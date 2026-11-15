import artemisRocket from './assets/artemis.png'

export const SHOWCASE_VEHICLES = [
  {
    id: 'artemis-1',
    indexLabel: '1/3',
    name: 'ARTEMIS I',
    subtitle: 'UNCREWED LUNAR FLYBY TEST',
    image: artemisRocket,
    status: 'COMPLETED // 2022',
  },
  {
    id: 'artemis-2',
    indexLabel: '2/3',
    name: 'ARTEMIS II',
    subtitle: 'CREWED LUNAR FLYBY MISSION',
    image: artemisRocket,
    status: 'FLIGHT RECONSTRUCTION',
  },
  {
    id: 'artemis-3',
    indexLabel: '3/3',
    name: 'ARTEMIS III',
    subtitle: 'FUTURE LUNAR SOUTH POLE LANDING',
    image: artemisRocket,
    status: 'FUTURE PROFILE',
  },
]

export const PANEL_CONTENT = {
  play: {
    kicker: 'FLIGHT PROGRAM',
    title: 'Choose your journey.',
    description: 'Start a free sandbox session or reconstruct an Artemis lunar mission.',
    options: [
      {
        title: 'MISSION SCENARIO',
        description: 'Reconstruct Artemis I, Artemis II, and future Artemis III trajectories.',
        nextPanel: 'scenario',
      },
      {
        title: 'NEW SANDBOX',
        description: 'Build and experiment with orbital maneuvers without a fixed objective.',
        nextPanel: 'sandbox',
      },
    ],
  },
  scenario: {
    kicker: 'ARTEMIS PROGRAM',
    title: 'Select Mission Profile',
    description: 'Choose a lunar mission reconstruction to simulate.',
    options: [
      {
        title: 'ARTEMIS I // UNCREWED FLYBY',
        description: 'Distant retrograde orbit test around the Moon and Earth reentry.',
        nextPanel: 'launch_artemis_1',
      },
      {
        title: 'ARTEMIS II // CREWED FLYBY',
        description: 'Free-return lunar trajectory carrying astronauts around the far side.',
        nextPanel: 'launch_artemis_2',
      },
      {
        title: 'ARTEMIS III // LUNAR LANDING',
        description: 'NRHO rendezvous and lunar south pole descent profile.',
        nextPanel: 'launch_artemis_3',
      },
      {
        title: "ARCHIVED // LUNAR 2014",
        description: "Explore historical lunar trajectory and orbital coordinate datasets from 2014.",
        nextPanel: "launch_lunar_2014",
      },
    ],
    backPanel: 'play',
  },
  tutorial: {
    kicker: 'LEARNING',
    title: 'Tutorial',
    description: 'Follow a guided tutorial to learn the basics of spacecraft design, Hohmann transfers, and lunar trajectory planning.',
    backPanel: 'play',
  },
  settings: {
    kicker: 'PREFERENCES',
    title: 'Settings',
    description: 'Settings panel placeholder. Audio, graphics, and control options can be added here.',
  },
  sandbox: {
    kicker: 'COMING NEXT',
    title: 'Sandbox setup',
    description: 'Ready to connect to the 3D orbital sandbox scene.',
    backPanel: 'play',
  },
  launch_artemis_1: {
    kicker: 'ARTEMIS I',
    title: 'Mission Ready',
    description: 'Ready to load Artemis I trajectory data into the 3D mission scene.',
    backPanel: 'scenario',
  },
  launch_artemis_2: {
    kicker: 'ARTEMIS II',
    title: 'Mission Ready',
    description: 'Ready to load Artemis II crewed flyby trajectory into the 3D mission scene.',
    backPanel: 'scenario',
  },
  launch_artemis_3: {
    kicker: 'ARTEMIS III',
    title: 'Mission Ready',
    description: 'Ready to load Artemis III lunar landing profile into the 3D mission scene.',
    backPanel: 'scenario',
  },
  launch_lunar_2014: {
    kicker: "ARCHIVED // LUNAR 2014",
    title: "Mission Ready",
    description: "Ready to load historical lunar trajectory and orbital data.",
    backPanel: "scenario",
  },
}

export const MISSION_DATA = {
  artemis_1: {
    title: "ARTEMIS 1",
    brief: "The rival space program secured the milestone 23 days ago completed a full orbit. We are behind in the space race. We need a successful mission, and we need it now.",
    objectives: [
      "Ignition & Ascent",
      "Suborbital Maneuver",
      "Atmospheric Descent",
    ],
  }
}

// --- KONSTANTA SIMULASI & SCENE 3D ---

export const PLAYBACK_INTERVAL = 100; // interval animasi di ProgresScene.jsx

export const SCENE_SCALE = 0.000006;

export const CELESTIAL_RADII = {
  EARTH: 6371 * SCENE_SCALE, // dipakai di ArtemisScene, LunarScene, & lunar/adapter
  MOON: 1737.4 * SCENE_SCALE, // dipakai di LunarScene
};

export const MISSION_SCALES = {
  LUNAR_2014: SCENE_SCALE, // skala koordinat di data/scenarios/lunar/adapter.js
};

export const SCENE_COLORS = {
  ROCKET_TRAJECTORY: "#ff8c42",
  MOON_TRAJECTORY: "#a0a0a0",
  FINISH_MARKER: "#22c55e",
};