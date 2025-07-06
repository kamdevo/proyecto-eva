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

        // Datos mock mientras no tengamos el endpoint real
        const mockCentros = [
          { id: "1", nombre: "Centro de Costo 1 - Administración" },
          { id: "2", nombre: "Centro de Costo 2 - Quirófanos" },
          { id: "3", nombre: "Centro de Costo 3 - UCI" },
          { id: "4", nombre: "Centro de Costo 4 - Emergencias" },
          { id: "5", nombre: "Centro de Costo 5 - Laboratorio" },
          { id: "6", nombre: "Centro de Costo 6 - Imagenología" },
        ];

        // Simular delay de red
        setTimeout(() => {
          setCentros(mockCentros);
          setLoading(false);
        }, 500);

        /* 
        // Cuando tengas el endpoint real, descomenta esto:
        const response = await httpService.get('/centros-costo');
        setCentros(response.data);
        setLoading(false);
        */
      } catch (err) {
        console.error("Error al obtener centros de costo:", err);
        setError("Error al cargar centros de costo");
        setLoading(false);
      }
    };

    fetchCentros();
  }, []);

  return { centros, loading, error };
};

export default useCentrosCosto;
