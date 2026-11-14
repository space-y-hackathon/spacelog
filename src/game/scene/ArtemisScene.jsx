import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";
import { useMemo } from "react";

import earthTexture from "../../assets/earth-map.jpg";

// Konversi koordinat EME2000 ke basis Three.js
function toThreePosition([x, y, z]) {
  return [x, z, -y];
}

// Lintasan Orion
function Trajectory({ points }) {
  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(
      points.map((point) => {
        const [x, y, z] = toThreePosition(point);
        return new THREE.Vector3(x, y, z);
      })
    );
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial
        color="#ff8c42"
        transparent
        opacity={0.85}
      />
    </line>
  );
}

// Bumi
function Earth() {
  const texture = useLoader(TextureLoader, earthTexture);

  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.12, 64, 64]} />

      <meshStandardMaterial
        map={texture}
        roughness={1}
      />
    </mesh>
  );
}

// Wahana Orion
function Orion({ points, currentIndex }) {
  if (!points || points.length === 0) return null;

  const index = Math.min(
    currentIndex,
    points.length - 1
  );

  const position = toThreePosition(points[index]);

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.025, 0.025, 0.06]} />

        <meshStandardMaterial
          color="#ff8c42"
          emissive="#7a3510"
          emissiveIntensity={0.5}
        />
      </mesh>

      <pointLight
        color="#ff8c42"
        intensity={1}
        distance={0.4}
      />
    </group>
  );
}

// Penanda akhir lintasan
function FinishLine({ points }) {
  if (!points || points.length === 0) return null;

  const position = toThreePosition(
    points[points.length - 1]
  );

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.055, 0.004, 8, 48]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

function SceneContent({ currentIndex, rocketPoints }) {
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
          <Trajectory points={rocketPoints} />

          <Orion
            points={rocketPoints}
            currentIndex={currentIndex}
          />

          <FinishLine points={rocketPoints} />
        </>
      )}

      <OrbitControls
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={50}
      />
    </>
  );
}

export default function ArtemisScene({
  currentIndex = 0,
  rocketPoints = [],
}) {
  return (
    <div className="mission-canvas">
      <Canvas
        camera={{
          position: [0, 2, 12],
          fov: 50,
          near: 0.01,
          far: 1000,
        }}
      >
        <SceneContent
          currentIndex={currentIndex}
          rocketPoints={rocketPoints}
        />
      </Canvas>
    </div>
  );
}