import { useEffect, useState } from "react";
import { LOGO } from "../assets/assetRegistry";
import { PANEL_CONTENT, SHOWCASE_VEHICLES } from "../constants";

import Button from "../components/Button";
import Modal from "../components/Modal";
import RocketShowcase from "../components/RocketShowcase";
import Starfield from "../components/Starfield";
import audioManager from "../audioManager";
import { BGM, SFX } from "../assets/audioRegistry";

import "./MainMenu.css";

export default function MainMenu({ onLaunch }) {
  const [activeVehicle, setActiveVehicle] = useState(0);
  const [activePanel, setActivePanel] = useState(null);
  const [typedDescription, setTypedDescription] = useState("");

  const [bgmVolume, setBgmVolume] = useState(audioManager.bgmVolume);
  const [sfxVolume, setSfxVolume] = useState(audioManager.sfxVolume);
  const [isMuted, setIsMuted] = useState(audioManager.muted);

  const panel = activePanel ? PANEL_CONTENT[activePanel] : null;

  const playButtonClick = () => {
    audioManager.playSFX(SFX.buttonClick);
  };

  const playButtonHover = () => {
    audioManager.playSFX(SFX.buttonHover);
  };

  useEffect(() => {
    audioManager.preloadSFX(Object.values(SFX));
  }, []);

  useEffect(() => {
    if (!activePanel) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePanel]);

  useEffect(() => {
    audioManager.preloadSFX(Object.values(SFX));
    audioManager.playBGM(BGM.mainMenu);

    return () => {
      audioManager.stopBGM();
    };
  }, []);

  // Tutorial typing animation
  useEffect(() => {
    if (activePanel !== "tutorial") {
      setTypedDescription("");
      return;
    }

    const fullText = PANEL_CONTENT.tutorial.description;
    let index = 0;

    setTypedDescription("");

    const timer = window.setInterval(() => {
      index += 1;

      setTypedDescription(fullText.slice(0, index));

      if (index >= fullText.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [activePanel]);

  const handleLaunch = () => {
    if (!activePanel?.startsWith("launch_")) return;

    const missionId = activePanel.replace("launch_", "");

    const availableMissions = ["artemis_1", "lunar_2014"];

    if (!availableMissions.includes(missionId)) {
      console.warn("Mission belum tersedia:", missionId);
      return;
    }

    const formattedMissionId = missionId.replaceAll("_", "-");

    if (typeof onLaunch === "function") {
      onLaunch(formattedMissionId);
    } else {
      console.error("onLaunch belum diteruskan dari App.jsx");
    }
  };

  const handleBgmVolume = (value) => {
    const volume = Number(value);

    setBgmVolume(volume);
    audioManager.setBGMVolume(volume);
  };

  const handleSfxVolume = (value) => {
    const volume = Number(value);

    setSfxVolume(volume);
    audioManager.setSFXVolume(volume);
  };

  const handleMute = () => {
    const nextMuted = !isMuted;

    setIsMuted(nextMuted);
    audioManager.setMute(nextMuted);
  };

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
              <img src={LOGO.logo} alt="" />
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
              Design your spacecraft, master the physics of spaceflight, and
              write your own mission history.
            </p>

            <div className="menu-actions-grid">
              <Button variant="primary" onClick={() => setActivePanel("play")}>
                PLAY
              </Button>

              <Button onClick={() => setActivePanel("tutorial")}>
                TUTORIAL
              </Button>

              <Button
                className="menu-btn-centered"
                onClick={() => setActivePanel("settings")}
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

      {/* Modal */}
      {panel && (
        <Modal onClose={() => setActivePanel(null)}>
          <span className="modal-kicker">{panel.kicker}</span>

          <h2>{panel.title}</h2>

          {activePanel === "tutorial" ? (
            <p>
              <span className="visually-hidden">{panel.description}</span>

              <span className="tutorial-typed-text" aria-hidden="true">
                {typedDescription}
              </span>
            </p>
          ) : (
            <p>{panel.description}</p>
          )}

          {activePanel === "settings" && (
            <div className="audio-settings">
              <div className="audio-setting-item">
                <div className="audio-setting-heading">
                  <strong>BACKGROUND MUSIC</strong>
                  <span>{Math.round(bgmVolume * 100)}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={bgmVolume}
                  onChange={(event) => handleBgmVolume(event.target.value)}
                />
              </div>

              <div className="audio-setting-item">
                <div className="audio-setting-heading">
                  <strong>SOUND EFFECTS</strong>
                  <span>{Math.round(sfxVolume * 100)}%</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sfxVolume}
                  onChange={(event) => handleSfxVolume(event.target.value)}
                />
              </div>

              <div className="audio-setting-mute">
                <div>
                  <strong>MASTER AUDIO</strong>
                  <small>Mute all background music and effects</small>
                </div>

                <button
                  type="button"
                  className={`audio-mute-button ${isMuted ? "muted" : ""}`}
                  onClick={() => {
                    playButtonClick();
                    handleMute();
                  }}
                  onMouseEnter={playButtonHover}
                >
                  {isMuted ? "MUTED" : "ON"}
                </button>
              </div>
            </div>
          )}

          {/* Pilihan panel */}
          {activePanel !== "settings" &&
            panel.options?.map((option) => (
              <button
                key={option.title}
                type="button"
                className="modal-option"
                onClick={() => {
                  playButtonClick();
                  setActivePanel(option.nextPanel);
                }}
                onMouseEnter={playButtonHover}
              >
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </span>

                <b>→</b>
              </button>
            ))}

          {/* Tombol Launch */}
          {activePanel.startsWith("launch_") && (
            <button
              type="button"
              className="modal-option"
              onClick={() => {
                playButtonClick();
                handleLaunch();
              }}
              onMouseEnter={playButtonHover}
            >
              <span>
                <strong>LAUNCH MISSION</strong>
                <small>Initialize mission visualization.</small>
              </span>

              <b>→</b>
            </button>
          )}

          {/* Tombol Back */}
          {panel.backPanel && (
            <button
              type="button"
              className="modal-back"
              onClick={() => {
                playButtonClick();
                setActivePanel(panel.backPanel);
              }}
              onMouseEnter={playButtonHover}
            >
              ← BACK
            </button>
          )}
        </Modal>
      )}
    </main>
  );
}
