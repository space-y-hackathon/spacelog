
export default function Inventory({
  inventory,
  onDragStart,
}) {
  return (
    <section className="launch-inventory">
      <div className="inventory-heading">
        <h3>COMPONENT INVENTORY</h3>
        <span>{Object.keys(inventory).length} COMPONENTS</span>
      </div>

      <div className="inventory-items">
        {Object.entries(inventory).map(([key, item]) => (
          <button
            key={key}
            type="button"
            className="inventory-card"
            draggable
            title={item.name}
            onDragStart={(event) => onDragStart(event, key)}
          >
            <div className="inventory-image">
              <img src={item.asset} alt={item.name} draggable={false} />
            </div>

            <span className="inventory-name">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
