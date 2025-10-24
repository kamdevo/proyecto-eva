import { useState, useEffect } from "react";
import httpService from "../services/httpService";

// Hook para obtener centros de costo
const useCentrosCosto = () => {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCentros = async () => {
      try {
        setLoading(true);
        setError(null);

        // Usar endpoint real de centros
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://192.168.56.1:8001/api"}/v1/centros`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          // Formatear datos para el componente
          const formattedCentros = data.data.map((centro) => ({
            id: centro.id.toString(),
            nombre: centro.code
              ? `${centro.code} - ${centro.name}`
              : centro.name,
          }));

          setCentros(formattedCentros);
        } else {
          throw new Error("Formato de respuesta inválido");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error al obtener centros de costo:", err);

        // Fallback a datos mock en caso de error
        const mockCentros = [
          { id: "1", nombre: "Centro de Costo 1 - Administración" },
          { id: "2", nombre: "Centro de Costo 2 - Quirófanos" },
          { id: "3", nombre: "Centro de Costo 3 - UCI" },
          { id: "4", nombre: "Centro de Costo 4 - Emergencias" },
          { id: "5", nombre: "Centro de Costo 5 - Laboratorio" },
          { id: "6", nombre: "Centro de Costo 6 - Imagenología" },
        ];

        setCentros(mockCentros);
        setError("Usando datos de respaldo - Error al cargar centros");
        setLoading(false);
      }
    };

    fetchCentros();
  }, []);

  return { centros, loading, error };
};

export { useCentrosCosto };
