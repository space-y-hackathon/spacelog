// src/data/scenarios/lunar/adapter.js
import { lunarTrajectoryData } from "./lunarTrajectory.js";
import { lunarOrbitData } from "./lunarOrbit.js";
import { CELESTIAL_RADII, MISSION_SCALES } from '../../../constants';

const LUNAR_SCALE = MISSION_SCALES.LUNAR_2014;
const VISUAL_EARTH_RADIUS = CELESTIAL_RADII.EARTH;
const SURFACE_RADIUS_KM = VISUAL_EARTH_RADIUS / LUNAR_SCALE;

const LAUNCH_STEPS = 45;
const LANDING_STEPS = 45;
const TRANSFER_STEP_SECONDS = 480; // 8 menit per step peluncuran/reentry

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseLunarTimestampMs(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const dateMatch = String(dateStr).trim().match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  const timeMatch = String(timeStr).trim().match(/^(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
  if (!dateMatch || !timeMatch) return null;

  const day = Number(dateMatch[1]);
  const month = MONTHS[dateMatch[2].toLowerCase()];
  const year = Number(dateMatch[3]);
  if (month === undefined) return null;

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const second = Number(timeMatch[3]);
  const ms = timeMatch[4] ? Number(timeMatch[4].padEnd(3, "0").slice(0, 3)) : 0;

  return Date.UTC(year, month, day, hour, minute, second, ms);
}

function getSurfacePoint(targetPoint, angleOffsetRad = 0.35) {
  const { X, Y, Z } = targetPoint;
  const dist = Math.hypot(X, Y, Z) || 1;

  const ux = X / dist;
  const uy = Y / dist;
  const uz = Z / dist;

  const cosA = Math.cos(angleOffsetRad);
  const sinA = Math.sin(angleOffsetRad);
  const rx = ux * cosA - uy * sinA;
  const ry = ux * sinA + uy * cosA;
  const rz = uz;

  const rNorm = Math.hypot(rx, ry, rz) || 1;
  const anchorRadius = SURFACE_RADIUS_KM * 1.002;

  return {
    X: (rx / rNorm) * anchorRadius,
    Y: (ry / rNorm) * anchorRadius,
    Z: (rz / rNorm) * anchorRadius,
  };
}

function buildTransferArc(startPt, endPt, steps, dateLabel, phaseLabel, isLaunch, anchorTimestampMs) {
  const midX = (startPt.X + endPt.X) * 0.5;
  const midY = (startPt.Y + endPt.Y) * 0.5;
  const midZ = (startPt.Z + endPt.Z) * 0.5;
  const midDist = Math.hypot(midX, midY, midZ) || 1;

  const archBoost = isLaunch ? 1.28 : 1.22;
  const ctrl = {
    X: midX * archBoost + (-midY / midDist) * 18000,
    Y: midY * archBoost + (midX / midDist) * 18000,
    Z: midZ * archBoost,
  };

  const arc = [];
  const startIdx = isLaunch ? 0 : 1;
  const endIdx = isLaunch ? steps - 1 : steps;

  for (let i = startIdx; i <= endIdx; i++) {
    const t = i / steps;
    const easedT = isLaunch ? Math.pow(t, 1.35) : 1 - Math.pow(1 - t, 1.35);
    const inv = 1 - easedT;

    const X = inv * inv * startPt.X + 2 * inv * easedT * ctrl.X + easedT * easedT * endPt.X;
    const Y = inv * inv * startPt.Y + 2 * inv * easedT * ctrl.Y + easedT * easedT * endPt.Y;
    const Z = inv * inv * startPt.Z + 2 * inv * easedT * ctrl.Z + easedT * easedT * endPt.Z;

    const stepOffset = isLaunch ? i - steps : i;
    const timestampMs =
      anchorTimestampMs !== null
        ? anchorTimestampMs + stepOffset * TRANSFER_STEP_SECONDS * 1000
        : null;

    arc.push({
      Date: dateLabel,
      Time: phaseLabel,
      X,
      Y,
      Z,
      phase: phaseLabel,
      timestampMs,
    });
  }

  return arc;
}

export function getLunar2014MissionData() {
  const rawRocket = lunarTrajectoryData.coordinates;
  const rawMoon = lunarOrbitData.coordinates;

  const firstOrbitPoint = rawRocket[0];
  const lastOrbitPoint = rawRocket[rawRocket.length - 1];

  const firstOrbitMs = parseLunarTimestampMs(firstOrbitPoint.Date, firstOrbitPoint.Time);
  const lastOrbitMs = parseLunarTimestampMs(lastOrbitPoint.Date, lastOrbitPoint.Time);

  const launchPadPoint = getSurfacePoint(firstOrbitPoint, 0.55);
  const landingZonePoint = getSurfacePoint(lastOrbitPoint, 0.45);

  const launchSegment = buildTransferArc(
    launchPadPoint,
    firstOrbitPoint,
    LAUNCH_STEPS,
    firstOrbitPoint.Date,
    "LAUNCH ASCENT",
    true,
    firstOrbitMs
  );

  const orbitalSegment = rawRocket.map((pt) => ({
    ...pt,
    phase: "CISLUNAR ORBIT",
    timestampMs: parseLunarTimestampMs(pt.Date, pt.Time),
  }));

  const landingSegment = buildTransferArc(
    lastOrbitPoint,
    landingZonePoint,
    LANDING_STEPS,
    lastOrbitPoint.Date,
    "EARTH REENTRY",
    false,
    lastOrbitMs
  );

  const fullCoordinates = [
    ...launchSegment,
    ...orbitalSegment,
    ...landingSegment,
  ];

  const paddedMoon = [
    ...Array(launchSegment.length).fill(rawMoon[0]),
    ...rawMoon,
    ...Array(landingSegment.length).fill(rawMoon[rawMoon.length - 1]),
  ];

  const toScaled = (list) =>
    list.map((p) => [p.X * LUNAR_SCALE, p.Y * LUNAR_SCALE, p.Z * LUNAR_SCALE]);

  return {
    coordinates: fullCoordinates,
    moonPoints: toScaled(paddedMoon),
    rocketPoints: toScaled(fullCoordinates),
  };
}