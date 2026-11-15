import { useEffect, useMemo, useRef, useState } from "react";
import MissionScene from "./MissionScene";
import "./ProgresScene.css";
import { artemis1Trajectory } from "../../data/scenarios/artemis-1/adapter.js";
import { PLAYBACK_INTERVAL } from '../../constants';
import { getLunar2014MissionData, parseLunarTimestampMs } from "../../data/scenarios/lunar/adapter.js";

const SPEED_OPTIONS = [1, 2, 4, 10, 25];
const EARTH_MU_KM3_S2 = 398600.4418; // Parameter gravitasi standar Bumi (km³/s²)

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

function parsePointTimestampMs(point) {
  if (!point) return null;
  if (Number.isFinite(Number(point.timestampMs))) {
    return Number(point.timestampMs);
  }

  const manualParsed = parseLunarTimestampMs(point.Date, point.Time);
  if (manualParsed !== null) return manualParsed;

  if (!point.Date || !point.Time) return null;
  const dateStr = String(point.Date).trim();
  const timeStr = String(point.Time).trim();
  if (!dateStr || !timeStr || dateStr === "N/A" || timeStr === "N/A") {
    return null;
  }

  const parsed = Date.parse(`${dateStr}T${timeStr}Z`);
  return Number.isNaN(parsed) ? null : parsed;
}

// Hitung percepatan gravitasi Bumi berdasarkan jarak wahana (g = GM / r²)
function calculateGravity(point) {
  if (!point) return null;
  const x = Number(point.X);
  const y = Number(point.Y);
  const z = Number(point.Z);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    return null;
  }

  const radiusKm = Math.hypot(x, y, z);
  if (radiusKm <= 0) return null;

  // Konversi dari km/s² ke m/s²
  return (EARTH_MU_KM3_S2 / (radiusKm * radiusKm)) * 1000;
}

// Hitung kecepatan dari vektor velocity dataset atau turunan posisi (Δr / Δt)
function calculateVelocity(coordinates, index) {
  const current = coordinates[index];
  if (!current) return null;

  if (
    current.velocity &&
    typeof current.velocity === "object" &&
    Number.isFinite(Number(current.velocity.x)) &&
    Number.isFinite(Number(current.velocity.y)) &&
    Number.isFinite(Number(current.velocity.z))
  ) {
    return Math.hypot(
      Number(current.velocity.x),
      Number(current.velocity.y),
      Number(current.velocity.z)
    );
  }

  if (coordinates.length < 2) return null;
  const prevIdx = Math.max(0, index - 1);
  const nextIdx = Math.min(coordinates.length - 1, index + 1);
  if (prevIdx === nextIdx) return null;

  const p1 = coordinates[prevIdx];
  const p2 = coordinates[nextIdx];
  const t1 = parsePointTimestampMs(p1);
  const t2 = parsePointTimestampMs(p2);
  if (t1 === null || t2 === null) return null;

  const dtSeconds = Math.abs(t2 - t1) / 1000;
  if (dtSeconds <= 0) return null;

  const dx = Number(p2.X) - Number(p1.X);
  const dy = Number(p2.Y) - Number(p1.Y);
  const dz = Number(p2.Z) - Number(p1.Z);
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) {
    return null;
  }

  return Math.hypot(dx, dy, dz) / dtSeconds;
}

// Hitung jarak roket ke Bulan dalam km jika data moonPoints tersedia
function calculateDistanceToMoon(currentPoint, rocketPoints, moonPoints, index) {
  if (
    !currentPoint ||
    !rocketPoints ||
    !moonPoints ||
    rocketPoints.length === 0 ||
    moonPoints.length === 0
  ) {
    return null;
  }

  const rIdx = Math.min(Math.max(index, 0), rocketPoints.length - 1);
  const mIdx = Math.min(Math.max(index, 0), moonPoints.length - 1);

  const rocketScene = rocketPoints[rIdx];
  const moonScene = moonPoints[mIdx];
  if (!rocketScene || !moonScene) return null;

  const rawDistEarth = Math.hypot(
    Number(currentPoint.X),
    Number(currentPoint.Y),
    Number(currentPoint.Z)
  );
  const sceneDistEarth = Math.hypot(
    Number(rocketScene[0]),
    Number(rocketScene[1]),
    Number(rocketScene[2])
  );

  if (
    !Number.isFinite(rawDistEarth) ||
    !Number.isFinite(sceneDistEarth) ||
    sceneDistEarth <= 0
  ) {
    return null;
  }

  const kmPerSceneUnit = rawDistEarth / sceneDistEarth;
  const sceneDistMoon = Math.hypot(
    Number(rocketScene[0]) - Number(moonScene[0]),
    Number(rocketScene[1]) - Number(moonScene[1]),
    Number(rocketScene[2]) - Number(moonScene[2])
  );

  if (!Number.isFinite(sceneDistMoon)) return null;
  return sceneDistMoon * kmPerSceneUnit;
}

export default function ProgresScene({
  missionId = "lunar-2014",
  onBack,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [speed, setSpeed] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [cameraTarget, setCameraTarget] = useState("earth");
  const [showLeft, setShowLeft] = useState(true);
  const [showBottom, setShowBottom] = useState(true);

  const trackRef = useRef(null);

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
          moonVisualPosition: [
            record.moonPosition.x,
            record.moonPosition.y,
            record.moonPosition.z,
          ],
          velocity: record.velocity,
        };
      });

      return {
        id: "artemis-1",
        name: "ARTEMIS I",
        coordinates,
        moonPoints: coordinates.map(
          (point) => point.moonVisualPosition
        ),
        rocketPoints: coordinates.map(
          (point) => point.visualPosition
        ),
        progressStart: "MISSION START",
        progressEnd: "MISSION END",
      };
    }

    const lunar2014 = getLunar2014MissionData();
    return {
      id: "lunar-2014",
      name: "ARCHIVED // LUNAR 2014",
      coordinates: lunar2014.coordinates,
      moonPoints: lunar2014.moonPoints,
      rocketPoints: lunar2014.rocketPoints,
      progressStart: "EARTH LAUNCH",
      progressEnd: "EARTH LANDING",
    };
  }, [missionId]);

  const coordinates = missionData.coordinates;
  const moonPoints = missionData.moonPoints;
  const rocketPoints = missionData.rocketPoints;

  // Daftar kamera otomatis mengikuti objek yang tersedia di data misi
  const cameraOptions = useMemo(() => {
    const options = [{ id: "earth", label: "EARTH" }];
    if (rocketPoints.length > 0) {
      options.push({ id: "rocket", label: "ROCKET" });
    }
    if (moonPoints.length > 0 && missionId !== "artemis-1") {
      options.push({ id: "moon", label: "MOON" });
    }
    return options;
  }, [rocketPoints.length, moonPoints.length, missionId]);

  const activeCameraTarget = cameraOptions.some((opt) => opt.id === cameraTarget)
    ? cameraTarget
    : "earth";

  const TOTAL_POINTS = coordinates.length;

  // Batasi index agar tidak melewati jumlah data
  const safeIndex = Math.min(
    Math.max(currentIndex, 0),
    Math.max(TOTAL_POINTS - 1, 0)
  );

  const currentPoint = coordinates[safeIndex] ?? null;

  // Progress misi
  const progress =
    TOTAL_POINTS > 1
      ? (safeIndex / (TOTAL_POINTS - 1)) * 100
      : 0;

  // Reset playback & kamera ketika berganti misi
  useEffect(() => {
    setCurrentIndex(0);
    setDirection(1);
    setSpeed(1);
    setIsScrubbing(false);
    setCameraTarget("earth");
    setIsPlaying(true);
  }, [missionId]);

  // Safety net global: lepas scrubbing jika mouse dilepas atau window kehilangan fokus
  useEffect(() => {
    if (!isScrubbing) return;

    const handleGlobalRelease = () => setIsScrubbing(false);
    window.addEventListener("pointerup", handleGlobalRelease);
    window.addEventListener("blur", handleGlobalRelease);

    return () => {
      window.removeEventListener("pointerup", handleGlobalRelease);
      window.removeEventListener("blur", handleGlobalRelease);
    };
  }, [isScrubbing]);

  // Playback (Forward & Backward Timelapse dengan Speed Multiplier)
  useEffect(() => {
    if (!isPlaying || isScrubbing || TOTAL_POINTS === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((previous) => {
        const next = previous + direction * speed;
        if (next >= TOTAL_POINTS - 1) return TOTAL_POINTS - 1;
        if (next <= 0) return 0;
        return next;
      });
    }, PLAYBACK_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, isScrubbing, TOTAL_POINTS, direction, speed]);

  // Hentikan playback ketika mencapai ujung awal/akhir sesuai arah
  useEffect(() => {
    if (TOTAL_POINTS === 0) return;
    if (direction === 1 && safeIndex >= TOTAL_POINTS - 1) {
      setIsPlaying(false);
    } else if (direction === -1 && safeIndex <= 0) {
      setIsPlaying(false);
    }
  }, [safeIndex, TOTAL_POINTS, direction]);

  // Shortcut keyboard (Spasi = Play/Pause, Panah Kiri/Kanan = Step, C = Ganti Kamera)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 50;
        setCurrentIndex((prev) => Math.min(prev + step, Math.max(TOTAL_POINTS - 1, 0)));
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 50;
        setCurrentIndex((prev) => Math.max(prev - step, 0));
      } else if (e.code === "KeyC") {
        e.preventDefault();
        setCameraTarget((prev) => {
          const idx = cameraOptions.findIndex((opt) => opt.id === prev);
          const nextIdx = (idx + 1) % cameraOptions.length;
          return cameraOptions[nextIdx]?.id ?? "earth";
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [TOTAL_POINTS, cameraOptions]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setDirection(1);
    setIsPlaying(true);
  };

  const handleRewind = () => {
    if (isPlaying && direction === -1) {
      setIsPlaying(false);
      return;
    }

    if (safeIndex <= 0 && TOTAL_POINTS > 1) {
      setCurrentIndex(TOTAL_POINTS - 1);
    }
    setDirection(-1);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    if (isPlaying && direction === 1) {
      setIsPlaying(false);
      return;
    }

    if (safeIndex >= TOTAL_POINTS - 1) {
      setCurrentIndex(0);
    }
    setDirection(1);
    setIsPlaying(true);
  };

  const handleCycleSpeed = () => {
    setSpeed((prev) => {
      const idx = SPEED_OPTIONS.indexOf(prev);
      return SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    });
  };

  // Drag / Klik Scrubber pada Progress Bar (Anti-nyangkut)
  const scrubToClientX = (clientX) => {
    if (!trackRef.current || TOTAL_POINTS <= 1) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    setCurrentIndex(Math.round(ratio * (TOTAL_POINTS - 1)));
  };

  const stopScrubbing = (e) => {
    setIsScrubbing(false);
    if (e?.currentTarget && e?.pointerId !== undefined) {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Abaikan jika pointerId sudah dilepas browser
      }
    }
  };

  const handleTrackPointerDown = (e) => {
    if (e.button !== 0) return; // Hanya respon klik kiri
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback jika capture gagal saat spam klik
    }
    setIsScrubbing(true);
    scrubToClientX(e.clientX);
  };

  const handleTrackPointerMove = (e) => {
    if (!isScrubbing) return;
    if ((e.buttons & 1) === 0) {
      stopScrubbing(e);
      return;
    }
    scrubToClientX(e.clientX);
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

  // Kalkulasi fisika dari data lintasan
  const gravityValue = calculateGravity(currentPoint);
  const velocityValue = calculateVelocity(coordinates, safeIndex);
  const distanceToMoonValue = calculateDistanceToMoon(
    currentPoint,
    rocketPoints,
    moonPoints,
    safeIndex
  );

  // Parameter sistem misi
  // Parameter sistem misi (hanya metrik yang terhitung dari dataset)
  const systemParameters = [
    {
      label: "GRAVITY",
      value: formatNumber(gravityValue, 3),
      unit: "m/s²",
      description: "Gravitational acceleration",
    },
    {
      label: "VELOCITY",
      value: formatNumber(velocityValue, 2),
      unit: "km/s",
      description: "Current spacecraft speed",
    },
    {
      label: "DISTANCE TO MOON",
      value: formatNumber(distanceToMoonValue, 0),
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

  const activeSystemCount = systemParameters.filter(
    (item) => item.value !== "N/A"
  ).length;

  return (
    <main
      className={`progress-scene ${showBottom ? "" : "bottom-hidden"
        }`}
    >
      {/* 3D Visualization */}
      <section className="mission-visual">
        <MissionScene
          missionId={missionId}
          currentIndex={safeIndex}
          moonPoints={moonPoints}
          rocketPoints={rocketPoints}
          cameraTarget={activeCameraTarget}
        />
      </section>

      {/* Back Button */}
      <button
        className="progress-back"
        onClick={onBack}
      >
        ← BACK
      </button>

      {/* Camera Angle Switcher */}
      <div
        className="camera-switcher"
        role="group"
        aria-label="Camera angle selector"
      >
        <span className="camera-label">CAM</span>
        <div className="camera-buttons">
          {cameraOptions.map((cam) => (
            <button
              key={cam.id}
              type="button"
              className={`camera-btn ${activeCameraTarget === cam.id ? "active" : ""
                }`}
              onClick={() => setCameraTarget(cam.id)}
              title={`Fokus kamera ke ${cam.label} (Shortcut: C)`}
            >
              {cam.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mission Progress */}
      <section className="mission-progress-panel">
        <div className="progress-heading">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "14px",
                letterSpacing: "1.5px",
              }}
            >
              {missionData.name}
            </span>
            <span style={{ color: "#64748b" }}>•</span>
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              MISSION PROGRESS
            </span>
          </div>
          <strong>{progress.toFixed(1)}%</strong>
        </div>

        <div
          ref={trackRef}
          className="progress-track"
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={stopScrubbing}
          onPointerCancel={stopScrubbing}
          onLostPointerCapture={stopScrubbing}
          onDragStart={(e) => e.preventDefault()}
          style={{ cursor: "pointer", touchAction: "none", userSelect: "none" }}
        >
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
            {direction === -1 ? " • REWIND" : ""}
            {speed > 1 ? ` • ${speed}x` : ""}
          </span>

          <div>
            <button onClick={handleRestart} title="Restart">
              ↺
            </button>
            <button
              onClick={handleRewind}
              title="Backward Timelapse (Rewind)"
              style={
                isPlaying && direction === -1
                  ? { borderColor: "#22c55e", color: "#22c55e" }
                  : undefined
              }
            >
              ◀◀
            </button>
            <button
              onClick={handlePlayPause}
              title={isPlaying && direction === 1 ? "Pause" : "Forward Play"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                ...(isPlaying && direction === 1
                  ? { borderColor: "#22c55e", color: "#22c55e" }
                  : {}),
              }}
            >
              {isPlaying && direction === 1 ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="2" y="1.5" width="3" height="9" rx="0.5" />
                  <rect x="7" y="1.5" width="3" height="9" rx="0.5" />
                </svg>
              ) : (
                "▶"
              )}
            </button>
            <button
              onClick={handleCycleSpeed}
              title="Kecepatan Timelapse (1x / 2x / 4x / 10x / 25x)"
              style={
                speed > 1
                  ? { borderColor: "#22c55e", color: "#22c55e", minWidth: "46px" }
                  : { minWidth: "46px" }
              }
            >
              {speed}x
            </button>
          </div>
        </div>
      </section>

      {/* Left: Rocket Telemetry */}
      <section
        className={`rocket-statistics ${showLeft ? "" : "hidden-left"
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
            className={`live-indicator ${isPlaying ? "active" : "paused"
              }`}
          >
            ● {isPlaying ? (direction === -1 ? "REWIND" : "LIVE") : "PAUSED"}
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
        className={`mission-systems-panel ${showBottom ? "" : "hidden-bottom"
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
            {activeSystemCount} / {systemParameters.length} ACTIVE
          </span>
        </div>

        <div className="systems-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
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
        className={`panel-toggle toggle-left ${showLeft ? "open" : "closed"
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
        className={`panel-toggle toggle-bottom ${showBottom ? "open" : "closed"
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