import { createContext, useContext, useState, useCallback, useRef } from "react";

const EquipmentSearchContext = createContext();

export const useEquipmentSearch = () => {
  const context = useContext(EquipmentSearchContext);
  if (!context) {
    throw new Error(
      "useEquipmentSearch must be used within an EquipmentSearchProvider"
    );
  }
  return context;
};

export const EquipmentSearchProvider = ({ children }) => {
  const [searchValue, setSearchValue] = useState("");
  const [resultCount, setResultCount] = useState(0);
  // Use ref for callback to avoid re-renders and infinite loops
  const searchCallbackRef = useRef(null);

  // Register search callback from equipment components (stable reference)
  const registerSearchCallback = useCallback((callback) => {
    searchCallbackRef.current = callback;
  }, []);

  // Unregister when component unmounts
  const unregisterSearchCallback = useCallback(() => {
    searchCallbackRef.current = null;
  }, []);

  // Trigger search (stable — reads from ref, no dependency on callback state)
  const triggerSearch = useCallback((searchTerm) => {
    if (searchCallbackRef.current) {
      searchCallbackRef.current(searchTerm);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchValue("");
    if (searchCallbackRef.current) {
      searchCallbackRef.current("");
    }
  }, []);

  const value = {
    searchValue,
    setSearchValue,
    resultCount,
    setResultCount,
    registerSearchCallback,
    unregisterSearchCallback,
    triggerSearch,
    clearSearch,
  };

  return (
    <EquipmentSearchContext.Provider value={value}>
      {children}
    </EquipmentSearchContext.Provider>
  );
};
