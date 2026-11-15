import Button from "../../components/Button";
import "./BreakingNewsScene.css";

export default function BreakingNewsScene({ summary, onBack }) {
  return (
    <main className="breaking-news-scene">
      <header className="breaking-news-header">
        <span>SPACELOG / MISSION DESK</span>
        <Button
          className="breaking-news-back"
          onClick={onBack}
        >
          Return to menu
        </Button>
      </header>

      <article className="breaking-news-story">
        <span className="breaking-news-kicker">BREAKING NEWS / FLIGHT REPORT</span>
        <h1>Mission complete: {summary.missionName}</h1>
        <p className="breaking-news-lede">
          The {summary.missionName} simulation reached its final recorded
          waypoint. This report summarizes the completed trajectory dataset.
        </p>

        <section className="breaking-news-data" aria-label="Mission summary">
          <div>
            <span>TRACK SAMPLES</span>
            <strong>{summary.sampleCount.toLocaleString("en-US")}</strong>
          </div>
          <div>
            <span>FINAL RECORD</span>
            <strong>{summary.completionDate}</strong>
            <small>{summary.completionTime}</small>
          </div>
          <div>
            <span>FINAL POSITION (KM)</span>
            <strong>X {summary.finalPosition.x}</strong>
            <small>
              Y {summary.finalPosition.y} / Z {summary.finalPosition.z}
            </small>
          </div>
        </section>
      </article>
    </main>
  );
}
