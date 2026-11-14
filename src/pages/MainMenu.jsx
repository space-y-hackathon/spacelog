import { useEffect, useState } from 'react'
import { PANEL_CONTENT, SHOWCASE_VEHICLES } from '../constants'
import Button from '../components/Button'
import Modal from '../components/Modal'
import RocketShowcase from '../components/RocketShowcase'
import Starfield from '../components/Starfield'
import './MainMenu.css'

export default function MainMenu() {
  const [activeVehicle, setActiveVehicle] = useState(0)
  const [activePanel, setActivePanel] = useState(null)
  const [typedDescription, setTypedDescription] = useState('')

  const panel = activePanel ? PANEL_CONTENT[activePanel] : null

  useEffect(() => {
    if (!activePanel) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActivePanel(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activePanel])

  useEffect(() => {
    if (activePanel !== 'tutorial') {
      setTypedDescription('')
      return
    }

    const fullText = PANEL_CONTENT.tutorial.description
    let index = 0
    setTypedDescription('')

    const timer = window.setInterval(() => {
      index += 1
      setTypedDescription(fullText.slice(0, index))
      if (index >= fullText.length) {
        window.clearInterval(timer)
      }
    }, 18)

    return () => window.clearInterval(timer)
  }, [activePanel])

  return (
    <main className="main-menu">
      <Starfield />

      {/* Bumi bertekstur dengan rotasi halus & atmosfer 3D */}
      <div className="earth-horizon" aria-hidden="true">
        <div className="earth-surface" />
        <div className="earth-atmosphere" />
      </div>

      <div className="menu-container">
        <section className="menu-left" aria-label="Main Menu">
          <div className="brand-card">
            <div className="brand-icon-box" aria-hidden="true">
              Δ
            </div>
            <div className="brand-text">
              <span className="brand-title">DELTA-V</span>
              <span className="brand-subtitle">SPACE MISSION SANDBOX</span>
            </div>
          </div>

          <div className="menu-hero">
            <h1 className="menu-title">SPACELOG</h1>

            <div className="menu-eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              <span>YOUR NEXT FRONTIER AWAITS</span>
            </div>

            <p className="menu-description">
              Design your spacecraft, master the physics of spaceflight, and write your own mission
              history.
            </p>

            <div className="menu-actions-grid">
              <Button variant="primary" onClick={() => setActivePanel('play')}>
                PLAY
              </Button>
              <Button onClick={() => setActivePanel('tutorial')}>TUTORIAL</Button>
              <Button
                className="menu-btn-centered"
                onClick={() => setActivePanel('settings')}
              >
                SETTINGS
              </Button>
            </div>
          </div>
        </section>

        <section className="menu-right" aria-label="Spacecraft Preview">
          <RocketShowcase
            vehicles={SHOWCASE_VEHICLES}
            activeIndex={activeVehicle}
            onSelect={setActiveVehicle}
          />
        </section>
      </div>

      {panel && (
        <Modal onClose={() => setActivePanel(null)}>
          <span className="modal-kicker">{panel.kicker}</span>
          <h2>{panel.title}</h2>

          {activePanel === 'tutorial' ? (
            <p>
              <span className="visually-hidden">{panel.description}</span>
              <span className="tutorial-typed-text" aria-hidden="true">
                {typedDescription}
              </span>
            </p>
          ) : (
            <p>{panel.description}</p>
          )}

          {panel.options?.map((option) => (
            <button
              key={option.title}
              type="button"
              className="modal-option"
              onClick={() => setActivePanel(option.nextPanel)}
            >
              <span>
                <strong>{option.title}</strong>
                <small>{option.description}</small>
              </span>
              <b>→</b>
            </button>
          ))}

          {panel.backPanel && (
            <button
              type="button"
              className="modal-back"
              onClick={() => setActivePanel(panel.backPanel)}
            >
              ← BACK
            </button>
          )}
        </Modal>
      )}
    </main>
  )
}