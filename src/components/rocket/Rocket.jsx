
import { useMemo, useState } from "react";

import { ROCKET_PARTS } from "../../assets/assetRegistry";
import Canvas from "./Canvas";
import Inventory from "./Inventory";
import { BLUEPRINT_ZONES } from "./Blueprint";

function getPartCategory(path) {
  const value = path.toLowerCase();

  if (value.includes("launch escape system")) return "escape-system";
  if (value.includes("aerodynamic cone")) return "aerodynamic-cone";
  if (value.includes("crew capsule")) return "capsule";
  if (value.includes("orion service module")) return "service-module";
  if (value.includes("solar panel")) return "solar-panel";
  if (value.includes("rcs")) return "rcs";
  if (value.includes("booster")) return "booster";
  if (value.includes("engine")) return "engine";
  if (value.includes("separator")) return "separator";

  if (
    value.includes("fuel tank") ||
    value.includes("stage") ||
    value.includes("tank")
  ) {
    return "fuel-tank";
  }

  return "unknown";
}

export default function Rocket() {
  const [installedParts, setInstalledParts] = useState([]);

  const inventory = useMemo(() => {
    return Object.fromEntries(
      Object.entries(ROCKET_PARTS).map(([key, item]) => [
        key,
        {
          ...item,
          category: getPartCategory(`${key} ${item.name}`),
        },
      ])
    );
  }, []);

  const handleDragStart = (event, key) => {
    event.dataTransfer.setData("application/rocket-part", key);
    event.dataTransfer.effectAllowed = "copy";
  };

  const handleDropPart = (key, dropPosition) => {
    const item = inventory[key];

    if (!item) return;

    const compatibleZones = BLUEPRINT_ZONES.filter(
      (zone) => zone.category === item.category
    );

    if (compatibleZones.length === 0) {
      window.alert(`Belum ada posisi blueprint untuk ${item.name}.`);
      return;
    }

    // Slot yang sudah terisi tetap boleh dipilih.
    // Komponen lama akan digantikan oleh komponen baru.
    const nearest = compatibleZones
      .map((zone) => ({
        zone,
        distance: Math.hypot(
          zone.x - dropPosition.x,
          zone.y - dropPosition.y
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (!nearest || nearest.distance > 12) {
      window.alert("Letakkan komponen pada zona blueprint yang sesuai.");
      return;
    }

    const zone = nearest.zone;

    setInstalledParts((prev) => [
      ...prev.filter((part) => part.zoneId !== zone.id),
      {
        id: crypto.randomUUID(),
        key,
        name: item.name,
        asset: item.asset,
        category: item.category,
        zoneId: zone.id,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        zIndex: prev.length + 1,
      },
    ]);
  };

  const handleRemovePart = (id) => {
    setInstalledParts((prev) =>
      prev.filter((part) => part.id !== id)
    );
  };

  // Hitung berdasarkan komponen yang benar-benar terpasang.
  const installedSummary = useMemo(() => {
    const grouped = {};

    installedParts.forEach((part) => {
      if (!grouped[part.key]) {
        grouped[part.key] = {
          key: part.key,
          name: part.name,
          asset: part.asset,
          count: 0,
        };
      }

      grouped[part.key].count += 1;
    });

    return Object.values(grouped);
  }, [installedParts]);

  return (
    <div className="rocket-builder">
      <div className="rocket-builder-main">
        <Canvas
          parts={installedParts}
          onDropPart={handleDropPart}
          onRemovePart={handleRemovePart}
        />

        <aside className="rocket-installed-panel">
          <div className="installed-heading">
            <h3>ASSEMBLED PARTS</h3>
            <span>{installedParts.length} INSTALLED</span>
          </div>

          {installedSummary.length === 0 ? (
            <p className="installed-empty">
              No components installed yet.
              <br />
              Drag components from inventory to the blueprint.
            </p>
          ) : (
            <div className="installed-list">
              {installedSummary.map((part) => (
                <div className="installed-item" key={part.key}>
                  <img src={part.asset} alt={part.name} />

                  <div className="installed-item-info">
                    <span>{part.name}</span>
                    <small>{part.count}x installed</small>
                  </div>

                  <strong>{part.count}x</strong>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      <Inventory
        inventory={inventory}
        onDragStart={handleDragStart}
      />
    </div>
  );
}
