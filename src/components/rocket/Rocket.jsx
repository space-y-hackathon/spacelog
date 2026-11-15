
import { useMemo, useState } from "react";

import { ROCKET_PARTS } from "../../assets/assetRegistry";
import Canvas from "./Canvas";
import Inventory from "./Inventory";
import { BLUEPRINT_ZONES, REQUIRED_ZONES } from "./Blueprint";

function getPartCategory(path) {
  const value = path.toLowerCase();

  if (value.includes("launch escape system")) return "escape-system";
  if (value.includes("aerodynamic cone")) return "cone-small";
  if (value.includes("cone small")) return "cone-small";
  if (value.includes("crew capsule")) return "capsule";
  if (value.includes("service module")) return "service-module";
  if (value.includes("rcs left")) return "left-rcs";
  if (value.includes("rcs right")) return "right-rcs";
  if (value.includes("booster")) return "booster";
  if (value.includes("core engine")) return "core-engine";
  if (value.includes("engine")) return "engine";
  if (value.includes("big cone separator")) return "big-cone-separator";
  if (value.includes("separator")) return "separator";
  if (value.includes("core stage 3")) return "core-stage-3";

  if (
    value.includes("fuel tank") ||
    value.includes("stage") ||
    value.includes("tank")
  ) {
    return "fuel-tank";
  }

  return "unknown";
}

export default function Rocket({ installedParts, setInstalledParts, missingZones }) {
  const [selectedKey, setSelectedKey] = useState(null);
  const inventory = useMemo(() => {
    return Object.fromEntries(
      Object.entries(ROCKET_PARTS).map(([key, item]) => [
        key,
        {
          ...item,
          category: getPartCategory(item.name),
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

    installPart(key, nearest.zone);
  };

  const installPart = (key, zone) => {
    const item = inventory[key];
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
    setSelectedKey(null);
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
          selectedCategory={inventory[selectedKey]?.category}
          onSelectZone={(zone) => installPart(selectedKey, zone)}
        />

        <aside className="rocket-installed-panel">
          <div className="requirements-heading">
            <h3>REQUIRED PARTS</h3>
            <span>{REQUIRED_ZONES.length - missingZones.length}/{REQUIRED_ZONES.length} READY</span>
          </div>
          <ul className="requirements-list" aria-label="Required rocket parts">
            {REQUIRED_ZONES.map((zone) => {
              const missing = missingZones.some((item) => item.id === zone.id);
              return (
                <li key={zone.id} className={missing ? "missing" : "ready"}>
                  <span>{zone.label}</span>
                  <span>{missing ? "Missing" : "Installed"}</span>
                </li>
              );
            })}
          </ul>

          <div className="installed-heading">
            <h3>ASSEMBLED PARTS</h3>
            <span>{installedParts.length} INSTALLED</span>
          </div>

          {installedSummary.length === 0 ? (
            <p className="installed-empty">
              No components installed yet.
              <br />
              Drag a component to the blueprint, or select it and then select a matching zone.
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
        selectedKey={selectedKey}
        onSelectPart={setSelectedKey}
      />
    </div>
  );
}
