
import { useEffect, useMemo, useState } from "react";

export default function Inventory({
  inventory,
  onDragStart,
  selectedKey,
  onSelectPart,
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const components = useMemo(() => Object.entries(inventory), [inventory]);
  const query = debouncedSearch.trim().toLowerCase();
  const filteredComponents = useMemo(
    () => components.filter(([, item]) => item.name.toLowerCase().includes(query)),
    [components, query]
  );

  return (
    <section className="launch-inventory">
      <div className="inventory-heading">
        <div className="inventory-heading-title">
          <h3>COMPONENT INVENTORY</h3>
          <span aria-live="polite">
            {query ? `${filteredComponents.length} / ${components.length}` : components.length} COMPONENTS
          </span>
        </div>
        <input
          className="inventory-search"
          type="search"
          aria-label="Search components"
          placeholder="Search components"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="inventory-items">
        {filteredComponents.length === 0 && (
          <p className="inventory-no-results">No components found.</p>
        )}
        {filteredComponents.map(([key, item]) => (
          <button
            key={key}
            type="button"
            className={`inventory-card ${selectedKey === key ? "selected" : ""}`}
            draggable
            title={item.name}
            aria-pressed={selectedKey === key}
            onClick={() => onSelectPart(selectedKey === key ? null : key)}
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
