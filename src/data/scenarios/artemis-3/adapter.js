import {
  ARTEMIS3_MISSION_INFO,
  getArtemis3State,
  getArtemis3Trails,
} from "./artemis3Orbital";
import { SCENE_SCALE } from "../../../constants";

const SAMPLE_COUNT = 2400;
const MISSION_START_MS = Date.parse("2027-06-15T12:00:00Z");

function toSceneCoords([xKm, yKm, zKm]) {
  return [xKm * SCENE_SCALE, yKm * SCENE_SCALE, zKm * SCENE_SCALE];
}

function formatUtcParts(timestampMs) {
  const iso = new Date(timestampMs).toISOString();
  return {
    Date: iso.slice(0, 10),
    Time: iso.slice(11, 19),
  };
}

let cachedMissionData = null;

export const ARTEMIS3_PHASES = [
  {
    id: 1,
    start: 0.0,
    end: 0.15,
    label: "ORBIT INSERTION & PHASING",
    target: "STARSHIP HLS",
  },
  {
    id: 2,
    start: 0.15,
    end: 0.40,
    label: "STARSHIP HLS RENDEZVOUS & DOCKING",
    target: "STARSHIP HLS",
  },
  {
    id: 3,
    start: 0.40,
    end: 0.60,
    label: "CREW TRANSFER & LIFE SUPPORT CHECK",
    target: "STARSHIP HLS",
  },
  {
    id: 4,
    start: 0.60,
    end: 0.85,
    label: "BLUE MOON PROXIMITY & DOCKING",
    target: "BLUE MOON",
  },
  {
    id: 5,
    start: 0.85,
    end: 1.0,
    label: "DEORBIT BURN & SPLASHDOWN",
    target: "RECOVERY ZONE",
  },
];

export function getArtemis3HudData(sampleIndex, totalSamples, currentPoint) {
  const progress = totalSamples > 1 ? sampleIndex / (totalSamples - 1) : 0;

  const activePhase =
    ARTEMIS3_PHASES.find((p) => progress >= p.start && progress < p.end) ||
    ARTEMIS3_PHASES[ARTEMIS3_PHASES.length - 1];

  // Hitung jarak 3D (km) jika koordinat wahana target tersimpan di currentPoint
  let targetRangeKm = null;
  if (currentPoint) {
    const targetPos =
      activePhase.target === "BLUE MOON"
        ? currentPoint.blueMoonPos
        : currentPoint.starshipPos;

    if (targetPos) {
      const dx = currentPoint.x - targetPos.x;
      const dy = currentPoint.y - targetPos.y;
      const dz = currentPoint.z - targetPos.z;
      targetRangeKm = Math.hypot(dx, dy, dz);
    } else {
      // Fallback jika posisi Starship/Blue Moon dihitung di scene 3D (bukan di array data):
      // Simulasikan jarak mendekat (0.0 km saat fase docking/transfer)
      if (activePhase.id === 3) {
        targetRangeKm = 0.0;
      } else if (activePhase.id === 2) {
        const phasePct = (progress - 0.15) / 0.25;
        targetRangeKm = Math.max(0, 145 * (1 - phasePct));
      } else if (activePhase.id === 4) {
        const phasePct = (progress - 0.60) / 0.25;
        targetRangeKm = Math.max(0.05, 180 * (1 - phasePct));
      } else {
        targetRangeKm = 210.4;
      }
    }
  }

  return {
    phase: activePhase,
    targetRangeKm,
  };
}

export function getArtemis3MissionData() {
  if (cachedMissionData) return cachedMissionData;

  const totalSeconds = ARTEMIS3_MISSION_INFO.durationDays * 86400;
  const coordinates = [];
  const rocketPoints = [];
  const starshipPoints = [];
  const blueMoonPoints = [];

  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const progress = i / (SAMPLE_COUNT - 1);
    const state = getArtemis3State(progress);
    const timestampMs = MISSION_START_MS + progress * totalSeconds * 1000;
    const { Date: dateStr, Time: timeStr } = formatUtcParts(timestampMs);

    const [x, y, z] = state.positions.orion;

    coordinates.push({
      Date: dateStr,
      Time: timeStr,
      timestampMs,
      X: x,
      Y: y,
      Z: z,
      progress,
      metFormatted: state.metFormatted,
      orbitsCompleted: state.orbitsCompleted,
      phase: state.phase,
      dockedTo: state.dockedTo,
      telemetry: state.telemetry,
    });

    rocketPoints.push(toSceneCoords(state.positions.orion));
    starshipPoints.push(toSceneCoords(state.positions.starship));
    blueMoonPoints.push(toSceneCoords(state.positions.bluemoon));
  }

  cachedMissionData = {
    info: ARTEMIS3_MISSION_INFO,
    coordinates,
    rocketPoints,
    starshipPoints,
    blueMoonPoints,
    moonPoints: [], // Misi LEO Artemis III tidak menuju Bulan
  };

  return cachedMissionData;
}

/**
 * Mengambil dynamic trail (dalam unit scene Three.js) pada index tertentu
 * agar lintasan orbit LEO tidak menumpuk menjadi 248 garis kusut.
 */
export function getArtemis3SceneTrails(index, totalSamples = SAMPLE_COUNT) {
  const progress =
    totalSamples > 1
      ? Math.min(Math.max(index / (totalSamples - 1), 0), 1)
      : 0;

  const rawTrails = getArtemis3Trails(progress, {
    trailOrbits: 0.75,
    samples: 96,
  });

  return {
    orion: rawTrails.orion.map(toSceneCoords),
    starship: rawTrails.starship.map(toSceneCoords),
    bluemoon: rawTrails.bluemoon.map(toSceneCoords),
  };
}