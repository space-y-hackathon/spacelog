
import fs from "node:fs";

const inputPath = "src/data/scenarios/artemis-1/artemis1.txt";
const outputPath = "src/data/scenarios/artemis-1/mission.js";

const raw = fs.readFileSync(inputPath, "utf8");

const metadata = {};
const trajectory = [];

let inMeta = false;

for (const line of raw.split(/\r?\n/)) {
  const value = line.trim();

  if (!value) continue;

  if (value === "META_START") {
    inMeta = true;
    continue;
  }

  if (value === "META_STOP") {
    inMeta = false;
    continue;
  }

  if (inMeta && value.includes("=")) {
    const [key, ...rest] = value.split("=");
    metadata[key.trim()] = rest.join("=").trim();
    continue;
  }

  if (
    value.startsWith("COMMENT") ||
    value.startsWith("CCSDS_") ||
    value.startsWith("CREATION_DATE") ||
    value.startsWith("ORIGINATOR")
  ) {
    continue;
  }

  const columns = value.split(/\s+/);

  if (columns.length !== 7) continue;

  const [timestamp, ...values] = columns;

  if (!/^\d{4}-\d{2}-\d{2}T/.test(timestamp)) {
    continue;
  }

  const [x, y, z, vx, vy, vz] = values.map(Number);

  if (![x, y, z, vx, vy, vz].every(Number.isFinite)) {
    continue;
  }

  trajectory.push({
    timestamp,
    position: { x, y, z },
    velocity: { x: vx, y: vy, z: vz }
  });
}

if (trajectory.length === 0) {
  throw new Error("Tidak ada data trajectory yang berhasil dibaca.");
}

const mission = {
  id: "artemis-1",
  name: "Artemis I",
  agency: "NASA",
  spacecraft: metadata.OBJECT_NAME,
  objectId: metadata.OBJECT_ID,
  center: metadata.CENTER_NAME,
  coordinateSystem: metadata.REF_FRAME,
  timeSystem: metadata.TIME_SYSTEM,
  startTime: metadata.START_TIME,
  usableStartTime: metadata.USEABLE_START_TIME,
  usableStopTime: metadata.USEABLE_STOP_TIME,
  stopTime: metadata.STOP_TIME,
  totalPoints: trajectory.length,
  trajectory
};

const output = `// NASA Artemis I - Converted CCSDS OEM data
const artemis1Mission = ${JSON.stringify(mission)};

export { artemis1Mission };
export default artemis1Mission;
`;

fs.writeFileSync(outputPath, output, "utf8");

console.log("Artemis I conversion successful!");
console.log("Total records:", trajectory.length);
console.log("First:", trajectory[0].timestamp);
console.log("Last:", trajectory.at(-1).timestamp);
console.log("Output:", outputPath);