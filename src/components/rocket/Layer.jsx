
export default function Layer({ part, onRemove }) {
  return (
    <div
      className="rocket-layer"
      style={{
        left: `${part.x}%`,
        top: `${part.y}%`,
        width: `${part.width}%`,
        height: `${part.height}%`,
        zIndex: part.zIndex,
      }}
      title={`${part.name} — klik × untuk melepas`}
    >
      <img
        src={part.asset}
        alt={part.name}
        draggable={false}
      />

      <button
        type="button"
        className="rocket-layer-remove"
        onClick={() => onRemove(part.id)}
        aria-label={`Remove ${part.name}`}
      >
        ×
      </button>
    </div>
  );
}
