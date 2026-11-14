import artemis1Mission from "./mission.js";

const SCALE = 0.0000188;

export const artemis1Trajectory =
  artemis1Mission.trajectory.map((record) => ({
    timestamp: record.timestamp,

    position: {
      x: record.position.x * SCALE,
      y: record.position.z * SCALE,
      z: -record.position.y * SCALE
    },

    velocity: record.velocity,

    rawPosition: record.position
  }));