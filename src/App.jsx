import { useState } from "react";
import MainMenu from "./pages/MainMenu";
import ProgresScene from "./game/scene/ProgresScene";

export default function App() {
  const [selectedMission, setSelectedMission] = useState(null);

  const handleLaunch = (missionId) => {
    setSelectedMission(missionId);
  };

  const handleBack = () => {
    setSelectedMission(null);
  };

  if (selectedMission) {
    return (
      <ProgresScene
        missionId={selectedMission}
        onBack={handleBack}
      />
    );
  }

  return <MainMenu onLaunch={handleLaunch} />;
}