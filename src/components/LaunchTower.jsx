import { useTexture } from '@react-three/drei';
import { DoubleSide } from 'three';

import { SCENE_ASSETS } from '../assets/assetRegistry';

export default function LaunchTower({
  position = [0, 0, -1.5],
  scale = [3, 3, 1],
}) {
  const texture = useTexture(SCENE_ASSETS.launchTower);

  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />

      <meshBasicMaterial
        map={texture}
        transparent
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}