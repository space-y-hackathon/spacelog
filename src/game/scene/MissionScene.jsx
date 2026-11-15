import LunarScene from "./LunarScene";
import ArtemisScene from "./ArtemisScene";

export default function MissionScene({
  missionId,
  currentIndex = 0,
  moonPoints = [],
  rocketPoints = [],
  cameraTarget = "earth",
  onTrajectoryHover,
}) {
  if (missionId === "artemis-1") {
    return (
      <ArtemisScene
        currentIndex={currentIndex}
        moonPoints={moonPoints}
        rocketPoints={rocketPoints}
        cameraTarget={cameraTarget}
        onTrajectoryHover={onTrajectoryHover}
      />
    );
  }

  return (
    <LunarScene
      currentIndex={currentIndex}
      moonPoints={moonPoints}
      rocketPoints={rocketPoints}
      cameraTarget={cameraTarget}
      onTrajectoryHover={onTrajectoryHover}
    />
  );
}