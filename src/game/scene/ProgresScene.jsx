import { useEffect, useMemo, useState } from "react";
import MissionScene from "./MissionScene";
import "./ProgresScene.css";

import { lunarTrajectoryData } from "../../data/scenarios/lunar/lunarTrajectory.js";
import { lunarOrbitData } from "../../data/scenarios/lunar/lunarOrbit.js";
import { artemis1Trajectory } from "../../data/scenarios/artemis-1/adapter.js";

const PLAYBACK_INTERVAL = 100;
const LUNAR_SCALE = 0.000006;

function convertLunarCoordinates(data) {
  return data.map((point) => [
    point.X * LUNAR_SCALE,
    point.Y * LUNAR_SCALE,
    point.Z * LUNAR_SCALE,
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

function getArtemisDate(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return {
      Date: "N/A",
      Time: "N/A",
    };
  }

  return {
    Date: date.toISOString().slice(0, 10),
    Time: date.toISOString().slice(11, 23),
  };
}

export default function ProgresScene({
  missionId = "lunar-2014",
  onBack,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const [showLeft, setShowLeft] = useState(true);
  const [showBottom, setShowBottom] = useState(true);

  // Pilih dataset berdasarkan misi
  const missionData = useMemo(() => {
    if (missionId === "artemis-1") {
      const coordinates = artemis1Trajectory.map((record) => {
        const dateInfo = getArtemisDate(record.timestamp);

        return {
          ...dateInfo,
          X: record.rawPosition.x,
          Y: record.rawPosition.y,
          Z: record.rawPosition.z,
          visualPosition: [
            record.position.x,
            record.position.y,
            record.position.z,
          ],
          velocity: record.velocity,
        };
      });

      return {
        id: "artemis-1",
        name: "ARTEMIS I",
        coordinates,
        moonPoints: [],
        rocketPoints: coordinates.map(
          (point) => point.visualPosition
        ),
        progressStart: "MISSION START",
        progressEnd: "MISSION END",
      };
    }

    const coordinates = lunarTrajectoryData.coordinates;
    const moonCoordinates = lunarOrbitData.coordinates;

    return {
      id: "lunar-2014",
      name: "ARCHIVED // LUNAR 2014",
      coordinates,
      moonPoints: convertLunarCoordinates(moonCoordinates),
      rocketPoints: convertLunarCoordinates(coordinates),
      progressStart: "EARTH DEPARTURE",
      progressEnd: "LUNAR ARRIVAL",
    };
  }, [missionId]);

  const coordinates = missionData.coordinates;
  const moonPoints = missionData.moonPoints;
  const rocketPoints = missionData.rocketPoints;

  const TOTAL_POINTS = coordinates.length;

  // Batasi index agar tidak melewati jumlah data
  const safeIndex = Math.min(
    currentIndex,
    Math.max(TOTAL_POINTS - 1, 0)
  );

  const currentPoint = coordinates[safeIndex] ?? null;

  // Progress misi
  const progress =
    TOTAL_POINTS > 1
      ? (safeIndex / (TOTAL_POINTS - 1)) * 100
      : 0;

  // Reset playback ketika berganti misi
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [missionId]);

  // Playback
  useEffect(() => {
    if (!isPlaying || TOTAL_POINTS === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((previous) =>
        Math.min(previous + 1, TOTAL_POINTS - 1)
      );
    }, PLAYBACK_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, TOTAL_POINTS]);

  // Hentikan playback ketika mencapai data terakhir
  useEffect(() => {
    if (TOTAL_POINTS > 0 && safeIndex >= TOTAL_POINTS - 1) {
      setIsPlaying(false);
    }
  }, [safeIndex, TOTAL_POINTS]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (safeIndex >= TOTAL_POINTS - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
      return;
    }

    setIsPlaying((previous) => !previous);
  };

  // Telemetry
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
      value: currentPoint?.Date?.trim?.() ?? "N/A",
      unit: "",
    },
  ];

  // Parameter sistem misi
  const systemParameters = [
    {
      label: "GRAVITY",
      value: "N/A",
      unit: "m/s²",
      description: "Gravitational acceleration",
    },
    {
      label: "VELOCITY",
      value:
        missionId === "artemis-1" && currentPoint?.velocity
          ? formatNumber(
              Math.sqrt(
                currentPoint.velocity.x ** 2 +
                currentPoint.velocity.y ** 2 +
                currentPoint.velocity.z ** 2
              )
            )
          : "N/A",
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
    <main
      className={`progress-scene ${
        showBottom ? "" : "bottom-hidden"
      }`}
    >
      {/* 3D Visualization */}
      <section className="mission-visual">
        <MissionScene
          missionId={missionId}
          currentIndex={safeIndex}
          moonPoints={moonPoints}
          rocketPoints={rocketPoints}
        />
      </section>

      {/* Back Button */}
      <button
        className="progress-back"
        onClick={onBack}
      >
        ← BACK
      </button>

      {/* Mission Progress */}
      <section className="mission-progress-panel">
        <div className="progress-heading">
          <span>MISSION PROGRESS</span>
          <strong>{progress.toFixed(1)}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />

          <div
            className="progress-indicator"
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className="progress-labels">
          <span>{missionData.progressStart}</span>
          <span>{missionData.progressEnd}</span>
        </div>

        <div className="progress-controls">
          <span>
            SAMPLE {TOTAL_POINTS ? safeIndex + 1 : 0} / {TOTAL_POINTS}
          </span>

          <div>
            <button onClick={handleRestart}>↺</button>
            <button onClick={handlePlayPause}>
              {isPlaying ? "Ⅱ" : "▶"}
            </button>
          </div>
        </div>
      </section>

      {/* Left: Rocket Telemetry */}
      <section
        className={`rocket-statistics ${
          showLeft ? "" : "hidden-left"
        }`}
      >
        <div className="statistics-heading">
          <div>
            <span className="statistics-kicker">
              LIVE TELEMETRY
            </span>

            <h3>Rocket Statistics</h3>
          </div>

          <span
            className={`live-indicator ${
              isPlaying ? "active" : "paused"
            }`}
          >
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
        className={`mission-systems-panel ${
          showBottom ? "" : "hidden-bottom"
        }`}
      >
        <div className="systems-heading">
          <div>
            <span className="statistics-kicker">
              SPACECRAFT CONDITION
            </span>
          </div>

          <h3>Mission Systems</h3>

          <span className="systems-status">
            SYSTEM DATA PENDING
          </span>
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
        className={`panel-toggle toggle-left ${
          showLeft ? "open" : "closed"
        }`}
        onClick={() => setShowLeft((value) => !value)}
        aria-label={
          showLeft
            ? "Sembunyikan telemetry"
            : "Tampilkan telemetry"
        }
      >
        {showLeft ? "◀" : "▶"}
      </button>

      {/* Toggle: panel bawah */}
      <button
        className={`panel-toggle toggle-bottom ${
          showBottom ? "open" : "closed"
        }`}
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