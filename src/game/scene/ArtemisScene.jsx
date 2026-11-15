import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useEffect, useMemo, useRef } from "react";
import { CELESTIAL_RADII, SCENE_COLORS } from "../../constants";
import artemisTexture from "../../assets/artemis.png";
import { TEXTURE } from "../../assets/assetRegistry";

// Konversi koordinat EME2000 ke basis Three.js
function toThreePosition([x, y, z]) {
  return [x, z, -y];
}

// Wahana Orion
function Orion({ points, currentIndex }) {
  const texture = useTexture(artemisTexture);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  if (!points || points.length === 0) return null;
  const index = Math.min(currentIndex, points.length - 1);
  const position = toThreePosition(points[index]);

  const aspect =
    texture.image && texture.image.height
      ? texture.image.width / texture.image.height
      : 1;
  const spriteHeight = 0.028;

  return (
    <group position={position}>
      <sprite scale={[spriteHeight * aspect, spriteHeight, 1]}>
        <spriteMaterial
          map={texture}
          transparent
          toneMapped={false}
          depthWrite={false}
        />
      </sprite>
      <pointLight
        color={SCENE_COLORS.ROCKET_TRAJECTORY}
        intensity={1}
        distance={0.2}
      />
    </group>
  );
}

function getTargetVector(cameraTarget, currentIndex, rocketPoints, moonPoints) {
  if (cameraTarget === "rocket" && rocketPoints.length > 0) {
    const idx = Math.min(Math.max(currentIndex, 0), rocketPoints.length - 1);
    const [x, y, z] = toThreePosition(rocketPoints[idx]);
    return new THREE.Vector3(x, y, z);
  }

  if (cameraTarget === "moon" && moonPoints.length > 0) {
    const idx = Math.min(Math.max(currentIndex, 0), moonPoints.length - 1);
    const [x, y, z] = toThreePosition(moonPoints[idx]);
    return new THREE.Vector3(x, y, z);
  }

  return new THREE.Vector3(0, 0, 0);
}

function getDefaultCameraOffset(cameraTarget) {
  if (cameraTarget === "rocket") {
    return new THREE.Vector3(0.08, 0.05, 0.16);
  }
  if (cameraTarget === "moon") {
    const dist = Math.max(CELESTIAL_RADII.MOON * 6, 0.15);
    return new THREE.Vector3(dist * 0.5, dist * 0.3, dist);
  }
  return new THREE.Vector3(0.8, 0, 5);
}

// Pengontrol kamera dinamis (Earth / Rocket / Moon)
function CameraRig({ cameraTarget, currentIndex, rocketPoints, moonPoints }) {
  const controlsRef = useRef(null);
  const prevTargetPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioningRef = useRef(false);
  const desiredCamPosRef = useRef(new THREE.Vector3(0.8, 0, 5));

  useEffect(() => {
    const targetPos = getTargetVector(
      cameraTarget,
      currentIndex,
      rocketPoints,
      moonPoints
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
      moonPoints
    );

    const frameDelta = new THREE.Vector3().subVectors(
      targetPos,
      prevTargetPosRef.current
    );
    prevTargetPosRef.current.copy(targetPos);

    // Ikuti pergerakan objek setiap frame tanpa mengunci rotasi mouse
    controls.target.add(frameDelta);
    camera.position.add(frameDelta);

    if (isTransitioningRef.current) {
      const step = 1 - Math.exp(-6 * Math.min(delta, 0.1));
      const offset = getDefaultCameraOffset(cameraTarget);
      desiredCamPosRef.current.copy(targetPos).add(offset);

      controls.target.lerp(targetPos, step);
      camera.position.lerp(desiredCamPosRef.current, step);

      if (
        camera.position.distanceTo(desiredCamPosRef.current) < 0.002 &&
        controls.target.distanceTo(targetPos) < 0.002
      ) {
        controls.target.copy(targetPos);
        camera.position.copy(desiredCamPosRef.current);
        isTransitioningRef.current = false;
      }
    } else {
      controls.target.copy(targetPos);
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minDistance={0.015}
      maxDistance={50}
      onStart={() => {
        isTransitioningRef.current = false;
      }}
    />
  );
}

// Lintasan Orion
function Trajectory({ points, label, onHover }) {
  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(
      points.map((point) => {
        const [x, y, z] = toThreePosition(point);
        return new THREE.Vector3(x, y, z);
      })
    );
  }, [points]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const handlePointerMove = (event) => {
    event.stopPropagation();
    onHover?.({
      label,
      color: SCENE_COLORS.ROCKET_TRAJECTORY,
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
      <lineBasicMaterial
        color={SCENE_COLORS.ROCKET_TRAJECTORY}
        transparent
        opacity={0.85}
      />
    </line>
  );
}

// Bumi
function Earth() {
  const texture = useLoader(TextureLoader, TEXTURE.earth);

  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[CELESTIAL_RADII.EARTH, 32, 32]} />

      <meshStandardMaterial
        map={texture}
        roughness={1}
      />
    </mesh>
  );
}

// Penanda akhir lintasan
function FinishLine({ points }) {
  if (!points || points.length === 0) return null;

  const position = toThreePosition(
    points[points.length - 1]
  );

  const normal = new THREE.Vector3(...position).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal
  );

  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <sphereGeometry args={[0.004, 16, 16]} />
        <meshBasicMaterial color={SCENE_COLORS.FINISH_MARKER} />
      </mesh>

      <mesh>
        <torusGeometry args={[0.012, 0.0012, 8, 48]} />
        <meshBasicMaterial color={SCENE_COLORS.FINISH_MARKER} />
      </mesh>
    </group>
  );
}

function SceneContent({
  currentIndex,
  rocketPoints,
  moonPoints,
  cameraTarget,
  onTrajectoryHover,
}) {
  return (
    <>
      <ambientLight intensity={0.65} />

      <directionalLight
        position={[5, 5, 5]}
        intensity={2}
      />

      <Earth />

      {rocketPoints.length > 0 && (
        <>
          <Trajectory
            points={rocketPoints}
            label="Spacecraft trajectory"
            onHover={onTrajectoryHover}
          />

          <Orion
            points={rocketPoints}
            currentIndex={currentIndex}
          />

          <FinishLine points={rocketPoints} />
        </>
      )}

      <CameraRig
        cameraTarget={cameraTarget}
        currentIndex={currentIndex}
        rocketPoints={rocketPoints}
        moonPoints={moonPoints}
      />
    </>
  );
}

export default function ArtemisScene({
  currentIndex = 0,
  rocketPoints = [],
  moonPoints = [],
  cameraTarget = "earth",
  onTrajectoryHover,
}) {
  return (
    <div className="mission-canvas">
      <Canvas
        raycaster={{ params: { Line: { threshold: 0.012 } } }}
        camera={{
          position: [0.8, 0, 5],
          fov: 45,
          near: 0.001,
          far: 1000,
        }}
      >
        <SceneContent
          currentIndex={currentIndex}
          rocketPoints={rocketPoints}
          moonPoints={moonPoints}
          cameraTarget={cameraTarget}
          onTrajectoryHover={onTrajectoryHover}
        />
      </Canvas>
    </div>
  );
}