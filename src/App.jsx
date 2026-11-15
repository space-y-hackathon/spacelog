import { useState } from "react";

import MainMenu from "./pages/MainMenu";
import LaunchScene from "./game/scene/LaunchScene";
import ProgresScene from "./game/scene/ProgresScene";
import BreakingNewsScene from "./game/scene/BreakingNewsScene";

export default function App() {
  const [selectedMission, setSelectedMission] = useState(null);
  const [missionSummary, setMissionSummary] = useState(null);
  const [currentStage, setCurrentStage] = useState("launch");

  const handleLaunch = (missionId) => {
    setSelectedMission(missionId);
    setMissionSummary(null);
    setCurrentStage("launch");
  };

  const handleBack = () => {
    setSelectedMission(null);
    setMissionSummary(null);
    setCurrentStage("launch");
  };

  const handleMissionComplete = (summary) => {
    setMissionSummary(summary);
    setCurrentStage("breaking-news");
  };

  if (!selectedMission) {
    return <MainMenu onLaunch={handleLaunch} />;
  }

  if (currentStage === "launch") {
    return (
      <LaunchScene
        missionId={selectedMission}
        onLaunch={() => setCurrentStage("progress")}
        onBack={handleBack}
      />
    );
  }

  if (currentStage === "progress") {
    return (
      <ProgresScene
        missionId={selectedMission === "sandbox" ? "lunar-2014" : selectedMission}
        onBack={handleBack}
        onContinue={handleMissionComplete}
      />
    );
  }

  if (currentStage === "breaking-news") {
    return (
      <BreakingNewsScene
        summary={missionSummary}
        onBack={handleBack}
      />
    );
  }

  return null;
}