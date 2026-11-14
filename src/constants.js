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
  settings: {
    kicker: 'PREFERENCES',
    title: 'Settings',
    description: 'Settings panel placeholder. Audio, graphics, and control options can be added here.',
  },
  quit: {
    kicker: 'END SESSION',
    title: 'Leaving so soon?',
    description: 'A browser game cannot close its own tab automatically. You can close this tab to exit.',
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
