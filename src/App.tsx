function App() {
  return (
    <main className="app-shell">
      <section className="landing" aria-labelledby="app-title">
        <p className="phase-label">Phase 1 Desktop Scaffold</p>
        <h1 id="app-title">KnowledgeDiscovery</h1>
        <p className="subtitle">
          A local-first evidence engine for grounded knowledge discovery.
        </p>
        <div className="status-grid" aria-label="Phase 1 status">
          <div>
            <span>Runtime</span>
            <strong>Tauri + React</strong>
          </div>
          <div>
            <span>Language</span>
            <strong>TypeScript</strong>
          </div>
          <div>
            <span>Identifier</span>
            <strong>com.knowledgediscovery.app</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
