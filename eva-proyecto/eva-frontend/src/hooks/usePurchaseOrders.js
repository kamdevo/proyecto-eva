import { useState, useEffect, useCallback } from "react";
import { API_CONFIG } from "../config/api";

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    per_page: 15,
    page: 1,
    sort_by: "id",
    sort_order: "desc",
  });

  const fetchPurchaseOrders = useCallback(
    async (customFilters = {}) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          ...filters,
          ...customFilters,
        });

        const response = await fetch(
          `${API_CONFIG.API_URL}/v1/ordenes-compra?${queryParams}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setPurchaseOrders(data.data.data || []);
          setPagination({
            current_page: data.data.current_page || 1,
            last_page: data.data.last_page || 1,
            per_page: data.data.per_page || 15,
            total: data.data.total || 0,
            from: data.data.from || 0,
            to: data.data.to || 0,
          });
        } else {
          throw new Error(data.message || "Error al obtener órdenes de compra");
        }
      } catch (err) {
        console.error("Error fetching purchase orders:", err);
        setError(err.message);
        setPurchaseOrders([]);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
          from: 0,
          to: 0,
        });
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Update filters and fetch data
  const updateFilters = useCallback(
    (newFilters) => {
      const updatedFilters = { ...filters, ...newFilters };

      // Reset to page 1 when changing search or status filters
      if (newFilters.search !== undefined || newFilters.status !== undefined) {
        updatedFilters.page = 1;
      }

      setFilters(updatedFilters);
      fetchPurchaseOrders(updatedFilters);
    },
    [filters, fetchPurchaseOrders]
  );

  // Change page
  const changePage = useCallback(
    (page) => {
      // Validar que la página esté en el rango válido
      if (
        page < 1 ||
        (pagination.last_page > 0 && page > pagination.last_page)
      ) {
        return;
      }
      updateFilters({ page });
    },
    [updateFilters, pagination.last_page]
  );

  // Change page size
  const changePageSize = useCallback(
    (per_page) => {
      updateFilters({ per_page, page: 1 });
    },
    [updateFilters]
  );

  // Search function
  const search = useCallback(
    (searchTerm) => {
      updateFilters({ search: searchTerm });
    },
    [updateFilters]
  );

  // Filter by status
  const filterByStatus = useCallback(
    (status) => {
      updateFilters({ status });
    },
    [updateFilters]
  );

  // Sort function
  const sort = useCallback(
    (sortBy, sortOrder) => {
      updateFilters({ sort_by: sortBy, sort_order: sortOrder, page: 1 });
    },
    [updateFilters]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      search: "",
      status: "",
      per_page: 15,
      page: 1,
      sort_by: "id",
      sort_order: "desc",
    };
    setFilters(clearedFilters);
    fetchPurchaseOrders(clearedFilters);
  }, [fetchPurchaseOrders]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Navigation helpers
  const goToFirstPage = useCallback(() => {
    changePage(1);
  }, [changePage]);

  const goToLastPage = useCallback(() => {
    if (pagination.last_page > 0) {
      changePage(pagination.last_page);
    }
  }, [changePage, pagination.last_page]);

  const goToNextPage = useCallback(() => {
    if (pagination.current_page < pagination.last_page) {
      changePage(pagination.current_page + 1);
    }
  }, [changePage, pagination.current_page, pagination.last_page]);

  const goToPreviousPage = useCallback(() => {
    if (pagination.current_page > 1) {
      changePage(pagination.current_page - 1);
    }
  }, [changePage, pagination.current_page]);

  // Initial load
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return {
    // Data
    purchaseOrders,
    loading,
    error,
    pagination,
    filters,

    // Actions
    updateFilters,
    changePage,
    changePageSize,
    search,
    filterByStatus,
    sort,
    clearFilters,
    refresh,

    // Navigation helpers
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,

    // Computed values
    hasData: purchaseOrders.length > 0,
    isEmpty: !loading && purchaseOrders.length === 0,
    hasError: !!error,
    totalPages: pagination.last_page,
    currentPage: pagination.current_page,
    totalItems: pagination.total,
    itemsPerPage: pagination.per_page,
    showingFrom: pagination.from,
    showingTo: pagination.to,
    sortBy: filters.sort_by,
    sortOrder: filters.sort_order,
  };
};
