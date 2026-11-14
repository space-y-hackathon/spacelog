export const PANEL_CONTENT = {
  play: {
    kicker: 'FLIGHT PROGRAM',
    title: 'Choose your journey.',
    description: 'Start a free sandbox session or follow a guided mission scenario.',
    options: [
      {
        title: 'NEW SANDBOX',
        description: 'Build and experiment without a fixed objective.',
        nextPanel: 'sandbox',
      },
      {
        title: 'MISSION SCENARIO',
        description: 'Take on a defined space mission objective.',
        nextPanel: 'scenario',
      },
    ],
  },
  tutorial: {
    kicker: 'LEARNING',
    title: 'Tutorial',
    description: 'Follow a guided tutorial to learn the basics of spacecraft design and mission planning.',
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
    description: 'This is the next screen to design. Your main menu is ready to connect to it.',
    backPanel: 'play',
  },
  scenario: {
    kicker: 'COMING NEXT',
    title: 'Mission selection',
    description: 'This is the next screen to design. Your main menu is ready to connect to it.',
    backPanel: 'play',
  },
}
