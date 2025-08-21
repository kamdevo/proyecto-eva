import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";
import { useEquipmentSearch } from "@/contexts/EquipmentSearchContext";

const GlobalEquipmentSearch = () => {
  const location = useLocation();
  const { searchValue, setSearchValue, resultCount } = useEquipmentSearch();
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  // Sync with context search value
  useEffect(() => {
    setLocalSearch(searchValue || "");
  }, [searchValue]);

  // Check if current page is equipment related
  const isEquipmentPage = () => {
    const equipmentPaths = [
      "/equipos",
      "/equipos-biomedicos",
      "/equipos-industriales",
      "/medical-devices",
      "/equipos/biomedicos",
      "/equipos/industriales",
      "/equipos/contingencias",
      "/equipos/manuales",
      "/equipos/bajas",
      "/equipos/guias-rapidas",
      "/equipos/ordenes-compra",
      "/equipos/consultas",
    ];

    return equipmentPaths.some(
      (path) =>
        location.pathname.includes(path) || location.pathname.startsWith(path)
    );
  };

  // Handle search input
  const handleSearchChange = (value) => {
    setLocalSearch(value);
    setSearchValue(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearch("");
    setSearchValue("");
  };

  // Only render if on equipment page
  if (!isEquipmentPage()) {
    return null;
  }

  // Componente deshabilitado temporalmente para evitar duplicación con búsqueda local
  return null;
};

export default GlobalEquipmentSearch;
