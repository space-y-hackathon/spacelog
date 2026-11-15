
import { useState } from "react";
import { Canvas } from "@react-three/fiber";

import LaunchTower from "../../components/LaunchTower";
import Rocket from "../../components/rocket/Rocket";
import { getMissingRequiredZones } from "../../components/rocket/Blueprint";

import { MISSION_DATA } from "../../constants";

import "./LaunchScene.css";

export default function LaunchScene({ missionId, onLaunch, onBack }) {
  const [installedParts, setInstalledParts] = useState([]);
  const [assemblyResetKey, setAssemblyResetKey] = useState(0);
  const missingZones = getMissingRequiredZones(installedParts);

  const mission = MISSION_DATA[missionId] ?? {
    title: "UNKNOWN MISSION",
    brief: "Mission briefing is currently unavailable.",
    objectives: [],
  };

  const handleReset = () => {
    setInstalledParts([]);
    setAssemblyResetKey((prev) => prev + 1);
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
          gl={{ antialias: true }}
        >
          <ambientLight intensity={1.5} />

          <directionalLight
            position={[4, 8, 5]}
            intensity={2}
          />

          <LaunchTower
            position={[0, 1, -2.5]}
            scale={[6.5, 6.5, 1]}
          />

          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2, 0]}
          >
            <planeGeometry args={[30, 30]} />
            <meshStandardMaterial color="#526348" />
          </mesh>
        </Canvas>
      </div>

      {/* Back Button */}
      <header className="launch-header">
        <button
          className="back-button"
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>
      </header>

      {/* Mission Brief - LEFT */}
      <section className="launch-brief">
        {mission.number && (
          <span className="mission-number">
            {mission.number}
          </span>
        )}

        <h1 className="mission-title">
          {mission.title}
        </h1>

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

      {/* Rocket Assembly - CENTER + RIGHT + BOTTOM */}
      <Rocket
        key={assemblyResetKey}
        installedParts={installedParts}
        setInstalledParts={setInstalledParts}
        missingZones={missingZones}
      />

      {/* Launch Actions - BOTTOM RIGHT */}
      <div className="launch-actions">
        <button
          className="launch-button"
          type="button"
          disabled={missingZones.length > 0}
          onClick={() => {
            if (missingZones.length === 0) onLaunch();
          }}
        >
          Launch
        </button>

        <button
          className="reset-button"
          type="button"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </main>
  );
}
