import LunarScene from "./LunarScene";
import ArtemisScene from "./ArtemisScene";
import Artemis3Scene from "./Artemis3Scene";

export default function MissionScene({
  missionId,
  currentIndex = 0,
  moonPoints = [],
  rocketPoints = [],
  starshipPoints = [],
  blueMoonPoints = [],
  dockedTo = null,
  dockingBlend,
  cameraTarget = "earth",
  onTrajectoryHover,
}) {
  if (missionId === "artemis-3") {
    return (
      <Artemis3Scene
        currentIndex={currentIndex}
        rocketPoints={rocketPoints}
        starshipPoints={starshipPoints}
        blueMoonPoints={blueMoonPoints}
        dockedTo={dockedTo}
        dockingBlend={dockingBlend}
        cameraTarget={cameraTarget}
        onTrajectoryHover={onTrajectoryHover}
      />
    );
  }

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