import { useEffect, useState } from "react";
import { LOGO, TUTORIAL } from "../assets/assetRegistry";
import { PANEL_CONTENT, SHOWCASE_VEHICLES } from "../constants";

import Button from "../components/Button";
import Modal from "../components/Modal";
import RocketShowcase from "../components/RocketShowcase";
import Starfield from "../components/Starfield";
import audioManager from "../audioManager";
import { BGM, SFX } from "../assets/audioRegistry";

import "./MainMenu.css";

const TUTORIAL_STEPS = [
  {
    step: "01",
    title: "INITIATE & SELECT MISSION",
    image: TUTORIAL.missionSelect,
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

export default function MainMenu({ onLaunch }) {
  const [activeVehicle, setActiveVehicle] = useState(0);
  const [activePanel, setActivePanel] = useState(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [typedDescription, setTypedDescription] = useState("");

  const [bgmVolume, setBgmVolume] = useState(audioManager.bgmVolume);
  const [sfxVolume, setSfxVolume] = useState(audioManager.sfxVolume);
  const [isMuted, setIsMuted] = useState(audioManager.muted);

  const panel = activePanel ? PANEL_CONTENT[activePanel] : null;
  const currentTutorial = TUTORIAL_STEPS[tutorialStep];

  const playButtonClick = () => {
    audioManager.playSFX(SFX.buttonClick);
  };

  const playButtonHover = () => {
    audioManager.playSFX(SFX.buttonHover);
  };

  useEffect(() => {
    audioManager.preloadSFX(Object.values(SFX));
    audioManager.playBGM(BGM.mainMenu);

    return () => {
      audioManager.stopBGM();
    };
  }, []);

  // Reset slide tutorial ke awal setiap kali membuka modal tutorial
  useEffect(() => {
    if (activePanel === "tutorial") {
      setTutorialStep(0);
    }
  }, [activePanel]);

  // Navigasi Keyboard (Escape untuk tutup, Arrow Left/Right untuk geser slide tutorial)
  useEffect(() => {
    if (!activePanel) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      } else if (activePanel === "tutorial") {
        if (event.key === "ArrowRight") {
          setTutorialStep((prev) => Math.min(prev + 1, TUTORIAL_STEPS.length - 1));
        } else if (event.key === "ArrowLeft") {
          setTutorialStep((prev) => Math.max(prev - 1, 0));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePanel]);

  // Efek mengetik (typing animation) setiap pindah slide tutorial
  useEffect(() => {
    if (activePanel !== "tutorial") {
      setTypedDescription("");
      return;
    }

    const fullText = TUTORIAL_STEPS[tutorialStep].description;
    let index = 0;

    setTypedDescription("");

    const timer = window.setInterval(() => {
      index += 1;
      setTypedDescription(fullText.slice(0, index));

      if (index >= fullText.length) {
        window.clearInterval(timer);
      }
    }, 14);

    return () => window.clearInterval(timer);
  }, [activePanel, tutorialStep]);

  const handlePrevSlide = () => {
    playButtonClick();
    setTutorialStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNextSlide = () => {
    playButtonClick();
    setTutorialStep((prev) => Math.min(prev + 1, TUTORIAL_STEPS.length - 1));
  };

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
          <span className="modal-kicker">
            {activePanel === "tutorial"
              ? `${panel.kicker} // STEP ${currentTutorial.step} OF 0${TUTORIAL_STEPS.length}`
              : panel.kicker}
          </span>

          <h2>
            {activePanel === "tutorial" ? currentTutorial.title : panel.title}
          </h2>

          {/* Tampilan Khusus Slider Tutorial */}
          {activePanel === "tutorial" ? (
            <div className="tutorial-slider">
              {/* Frame Gambar 16:9 Statis / Terkunci */}
              <div className="tutorial-media-frame">
                <img
                  src={currentTutorial.image}
                  alt={currentTutorial.alt}
                  className="tutorial-media-img"
                />
              </div>

              {/* Box Deskripsi dengan Tinggi Tetap agar Modal Tidak Berubah Ukuran */}
              <div className="tutorial-text-box">
                <p>
                  <span className="visually-hidden">
                    {currentTutorial.description}
                  </span>
                  <span className="tutorial-typed-text" aria-hidden="true">
                    {typedDescription}
                  </span>
                </p>
              </div>

              {/* Navigasi Slider Left / Dots / Right */}
              <div className="tutorial-controls">
                <button
                  type="button"
                  className="tutorial-nav-btn"
                  onClick={handlePrevSlide}
                  onMouseEnter={playButtonHover}
                  disabled={tutorialStep === 0}
                >
                  ← PREV
                </button>

                <div className="tutorial-indicators" aria-label="Slide Steps">
                  {TUTORIAL_STEPS.map((item, idx) => (
                    <button
                      key={item.step}
                      type="button"
                      className={`tutorial-dot ${
                        idx === tutorialStep ? "active" : ""
                      }`}
                      onClick={() => {
                        playButtonClick();
                        setTutorialStep(idx);
                      }}
                      aria-label={`Go to step ${idx + 1}`}
                    />
                  ))}
                </div>

                {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                  <button
                    type="button"
                    className="tutorial-nav-btn"
                    onClick={handleNextSlide}
                    onMouseEnter={playButtonHover}
                  >
                    NEXT →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="tutorial-nav-btn tutorial-finish-btn"
                    onClick={() => {
                      playButtonClick();
                      setActivePanel("play");
                    }}
                    onMouseEnter={playButtonHover}
                  >
                    START MISSION →
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p>{panel.description}</p>
          )}

          {/* Panel Settings */}
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

          {/* Pilihan Panel Lain (Play / Select Mission) */}
          {activePanel !== "settings" &&
            activePanel !== "tutorial" &&
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
          {activePanel?.startsWith("launch_") && (
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