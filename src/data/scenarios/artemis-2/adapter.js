// src/data/scenarios/artemis-2/adapter.js
import { artemis2Trajectory } from "./mission.js";
import { artemis2Moon } from "./moon.js";
import { CELESTIAL_RADII, MISSION_SCALES } from "../../../constants";

const SCALE = MISSION_SCALES.ARTEMIS_2 ?? MISSION_SCALES.LUNAR_2014;
const VISUAL_EARTH_RADIUS = CELESTIAL_RADII.EARTH;
const SURFACE_RADIUS_KM = VISUAL_EARTH_RADIUS / SCALE;

const LAUNCH_STEPS = 45;
const LANDING_STEPS = 45;
const TRANSFER_STEP_SECONDS = 480;
const SAFE_ORBIT_RADIUS_KM = SURFACE_RADIUS_KM * 1.055; // Aman di luar permukaan (1.0) & atmosfer (1.025)

function enforceRadialClearance(pt, minRadiusKm) {
    const r = Math.hypot(pt.X, pt.Y, pt.Z);
    if (r > 0 && r < minRadiusKm) {
        const push = minRadiusKm / r;
        return {
            ...pt,
            X: pt.X * push,
            Y: pt.Y * push,
            Z: pt.Z * push,
        };
    }
    return pt;
}

function segmentMinDistanceToOrigin(a, b) {
    const dx = b.X - a.X;
    const dy = b.Y - a.Y;
    const dz = b.Z - a.Z;
    const lenSq = dx * dx + dy * dy + dz * dz;
    if (lenSq === 0) return Math.hypot(a.X, a.Y, a.Z);

    const t = Math.max(0, Math.min(1, -(a.X * dx + a.Y * dy + a.Z * dz) / lenSq));
    return Math.hypot(a.X + t * dx, a.Y + t * dy, a.Z + t * dz);
}

function slerpPoint(a, b, s, minRadiusKm) {
    const rA = Math.hypot(a.X, a.Y, a.Z) || minRadiusKm;
    const rB = Math.hypot(b.X, b.Y, b.Z) || minRadiusKm;

    const uxA = a.X / rA, uyA = a.Y / rA, uzA = a.Z / rA;
    const uxB = b.X / rB, uyB = b.Y / rB, uzB = b.Z / rB;

    const dot = Math.max(-1, Math.min(1, uxA * uxB + uyA * uyB + uzA * uzB));
    const omega = Math.acos(dot);

    let ux, uy, uz;
    if (omega < 1e-5) {
        ux = uxA + (uxB - uxA) * s;
        uy = uyA + (uyB - uyA) * s;
        uz = uzA + (uzB - uzA) * s;
        const norm = Math.hypot(ux, uy, uz) || 1;
        ux /= norm; uy /= norm; uz /= norm;
    } else {
        const sinOmega = Math.sin(omega);
        const wA = Math.sin((1 - s) * omega) / sinOmega;
        const wB = Math.sin(s * omega) / sinOmega;
        ux = uxA * wA + uxB * wB;
        uy = uyA * wA + uyB * wB;
        uz = uzA * wA + uzB * wB;
    }

    const safeR = Math.max(rA + (rB - rA) * s, minRadiusKm);
    const timestampMs =
        a.timestampMs !== null && b.timestampMs !== null
            ? Math.round(a.timestampMs + (b.timestampMs - a.timestampMs) * s)
            : a.timestampMs;

    return {
        ...a,
        X: ux * safeR,
        Y: uy * safeR,
        Z: uz * safeR,
        timestampMs,
    };
}

function densifyCloseEarthPasses(orbitalPts, moonPts, minRadiusKm) {
    const outRocket = [];
    const outMoon = [];
    const SUB_STEPS = 16;

    for (let i = 0; i < orbitalPts.length; i++) {
        const curr = orbitalPts[i];
        const currMoon = moonPts[i];
        outRocket.push(curr);
        outMoon.push(currMoon);

        if (i < orbitalPts.length - 1) {
            const next = orbitalPts[i + 1];
            const nextMoon = moonPts[i + 1];

            if (segmentMinDistanceToOrigin(curr, next) < minRadiusKm) {
                for (let k = 1; k < SUB_STEPS; k++) {
                    const s = k / SUB_STEPS;
                    outRocket.push(slerpPoint(curr, next, s, minRadiusKm));
                    outMoon.push({
                        ...currMoon,
                        X: currMoon.X + (nextMoon.X - currMoon.X) * s,
                        Y: currMoon.Y + (nextMoon.Y - currMoon.Y) * s,
                        Z: currMoon.Z + (nextMoon.Z - currMoon.Z) * s,
                    });
                }
            }
        }
    }

    return { orbitalPts: outRocket, orbitalMoonPts: outMoon };
}

const MONTHS = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function normalizeHorizonsRecord(item) {
    const cleanFullDate = String(item.date || "")
        .replace(/^A\.D\.\s*/i, "")
        .replace(/\s*TDB$/i, "")
        .trim();
    const [datePart = "", timePart = "00:00:00"] = cleanFullDate.split(/\s+/);

    return {
        jd: item.jd,
        Date: datePart,
        Time: timePart,
        X: Number(item.x),
        Y: Number(item.y),
        Z: Number(item.z),
        VX: Number(item.vx),
        VY: Number(item.vy),
        VZ: Number(item.vz),
    };
}

export function parseArtemis2TimestampMs(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const cleanDate = String(dateStr).trim();
    const cleanTime = String(timeStr).trim();

    const timeMatch = cleanTime.match(/^(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);

    // Mendukung format JPL Horizons "YYYY-Mon-DD" (contoh: "2026-Apr-02")
    const horizonsMatch = cleanDate.match(/^(\d{4})-([A-Za-z]{3})-(\d{1,2})$/);
    if (horizonsMatch && timeMatch) {
        const month = MONTHS[horizonsMatch[2].toLowerCase()];
        if (month === undefined) return null;
        const ms = timeMatch[4] ? Number(timeMatch[4].padEnd(3, "0").slice(0, 3)) : 0;
        return Date.UTC(
            Number(horizonsMatch[1]),
            month,
            Number(horizonsMatch[3]),
            Number(timeMatch[1]),
            Number(timeMatch[2]),
            Number(timeMatch[3]),
            ms
        );
    }

    // Mendukung format "DD Mon YYYY" (seperti dataset lunar-2014)
    const textMatch = cleanDate.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (textMatch && timeMatch) {
        const month = MONTHS[textMatch[2].toLowerCase()];
        if (month === undefined) return null;
        const ms = timeMatch[4] ? Number(timeMatch[4].padEnd(3, "0").slice(0, 3)) : 0;
        return Date.UTC(
            Number(textMatch[3]),
            month,
            Number(textMatch[1]),
            Number(timeMatch[1]),
            Number(timeMatch[2]),
            Number(timeMatch[3]),
            ms
        );
    }

    // Mendukung format ISO "YYYY-MM-DD"
    const isoParsed = Date.parse(`${cleanDate}T${cleanTime}Z`);
    return Number.isNaN(isoParsed) ? null : isoParsed;
}

function getAlignedSurfacePoint(anchorPt, neighborPt, isLaunch, fallbackAngleRad = 0.25) {
    const anchorDist = Math.hypot(anchorPt.X, anchorPt.Y, anchorPt.Z) || 1;
    const ux = anchorPt.X / anchorDist;
    const uy = anchorPt.Y / anchorDist;
    const uz = anchorPt.Z / anchorDist;

    // Ambil arah tangen pergerakan orbit agar transisi mulus tanpa belokan patah
    let tx = 0;
    let ty = 0;
    let tz = 0;

    if (neighborPt) {
        const dirSign = isLaunch ? -1 : 1;
        tx = (neighborPt.X - anchorPt.X) * dirSign;
        ty = (neighborPt.Y - anchorPt.Y) * dirSign;
        tz = (neighborPt.Z - anchorPt.Z) * dirSign;
    }

    // Proyeksikan tangen agar tegak lurus terhadap vektor radial Bumi
    const radialDot = tx * ux + ty * uy + tz * uz;
    tx -= radialDot * ux;
    ty -= radialDot * uy;
    tz -= radialDot * uz;

    const tLen = Math.hypot(tx, ty, tz);
    const anchorRadius = SURFACE_RADIUS_KM * 1.003;

    if (tLen > 1e-6) {
        const stepAngle = 0.25; // ~14 derajat searah bidang orbit
        const cosA = Math.cos(stepAngle);
        const sinA = Math.sin(stepAngle);
        return {
            X: (ux * cosA + (tx / tLen) * sinA) * anchorRadius,
            Y: (uy * cosA + (ty / tLen) * sinA) * anchorRadius,
            Z: (uz * cosA + (tz / tLen) * sinA) * anchorRadius,
        };
    }

    const cosA = Math.cos(fallbackAngleRad);
    const sinA = Math.sin(fallbackAngleRad);
    const rx = ux * cosA - uy * sinA;
    const ry = ux * sinA + uy * cosA;
    const rNorm = Math.hypot(rx, ry, uz) || 1;

    return {
        X: (rx / rNorm) * anchorRadius,
        Y: (ry / rNorm) * anchorRadius,
        Z: (uz / rNorm) * anchorRadius,
    };
}

function buildTransferArc(startPt, endPt, steps, dateLabel, phaseLabel, isLaunch, anchorTimestampMs) {
    const r0 = Math.hypot(startPt.X, startPt.Y, startPt.Z) || SURFACE_RADIUS_KM;
    const r1 = Math.hypot(endPt.X, endPt.Y, endPt.Z) || SURFACE_RADIUS_KM;

    const midX = (startPt.X + endPt.X) * 0.5;
    const midY = (startPt.Y + endPt.Y) * 0.5;
    const midZ = (startPt.Z + endPt.Z) * 0.5;

    // Angkat titik kontrol secara radial tanpa tendangan menyamping 18000 km
    const archBoost = isLaunch ? 1.16 : 1.12;
    const ctrl = {
        X: midX * archBoost,
        Y: midY * archBoost,
        Z: midZ * archBoost,
    };

    const minSurfaceRadius = SURFACE_RADIUS_KM * 1.003;
    const arc = [];
    const startIdx = isLaunch ? 0 : 1;
    const endIdx = isLaunch ? steps - 1 : steps;

    for (let i = startIdx; i <= endIdx; i++) {
        const t = i / steps;
        const easedT = isLaunch ? Math.pow(t, 1.35) : 1 - Math.pow(1 - t, 1.35);
        const inv = 1 - easedT;

        let X = inv * inv * startPt.X + 2 * inv * easedT * ctrl.X + easedT * easedT * endPt.X;
        let Y = inv * inv * startPt.Y + 2 * inv * easedT * ctrl.Y + easedT * easedT * endPt.Y;
        let Z = inv * inv * startPt.Z + 2 * inv * easedT * ctrl.Z + easedT * easedT * endPt.Z;

        // Anti-chord-cutting: jaga radius tiap titik tetap di luar permukaan Bumi
        const currentRadius = Math.hypot(X, Y, Z);
        const envelopeRadius = r0 + (r1 - r0) * easedT;
        const minAllowedRadius = Math.max(minSurfaceRadius, envelopeRadius);

        if (currentRadius > 0 && currentRadius < minAllowedRadius) {
            const push = minAllowedRadius / currentRadius;
            X *= push;
            Y *= push;
            Z *= push;
        }

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

export function getArtemis2MissionData() {
    const rawRocket = (artemis2Trajectory || []).map(normalizeHorizonsRecord);
    const rawMoon = (artemis2Moon || []).map(normalizeHorizonsRecord);

    if (!rawRocket.length || !rawMoon.length) {
        return {
            coordinates: [],
            moonPoints: [],
            rocketPoints: [],
        };
    }

    const baseOrbital = rawRocket.map((pt) =>
        enforceRadialClearance(
            {
                ...pt,
                phase: "CISLUNAR FLYBY",
                timestampMs: parseArtemis2TimestampMs(pt.Date, pt.Time),
                ...(Number.isFinite(pt.VX) &&
                    Number.isFinite(pt.VY) &&
                    Number.isFinite(pt.VZ)
                    ? {
                        velocity: {
                            x: pt.VX,
                            y: pt.VY,
                            z: pt.VZ,
                        },
                    }
                    : {}),
            },
            SAFE_ORBIT_RADIUS_KM
        )
    );

    const { orbitalPts: orbitalSegment, orbitalMoonPts } = densifyCloseEarthPasses(
        baseOrbital,
        rawMoon,
        SAFE_ORBIT_RADIUS_KM
    );

    const firstOrbitPoint = orbitalSegment[0];
    const lastOrbitPoint = orbitalSegment[orbitalSegment.length - 1];

    const firstOrbitMs = firstOrbitPoint.timestampMs;
    const lastOrbitMs = lastOrbitPoint.timestampMs;

    const launchPadPoint = getAlignedSurfacePoint(
        firstOrbitPoint,
        orbitalSegment[1],
        true,
        0.25
    );
    const landingZonePoint = getAlignedSurfacePoint(
        lastOrbitPoint,
        orbitalSegment[orbitalSegment.length - 2],
        false,
        0.25
    );

    const launchSegment = buildTransferArc(
        launchPadPoint,
        firstOrbitPoint,
        LAUNCH_STEPS,
        firstOrbitPoint.Date,
        "LAUNCH ASCENT",
        true,
        firstOrbitMs
    );

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
        ...Array(launchSegment.length).fill(orbitalMoonPts[0]),
        ...orbitalMoonPts,
        ...Array(landingSegment.length).fill(orbitalMoonPts[orbitalMoonPts.length - 1]),
    ];

    const toScaled = (list) =>
        list.map((p) => [p.X * SCALE, p.Y * SCALE, p.Z * SCALE]);

    return {
        coordinates: fullCoordinates,
        moonPoints: toScaled(paddedMoon),
        rocketPoints: toScaled(fullCoordinates),
    };
}