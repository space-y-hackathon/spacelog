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
    subtitle: 'LEO MULTI-LANDER DOCKING TEST',
    image: artemisRocket,
    status: 'FLIGHT PROFILE // 2027',
  },
]

export const PANEL_CONTENT = {
  play: {
    kicker: 'FLIGHT PROGRAM',
    title: 'Choose your journey.',
    description: 'Start a free sandbox session or reconstruct an Artemis lunar mission.',
    options: [
      {
        title: 'SANDBOX',
        description: 'Build a rocket and launch the Lunar 2014 trajectory.',
        nextPanel: 'sandbox',
      },
      {
        title: 'MISSION SCENARIO',
        description: 'Reconstruct Artemis I, Artemis II, and future Artemis III trajectories.',
        nextPanel: 'scenario',
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
        title: 'ARTEMIS III // LEO RENDEZVOUS',
        description: 'Low Earth orbit rendezvous and docking test with Starship HLS and Blue Moon.',
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
    kicker: 'SANDBOX',
    title: 'Sandbox setup',
    description: 'Build a rocket with the required parts, then explore the Lunar 2014 trajectory.',
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
    description: 'Ready to load Artemis III LEO multi-lander rendezvous trajectory into the 3D mission scene.',
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
  sandbox: {
    number: "SANDBOX // FREE FLIGHT",
    title: "SANDBOX",
    brief: "Build your rocket, then launch the Lunar 2014 trajectory replay.",
    objectives: [
      "Assemble the required rocket parts",
      "Launch the Lunar 2014 trajectory",
    ],
  },
  "artemis-1": {
    number: "MISSION 01 // UNCREWED TEST",
    title: "ARTEMIS I",
    brief: "Uncrewed lunar distant retrograde orbit test flight to validate the SLS rocket and Orion spacecraft systems before crewed operations.",
    objectives: [
      "Assemble the SLS & Orion launch vehicle",
      "Execute Translunar Injection & Lunar Flyby",
      "Complete high-speed atmospheric reentry and splashdown",
    ],
  },
  "artemis-2": {
    number: "MISSION 02 // CREWED FLYBY",
    title: "ARTEMIS II",
    brief: "First crewed flight test of the Artemis program, carrying four astronauts on a free-return trajectory around the far side of the Moon.",
    objectives: [
      "Assemble the crew-rated launch vehicle",
      "Perform hybrid free-return lunar flyby",
      "Safely return crew via Pacific splashdown",
    ],
  },
  "artemis-3": {
    number: "MISSION 03 // LEO RENDEZVOUS",
    title: "ARTEMIS III",
    brief: "Low Earth Orbit multi-lander rendezvous and docking test between the Orion capsule, SpaceX Starship HLS, and Blue Origin Blue Moon.",
    objectives: [
      "Assemble the Orion launch configuration",
      "Rendezvous and dock with SpaceX Starship HLS",
      "Undock, rendezvous with Blue Origin Blue Moon, and return",
    ],
  },
  "lunar-2014": {
    number: "ARCHIVED // HISTORICAL DATA",
    title: "LUNAR 2014",
    brief: "Historical cislunar trajectory reconstruction utilizing 2014 orbital coordinate datasets and gravitational slingshot telemetry.",
    objectives: [
      "Assemble the launch vehicle",
      "Follow the historical 2014 cislunar trajectory",
      "Verify orbital mechanics and Earth reentry",
    ],
  },
};

export const PLAYBACK_INTERVAL = 100;

export const SCENE_SCALE = 0.000006;

export const CELESTIAL_RADII = {
  EARTH: 6371 * SCENE_SCALE,
  MOON: 1737.4 * SCENE_SCALE,
};

export const MISSION_SCALES = {
  LUNAR_2014: SCENE_SCALE,
};

export const SCENE_COLORS = {
  ROCKET_TRAJECTORY: "#ff8c42",
  MOON_TRAJECTORY: "#a0a0a0",
  FINISH_MARKER: "#22c55e",
};
