import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const DebugRegistration = () => {
  const { register } = useAuth();
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult("Enviando petición...");

    const testData = {
      nombre: "Test",
      apellido: "Usuario",
      email: "test@react.com",
      username: "testreact123",
      password: "Test1234!",
      password_confirmation: "Test1234!",
    };

    try {
      console.log("🔥 [DEBUG] Iniciando registro desde React...");
      const response = await register(testData);
      setResult(`Éxito: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      console.error("🔥 [DEBUG] Error en registro:", error);
      setResult(`Error: ${error.message}\n${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Debug Registration - React Frontend</h2>
      <button
        onClick={testRegistration}
        disabled={loading}
        style={{
          background: loading ? "#ccc" : "#007cba",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Enviando..." : "Probar Registro React"}
      </button>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: "#f5f5f5",
          borderRadius: "5px",
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
        }}
      >
        {result || "Haz clic en el botón para probar..."}
      </div>
    </div>
  );
};

export default DebugRegistration;
