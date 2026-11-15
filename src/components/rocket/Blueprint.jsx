
const zone = (id, label, category, x, y, width, height) => ({
  id, label, category, x, y, width, height,
});

export const BLUEPRINT_ZONES = [
  zone("escape-system", "Launch Escape System", "escape-system", 47, 5, 10, 7),
  zone("aerodynamic-cone", "Aerodynamic Cone", "aerodynamic-cone", 47, 12, 13, 9),
  zone("crew-capsule", "Crew Capsule", "capsule", 47, 21, 12, 9),
  zone("service-module", "Service Module", "service-module", 47, 30, 15, 9),

  zone("separator-upper", "Upper Adapter", "separator", 47, 39, 15, 4),
  zone("upper-stage-1", "Upper Stage 1", "fuel-tank", 47, 43, 15, 7),
  zone("upper-stage-2", "Upper Stage 2", "fuel-tank", 47, 50, 15, 7),

  zone("separator-core", "Core Separator", "separator", 47, 57, 17, 3),

  zone("core-stage-1", "Core Stage 1", "fuel-tank", 47, 60, 17, 8),
  zone("core-stage-2", "Core Stage 2", "fuel-tank", 47, 68, 17, 8),
  zone("core-stage-3", "Core Stage 3", "fuel-tank", 47, 76, 17, 8),
  zone("core-stage-4", "Core Stage 4", "fuel-tank", 47, 84, 17, 8),

  zone("left-booster-1", "Left Booster 1", "booster", 35, 60, 7, 8),
  zone("left-booster-2", "Left Booster 2", "booster", 35, 68, 7, 8),
  zone("left-booster-3", "Left Booster 3", "booster", 35, 76, 7, 8),
  zone("left-booster-4", "Left Booster 4", "booster", 35, 84, 7, 8),

  zone("right-booster-1", "Right Booster 1", "booster", 59, 60, 7, 8),
  zone("right-booster-2", "Right Booster 2", "booster", 59, 68, 7, 8),
  zone("right-booster-3", "Right Booster 3", "booster", 59, 76, 7, 8),
  zone("right-booster-4", "Right Booster 4", "booster", 59, 84, 7, 8),

  zone("engine-left", "Left Engine", "engine", 40, 94, 5, 6),
  zone("engine-center", "Center Engine", "engine", 47, 94, 5, 6),
  zone("engine-right", "Right Engine", "engine", 54, 94, 5, 6),

  zone("solar-left", "Left Solar Panel", "solar-panel", 19, 30, 7, 12),
  zone("solar-right", "Right Solar Panel", "solar-panel", 75, 30, 7, 12),

  zone("rcs-left", "Left RCS", "rcs", 37, 25, 6, 6),
  zone("rcs-right", "Right RCS", "rcs", 57, 25, 6, 6),
];
