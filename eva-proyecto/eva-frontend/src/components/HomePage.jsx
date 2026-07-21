"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ArrowRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import wrenchImg from "../assets/Img/wrench.png";
import bagImg from "../assets/Img/bag.png";

const AVATARS_IMG = "/images/loadingavatars.png";

export default function EvaDashboard() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [guiasRapidas, setGuiasRapidas] = useState([]);
  const [loadingGuias, setLoadingGuias] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar guías rápidas desde la BD
  const fetchGuiasRapidas = async () => {
    try {
      setLoadingGuias(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";
      const response = await fetch(`${API_BASE_URL}/v1/guias-rapidas`);
      const data = await response.json();
      if (data.success) {
        setGuiasRapidas(data.data);
      } else {
        console.error("❌ Error cargando guías:", data.message);
        setGuiasRapidas([]);
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      setGuiasRapidas([]);
    } finally {
      setLoadingGuias(false);
    }
  };

  useEffect(() => {
    fetchGuiasRapidas();
  }, []);

  // Filtrar guías rápidas según término de búsqueda
  const guiasFiltradas = guiasRapidas.filter((guia) =>
    guia.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir documento de guía rápida
  const abrirGuiaRapida = (guia) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";
      window.open(`${API_BASE_URL}/v1/guias-rapidas/${guia.id}/archivo`, "_blank");
    } catch (error) {
      console.error("❌ Error abriendo guía:", error);
      toast.error("Error al abrir la guía rápida");
    }
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] lg:h-[calc(100vh-6.5rem)] w-full bg-[#F1F4F6] p-3 sm:p-4 overflow-x-hidden lg:overflow-hidden">
      <div className="w-full lg:h-full">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full lg:h-full rounded-[2rem] overflow-hidden border border-slate-100 bg-gradient-to-br from-white to-slate-50/80">
          {/* Columna izquierda: texto + tarjeta de búsqueda */}
          <div className="p-8 sm:p-10 lg:p-14 xl:p-20 flex flex-col justify-center order-2 lg:order-1">
            <p className="text-sm font-bold tracking-[0.25em] text-blue-500 uppercase mb-5">
              Plataforma EVA
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-800 leading-[1.03] uppercase mb-5">
              EVA gestiona la tecnología
            </h1>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-10">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide text-[#9a7b1c]">
                Acreditación
              </span>
              <span className="text-base lg:text-lg font-bold text-slate-700">
                ¡Un compromiso de TODOS!
              </span>
            </div>

            {/* Tarjeta de búsqueda */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-7 w-full max-w-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 leading-tight">
                  <p className="text-[11px] font-bold tracking-wider text-blue-500 uppercase">
                    Consulta aquí
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    Guías rápidas · equipos biomédicos
                  </p>
                </div>
              </div>

              {/* Input de búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="Buscar equipo o guía..."
                  className="w-full h-11 pl-9 pr-9 rounded-xl bg-slate-50 border-slate-200 text-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value && !showDropdown) setShowDropdown(true);
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Limpiar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Resultados */}
              {showDropdown && (
                <div className="mt-3 max-h-56 overflow-auto bg-white border border-slate-100 rounded-xl">
                  {loadingGuias ? (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-2" />
                      Cargando guías...
                    </div>
                  ) : guiasFiltradas.length > 0 ? (
                    guiasFiltradas.map((guia) => (
                      <div
                        key={guia.id}
                        onClick={() => abrirGuiaRapida(guia)}
                        className="flex items-center justify-between p-3 hover:bg-blue-50 text-left cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                      >
                        <span className="text-slate-700 text-sm font-medium flex-1 truncate">
                          {guia.name}
                        </span>
                        <ExternalLink className="h-4 w-4 text-blue-600 ml-2 flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      {searchTerm
                        ? `No se encontraron guías que coincidan con "${searchTerm}"`
                        : "No se encontraron guías rápidas"}
                    </div>
                  )}
                </div>
              )}

              {/* Botón navegar */}
              <Button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="mt-4 w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm gap-2"
              >
                Navega todas las guías rápidas
                {loadingGuias ? (
                  <span className="text-xs font-normal opacity-80">(Cargando...)</span>
                ) : searchTerm ? (
                  <span className="text-xs font-normal opacity-90">
                    ({guiasFiltradas.length}{" "}
                    {guiasFiltradas.length === 1 ? "resultado" : "resultados"})
                  </span>
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Columna derecha: panel celeste con avatares + decoración */}
          <div className="relative order-1 lg:order-2 min-h-[300px] sm:min-h-[400px] lg:min-h-full flex items-center justify-center p-8 sm:p-10 overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-blue-100/70">
            {/* Llave (arriba a la derecha) */}
            <img
              src={wrenchImg}
              alt=""
              aria-hidden="true"
              className="absolute top-8 right-10 sm:top-12 sm:right-16 lg:top-20 lg:right-24 w-20 sm:w-28 lg:w-36 select-none pointer-events-none"
              style={{ filter: "drop-shadow(0 12px 18px rgba(30,58,138,0.18))" }}
            />

            {/* Avatares (centro) */}
            <img
              src={AVATARS_IMG}
              alt="Equipo EVA"
              className="relative w-72 sm:w-[26rem] lg:w-[34rem] xl:w-[42rem] max-h-[85%] object-contain select-none"
              style={{ filter: "drop-shadow(0 20px 30px rgba(30,58,138,0.18))" }}
            />

            {/* Bolsa de suero (abajo a la izquierda) */}
            <img
              src={bagImg}
              alt=""
              aria-hidden="true"
              className="absolute bottom-8 left-10 sm:bottom-12 sm:left-16 lg:bottom-20 lg:left-24 w-16 sm:w-24 lg:w-28 select-none pointer-events-none"
              style={{ filter: "drop-shadow(0 12px 18px rgba(30,58,138,0.18))" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
