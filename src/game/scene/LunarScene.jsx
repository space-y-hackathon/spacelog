import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import { CELESTIAL_RADII, SCENE_COLORS } from '../../constants';
import earthTexture from "../../assets/earth-map.jpg";
import moonTexture from "../../assets/moon-map.jpg";

function getTargetVector(cameraTarget, currentIndex, rocketPoints, moonPoints) {
  if (cameraTarget === "rocket" && rocketPoints.length > 0) {
    const idx = Math.min(Math.max(currentIndex, 0), rocketPoints.length - 1);
    const [x, y, z] = rocketPoints[idx];
    return new THREE.Vector3(x, z, -y);
  }

  if (cameraTarget === "moon" && moonPoints.length > 0) {
    const idx = Math.min(Math.max(currentIndex, 0), moonPoints.length - 1);
    const [x, y, z] = moonPoints[idx];
    return new THREE.Vector3(x, z, -y);
  }

  return new THREE.Vector3(0, 0, 0);
}

function getDefaultCameraOffset(cameraTarget) {
  if (cameraTarget === "rocket") {
    return new THREE.Vector3(0.04, 0.025, 0.08);
  }
  if (cameraTarget === "moon") {
    const dist = Math.max(CELESTIAL_RADII.MOON * 6, 0.14);
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
      minDistance={0.01}
      maxDistance={15}
      onStart={() => {
        isTransitioningRef.current = false;
      }}
    />
  );
}

// Membuat garis lintasan
function Trajectory({ points, color, label, onHover }) {
  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(
      points.map(([x, y, z]) => new THREE.Vector3(x, z, -y))
    );
  }, [points]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <line
      geometry={geometry}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHover({ label, color });
      }}
      onPointerOut={() => onHover(null)}
    >
      <lineBasicMaterial color={color} transparent opacity={0.8} />
    </line>
  );
}

// Bumi
function Earth() {
  const texture = useLoader(TextureLoader, earthTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <group position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[CELESTIAL_RADII.EARTH, 48, 48]} />
        <meshStandardMaterial map={texture} roughness={1} />
      </mesh>
      <mesh>
        <sphereGeometry args={[CELESTIAL_RADII.EARTH * 1.025, 48, 48]} />
        <meshBasicMaterial
          color="#67d4f6"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// Bulan
function Moon({ points, currentIndex }) {
  const texture = useLoader(TextureLoader, moonTexture);

  texture.colorSpace = THREE.SRGBColorSpace;

  if (!points || points.length === 0) return null;

  const index = Math.min(
    currentIndex,
    points.length - 1
  );

  const [x, y, z] = points[index];

  return (
    <mesh position={[x, z, -y]}>
      <sphereGeometry args={[CELESTIAL_RADII.MOON, 32, 32]} />

      <meshStandardMaterial
        map={texture}
        color="#ffffff"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

// Roket
function Rocket({ points, currentIndex }) {
  if (!points || points.length === 0) return null;
  const index = Math.min(currentIndex, points.length - 1);
  const [x, y, z] = points[index];
  return (
    <group position={[x, z, -y]}>
      <mesh>
        <boxGeometry args={[0.002, 0.002, 0.005]} />
        <meshStandardMaterial
          color={SCENE_COLORS.ROCKET_TRAJECTORY}
          emissive="#7a3510"
        />
      </mesh>
    </group>
  );
}

// Penanda tujuan 3D
function FinishLine({ points }) {
  if (!points || points.length === 0) return null;

  const [x, y, z] = points[points.length - 1];
  const position = [x, z, -y];

  const normal = new THREE.Vector3(...position).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal
  );

  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <torusGeometry args={[0.012, 0.0012, 8, 48]} />
        <meshBasicMaterial color={SCENE_COLORS.FINISH_MARKER} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.004, 16, 16]} />
        <meshBasicMaterial color={SCENE_COLORS.FINISH_MARKER} />
      </mesh>
    </group>
  );
}

// Isi scene
function SceneContent({
  currentIndex,
  moonPoints,
  rocketPoints,
  cameraTarget,
  onTrajectoryHover,
}) {
  return (
    <>
      <ambientLight intensity={0.8} />

      <directionalLight
        position={[5, 5, 5]}
        intensity={2}
      />

      <Earth />

      {moonPoints.length > 0 && (
        <>
          <Moon
            points={moonPoints}
            currentIndex={currentIndex}
          />

          <Trajectory
            points={moonPoints}
            color={SCENE_COLORS.MOON_TRAJECTORY}
            label="Moon orbital path"
            onHover={onTrajectoryHover}
          />
        </>
      )}

      {rocketPoints.length > 0 && (
        <>
          <Rocket
            points={rocketPoints}
            currentIndex={currentIndex}
          />

          <FinishLine points={rocketPoints} />

          <Trajectory
            points={rocketPoints}
            color={SCENE_COLORS.ROCKET_TRAJECTORY}
            label="Spacecraft trajectory"
            onHover={onTrajectoryHover}
          />
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

// Lunar Scene
export default function LunarScene({
  currentIndex = 0,
  moonPoints = [],
  rocketPoints = [],
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
          moonPoints={moonPoints}
          rocketPoints={rocketPoints}
          cameraTarget={cameraTarget}
          onTrajectoryHover={onTrajectoryHover}
        />
      </Canvas>
    </div>
  );
}