import { createContext, useContext, useState, useCallback } from "react";

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
  const [searchCallback, setSearchCallback] = useState(null);

  // Register search callback from equipment components
  const registerSearchCallback = useCallback((callback) => {
    setSearchCallback(() => callback);
  }, []);

  // Trigger search
  const triggerSearch = useCallback(
    (searchTerm) => {
      if (searchCallback) {
        searchCallback(searchTerm);
      }
    },
    [searchCallback]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchValue("");
    if (searchCallback) {
      searchCallback("");
    }
  }, [searchCallback]);

  const value = {
    searchValue,
    setSearchValue,
    resultCount,
    setResultCount,
    registerSearchCallback,
    triggerSearch,
    clearSearch,
  };

  return (
    <EquipmentSearchContext.Provider value={value}>
      {children}
    </EquipmentSearchContext.Provider>
  );
};
