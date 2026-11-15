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

export const TUTORIAL_STEPS = [
  {
    step: "01",
    title: "INITIATE & SELECT MISSION",
    image: "",
    alt: "Step 1: Main menu PLAY button and Mission Selection interface",
    description:
      "Click PLAY on the main menu and select your target historical or deep-space mission. Review the mission brief, payload requirements, and target orbital parameters before entering the hangar."
  },
  {
    step: "02",
    title: "VEHICLE ASSEMBLY & TIPS",
    image: "",
    alt: "Step 2: Rocket assembly hangar with staging components and engineering tips",
    description:
      "Assemble your launch vehicle stage by stage. Follow the on-screen engineering tips to balance thrust-to-weight ratio, fuel capacity, and aerodynamics for your specific payload."
  },
  {
    step: "03",
    title: "PRE-FLIGHT CHECK & LAUNCH",
    image: "",
    alt: "Step 3: Pre-flight validation checklist and Launch Pad ignition button",
    description:
      "Proceed to the launch pad for pre-flight validation. Keep in mind: if your rocket configuration does not meet the mission specifications, launch sequence will be locked until corrected."
  },
  {
    step: "04",
    title: "MISSION FLIGHT SIMULATION",
    image: "",
    alt: "Step 4: Real-time orbital trajectory and telemetry flight simulation",
    description:
      "Monitor real-time telemetry, stage separations, and orbital burns as your spacecraft executes the flight path. Watch physics in action from liftoff to final orbit insertion."
  },
  {
    step: "05",
    title: "HEADLINES & MISSION ACCOMPLISHED",
    image: "",
    alt: "Step 5: Mission Accomplished summary screen and Breaking News headline",
    description:
      "Achieve your primary objectives to trigger Mission Accomplished! Read the global Breaking News coverage celebrating your historic milestone and complete your mission log."
  }
];