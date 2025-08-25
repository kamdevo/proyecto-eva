import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Componente reutilizable para búsqueda de equipos
 * Funciona tanto para equipos biomédicos como industriales
 */
export function EquipmentSearch({
  value,
  onChange,
  onSearch,
  equipmentType = "biomedical", // "biomedical" | "industrial"
  placeholder,
}) {
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    switch (equipmentType) {
      case "industrial":
        return "Buscar equipos industriales...";
      case "biomedical":
      default:
        return "Buscar equipos médicos...";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="mb-3 sm:mb-4">
      <div className="space-y-1 sm:space-y-2">
        <label className="text-xs sm:text-sm font-medium text-slate-700 block">
          Consulta Global:
        </label>
        <div className="relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4" />
          <Input
            type="text"
            placeholder={getPlaceholder()}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className="w-full h-8 sm:h-9 md:h-10 pl-7 sm:pl-9 pr-3 text-xs sm:text-sm bg-white border border-slate-200 rounded focus:border-teal-500 focus:ring-1 focus:ring-teal-200 transition-all duration-200 placeholder:text-slate-400"
          />
        </div>
      </div>
    </div>
  );
}
