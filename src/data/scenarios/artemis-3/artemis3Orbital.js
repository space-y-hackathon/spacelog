// Konstanta Fisika & Orbit LEO Artemis III
const EARTH_RADIUS_KM = 6371;
const LEO_ALTITUDE_KM = 400; // Orbit operasional ~400 km
const LEO_RADIUS_KM = EARTH_RADIUS_KM + LEO_ALTITUDE_KM; // 6771 km
const MU_EARTH = 398600.4418; // Parameter gravitasi standar Bumi (km^3/s^2)

const TOTAL_DAYS = 16; // Durasi misi 16 hari (rentang 14–17 hari)
const TOTAL_SECONDS = TOTAL_DAYS * 86400;
const ORBITAL_PERIOD_SEC = 2 * Math.PI * Math.sqrt(Math.pow(LEO_RADIUS_KM, 3) / MU_EARTH); // ~5553 detik (~92.5 menit)
const TOTAL_ORBITS = TOTAL_SECONDS / ORBITAL_PERIOD_SEC; // ~248.9 putaran

// Inklinasi peluncuran dari Kennedy Space Center (28.5 derajat)
const INCLINATION_RAD = (28.5 * Math.PI) / 180;
const RAAN_RAD = (35 * Math.PI) / 180; // Ascending node offset

// Jarak fisik antar pusat massa saat docked (km)
const DOCKING_STANDOFF_KM = 0.045;

export const ARTEMIS3_MISSION_INFO = {
  id: "artemis-3",
  name: "Artemis III",
  subtitle: "LEO Multi-Lander Rendezvous & Docking Test",
  durationDays: TOTAL_DAYS,
  launchSite: "Kennedy Space Center, LC-39B",
  landingSite: "Pacific Ocean (Splashdown)",
  crew: [
    { name: "Randy Bresnik", role: "Commander", agency: "NASA" },
    { name: "Luca Parmitano", role: "Pilot", agency: "ESA" },
    { name: "Frank Rubio", role: "Mission Specialist", agency: "NASA" },
    { name: "Andre Douglas", role: "Mission Specialist", agency: "NASA" },
  ],
};

export const ARTEMIS3_PHASES = [
  {
    id: "launch",
    start: 0.0,
    end: 0.06,
    label: "Launch & LEO Insertion",
    target: null,
    description: "SLS meluncurkan Orion dari Kennedy Space Center menuju orbit rendah Bumi (400 km).",
  },
  {
    id: "rendezvous-starship",
    start: 0.06,
    end: 0.22,
    label: "Rendezvous: SpaceX Starship HLS",
    target: "starship",
    description: "Manuver phasing orbit rendah untuk menyusul dan mendekati purwarupa Starship HLS.",
  },
  {
    id: "docked-starship",
    start: 0.22,
    end: 0.45,
    label: "Docked: Starship HLS Operations",
    target: "starship",
    description: "Orion terhubung dengan Starship HLS; kru menguji sistem life support dan transfer kabin.",
  },
  {
    id: "rendezvous-bluemoon",
    start: 0.45,
    end: 0.62,
    label: "Transfer & Rendezvous: Blue Moon",
    target: "bluemoon",
    description: "Undocking dari Starship dan manuver transfer fase menuju wahana Blue Origin Blue Moon.",
  },
  {
    id: "docked-bluemoon",
    start: 0.62,
    end: 0.88,
    label: "Docked: Blue Moon Operations",
    target: "bluemoon",
    description: "Pengujian docking kedua, integrasi kendali, dan verifikasi sistem pendarat Blue Moon.",
  },
  {
    id: "deorbit-splashdown",
    start: 0.88,
    end: 1.0,
    label: "Deorbit Burn & Pacific Splashdown",
    target: null,
    description: "Orion melepas diri, melakukan deorbit burn, dan mendarat di Samudra Pasifik.",
  },
];

function smootherstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Konversi koordinat polar dalam bidang orbit (radius, trueAnomaly)
 * ke koordinat kartesian 3D ECI [x, y, z] (Z-up) dalam km.
 * Catatan: jika Three.js menggunakan Y-up tanpa rotasi grup parent,
 * lakukan mapping [x, z, -y] saat konversi ke unit scene di adapter.js.
 */
function orbitalToInertial(radiusKm, angleRad, inclination = INCLINATION_RAD, raan = RAAN_RAD) {
  const xOrb = radiusKm * Math.cos(angleRad);
  const yOrb = radiusKm * Math.sin(angleRad);

  const cosO = Math.cos(raan);
  const sinO = Math.sin(raan);
  const cosI = Math.cos(inclination);
  const sinI = Math.sin(inclination);

  const x = xOrb * cosO - yOrb * cosI * sinO;
  const y = xOrb * sinO + yOrb * cosI * cosO;
  const z = yOrb * sinI;

  return [x, y, z];
}

/**
 * Kalkulasi inti posisi ketiga wahana (ringan, dipakai ulang oleh getArtemis3Trails)
 */
function computeArtemis3Positions(progress) {
  const baseTheta = progress * TOTAL_ORBITS * 2 * Math.PI;

  // 1. SpaceX Starship HLS
  const starshipTheta = baseTheta;
  const starshipRadius = LEO_RADIUS_KM;
  const starshipPos = orbitalToInertial(starshipRadius, starshipTheta);

  // 2. Blue Origin Blue Moon (+1.45 rad di depan Starship)
  const blueMoonPhaseOffset = 1.45;
  const blueMoonTheta = baseTheta + blueMoonPhaseOffset;
  const blueMoonAltAdjust = lerp(12, 0, smootherstep(0.45, 0.56, progress));
  const blueMoonRadius = LEO_RADIUS_KM + blueMoonAltAdjust;
  const blueMoonPos = orbitalToInertial(blueMoonRadius, blueMoonTheta);

  // 3. Kapsul Orion
  let orionRadius = LEO_RADIUS_KM;
  let orionTheta = baseTheta;
  let dockedTo = null;

  if (progress < 0.06) {
    const t = smootherstep(0.0, 0.06, progress);
    orionRadius = lerp(EARTH_RADIUS_KM, LEO_RADIUS_KM - 55, t);
    orionTheta = starshipTheta - 0.85 - lerp(0.35, 0, t);
  } else if (progress < 0.22) {
    const t = smootherstep(0.06, 0.22, progress);
    const phasingDip = Math.sin(t * Math.PI) * 35;
    orionRadius = lerp(LEO_RADIUS_KM - 55, LEO_RADIUS_KM, t) - phasingDip;
    orionTheta = starshipTheta + lerp(-0.85, 0, t);
  } else if (progress < 0.45) {
    orionRadius = starshipRadius;
    orionTheta = starshipTheta;
    dockedTo = "starship";
  } else if (progress < 0.62) {
    const t = smootherstep(0.45, 0.62, progress);
    const phasingDip = Math.sin(t * Math.PI) * 45;
    orionRadius = LEO_RADIUS_KM - phasingDip;
    orionTheta = baseTheta + lerp(0, blueMoonPhaseOffset, t);
  } else if (progress < 0.88) {
    orionRadius = blueMoonRadius;
    orionTheta = blueMoonTheta;
    dockedTo = "bluemoon";
  } else {
    const t = smootherstep(0.88, 1.0, progress);
    orionRadius = lerp(LEO_RADIUS_KM, EARTH_RADIUS_KM, t * t);
    orionTheta = blueMoonTheta + lerp(0, 0.65, t);
  }

  let orionPos = orbitalToInertial(orionRadius, orionTheta);

  // Hitung arah tangensial orbit untuk standoff docking agar halus (tanpa snap)
  const starshipDockBlend =
    smootherstep(0.205, 0.22, progress) * (1 - smootherstep(0.45, 0.465, progress));
  const blueMoonDockBlend =
    smootherstep(0.605, 0.62, progress) * (1 - smootherstep(0.88, 0.895, progress));

  const dockingBlend = Math.max(starshipDockBlend, blueMoonDockBlend);
  const dockingSign = blueMoonDockBlend > starshipDockBlend ? 1 : -1;

  const tangentAngle = orionTheta + Math.PI / 2;
  const [tx, ty, tz] = orbitalToInertial(1, tangentAngle);
  const dockingOffsetDir = [tx * dockingSign, ty * dockingSign, tz * dockingSign];

  if (dockingBlend > 0) {
    const offsetKm = DOCKING_STANDOFF_KM * dockingBlend;
    orionPos = [
      orionPos[0] + dockingOffsetDir[0] * offsetKm,
      orionPos[1] + dockingOffsetDir[1] * offsetKm,
      orionPos[2] + dockingOffsetDir[2] * offsetKm,
    ];
  }

  return {
    orionRadius,
    orionTheta,
    dockedTo,
    dockingBlend,
    dockingOffsetDir,
    positions: {
      orion: orionPos,
      starship: starshipPos,
      bluemoon: blueMoonPos,
    },
  };
}

/**
 * Menghitung state lengkap ketiga wahana pada nilai progress [0..1]
 */
export function getArtemis3State(rawProgress) {
  const progress = Math.max(0, Math.min(1, rawProgress));
  const elapsedSec = progress * TOTAL_SECONDS;
  const missionDay = progress * TOTAL_DAYS;

  const {
    orionRadius,
    dockedTo,
    dockingBlend,
    dockingOffsetDir,
    positions,
  } = computeArtemis3Positions(progress);

  const currentPhase =
    ARTEMIS3_PHASES.find((p) => progress >= p.start && progress <= p.end) ||
    ARTEMIS3_PHASES[ARTEMIS3_PHASES.length - 1];

  // Telemetri HUD dengan ramp akselerasi peluncuran & deselerasi reentry
  const altitudeKm = Math.max(0, orionRadius - EARTH_RADIUS_KM);
  const circularVelKmS = Math.sqrt(MU_EARTH / orionRadius);
  const ascentFactor = smootherstep(0.0, 0.06, progress);
  const reentryFactor = 1 - smootherstep(0.88, 1.0, progress);
  const velocityKmS = circularVelKmS * ascentFactor * reentryFactor;

  return {
    progress,
    missionDay,
    metFormatted: formatMET(elapsedSec),
    orbitsCompleted: Math.floor(progress * TOTAL_ORBITS),
    phase: currentPhase,
    dockedTo,
    dockingBlend,
    dockingOffsetDir,
    telemetry: {
      altitudeKm: Number(altitudeKm.toFixed(1)),
      velocityKmS: Number(velocityKmS.toFixed(2)),
      inclinationDeg: 28.5,
    },
    positions,
  };
}

/**
 * Menghasilkan array titik [x, y, z] (km) untuk ekor lintasan (dynamic trail)
 */
export function getArtemis3Trails(progress, { trailOrbits = 0.85, samples = 96 } = {}) {
  const clamped = Math.max(0, Math.min(1, progress));
  const trailSpan = trailOrbits / TOTAL_ORBITS;
  const startP = Math.max(0, clamped - trailSpan);

  if (clamped <= 0.0001) {
    const initial = computeArtemis3Positions(0).positions;
    return {
      orion: [initial.orion],
      starship: [initial.starship],
      bluemoon: [initial.bluemoon],
    };
  }

  const orion = [];
  const starship = [];
  const bluemoon = [];

  for (let i = 0; i <= samples; i++) {
    const p = lerp(startP, clamped, i / samples);
    const { positions } = computeArtemis3Positions(p);
    orion.push(positions.orion);
    starship.push(positions.starship);
    bluemoon.push(positions.bluemoon);
  }

  return { orion, starship, bluemoon };
}

function formatMET(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m`;
}