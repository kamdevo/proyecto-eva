import React, { useRef, useState, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Reusable drag-and-drop file picker.
 * - Supports both click and drag & drop.
 * - Uses a dragenter/dragleave counter to avoid flicker when the cursor
 *   crosses child elements.
 * - Calls preventDefault on dragover so the browser allows the drop.
 *
 * Props:
 *  - file: File | null — currently selected file
 *  - onFileChange(file): called with File on selection (click or drop)
 *  - onRemove(): called when user removes the file
 *  - accept: string — passed to <input accept=...>
 *  - hint: string — small helper text under the prompt
 *  - label: string — main prompt text (default "Arrastra un archivo aquí o")
 *  - compact: boolean — smaller layout variant
 *  - disabled: boolean
 */
const FileDropzone = ({
  file,
  onFileChange,
  onRemove,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv",
  hint = "PDF, Word, Excel, JPG, PNG (máx. 10MB)",
  label = "Arrastra un archivo aquí o",
  selectText = "selecciona uno",
  compact = false,
  disabled = false,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragActive(false);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e) => {
    // Required so browser accepts the drop
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  }, [disabled]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragActive(false);
    if (disabled) return;
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      onFileChange?.(droppedFile);
    }
  }, [disabled, onFileChange]);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) onFileChange?.(selected);
    // allow selecting the same file again later
    e.target.value = "";
  };

  const baseClasses = compact
    ? "border-2 border-dashed rounded-md p-3 text-center transition-colors text-xs"
    : "border-2 border-dashed rounded-lg p-6 text-center transition-colors";

  const stateClasses = dragActive
    ? "border-blue-500 bg-blue-50"
    : "border-gray-300 hover:border-blue-400";

  if (file) {
    return (
      <div className={`flex items-center justify-between p-3 bg-gray-50 rounded border ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{file.name}</span>
          {typeof file.size === "number" && (
            <span className="text-xs text-gray-500 flex-shrink-0">
              ({(file.size / 1024).toFixed(2)} KB)
            </span>
          )}
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${stateClasses} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {compact ? (
        <>
          <Upload className="mx-auto h-4 w-4 text-gray-400 mb-1 pointer-events-none" />
          <span className="text-gray-500 pointer-events-none">{label}</span>
        </>
      ) : (
        <>
          <Upload className="mx-auto h-12 w-12 text-gray-400 pointer-events-none" />
          <p className="mt-2 text-sm text-gray-600 pointer-events-none">
            {label} <span className="text-blue-600 hover:text-blue-700">{selectText}</span>
          </p>
          {hint && <p className="text-xs text-gray-500 mt-1 pointer-events-none">{hint}</p>}
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  );
};

export default FileDropzone;
