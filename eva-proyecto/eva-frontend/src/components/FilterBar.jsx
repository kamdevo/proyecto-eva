import { useState } from "react"

const FilterBar = ({ onFilter, showTypeFilter = false, typeOptions = [] }) => {
  const [filters, setFilters] = useState({
    search: "",
    status: "todos",
    type: "todos",
    dateFrom: "",
    dateTo: "",
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      status: "todos",
      type: "todos",
      dateFrom: "",
      dateTo: "",
    }
    setFilters(clearedFilters)
    onFilter(clearedFilters)
  }

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)} />
        </div>
      </div>
      <div className="filter-group">
        {!showTypeFilter && (
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="aprobado">Aprobados</option>
            <option value="pendiente">Pendientes</option>
            <option value="revision">En Revisión</option>
          </select>
        )}

        {showTypeFilter && typeOptions.length > 0 && (
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}>
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
          placeholder="Fecha desde" />

        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange("dateTo", e.target.value)}
          placeholder="Fecha hasta" />
      </div>
      <div className="filter-actions">
        <button className="btn btn-outline btn-sm" onClick={clearFilters}>
          🗑️ Limpiar
        </button>
      </div>
    </div>
  );
}

export default FilterBar
