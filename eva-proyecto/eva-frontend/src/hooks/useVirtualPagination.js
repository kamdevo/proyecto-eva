/**
 * ========================================
 * HOOK DE PAGINACIÓN VIRTUAL
 * ========================================
 *
 * Hook optimizado para manejar grandes listas de tickets
 * con paginación virtual y carga perezosa
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export const useVirtualPagination = ({
  totalItems = 0,
  itemHeight = 80,
  containerHeight = 600,
  overscan = 5,
  onLoadMore = null,
  threshold = 0.8,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const scrollElementRef = useRef(null);

  // Calcular elementos visibles
  const visibleRange = useMemo(() => {
    const visibleItemCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleItemCount, totalItems - 1);

    // Agregar overscan para suavizar el scroll
    const startWithOverscan = Math.max(0, startIndex - overscan);
    const endWithOverscan = Math.min(totalItems - 1, endIndex + overscan);

    return {
      start: startWithOverscan,
      end: endWithOverscan,
      visibleStart: startIndex,
      visibleEnd: endIndex,
    };
  }, [scrollTop, itemHeight, containerHeight, totalItems, overscan]);

  // Calcular altura total del contenedor virtual
  const totalHeight = useMemo(() => {
    return totalItems * itemHeight;
  }, [totalItems, itemHeight]);

  // Calcular offset del primer elemento visible
  const offsetY = useMemo(() => {
    return visibleRange.start * itemHeight;
  }, [visibleRange.start, itemHeight]);

  // Elementos visibles
  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      items.push({
        index: i,
        offsetY: i * itemHeight,
        isVisible: i >= visibleRange.visibleStart && i <= visibleRange.visibleEnd,
      });
    }
    return items;
  }, [visibleRange, itemHeight]);

  /**
   * Manejar scroll del contenedor
   */
  const handleScroll = useCallback((event) => {
    const scrollTop = event.target.scrollTop;
    setScrollTop(scrollTop);

    // Verificar si necesitamos cargar más elementos
    if (onLoadMore && !isLoading) {
      const scrollPercentage = scrollTop / (totalHeight - containerHeight);
      if (scrollPercentage >= threshold) {
        setIsLoading(true);
        onLoadMore().finally(() => {
          setIsLoading(false);
        });
      }
    }
  }, [onLoadMore, isLoading, totalHeight, containerHeight, threshold]);

  /**
   * Scroll a un índice específico
   */
  const scrollToIndex = useCallback((index, align = 'start') => {
    if (!scrollElementRef.current) return;

    let scrollTop;
    switch (align) {
      case 'start':
        scrollTop = index * itemHeight;
        break;
      case 'center':
        scrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
        break;
      case 'end':
        scrollTop = index * itemHeight - containerHeight + itemHeight;
        break;
      default:
        scrollTop = index * itemHeight;
    }

    scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight));
    scrollElementRef.current.scrollTop = scrollTop;
  }, [itemHeight, containerHeight, totalHeight]);

  /**
   * Scroll suave a un índice
   */
  const scrollToIndexSmooth = useCallback((index, align = 'start') => {
    if (!scrollElementRef.current) return;

    let scrollTop;
    switch (align) {
      case 'start':
        scrollTop = index * itemHeight;
        break;
      case 'center':
        scrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
        break;
      case 'end':
        scrollTop = index * itemHeight - containerHeight + itemHeight;
        break;
      default:
        scrollTop = index * itemHeight;
    }

    scrollTop = Math.max(0, Math.min(scrollTop, totalHeight - containerHeight));
    scrollElementRef.current.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  }, [itemHeight, containerHeight, totalHeight]);

  /**
   * Obtener elemento en una posición específica
   */
  const getItemAtPosition = useCallback((y) => {
    const index = Math.floor(y / itemHeight);
    return Math.max(0, Math.min(index, totalItems - 1));
  }, [itemHeight, totalItems]);

  /**
   * Verificar si un elemento está visible
   */
  const isItemVisible = useCallback((index) => {
    return index >= visibleRange.visibleStart && index <= visibleRange.visibleEnd;
  }, [visibleRange]);

  /**
   * Obtener estadísticas de rendimiento
   */
  const getStats = useCallback(() => {
    return {
      totalItems,
      visibleItems: visibleItems.length,
      renderedItems: visibleRange.end - visibleRange.start + 1,
      scrollTop,
      scrollPercentage: totalHeight > 0 ? scrollTop / (totalHeight - containerHeight) : 0,
      memoryUsage: {
        totalPossible: totalItems,
        currentlyRendered: visibleItems.length,
        efficiency: totalItems > 0 ? (visibleItems.length / totalItems) * 100 : 0,
      },
    };
  }, [totalItems, visibleItems.length, visibleRange, scrollTop, totalHeight, containerHeight]);

  // Configurar el contenedor de scroll
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Resetear scroll cuando cambie el total de elementos
  useEffect(() => {
    if (scrollElementRef.current && totalItems === 0) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [totalItems]);

  return {
    // Referencias
    containerRef,
    scrollElementRef,
    
    // Datos de virtualización
    visibleItems,
    totalHeight,
    offsetY,
    visibleRange,
    
    // Estados
    isLoading,
    scrollTop,
    
    // Acciones
    scrollToIndex,
    scrollToIndexSmooth,
    getItemAtPosition,
    isItemVisible,
    
    // Utilidades
    getStats,
    
    // Props para el contenedor
    containerProps: {
      ref: containerRef,
      style: {
        height: containerHeight,
        overflow: 'hidden',
        position: 'relative',
      },
    },
    
    // Props para el elemento de scroll
    scrollProps: {
      ref: scrollElementRef,
      onScroll: handleScroll,
      style: {
        height: containerHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
      },
    },
    
    // Props para el contenedor virtual
    virtualProps: {
      style: {
        height: totalHeight,
        position: 'relative',
      },
    },
    
    // Props para el contenedor de elementos visibles
    itemsContainerProps: {
      style: {
        transform: `translateY(${offsetY}px)`,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      },
    },
  };
};

export default useVirtualPagination;
