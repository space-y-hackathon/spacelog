import { useState } from "react";
import { Canvas } from "@react-three/fiber";

import LaunchTower from "../../components/LaunchTower";
// import Rocket from '../../components/Rocket';

import { MISSION_DATA } from "../../constants";
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

  const mission = MISSION_DATA[missionId] ?? {
    title: "UNKNOWN MISSION",
    brief: "Mission briefing is currently unavailable.",
    objectives: [],
  };

  return (
    <main className="launch-scene">
      {/* 3D Environment */}
      <div className="launch-environment">
        <Canvas
          camera={{
            position: [0, 3, 12],
            fov: 45,
          }}
          shadows
          gl={{ antialias: true }}
        >
          <ambientLight intensity={1.5} />

          <directionalLight position={[4, 8, 5]} intensity={2} castShadow />

          {/* Launch Tower */}
          <LaunchTower position={[0, 1, -2.5]} scale={[6.5, 6.5, 1]} />

          {/* Rocket */}
          {/* <Rocket /> */}

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
        <button className="back-button" type="button" onClick={onBack}>
          ← Back
        </button>
      </header>

      {/* Mission Brief */}
      <section className="launch-brief">
        <span className="mission-number">{mission.number}</span>

        <h1 className="mission-title">{mission.title}</h1>

        <div className="brief-divider" />

        <h2>Brief:</h2>
        <p>{mission.brief}</p>

        <h2>Objectives:</h2>
        <ul>
          {mission.objectives.map((objective, index) => (
            <li key={index}>
              Objective {index + 1}: {objective}
            </li>
          ))}
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

            if (!item) return null;

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
          aria-label="Remove selected part"
        >
          −
        </button>
      </section>
    </main>
  );
}
