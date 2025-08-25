import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";
import { useEquipmentSearch } from "@/contexts/EquipmentSearchContext";

const GlobalEquipmentSearch = () => {
  const location = useLocation();
  const {
    searchValue,
    setSearchValue,
    resultCount,
    triggerSearch,
    clearSearch,
  } = useEquipmentSearch();
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  // Sync with context search value
  useEffect(() => {
    setLocalSearch(searchValue || "");
  }, [searchValue]);

  // Check if current page is equipment related (only biomedical and industrial)
  const isEquipmentPage = () => {
    const equipmentPaths = [
      "/equipos-biomedicos",
      "/equipos-industriales",
      "/medical-devices",
      "/equipos/biomedicos",
      "/equipos/industriales",
    ];

    // Check for exact matches or if the path starts with these specific equipment paths
    return equipmentPaths.some((path) => {
      return (
        location.pathname === path ||
        (location.pathname.startsWith(path) &&
          (location.pathname.charAt(path.length) === "/" ||
            location.pathname.charAt(path.length) === "?" ||
            location.pathname.charAt(path.length) === "#" ||
            location.pathname.length === path.length))
      );
    });
  };

  // Handle search input with debouncing
  const handleSearchChange = (value) => {
    setLocalSearch(value);
    setSearchValue(value);

    // Trigger search immediately for now (can add debouncing later if needed)
    triggerSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setLocalSearch("");
    setSearchValue("");
    clearSearch();
  };

  // Only render if on equipment page
  if (!isEquipmentPage()) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 max-w-md mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar equipos..."
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 h-9 text-sm bg-white border border-slate-200 rounded-md focus:border-teal-500 focus:ring-1 focus:ring-teal-200 transition-all duration-200"
        />
        {localSearch && (
          <Button
            onClick={handleClearSearch}
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-slate-100"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      {resultCount > 0 && (
        <span className="text-xs text-slate-600 whitespace-nowrap">
          {resultCount} resultados
        </span>
      )}
    </div>
  );
};

export default GlobalEquipmentSearch;
