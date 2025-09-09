import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Componente de paginación reutilizable
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false,
  showInfo = true,
  maxVisiblePages = 5
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
      {showInfo && (
        <div className="text-sm text-gray-600">
          Mostrando {startItem} - {endItem} de {totalItems} registros
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        {/* First page */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1 || loading}
          className="p-2"
          title="Primera página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        {/* Previous page */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="p-2"
          title="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Page numbers */}
        {(() => {
          const pages = [];
          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
          
          // Adjust start page if we're near the end
          if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
          }
          
          // Add ellipsis at the beginning if needed
          if (startPage > 1) {
            pages.push(
              <Button
                key={1}
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                className="min-w-[2.5rem]"
                disabled={loading}
              >
                1
              </Button>
            );
            if (startPage > 2) {
              pages.push(
                <span key="ellipsis-start" className="px-2 text-gray-400">
                  ...
                </span>
              );
            }
          }
          
          // Add visible page numbers
          for (let i = startPage; i <= endPage; i++) {
            pages.push(
              <Button
                key={i}
                variant={currentPage === i ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(i)}
                disabled={loading}
                className={`min-w-[2.5rem] ${
                  currentPage === i 
                    ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-md font-semibold" 
                    : "hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                {i}
              </Button>
            );
          }
          
          // Add ellipsis at the end if needed
          if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
              pages.push(
                <span key="ellipsis-end" className="px-2 text-gray-400">
                  ...
                </span>
              );
            }
            pages.push(
              <Button
                key={totalPages}
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="min-w-[2.5rem]"
                disabled={loading}
              >
                {totalPages}
              </Button>
            );
          }
          
          return pages;
        })()}
        
        {/* Next page */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="p-2"
          title="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Last page */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || loading}
          className="p-2"
          title="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
