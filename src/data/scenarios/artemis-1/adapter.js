import artemis1Mission from "./mission.js";
import { CELESTIAL_RADII, MISSION_SCALES } from "../../../constants";

const SCALE =
  MISSION_SCALES.ARTEMIS_1 ??
  MISSION_SCALES.ARTEMIS1 ??
  MISSION_SCALES.LUNAR_2014;

const SURFACE_RADIUS_KM = CELESTIAL_RADII.EARTH / SCALE;

const LAUNCH_STEPS = 45;
const LANDING_STEPS = 45;
const DEG2RAD = Math.PI / 180;

function toScenePosition(pos) {
  return {
    x: pos.x * SCALE,
    y: pos.z * SCALE,
    z: -pos.y * SCALE,
  };
}

// Hitung koordinat geocentric J2000 (km) Bulan dari timestamp misi
function getMoonGeocentricKm(timestamp) {
  const ms = new Date(timestamp).getTime();
  const safeMs = Number.isFinite(ms) ? ms : Date.UTC(2022, 10, 16);
  const jd = safeMs / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;

  const Lp = (218.3164477 + 481267.88123421 * T) * DEG2RAD;
  const D = (297.8501921 + 445267.1114034 * T) * DEG2RAD;
  const M = (357.5291092 + 35999.0502909 * T) * DEG2RAD;
  const Mp = (134.9633964 + 477198.8675055 * T) * DEG2RAD;
  const F = (93.2720950 + 483202.0175233 * T) * DEG2RAD;

  const lon =
    Lp +
    (6.289 * Math.sin(Mp) +
      1.274 * Math.sin(2 * D - Mp) +
      0.658 * Math.sin(2 * D) +
      0.214 * Math.sin(2 * Mp) -
      0.186 * Math.sin(M) -
      0.114 * Math.sin(2 * F)) *
      DEG2RAD;

  const lat =
    (5.128 * Math.sin(F) +
      0.28 * Math.sin(Mp + F) +
      0.277 * Math.sin(Mp - F) +
      0.173 * Math.sin(2 * D - F)) *
    DEG2RAD;

  const distKm =
    385001 -
    20905 * Math.cos(Mp) -
    3699 * Math.cos(2 * D - Mp) -
    2956 * Math.cos(2 * D) -
    570 * Math.cos(2 * Mp) +
    246 * Math.cos(2 * Mp - 2 * D);

  const cosLat = Math.cos(lat);
  const xEcl = distKm * cosLat * Math.cos(lon);
  const yEcl = distKm * cosLat * Math.sin(lon);
  const zEcl = distKm * Math.sin(lat);

  const eps = 23.4392911 * DEG2RAD;
  const cosEps = Math.cos(eps);
  const sinEps = Math.sin(eps);

  return {
    x: xEcl,
    y: yEcl * cosEps - zEcl * sinEps,
    z: yEcl * sinEps + zEcl * cosEps,
  };
}

function getSurfacePoint(targetPos, angleOffsetRad = 0.35) {
  const { x, y, z } = targetPos;
  const dist = Math.hypot(x, y, z) || 1;

  const ux = x / dist;
  const uy = y / dist;
  const uz = z / dist;

  const cosA = Math.cos(angleOffsetRad);
  const sinA = Math.sin(angleOffsetRad);

  const rx = ux * cosA - uy * sinA;
  const ry = ux * sinA + uy * cosA;
  const rz = uz;

  const rNorm = Math.hypot(rx, ry, rz) || 1;
  const anchorRadius = SURFACE_RADIUS_KM * 1.002;

  return {
    x: (rx / rNorm) * anchorRadius,
    y: (ry / rNorm) * anchorRadius,
    z: (rz / rNorm) * anchorRadius,
  };
}

function buildTransferArc(startPos, endPos, tangentDir, steps, timestamp, velocity, isLaunch) {
  const dist = Math.hypot(endPos.x - startPos.x, endPos.y - startPos.y, endPos.z - startPos.z) || 1;
  const tLen = Math.hypot(tangentDir.x, tangentDir.y, tangentDir.z) || 1;

  const handle = dist * 0.45;
  const ctrl = isLaunch
    ? {
        x: endPos.x - (tangentDir.x / tLen) * handle,
        y: endPos.y - (tangentDir.y / tLen) * handle,
        z: endPos.z - (tangentDir.z / tLen) * handle,
      }
    : {
        x: startPos.x + (tangentDir.x / tLen) * handle,
        y: startPos.y + (tangentDir.y / tLen) * handle,
        z: startPos.z + (tangentDir.z / tLen) * handle,
      };

  // Jaga agar kurva tidak masuk menembus ke dalam bola Bumi
  const ctrlDist = Math.hypot(ctrl.x, ctrl.y, ctrl.z) || 1;
  const minCtrlRadius = SURFACE_RADIUS_KM * 1.03;
  if (ctrlDist < minCtrlRadius) {
    const push = minCtrlRadius / ctrlDist;
    ctrl.x *= push;
    ctrl.y *= push;
    ctrl.z *= push;
  }

  const arc = [];
  const startIdx = isLaunch ? 0 : 1;
  const endIdx = isLaunch ? steps - 1 : steps;

  for (let i = startIdx; i <= endIdx; i++) {
    const t = i / steps;
    const easedT = isLaunch ? t * t : 1 - (1 - t) * (1 - t);
    const inv = 1 - easedT;

    arc.push({
      timestamp,
      velocity,
      position: {
        x: inv * inv * startPos.x + 2 * inv * easedT * ctrl.x + easedT * easedT * endPos.x,
        y: inv * inv * startPos.y + 2 * inv * easedT * ctrl.y + easedT * easedT * endPos.y,
        z: inv * inv * startPos.z + 2 * inv * easedT * ctrl.z + easedT * easedT * endPos.z,
      },
    });
  }

  return arc;
}

const rawRecords = artemis1Mission.trajectory;
const firstRecord = rawRecords[0];
const secondRecord = rawRecords[1] ?? firstRecord;
const prevLastRecord = rawRecords[rawRecords.length - 2] ?? rawRecords[rawRecords.length - 1];
const lastRecord = rawRecords[rawRecords.length - 1];

const zeroVelocity =
  typeof firstRecord.velocity === "object" && firstRecord.velocity !== null
    ? { x: 0, y: 0, z: 0 }
    : 0;

const launchPadPos = getSurfacePoint(firstRecord.position, 0.35);
const landingZonePos = getSurfacePoint(lastRecord.position, 0.05);

const launchTangent = {
  x: secondRecord.position.x - firstRecord.position.x,
  y: secondRecord.position.y - firstRecord.position.y,
  z: secondRecord.position.z - firstRecord.position.z,
};

const landingTangent = {
  x: lastRecord.position.x - prevLastRecord.position.x,
  y: lastRecord.position.y - prevLastRecord.position.y,
  z: lastRecord.position.z - prevLastRecord.position.z,
};

const launchSegment = buildTransferArc(
  launchPadPos,
  firstRecord.position,
  launchTangent,
  LAUNCH_STEPS,
  firstRecord.timestamp,
  zeroVelocity,
  true
);

const landingSegment = buildTransferArc(
  lastRecord.position,
  landingZonePos,
  landingTangent,
  LANDING_STEPS,
  lastRecord.timestamp,
  zeroVelocity,
  false
);

const fullTrajectory = [
  ...launchSegment,
  ...rawRecords,
  ...landingSegment,
];

export const artemis1Trajectory = fullTrajectory.map((record) => {
  const moonRaw = getMoonGeocentricKm(record.timestamp);
  return {
    timestamp: record.timestamp,
    position: toScenePosition(record.position),
    moonPosition: toScenePosition(moonRaw),
    velocity: record.velocity,
    rawPosition: record.position,
  };
});