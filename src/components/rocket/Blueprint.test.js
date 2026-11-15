import { test } from "node:test";
import assert from "node:assert/strict";

import { getMissingRequiredZones, REQUIRED_ZONES } from "./Blueprint.js";

const completeAssembly = () => REQUIRED_ZONES.map((zone) => ({
  zoneId: zone.id,
  category: zone.category,
}));

test("launch requirements start missing and are met only by a complete assembly", () => {
  assert.deepEqual(getMissingRequiredZones([]), REQUIRED_ZONES);
  assert.deepEqual(getMissingRequiredZones(completeAssembly()), []);
});

test("removing or replacing a required part with an incompatible part blocks launch", () => {
  const parts = completeAssembly();
  const missing = parts.pop();

  assert.deepEqual(getMissingRequiredZones(parts).map((zone) => zone.id), [missing.zoneId]);
  parts.push({ ...missing, category: "capsule" });
  assert.deepEqual(getMissingRequiredZones(parts).map((zone) => zone.id), [missing.zoneId]);
});

test("extra and duplicate parts do not satisfy other required positions", () => {
  const parts = completeAssembly().slice(1);
  parts.push(parts[0], { zoneId: "engine-left", category: "engine" });

  assert.deepEqual(getMissingRequiredZones(parts).map((zone) => zone.id), [REQUIRED_ZONES[0].id]);
});
