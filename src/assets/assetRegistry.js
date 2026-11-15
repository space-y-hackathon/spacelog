import launchTower from './launch_tower.png';
import logo from './logo/logo-putih.png';
import earth from './texture/earth-map.jpg';
import moon from './texture/moon-map.jpg';

export const SCENE_ASSETS = {
  launchTower,
};

export const LOGO = {
  logo,
}

export const TEXTURE = {
  earth,
  moon,
}

const rocketImages = import.meta.glob(
  "./rocket/**/*.{png,PNG}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

export const ROCKET_PARTS = Object.fromEntries(
  Object.entries(rocketImages)
    .filter(([path]) => !path.toLowerCase().includes("mockup"))
    .map(([path, asset]) => {
      const filename = path.split("/").pop();

      const name = filename
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");

      return [
        path,
        {
          name,
          asset,
        },
      ];
    })
);