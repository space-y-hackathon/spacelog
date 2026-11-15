
const placeholderLabels = {
  "aerodynamic-cone": "cone small",
  "left-cone-small": "cone small",
  "right-cone-small": "cone small",
  "separator-upper": "separator",
  "core-stage-1": "big core stage",
  "core-stage-2": "big core stage",
  "core-stage-4": "big core stage",
  "left-booster-1": "booster",
  "left-booster-2": "booster",
  "left-booster-3": "booster",
  "left-booster-4": "booster",
  "right-booster-1": "booster",
  "right-booster-2": "booster",
  "right-booster-3": "booster",
  "right-booster-4": "booster",
  "engine-left": "engine",
  "core-engine": "core engine",
  "engine-right": "engine",
  "core-stage-3": "Core Stage 3",
  "big-cone-separator": "Big Cone Separator",
  "left-rcs": "Left RCS",
  "right-rcs": "Right RCS"
};

const zone = (id, label, category, x, y, width, height, required = false) => ({
  id, label, category, x, y, width, height, required,
  placeholderLabel: placeholderLabels[id] ?? label,
});

export const BLUEPRINT_ZONES = [
  zone("escape-system", "Launch Escape System", "escape-system", 47, 5, 10, 7, true),
  zone("crew-capsule", "Crew Capsule", "capsule", 47, 21, 12, 9, true),
  zone("service-module", "Service Module", "service-module", 47, 30, 15, 9, true),

  zone("separator-upper", "Upper Adapter", "separator", 47, 39, 15, 4),
  zone("core-stage-3", "core stage 3", "core-stage-3", 47, 50, 15, 7),

  zone("big-cone-separator", "big-cone-separator", "big-cone-separator", 47, 57, 17, 3, true),

  zone("core-stage-1", "Core Stage 1", "fuel-tank", 47, 60, 17, 8, true),
  zone("core-stage-2", "Core Stage 2", "fuel-tank", 47, 68, 17, 8),
  zone("core-stage-4", "Core Stage 4", "fuel-tank", 47, 84, 17, 8),

  zone("left-cone-small", "Left Cone Small", "cone-small", 35, 53, 7, 6),
  zone("right-cone-small", "Right Cone Small", "cone-small", 59, 53, 7, 6),

  zone("left-booster-1", "Left Booster 1", "booster", 35, 60, 7, 8),
  zone("left-booster-2", "Left Booster 2", "booster", 35, 68, 7, 8),
  zone("left-booster-3", "Left Booster 3", "booster", 35, 76, 7, 8),
  zone("left-booster-4", "Left Booster 4", "booster", 35, 84, 7, 8),

  zone("right-booster-1", "Right Booster 1", "booster", 59, 60, 7, 8),
  zone("right-booster-2", "Right Booster 2", "booster", 59, 68, 7, 8),
  zone("right-booster-3", "Right Booster 3", "booster", 59, 76, 7, 8),
  zone("right-booster-4", "Right Booster 4", "booster", 59, 84, 7, 8),

  zone("engine-left", "Left Engine", "engine", 40, 94, 5, 6),
  zone("core-engine", "Core Engine", "core-engine", 47, 94, 5, 6, true),
  zone("engine-right", "Right Engine", "engine", 54, 94, 5, 6),

  zone("rcs-left", "Left RCS", "left-rcs", 37, 25, 6, 6),
  zone("rcs-right", "Right RCS", "right-rcs", 57, 25, 6, 6),
];

export const REQUIRED_ZONES = BLUEPRINT_ZONES.filter((zone) => zone.required);

export function getMissingRequiredZones(parts) {
  return REQUIRED_ZONES.filter(
    (zone) => !parts.some(
      (part) => part.zoneId === zone.id && part.category === zone.category
    )
  );
}
