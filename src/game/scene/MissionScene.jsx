import LunarScene from "./LunarScene";
import ArtemisScene from "./ArtemisScene";

export default function MissionScene({
  missionId,
  currentIndex = 0,
  moonPoints = [],
  rocketPoints = [],
}) {
  if (missionId === "artemis-1") {
    return (
      <ArtemisScene
        currentIndex={currentIndex}
        rocketPoints={rocketPoints}
      />
    );
  }

  return (
    <LunarScene
      currentIndex={currentIndex}
      moonPoints={moonPoints}
      rocketPoints={rocketPoints}
    />
  );
}