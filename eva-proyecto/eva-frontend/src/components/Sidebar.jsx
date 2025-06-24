"use client"

const Sidebar = ({ activeView, setActiveView, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "perfil", label: "Mi Perfil", icon: "👤" },
    { id: "reportes", label: "Reportes", icon: "📄" },
    { id: "evidencias", label: "Evidencias", icon: "📸" },
    { id: "archivos", label: "Archivos", icon: "📁" },
  ]

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}></div>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <h2>Reportes Inovación</h2>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeView === item.id ? "active" : ""}`}
                  onClick={() => {
                    setActiveView(item.id)
                    setSidebarOpen(false)
                  }}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="storage-info">
            <h4>Almacenamiento</h4>
            <div className="storage-bar">
              <div className="storage-used" style={{ width: "65%" }}></div>
            </div>
            <p>2.4 GB de 15 GB usados</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar
