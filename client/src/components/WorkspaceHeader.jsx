export function WorkspaceHeader({
  selectedTenant,
  selectedTenantId,
  tenants,
  stats,
  showcase,
  onTenantChange
}) {
  return (
    <header className="workspace-header panel-surface">
      <div className="header-copy">
        <div className="eyebrow">Support operations</div>
        <h1>AI Customer Support Copilot</h1>
        <p>{showcase.subhead}</p>
        <div className="hero-callout">
          <strong>{showcase.headline}</strong>
          <span>{showcase.syncStatus}</span>
        </div>
      </div>

      <div className="header-controls">
        <label className="tenant-switcher">
          <span>Tenant</span>
          <select
            value={selectedTenantId}
            onChange={(event) => onTenantChange(event.target.value)}
          >
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} · {tenant.plan}
              </option>
            ))}
          </select>
        </label>

        <div className="tenant-summary">
          <div className="tenant-kicker">Workspace in focus</div>
          <div className="tenant-name">{selectedTenant?.name || "Loading tenant"}</div>
          <div className="tenant-plan">{selectedTenant?.plan || "Plan unavailable"}</div>
        </div>
      </div>

      <div className="header-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-tile">
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
          </div>
        ))}
      </div>

      <div className="showcase-strip">
        {showcase.stats.map((item) => (
          <div key={item.label} className="showcase-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </div>
        ))}
      </div>
    </header>
  );
}
