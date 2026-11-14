import { useEffect, useState } from 'react'
import MenuScene from '../game/scene/MenuScene'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { PANEL_CONTENT } from '../constants'
import './MainMenu.css'

function TypedTutorialDescription({ text }) {
  const characters = Array.from(text)
  const [visibleCharacters, setVisibleCharacters] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? characters.length : 0,
  )

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let characterIndex = 0
    const characterCount = Array.from(text).length
    const timer = window.setInterval(() => {
      characterIndex += 1
      setVisibleCharacters(characterIndex)

      if (characterIndex >= characterCount) window.clearInterval(timer)
    }, 28)

    return () => window.clearInterval(timer)
  }, [text])

  const isTyping = visibleCharacters < characters.length

  return (
    <p>
      <span aria-hidden="true" className={isTyping ? 'tutorial-typed-text' : undefined}>
        {characters.slice(0, visibleCharacters).join('')}
      </span>
      <span className="visually-hidden">{text}</span>
    </p>
  )
}

export default function MainMenu() {
  const [panel, setPanel] = useState(null)
  const panelContent = PANEL_CONTENT[panel]

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
            <Button onClick={() => setPanel('play')}>
              <span>PLAY</span>
            </Button>
            <Button variant="secondary" onClick={() => setPanel('tutorial')}>
              <span>TUTORIAL</span>
            </Button>
            <Button variant="quiet" onClick={() => setPanel('settings')}>
              <span>SETTINGS</span>
            </Button>
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

      {panelContent && (
        <Modal onClose={() => setPanel(null)}>
          <span className="modal-kicker">{panelContent.kicker}</span>
          <h2>{panelContent.title}</h2>
          {panel === 'tutorial' ? (
            <TypedTutorialDescription text={panelContent.description} />
          ) : (
            <p>{panelContent.description}</p>
          )}
          {panelContent.options?.map((option) => (
            <button
              className="modal-option"
              key={option.nextPanel}
              onClick={() => setPanel(option.nextPanel)}
            >
              <span><strong>{option.title}</strong><small>{option.description}</small></span>
              <b>↗</b>
            </button>
          ))}
          {panelContent.backPanel && (
            <button className="modal-back" onClick={() => setPanel(panelContent.backPanel)}>← BACK</button>
          )}
        </Modal>
      )}
    </main>
  )
}