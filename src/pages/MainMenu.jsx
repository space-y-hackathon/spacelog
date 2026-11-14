import { useState } from 'react'
import MenuScene from '../game/scene/MenuScene'
import './MainMenu.css'

export default function MainMenu() {
  const [panel, setPanel] = useState(null)

  return (
    <main className="main-menu">
      <section className="menu-left">
        <header className="menu-header">
          <div className="brand-mark">Δ</div>
          <div className="brand-copy">
            <span className="brand-name">DELTA-V</span>
            <span className="brand-subtitle">SPACE MISSION SANDBOX</span>
          </div>
        </header>

        <div className="menu-main-content">
          <div className="menu-eyebrow">
            <span className="status-dot" />
            YOUR NEXT FRONTIER AWAITS
          </div>

          <h1 className="menu-title">
            BUILD.
            <br />
            LAUNCH.
            <br />
            <span>EXPLORE.</span>
          </h1>

          <p className="menu-description">
            Design your spacecraft, master the physics of spaceflight,
            and write your own mission history.
          </p>

          <nav className="menu-actions" aria-label="Main menu">
            <button className="menu-button menu-button-primary" onClick={() => setPanel('play')}>
              <span>PLAY</span>
              <span className="button-arrow">↗</span>
            </button>
            <button className="menu-button menu-button-secondary" onClick={() => setPanel('settings')}>
              <span>SETTINGS</span>
              <span className="button-symbol">⚙</span>
            </button>
            <button className="menu-button menu-button-quiet" onClick={() => setPanel('quit')}>
              <span>QUIT</span>
              <span className="button-symbol">×</span>
            </button>
          </nav>
        </div>

        <footer className="menu-footer">
          <div>
            <span className="footer-label">FLIGHT PROGRAM</span>
            <span className="footer-value">SANDBOX INITIATIVE</span>
          </div>
          <div className="footer-version">PRE-ALPHA // v0.1</div>
        </footer>
      </section>

      <section className="menu-right" aria-label="Spacecraft preview">
        <div className="scene-topline">
          <span>DEEP SPACE // VISUALIZATION</span>
          <span className="scene-live"><i /> LIVE VIEW</span>
        </div>

        <div className="scene-canvas">
          <MenuScene />
        </div>

        <div className="scene-caption scene-caption-top">
          <span className="caption-index">01 / 03</span>
          <span>EXPLORATION VEHICLE</span>
        </div>

        <div className="scene-caption scene-caption-bottom">
          <div>
            <span className="caption-label">CURRENT LOCATION</span>
            <strong>LOW EARTH ORBIT</strong>
          </div>
          <div className="scene-coordinates">
            <span className="caption-label">MISSION STATUS</span>
            <strong>AWAITING COMMAND</strong>
          </div>
        </div>

        <div className="scene-side-mark">D V / 001</div>
      </section>

      {panel && (
        <div className="menu-modal-backdrop" onClick={() => setPanel(null)}>
          <section className="menu-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setPanel(null)} aria-label="Close">×</button>
            {panel === 'play' && (
              <>
                <span className="modal-kicker">FLIGHT PROGRAM</span>
                <h2>Choose your journey.</h2>
                <p>Start a free sandbox session or follow a guided mission scenario.</p>
                <button className="modal-option" onClick={() => setPanel('sandbox')}>
                  <span><strong>NEW SANDBOX</strong><small>Build and experiment without a fixed objective.</small></span>
                  <b>↗</b>
                </button>
                <button className="modal-option" onClick={() => setPanel('scenario')}>
                  <span><strong>MISSION SCENARIO</strong><small>Take on a defined space mission objective.</small></span>
                  <b>↗</b>
                </button>
              </>
            )}
            {panel === 'settings' && (
              <>
                <span className="modal-kicker">PREFERENCES</span>
                <h2>Settings</h2>
                <p>Settings panel placeholder. Audio, graphics, and control options can be added here.</p>
              </>
            )}
            {panel === 'quit' && (
              <>
                <span className="modal-kicker">END SESSION</span>
                <h2>Leaving so soon?</h2>
                <p>A browser game cannot close its own tab automatically. You can close this tab to exit.</p>
              </>
            )}
            {(panel === 'sandbox' || panel === 'scenario') && (
              <>
                <span className="modal-kicker">COMING NEXT</span>
                <h2>{panel === 'sandbox' ? 'Sandbox setup' : 'Mission selection'}</h2>
                <p>This is the next screen to design. Your main menu is ready to connect to it.</p>
                <button className="modal-back" onClick={() => setPanel('play')}>← BACK</button>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}