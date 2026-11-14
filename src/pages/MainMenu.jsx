import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import RocketShowcase from '../components/RocketShowcase'
import { PANEL_CONTENT, SHOWCASE_VEHICLES } from '../constants'
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
  const [vehicleIndex, setVehicleIndex] = useState(0)
  const panelContent = PANEL_CONTENT[panel]

  return (
    <main className="main-menu">
      <div className="space-stars" aria-hidden="true" />

      {/* Bumi bertekstur dengan rotasi halus & atmosfer 3D */}
      <div className="earth-horizon" aria-hidden="true">
        <div className="earth-surface" />
        <div className="earth-atmosphere" />
      </div>

      <div className="menu-container">
        <section className="menu-left">
          <header className="brand-card">
            <div className="brand-icon-box" aria-hidden="true">
              <span>Δ</span>
            </div>
            <div className="brand-text">
              <span className="brand-title">DELTA-V</span>
              <span className="brand-subtitle">SPACE MISSION SANDBOX</span>
            </div>
          </header>

          <div className="menu-hero">
            <h1 className="menu-title">SPACELOG</h1>

            <div className="menu-eyebrow">
              <span className="eyebrow-dot" />
              <span>YOUR NEXT FRONTIER AWAITS</span>
            </div>

            <p className="menu-description">
              Design your spacecraft, master the physics of spaceflight, and write your own mission
              history.
            </p>

            <nav className="menu-actions-grid" aria-label="Main menu">
              <Button variant="primary" onClick={() => setPanel('play')}>
                PLAY
              </Button>
              <Button variant="secondary" onClick={() => setPanel('tutorial')}>
                TUTORIAL
              </Button>
              <Button
                variant="secondary"
                className="menu-btn-centered"
                onClick={() => setPanel('settings')}
              >
                SETTINGS
              </Button>
            </nav>
          </div>
        </section>

        <section className="menu-right" aria-label="Spacecraft showcase">
          <RocketShowcase
            vehicles={SHOWCASE_VEHICLES}
            activeIndex={vehicleIndex}
            onSelect={setVehicleIndex}
          />
        </section>
      </div>

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
              type="button"
              className="modal-option"
              key={option.nextPanel}
              onClick={() => setPanel(option.nextPanel)}
            >
              <span>
                <strong>{option.title}</strong>
                <small>{option.description}</small>
              </span>
              <b>→</b>
            </button>
          ))}
          {panelContent.backPanel && (
            <button
              type="button"
              className="modal-back"
              onClick={() => setPanel(panelContent.backPanel)}
            >
              ← BACK
            </button>
          )}
        </Modal>
      )}
    </main>
  )
}