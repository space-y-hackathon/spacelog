import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useEffect, useMemo, useRef } from "react";
import { CELESTIAL_RADII, SCENE_COLORS } from "../../constants";
import { getArtemis3SceneTrails } from "../../data/scenarios/artemis-3/adapter";
import { TEXTURE } from "../../assets/assetRegistry";
import orionTexture from "../../assets/orion.png";
import blueMoonTexture from "../../assets/blue-moon.png";
import starshipTexture from "../../assets/artemis.png";

const VEHICLE_COLORS = {
  orion: SCENE_COLORS.ROCKET_TRAJECTORY, // Oranye (#ff8c42)
  starship: "#38bdf8", // Biru langit (SpaceX Starship HLS)
  bluemoon: "#a855f7", // Ungu (Blue Origin Blue Moon)
  dockedRing: "#22c55e", // Hijau saat docked
};

const VEHICLE_SIZES = {
  orion: [0.0008, 0.0008, 0.0018],
  starship: [0.0011, 0.0011, 0.0032],
  bluemoon: [0.0011, 0.0011, 0.0026],
};

// Jarak visual moncong-ke-moncong saat docked (setengah panjang Orion + setengah panjang lander)
const VISUAL_DOCKING_STANDOFF = {
  starship: (VEHICLE_SIZES.orion[2] + VEHICLE_SIZES.starship[2]) * 0.5,
  bluemoon: (VEHICLE_SIZES.orion[2] + VEHICLE_SIZES.bluemoon[2]) * 0.5,
};

const Z_AXIS = new THREE.Vector3(0, 0, 1);

// Konversi koordinat inertial [x, y, z] ke basis Three.js (Y-up)
function toThreePosition([x, y, z]) {
  return [x, z, -y];
}

function getFlightQuaternion(points, index) {
  if (!points || points.length < 2) return null;
  const i0 = Math.max(0, Math.min(index, points.length - 2));
  const i1 = i0 + 1;

  const p0 = new THREE.Vector3(...toThreePosition(points[i0]));
  const p1 = new THREE.Vector3(...toThreePosition(points[i1]));
  const dir = p1.sub(p0);

  if (dir.lengthSq() < 1e-16) return null;
  dir.normalize();

  return new THREE.Quaternion().setFromUnitVectors(Z_AXIS, dir);
}

function getVisualOrionPosition({
  safeIdx,
  rocketPoints,
  starshipPoints,
  blueMoonPoints,
  dockedTo,
  dockingBlend,
}) {
  const rawOrion = rocketPoints[safeIdx];
  if (!rawOrion) return null;

  const orionVec = new THREE.Vector3(...toThreePosition(rawOrion));
  const targetArr =
    dockedTo === "starship"
      ? starshipPoints
      : dockedTo === "bluemoon"
      ? blueMoonPoints
      : null;

  if (!targetArr || targetArr.length < 2) {
    return [orionVec.x, orionVec.y, orionVec.z];
  }

  const i0 = Math.max(0, Math.min(safeIdx, targetArr.length - 2));
  const i1 = i0 + 1;
  const t0 = new THREE.Vector3(...toThreePosition(targetArr[i0]));
  const t1 = new THREE.Vector3(...toThreePosition(targetArr[i1]));
  const tangent = t1.sub(t0);

  if (tangent.lengthSq() < 1e-16) {
    return [orionVec.x, orionVec.y, orionVec.z];
  }
  tangent.normalize();

  const blend = typeof dockingBlend === "number" ? dockingBlend : 1;
  const sign = dockedTo === "starship" ? -1 : 1;
  const standoff = VISUAL_DOCKING_STANDOFF[dockedTo] * blend * sign;

  orionVec.addScaledVector(tangent, standoff);
  return [orionVec.x, orionVec.y, orionVec.z];
}

function getTargetVector(
  cameraTarget,
  currentIndex,
  rocketPoints,
  starshipPoints,
  blueMoonPoints
) {
  const pickPoint = (arr) => {
    if (!arr || arr.length === 0) return new THREE.Vector3(0, 0, 0);
    const idx = Math.min(Math.max(currentIndex, 0), arr.length - 1);
    const [x, y, z] = toThreePosition(arr[idx]);
    return new THREE.Vector3(x, y, z);
  };

  if (cameraTarget === "rocket" || cameraTarget === "orion") {
    return pickPoint(rocketPoints);
  }
  if (cameraTarget === "starship") {
    return pickPoint(starshipPoints);
  }
  if (cameraTarget === "bluemoon") {
    return pickPoint(blueMoonPoints);
  }

  return new THREE.Vector3(0, 0, 0);
}

function getDefaultCameraOffset(cameraTarget) {
  if (
    cameraTarget === "rocket" ||
    cameraTarget === "orion" ||
    cameraTarget === "starship" ||
    cameraTarget === "bluemoon"
  ) {
    return new THREE.Vector3(0.008, 0.005, 0.014);
  }
  return new THREE.Vector3(0.065, 0.045, 0.115);
}

function CameraRig({
  cameraTarget,
  currentIndex,
  rocketPoints,
  starshipPoints,
  blueMoonPoints,
}) {
  const controlsRef = useRef(null);
  const prevTargetPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioningRef = useRef(false);
  const desiredCamPosRef = useRef(new THREE.Vector3(0.065, 0.045, 0.115));

  const isVehicleTarget =
    cameraTarget === "rocket" ||
    cameraTarget === "orion" ||
    cameraTarget === "starship" ||
    cameraTarget === "bluemoon";

  useEffect(() => {
    const targetPos = getTargetVector(
      cameraTarget,
      currentIndex,
      rocketPoints,
      starshipPoints,
      blueMoonPoints
    );
    const offset = getDefaultCameraOffset(cameraTarget);

    prevTargetPosRef.current.copy(targetPos);
    desiredCamPosRef.current.copy(targetPos).add(offset);
    isTransitioningRef.current = true;
  }, [cameraTarget]);

  useFrame(({ camera }, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const targetPos = getTargetVector(
      cameraTarget,
      currentIndex,
      rocketPoints,
      starshipPoints,
      blueMoonPoints
    );

    const frameDelta = new THREE.Vector3().subVectors(
      targetPos,
      prevTargetPosRef.current
    );
    prevTargetPosRef.current.copy(targetPos);

    controls.target.add(frameDelta);
    camera.position.add(frameDelta);

    if (isTransitioningRef.current) {
      const step = 1 - Math.exp(-6 * Math.min(delta, 0.1));
      const offset = getDefaultCameraOffset(cameraTarget);
      desiredCamPosRef.current.copy(targetPos).add(offset);

      controls.target.lerp(targetPos, step);
      camera.position.lerp(desiredCamPosRef.current, step);

      if (
        camera.position.distanceTo(desiredCamPosRef.current) < 0.0005 &&
        controls.target.distanceTo(targetPos) < 0.0005
      ) {
        controls.target.copy(targetPos);
        camera.position.copy(desiredCamPosRef.current);
        isTransitioningRef.current = false;
      }
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={isVehicleTarget ? 0.0025 : CELESTIAL_RADII.EARTH * 1.08}
      maxDistance={2}
      onStart={() => {
        if (isTransitioningRef.current && controlsRef.current) {
          const targetPos = getTargetVector(
            cameraTarget,
            currentIndex,
            rocketPoints,
            starshipPoints,
            blueMoonPoints
          );
          controlsRef.current.target.copy(targetPos);
          isTransitioningRef.current = false;
        }
      }}
    />
  );
}

function Earth() {
  const texture = useLoader(TextureLoader, TEXTURE.earth);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[CELESTIAL_RADII.EARTH, 48, 48]} />
      <meshStandardMaterial map={texture} roughness={0.95} />
    </mesh>
  );
}

function TrailLine({ points, color, label, opacity = 0.85, onHover }) {
  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(
      points.map((pt) => {
        const [x, y, z] = toThreePosition(pt);
        return new THREE.Vector3(x, y, z);
      })
    );
  }, [points]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  if (!points || points.length < 2) return null;

  const handlePointerMove = (event) => {
    event.stopPropagation();
    onHover?.({
      label,
      color,
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <line
      geometry={geometry}
      onPointerOver={handlePointerMove}
      onPointerMove={handlePointerMove}
      onPointerOut={() => onHover?.(null)}
    >
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  );
}

function VehicleSprite({ textureUrl, scale }) {
  const texture = useTexture(textureUrl);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  const aspect =
    texture.image && texture.image.height
      ? texture.image.width / texture.image.height
      : 1;

  return (
    <sprite scale={[scale * aspect, scale, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </sprite>
  );
}

function SpacecraftMarker({
  threePosition,
  quaternion,
  color,
  size = [0.0009, 0.0009, 0.0022],
  textureUrl = null,
  spriteScale = 0.0055,
  isDocked = false,
  label,
  onHover,
}) {
  if (!threePosition) return null;

  const handlePointerMove = (event) => {
    event.stopPropagation();
    onHover?.({
      label,
      color,
      x: event.clientX,
      y: event.clientY,
    });
  };

  return (
    <group
      position={threePosition}
      quaternion={quaternion || undefined}
      onPointerOver={handlePointerMove}
      onPointerMove={handlePointerMove}
      onPointerOut={() => onHover?.(null)}
    >
      {textureUrl ? (
        <VehicleSprite textureUrl={textureUrl} scale={spriteScale} />
      ) : (
        <mesh>
          <boxGeometry args={size} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.65}
          />
        </mesh>
      )}

      {isDocked && (
        <mesh>
          <sphereGeometry args={[size[2] * 0.9, 16, 16]} />
          <meshBasicMaterial
            color={VEHICLE_COLORS.dockedRing}
            wireframe
            transparent
            opacity={0.75}
          />
        </mesh>
      )}

      <pointLight color={color} intensity={0.35} distance={0.03} />
    </group>
  );
}

function SceneContent({
  currentIndex,
  rocketPoints,
  starshipPoints,
  blueMoonPoints,
  dockedTo,
  dockingBlend,
  cameraTarget,
  onTrajectoryHover,
}) {
  const totalSamples = rocketPoints.length;

  const trails = useMemo(
    () => getArtemis3SceneTrails(currentIndex, totalSamples),
    [currentIndex, totalSamples]
  );

  const safeIdx = Math.min(Math.max(currentIndex, 0), Math.max(totalSamples - 1, 0));

  const orionThreePos = getVisualOrionPosition({
    safeIdx,
    rocketPoints,
    starshipPoints,
    blueMoonPoints,
    dockedTo,
    dockingBlend,
  });

  const starshipThreePos = starshipPoints[safeIdx]
    ? toThreePosition(starshipPoints[safeIdx])
    : null;
  const blueMoonThreePos = blueMoonPoints[safeIdx]
    ? toThreePosition(blueMoonPoints[safeIdx])
    : null;

  const orionQuat = useMemo(
    () => getFlightQuaternion(rocketPoints, safeIdx),
    [rocketPoints, safeIdx]
  );
  const starshipQuat = useMemo(
    () => getFlightQuaternion(starshipPoints, safeIdx),
    [starshipPoints, safeIdx]
  );
  const blueMoonQuat = useMemo(
    () => getFlightQuaternion(blueMoonPoints, safeIdx),
    [blueMoonPoints, safeIdx]
  );

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={2} />

      <Earth />

      <TrailLine
        points={trails.orion}
        color={VEHICLE_COLORS.orion}
        label="Orion Spacecraft Trajectory"
        opacity={0.95}
        onHover={onTrajectoryHover}
      />

      <TrailLine
        points={trails.starship}
        color={VEHICLE_COLORS.starship}
        label="SpaceX Starship HLS Orbit"
        opacity={0.5}
        onHover={onTrajectoryHover}
      />

      <TrailLine
        points={trails.bluemoon}
        color={VEHICLE_COLORS.bluemoon}
        label="Blue Origin Blue Moon Orbit"
        opacity={0.5}
        onHover={onTrajectoryHover}
      />

      <SpacecraftMarker
        threePosition={orionThreePos}
        quaternion={orionQuat}
        color={VEHICLE_COLORS.orion}
        size={VEHICLE_SIZES.orion}
        textureUrl={orionTexture}
        spriteScale={0.0055}
        isDocked={Boolean(dockedTo)}
        label="Orion Capsule"
        onHover={onTrajectoryHover}
      />

      <SpacecraftMarker
        threePosition={starshipThreePos}
        quaternion={starshipQuat}
        color={VEHICLE_COLORS.starship}
        size={VEHICLE_SIZES.starship}
        textureUrl={starshipTexture}
        spriteScale={0.007}
        isDocked={dockedTo === "starship"}
        label="SpaceX Starship HLS"
        onHover={onTrajectoryHover}
      />

      <SpacecraftMarker
        threePosition={blueMoonThreePos}
        quaternion={blueMoonQuat}
        color={VEHICLE_COLORS.bluemoon}
        size={VEHICLE_SIZES.bluemoon}
        textureUrl={blueMoonTexture}
        spriteScale={0.006}
        isDocked={dockedTo === "bluemoon"}
        label="Blue Origin Blue Moon"
        onHover={onTrajectoryHover}
      />

      <CameraRig
        cameraTarget={cameraTarget}
        currentIndex={safeIdx}
        rocketPoints={rocketPoints}
        starshipPoints={starshipPoints}
        blueMoonPoints={blueMoonPoints}
      />
    </>
  );
}

export default function Artemis3Scene({
  currentIndex = 0,
  rocketPoints = [],
  starshipPoints = [],
  blueMoonPoints = [],
  dockedTo = null,
  dockingBlend,
  cameraTarget = "earth",
  onTrajectoryHover,
}) {
  return (
    <div className="mission-canvas">
      <Canvas
        raycaster={{ params: { Line: { threshold: 0.003 } } }}
        camera={{
          position: [0.065, 0.045, 0.115],
          fov: 45,
          near: 0.0001,
          far: 100,
        }}
      >
        <SceneContent
          currentIndex={currentIndex}
          rocketPoints={rocketPoints}
          starshipPoints={starshipPoints}
          blueMoonPoints={blueMoonPoints}
          dockedTo={dockedTo}
          dockingBlend={dockingBlend}
          cameraTarget={cameraTarget}
          onTrajectoryHover={onTrajectoryHover}
        />
      </Canvas>
    </div>
  );
}