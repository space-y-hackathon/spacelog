
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { TextureLoader } from "three";

import earthTexture from "../../assets/earth-map.jpg";
import moonTexture from "../../assets/moon-map.jpg";

// Membuat garis lintasan
function Trajectory({ points, color }) {
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map(([x, y, z]) => new THREE.Vector3(x, z, -y))
  );

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.8}
      />
    </line>
  );
}

// Bumi
function Earth() {
  const texture = useLoader(TextureLoader, earthTexture);

  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={[-0.3, 0.2, 0]}>
      <sphereGeometry args={[0.12, 64, 64]} />

      <meshStandardMaterial
        map={texture}
        roughness={1}
      />
    </mesh>
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
      <sphereGeometry args={[0.045, 64, 64]} />

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

  const index = Math.min(
    currentIndex,
    points.length - 1
  );

  const [x, y, z] = points[index];

  return (
    <group position={[x, z, -y]}>
      <mesh>
        <boxGeometry args={[0.025, 0.025, 0.06]} />

        <meshStandardMaterial
          color="#ff8c42"
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

  return (
    <group position={[x, z, -y]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.055, 0.004, 8, 48]} />

        <meshBasicMaterial color="#22c55e" />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.012, 16, 16]} />

        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

// Isi scene
function SceneContent({
  currentIndex,
  moonPoints,
  rocketPoints,
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
            color="#a0a0a0"
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
            color="#ff8c42"
          />
        </>
      )}

      <OrbitControls
        target={[-1, 0, 0]}
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={15}
      />
    </>
  );
}

// Mission Scene
export default function MissionScene({
  currentIndex = 0,
  moonPoints = [],
  rocketPoints = [],
}) {
  return (
    <div className="mission-canvas">
      <Canvas
        camera={{
          position: [0.8, 0, 5],
          fov: 45,
          near: 0.01,
          far: 1000,
        }}
      >
        <SceneContent
          currentIndex={currentIndex}
          moonPoints={moonPoints}
          rocketPoints={rocketPoints}
        />
      </Canvas>
    </div>
  );
}