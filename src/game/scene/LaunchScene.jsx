import { useState } from "react";
import { Canvas } from "@react-three/fiber";

import LaunchTower from "../../components/LaunchTower";
// import Rocket from '../../components/Rocket';

import { ROCKET_PARTS } from "../../assets/assetRegistry";

import "./LaunchScene.css";

export default function LaunchScene({ missionId, onLaunch, onBack }) {
  const [selectedPart, setSelectedPart] = useState(null);
  const [rocketParts, setRocketParts] = useState([]);

  const inventory = Object.entries(ROCKET_PARTS);

  const handleAddPart = (key) => {
    const part = ROCKET_PARTS[key];

    if (!part) return;

    setRocketParts((prev) => [...prev, { key, id: crypto.randomUUID() }]);
  };

  const handleRemovePart = (id) => {
    setRocketParts((prev) => prev.filter((part) => part.id !== id));
  };

  const handleReset = () => {
    setRocketParts([]);
    setSelectedPart(null);
  };

  return (
    <main className="launch-scene">
      {/* 3D Environment */}
      <div className="launch-environment">
        <Canvas
          camera={{
            position: [0, 2, 9],
            fov: 40,
          }}
          shadows
          gl={{ antialias: true }}
        >
          <ambientLight intensity={1.5} />

          <directionalLight position={[4, 8, 5]} intensity={2} castShadow />

          {/* Launch Tower */}
          <LaunchTower position={[0, 0, -1.5]} scale={[4.2, 4.2, 1]} />

          {/* Rocket */}
          {/* <Rocket /> */}
          {/* Rocket Placeholder */}
          <group position={[0, 0, 0]}>
            {/* Main Body */}
            <mesh castShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 2.5, 32]} />
              <meshStandardMaterial
                color="#dce6ec"
                metalness={0.5}
                roughness={0.35}
              />
            </mesh>

            {/* Nose Cone */}
            <mesh castShadow position={[0, 1.5, 0]}>
              <coneGeometry args={[0.25, 0.6, 32]} />
              <meshStandardMaterial color="#80d9f2" />
            </mesh>

            {/* Engine */}
            <mesh castShadow position={[0, -1.4, 0]}>
              <cylinderGeometry args={[0.15, 0.25, 0.45, 32]} />
              <meshStandardMaterial color="#657889" />
            </mesh>

            {/* Side Boosters */}
            {[-1, 1].map((side) => (
              <mesh key={side} castShadow position={[side * 0.42, -0.1, 0]}>
                <cylinderGeometry args={[0.12, 0.12, 1.8, 24]} />
                <meshStandardMaterial color="#aab9c5" />
              </mesh>
            ))}
          </group>

          {/* Ground */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2, 0]}
            receiveShadow
          >
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#526348" />
          </mesh>
        </Canvas>
      </div>

      {/* Top HUD */}
      <header className="launch-header">
        <button className="level-label" type="button" onClick={onBack}>
          Level 1
        </button>

        <button className="settings-button">⚙</button>
      </header>

      {/* Mission Brief */}
      <section className="launch-brief">
        <h2>Brief:</h2>

        <p>
          The rival space program secured the milestone 23 days ago completed a
          full orbit. We are behind in the space race. We need a successful
          mission, and we need it now.
        </p>

        <h2>Objectives:</h2>

        <ul>
          <li>Objective 1: Ignition &amp; Ascent</li>
          <li>Objective 2: Suborbital Maneuver</li>
          <li>Objective 3: Atmospheric Descent</li>
        </ul>
      </section>

      {/* Launch Actions */}
      <div className="launch-actions">
        <button className="launch-button" onClick={onLaunch} type="button">
          Launch
        </button>

        <button className="reset-button" onClick={handleReset} type="button">
          Reset
        </button>
      </div>

      {/* Rocket Inventory */}
      <section className="launch-inventory">
        <div className="inventory-items">
          {rocketParts.map((part) => {
            const item = ROCKET_PARTS[part.key];

            return (
              <button
                key={part.id}
                className={`inventory-card ${
                  selectedPart === part.id ? "selected" : ""
                }`}
                onClick={() => setSelectedPart(part.id)}
                type="button"
              >
                <img src={item.asset} alt={item.name} />
                <span>1x</span>
              </button>
            );
          })}
        </div>

        <div className="inventory-add">
          {inventory.map(([key, item]) => (
            <button key={key} type="button" onClick={() => handleAddPart(key)}>
              + {item.name}
            </button>
          ))}
        </div>

        <button
          className="inventory-remove"
          type="button"
          disabled={!selectedPart}
          onClick={() => {
            handleRemovePart(selectedPart);
            setSelectedPart(null);
          }}
        >
          −
        </button>
      </section>
    </main>
  );
}
