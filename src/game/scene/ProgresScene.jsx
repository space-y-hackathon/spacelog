import { useEffect, useMemo, useState } from "react";
import MissionScene from "./MissionScene";
import "./ProgresScene.css";

import { lunarTrajectoryData } from "../../data/scenarios/lunar/lunarTrajectory.js";

import { lunarOrbitData } from "../../data/scenarios/lunar/lunarOrbit.js";

// Dataset Lunar
const coordinates = lunarTrajectoryData.coordinates;
const moonCoordinates = lunarOrbitData.coordinates;

const TOTAL_POINTS = coordinates.length;

// Kecepatan simulasi
const PLAYBACK_INTERVAL = 100;

// Skala visualisasi Three.js
const SCALE = 0.000006;

function convertCoordinates(data) {
  return data.map((point) => [
    point.X * SCALE,
    point.Y * SCALE,
    point.Z * SCALE,
  ]);
}

function formatNumber(value, digits = 2) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "N/A";
  }

  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

export default function ProgressScene({ onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // State hide/unhide panel
  const [showLeft, setShowLeft] = useState(true);
  const [showBottom, setShowBottom] = useState(true);

  // Konversi koordinat untuk visualisasi 3D
  const moonPoints = useMemo(() => convertCoordinates(moonCoordinates), []);

  const rocketPoints = useMemo(() => convertCoordinates(coordinates), []);

  // Index data aktif
  const safeIndex = Math.min(currentIndex, Math.max(TOTAL_POINTS - 1, 0));

  const currentPoint = coordinates[safeIndex] ?? null;

  // Progress misi
  const progress =
    TOTAL_POINTS > 1 ? (safeIndex / (TOTAL_POINTS - 1)) * 100 : 0;

  // Playback simulasi
  useEffect(() => {
    if (!isPlaying || TOTAL_POINTS === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((previous) => Math.min(previous + 1, TOTAL_POINTS - 1));
    }, PLAYBACK_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Hentikan playback ketika mencapai data terakhir
  useEffect(() => {
    if (TOTAL_POINTS > 0 && safeIndex >= TOTAL_POINTS - 1) {
      setIsPlaying(false);
    }
  }, [safeIndex]);

  // Restart
  const handleRestart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  // Play / Pause
  const handlePlayPause = () => {
    if (safeIndex >= TOTAL_POINTS - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
      return;
    }

    setIsPlaying((previous) => !previous);
  };

  // Data telemetry
  const telemetry = [
    {
      label: "POSITION X",
      value: currentPoint ? formatNumber(currentPoint.X) : "N/A",
      unit: "km",
    },
    {
      label: "POSITION Y",
      value: currentPoint ? formatNumber(currentPoint.Y) : "N/A",
      unit: "km",
    },
    {
      label: "POSITION Z",
      value: currentPoint ? formatNumber(currentPoint.Z) : "N/A",
      unit: "km",
    },
    {
      label: "MISSION DATE",
      value: currentPoint?.Date?.trim() ?? "N/A",
      unit: "",
    },
  ];

  // Parameter sistem misi
  // Nilai akan dihubungkan ke sumber data masing-masing nantinya.
  const systemParameters = [
    {
      label: "GRAVITY",
      value: "N/A",
      unit: "m/s²",
      description: "Gravitational acceleration",
    },
    {
      label: "VELOCITY",
      value: "N/A",
      unit: "km/s",
      description: "Current spacecraft speed",
    },
    {
      label: "OXYGEN LEVEL",
      value: "N/A",
      unit: "%",
      description: "Oxygen availability",
    },
    {
      label: "FUEL REMAINING",
      value: "N/A",
      unit: "%",
      description: "Propellant capacity",
    },
    {
      label: "CABIN PRESSURE",
      value: "N/A",
      unit: "kPa",
      description: "Internal cabin pressure",
    },
    {
      label: "TEMPERATURE",
      value: "N/A",
      unit: "°C",
      description: "Cabin temperature",
    },
    {
      label: "DISTANCE TO MOON",
      value: "N/A",
      unit: "km",
      description: "Distance to lunar body",
    },
    {
      label: "MISSION ELAPSED",
      value: currentPoint?.Time ?? "N/A",
      unit: "",
      description: "Current dataset timestamp",
    },
  ];

  return (
    <main className={`progress-scene ${showBottom ? "" : "bottom-hidden"}`}>
      {/* 3D Visualization */}
      <section className="mission-visual">
        <MissionScene
          currentIndex={safeIndex}
          moonPoints={moonPoints}
          rocketPoints={rocketPoints}
        />
      </section>

      {/* Back Button */}
      <button className="progress-back" onClick={onBack}>
        ← BACK
      </button>

      {/* Mission Progress */}
      <section className="mission-progress-panel">
        <div className="progress-heading">
          <span>MISSION PROGRESS</span>
          <strong>{progress.toFixed(1)}%</strong>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />

          <div
            className="progress-indicator"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="progress-labels">
          <span>EARTH DEPARTURE</span>
          <span>LUNAR ARRIVAL</span>
        </div>

        <div className="progress-controls">
          <span>
            SAMPLE {TOTAL_POINTS ? safeIndex + 1 : 0} / {TOTAL_POINTS}
          </span>

          <div>
            <button onClick={handleRestart}>↺</button>
            <button onClick={handlePlayPause}>{isPlaying ? "Ⅱ" : "▶"}</button>
          </div>
        </div>
      </section>

      {/* Left: Rocket Telemetry */}
      <section className={`rocket-statistics ${showLeft ? "" : "hidden-left"}`}>
        <div className="statistics-heading">
          <div>
            <span className="statistics-kicker">LIVE TELEMETRY</span>

            <h3>Rocket Statistics</h3>
          </div>

          <span className={`live-indicator ${isPlaying ? "active" : "paused"}`}>
            ● {isPlaying ? "LIVE" : "PAUSED"}
          </span>
        </div>

        <div className="statistics-grid">
          {telemetry.map((item) => (
            <div className="stat-item" key={item.label}>
              <span>{item.label}</span>

              <strong>{item.value}</strong>

              {item.unit && <small>{item.unit}</small>}
            </div>
          ))}
        </div>

        <div className="statistics-footer">
          <span>MISSION TIME</span>
          <strong>{currentPoint?.Time ?? "N/A"}</strong>
        </div>
      </section>

      {/* Bottom: Mission Systems */}
      <section
        className={`mission-systems-panel ${showBottom ? "" : "hidden-bottom"}`}
      >
        <div className="systems-heading">
          <div>
            <span className="statistics-kicker">SPACECRAFT CONDITION</span>
          </div>
          <h3>Mission Systems</h3>

          <span className="systems-status">SYSTEM DATA PENDING</span>
        </div>

        <div className="systems-grid">
          {systemParameters.map((item) => (
            <div className="system-item" key={item.label}>
              <span>{item.label}</span>

              <div className="system-value">
                <strong>{item.value}</strong>
                <small>{item.unit}</small>
              </div>

              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Toggle: sidebar kiri */}
      <button
        className={`panel-toggle toggle-left ${showLeft ? "open" : "closed"}`}
        onClick={() => setShowLeft((value) => !value)}
        aria-label={showLeft ? "Sembunyikan telemetry" : "Tampilkan telemetry"}
      >
        {showLeft ? "◀" : "▶"}
      </button>

      {/* Toggle: panel bawah */}
      <button
        className={`panel-toggle toggle-bottom ${showBottom ? "open" : "closed"}`}
        onClick={() => setShowBottom((value) => !value)}
        aria-label={
          showBottom
            ? "Sembunyikan mission systems"
            : "Tampilkan mission systems"
        }
      >
        {showBottom ? "▼" : "▲"}
      </button>
    </main>
  );
}
