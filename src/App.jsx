import { useState } from "react";

import MainMenu from "./pages/MainMenu";
import LaunchScene from "./game/scene/LaunchScene";
import ProgresScene from "./game/scene/ProgresScene";

export default function App() {
  const [selectedMission, setSelectedMission] = useState(null);
  const [currentStage, setCurrentStage] = useState("launch");

  const handleLaunch = (missionId) => {
    setSelectedMission(missionId);
    setCurrentStage("launch");
  };

  const handleBack = () => {
    setSelectedMission(null);
    setCurrentStage("launch");
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
        missionId={selectedMission}
        onBack={handleBack}
      />
    );
  }

  return null;
}