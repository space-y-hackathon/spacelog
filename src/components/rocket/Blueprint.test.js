import { test } from "node:test";
import assert from "node:assert/strict";

import { BLUEPRINT_ZONES, getMissingRequiredZones, REQUIRED_ZONES } from "./Blueprint.js";

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

test("small cone slots are labeled and placed above both booster stacks", () => {
  const smallCones = BLUEPRINT_ZONES.filter((zone) => zone.id.endsWith("cone-small"));

  assert.deepEqual(
    smallCones.map(({ id, category, placeholderLabel }) => ({ id, category, placeholderLabel })),
    [
      { id: "left-cone-small", category: "cone-small", placeholderLabel: "cone small" },
      { id: "right-cone-small", category: "cone-small", placeholderLabel: "cone small" },
    ]
  );
  assert.ok(
    smallCones.every((zone) => zone.y + zone.height / 2 === 56),
    "small cone slots should end where the first booster slots begin"
  );
});

test("engine placeholders identify the center engine", () => {
  const engineLabels = BLUEPRINT_ZONES
    .filter((zone) => zone.category === "engine")
    .map((zone) => zone.placeholderLabel);

  assert.deepEqual(engineLabels, ["engine", "core engine", "engine"]);
});
