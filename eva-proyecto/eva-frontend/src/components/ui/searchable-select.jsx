import React, { useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";

const SearchableSelect = ({
  placeholder = "Seleccionar...",
  options = [],
  value,
  onValueChange,
  onChange, // ← AGREGAR SOPORTE PARA onChange TAMBIÉN
  disabled = false,
  loading = false,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // Normalize text to remove accents/tildes for search
  const normalizeText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Find selected option
  const selectedOption = options.find(
    (option) => option && option.id && option.id.toString() === value
  );

  // Filter options based on search term and ensure valid options
  const filteredOptions = useMemo(() => {
    // First filter out any options with invalid/empty IDs
    const validOptions = options.filter(
      (option) =>
        option &&
        option.id !== null &&
        option.id !== undefined &&
        option.id !== "" &&
        (option.label || option.nombre || option.name)
    );

    if (!searchTerm.trim()) return validOptions;

    const normalizedSearchTerm = normalizeText(searchTerm.trim());

    return validOptions.filter(
      (option) => {
        const displayText = option.label || option.nombre || option.name || '';
        const codeText = option.codigo || option.code || '';
        return normalizeText(displayText).includes(normalizedSearchTerm) ||
               (codeText && normalizeText(codeText.toString()).includes(normalizedSearchTerm));
      }
    );
  }, [options, searchTerm]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsSearching(true);

    if (!open) {
      setOpen(true);
    }
  };

  const handleSelectValue = (selectedValue) => {
    // Usar onChange u onValueChange dependiendo de cual esté disponible
    const callback = onChange || onValueChange;
    if (callback) {
      callback(selectedValue);
    }
    setOpen(false);
    setSearchTerm("");
    setIsSearching(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm("");
      setIsSearching(false);
    } else {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSearchTerm("");
      setIsSearching(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <Input
        ref={inputRef}
        placeholder={selectedOption ? (selectedOption.label || selectedOption.nombre || selectedOption.name) : placeholder}
        value={
          isSearching ? searchTerm : selectedOption ? (selectedOption.label || selectedOption.nombre || selectedOption.name) : ""
        }
        onChange={handleInputChange}
        onFocus={() => {
          setOpen(true);
          setIsSearching(true);
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        className="w-full"
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[200px] overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                onClick={() => handleSelectValue(option.id ? option.id.toString() : '')}
              >
                {option.label || option.nombre || option.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => handleOpenChange(false)}
        />
      )}
    </div>
  );
};

export default SearchableSelect;
