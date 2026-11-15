
import Layer from "./Layer";
import { BLUEPRINT_ZONES } from "./Blueprint";

export default function Canvas({
  parts,
  onDropPart,
  onRemovePart,
  selectedCategory,
  onSelectZone,
}) {
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const key = event.dataTransfer.getData("application/rocket-part");
    if (!key) return;

    const bounds = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    onDropPart(key, { x, y });
  };

  return (
    <div
      className="rocket-assembly-canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="rocket-blueprint-guide">
        {BLUEPRINT_ZONES.map((zone) => {
          const occupied = parts.some(
            (part) => part.zoneId === zone.id
          );

          return (
            <button
              key={zone.id}
              type="button"
              disabled={selectedCategory !== zone.category}
              onClick={() => onSelectZone(zone)}
              className={`blueprint-zone ${occupied ? "occupied" : ""} ${selectedCategory === zone.category ? "available" : ""}`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
              title={`${zone.label}${zone.required ? " (required)" : ""}`}
            >
              <span>{zone.label}{zone.required ? " *" : ""}</span>
            </button>
          );
        })}
      </div>

      {parts.map((part) => (
        <Layer
          key={part.id}
          part={part}
          onRemove={onRemovePart}
        />
      ))}
    </div>
  );
}
