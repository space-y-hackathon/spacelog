export default function RocketShowcase({ vehicles, activeIndex, onSelect }) {
  const current = vehicles[activeIndex] || vehicles[0]

  const handleCycle = () => {
    const nextIndex = (activeIndex + 1) % vehicles.length
    onSelect(nextIndex)
  }

  return (
    <div className="rocket-showcase">
      <div className="rocket-stage">
        <div className="rocket-ambient-glow" aria-hidden="true" />
        <div className="rocket-tilt-wrapper">
          <div className="rocket-float-wrapper">
            <img
              src={current.image}
              alt={`${current.name} spacecraft`}
              className="rocket-sprite"
              draggable="false"
            />
            <div className="rocket-thruster-glow" aria-hidden="true" />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="rocket-indicator"
        onClick={handleCycle}
        title="Switch spacecraft preview"
      >
        <span className="indicator-dot" />
        <span className="indicator-count">{current.indexLabel}</span>
        <span className="indicator-name">{current.name}</span>
      </button>
    </div>
  )
}