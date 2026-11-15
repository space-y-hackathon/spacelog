import { useState } from "react";
import Button from "../../components/Button";
import "./BreakingNewsScene.css";

export default function BreakingNewsScene({ summary, onBack }) {
  const [tickerPaused, setTickerPaused] = useState(false);
  const tickerText = [
    `[MISSION SUMMARY] ${summary.missionName} COMPLETED`,
    `DATES: ${summary.startDate} — ${summary.endDate}`,
    `TOTAL DURATION: ${summary.duration}`,
    `MAX VELOCITY: ${summary.maxVelocity} km/s`,
    `CLOSEST TO MOON: ${summary.closestLunarApproach} km`,
    `MAX DISTANCE FROM EARTH: ${summary.maxEarthDistance} km`,
    `TELEMETRY: ${summary.sampleCount.toLocaleString("en-US")} SAMPLES`,
    `HEADLINE: ${summary.headline}`,
  ].join("  •  ");

  return (
    <main className="breaking-news-scene">
      <Button
        className="breaking-news-back"
        onClick={onBack}
      >
        Return to menu
      </Button>

      <section className="breaking-news-main" aria-label="Mission report">
        <article className="breaking-news-story">
          <span className="breaking-news-kicker">BREAKING NEWS</span>
          <div className="breaking-news-headline">
            <h1>Mission complete: {summary.displayMissionName}</h1>
            <p className="breaking-news-lede">
              Flight window: {summary.startDate} — {summary.endDate} ·{" "}
              {summary.duration} ·{" "}
              {summary.sampleCount.toLocaleString("en-US")} telemetry samples
            </p>
          </div>
        </article>
      </section>

      <section className="breaking-news-ticker" aria-label="Mission summary">
        <p className="breaking-news-sr-only">{tickerText}</p>
        <div className="breaking-news-ticker-viewport" aria-hidden="true">
          <div
            className={`breaking-news-ticker-track ${
              tickerPaused ? "is-paused" : ""
            }`}
          >
            <span className="breaking-news-ticker-copy">{tickerText}</span>
            <span className="breaking-news-ticker-copy">
              {tickerText}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="breaking-news-ticker-toggle"
          aria-label={`${tickerPaused ? "Resume" : "Pause"} mission summary ticker`}
          aria-pressed={tickerPaused}
          onClick={() => setTickerPaused((paused) => !paused)}
        >
          {tickerPaused ? "Resume" : "Pause"}
        </button>
      </section>
    </main>
  );
}
