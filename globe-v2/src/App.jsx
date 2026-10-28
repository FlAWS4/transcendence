import { useState } from "react";
import Globe from "./globe/Globe.jsx";

export default function App() {
  const [selectedCampus, setSelectedCampus] = useState(null);

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">42 HORIZON / TECHNICAL SPIKE</p>
        <h1>Explore the 42 Network</h1>
        <p>
          Phase 1 only: a clean Three.js globe with a few real campus positions.
        </p>
      </header>

      <section className="globe-panel" aria-label="42 Network globe">
        <Globe onCampusSelect={setSelectedCampus} />

        <aside className="campus-card" aria-live="polite">
          {selectedCampus ? (
            <>
              <span>Selected campus</span>
              <strong>{selectedCampus.name}</strong>
              <small>{selectedCampus.country}</small>
            </>
          ) : (
            <>
              <span>Explorer</span>
              <strong>Rotate the globe</strong>
              <small>Click a campus point to select it.</small>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
