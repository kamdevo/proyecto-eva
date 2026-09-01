import React, { useRef, useEffect, useCallback } from "react";
import { Bold } from "lucide-react";
import { sanitizeRichHtml, htmlToPlainText } from "@/utils/sanitizeRichText";

/**
 * RichTextarea — campo de texto enriquecido (solo negrita).
 * Almacena HTML internamente y expone el texto plano + HTML.
 *
 * IMPORTANTE: todo lo que entra se sanea a <strong>/<br>. Sin esto, pegar
 * desde Gmail/Word inyecta el HTML de origen completo (con style, font-family,
 * etc.), que terminaba guardado en la base de datos y salía crudo en los
 * exportes a Excel y en los correos.
 *
 * Props:
 *   value       : string HTML — el valor actual (puede ser plano o con <strong>)
 *   onChange    : (plainText: string, html: string) => void
 *   placeholder : string
 *   rows        : number (aprox altura)
 *   className   : string extra para el contenedor
 *   minLength   : number — para mostrar contador (opcional)
 */
export default function RichTextarea({
  value = "",
  onChange,
  placeholder = "",
  rows = 5,
  className = "",
  minLength,
}) {
  const editorRef = useRef(null);
  const isInternalUpdate = useRef(false);

  // Sincronizar valor externo → editor (solo cuando cambia desde afuera)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    // El valor externo puede venir sucio (registros antiguos): se sanea antes de pintarlo.
    const safe = sanitizeRichHtml(value);
    if (el.innerHTML !== safe) {
      el.innerHTML = safe;
    }
  }, [value]);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el || !onChange) return;
    isInternalUpdate.current = true;
    // Red de seguridad: nunca se emite HTML fuera del contrato <strong>/<br>.
    const html = sanitizeRichHtml(el.innerHTML);
    const plain = el.innerText || el.textContent || "";
    onChange(plain, html);
  }, [onChange]);

  const toggleBold = () => {
    editorRef.current?.focus();
    document.execCommand("bold", false);
    emitChange();
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault();
      toggleBold();
    }
  };

  // Puerta de entrada principal del HTML basura: se intercepta el pegado,
  // se sanea (conservando la negrita) y se inserta ya limpio.
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboard = e.clipboardData || window.clipboardData;
    if (!clipboard) return;

    const html = clipboard.getData("text/html");
    const text = clipboard.getData("text/plain");

    const safe = html
      ? sanitizeRichHtml(html)
      : sanitizeRichHtml(
          // El texto plano se escapa y sus saltos se vuelven <br>.
          String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\r?\n/g, "<br>")
        );

    if (safe) document.execCommand("insertHTML", false, safe);
    emitChange();
  };

  // Se evita arrastrar contenido con formato hacia el editor.
  const handleDrop = (e) => {
    e.preventDefault();
    const text = e.dataTransfer?.getData("text/plain");
    if (text) {
      document.execCommand(
        "insertHTML",
        false,
        String(text)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\r?\n/g, "<br>")
      );
      emitChange();
    }
  };

  const minH = `${rows * 1.6}rem`;
  const plainLen = editorRef.current
    ? (editorRef.current.innerText || editorRef.current.textContent || "").length
    : htmlToPlainText(value).length;

  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border border-b-0 border-gray-300 rounded-t-md bg-gray-50">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); toggleBold(); }}
          title="Negrita (Ctrl+B)"
          className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-700 font-bold text-sm leading-none"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] text-gray-400 ml-1">Ctrl+B para negrita</span>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        data-placeholder={placeholder}
        style={{ minHeight: minH }}
        className={
          "w-full px-3 py-2 text-sm border border-gray-300 rounded-b-md bg-white " +
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
          "overflow-y-auto whitespace-pre-wrap break-words " +
          "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
        }
      />

      {/* Contador */}
      {minLength !== undefined && (
        <p className={`text-xs mt-1 ${plainLen < minLength ? "text-red-500 font-medium" : "text-gray-500"}`}>
          {plainLen} caracteres {minLength ? `(mínimo ${minLength})` : ""}
        </p>
      )}
    </div>
  );
}
