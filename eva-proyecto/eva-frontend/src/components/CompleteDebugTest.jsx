import React, { useState, useEffect } from "react";
import { API_CONFIG, AUTH_ENDPOINTS } from "../config/api.js";
import httpService from "../services/httpService.js";
import authService from "../services/authService.js";

const CompleteDebugTest = () => {
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState({});

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    addLog("🔧 Configuración cargada:");
    addLog(`API_CONFIG.API_URL: ${API_CONFIG.API_URL}`);
    addLog(`AUTH_ENDPOINTS.REGISTER: ${AUTH_ENDPOINTS.REGISTER}`);
    addLog(
      `URL completa esperada: ${API_CONFIG.API_URL}${AUTH_ENDPOINTS.REGISTER}`
    );

    // Verificar variables de entorno
    addLog("📋 Variables de entorno:");
    addLog(`VITE_API_URL: ${import.meta.env.VITE_API_URL}`);
    addLog(`VITE_AUTH_REGISTER_URL: ${import.meta.env.VITE_AUTH_REGISTER_URL}`);
  }, []);

  const testDirectHttpService = async () => {
    addLog("🧪 Iniciando prueba directa con httpService...", "info");

    const testData = {
      nombre: "Test Direct",
      apellido: "User",
      email: "testdirect@example.com",
      username: "testdirect123",
      password: "Test1234!",
      password_confirmation: "Test1234!",
    };

    try {
      addLog(`Llamando a: ${AUTH_ENDPOINTS.REGISTER}`, "info");
      const response = await httpService.post(
        AUTH_ENDPOINTS.REGISTER,
        testData
      );

      addLog("✅ Respuesta exitosa de httpService", "success");
      setResults((prev) => ({ ...prev, httpService: response.data }));
    } catch (error) {
      addLog(`❌ Error en httpService: ${error.message}`, "error");
      addLog(`URL solicitada: ${error.config?.url}`, "error");
      addLog(`Método: ${error.config?.method}`, "error");
      addLog(`Base URL: ${error.config?.baseURL}`, "error");
      setResults((prev) => ({
        ...prev,
        httpService: { error: error.message, config: error.config },
      }));
    }
  };

  const testAuthService = async () => {
    addLog("🔐 Iniciando prueba con authService...", "info");

    const testData = {
      nombre: "Test Auth",
      apellido: "Service",
      email: "testauth@example.com",
      username: "testauth123",
      password: "Test1234!",
      password_confirmation: "Test1234!",
    };

    try {
      const response = await authService.register(testData);

      if (response.success) {
        addLog("✅ Registro exitoso con authService", "success");
        setResults((prev) => ({ ...prev, authService: response }));
      } else {
        addLog(`❌ Error en authService: ${response.message}`, "error");
        setResults((prev) => ({ ...prev, authService: response }));
      }
    } catch (error) {
      addLog(`❌ Excepción en authService: ${error.message}`, "error");
      setResults((prev) => ({
        ...prev,
        authService: { error: error.message },
      }));
    }
  };

  const testDirectFetch = async () => {
    addLog("🌐 Iniciando prueba directa con fetch...", "info");

    const testData = {
      nombre: "Test Fetch",
      apellido: "Direct",
      email: "testfetch@example.com",
      username: "testfetch123",
      password: "Test1234!",
      password_confirmation: "Test1234!",
    };

    // Probar múltiples endpoints
    const endpoints = [
      `${API_CONFIG.API_URL}${AUTH_ENDPOINTS.REGISTER}`,
      `${API_CONFIG.API_URL}/auth/register`,
      `${API_CONFIG.API_URL}/v1/register-working`,
    ];

    for (const endpoint of endpoints) {
      try {
        addLog(`Probando endpoint: ${endpoint}`, "info");

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "include",
          body: JSON.stringify({
            ...testData,
            username: testData.username + "_" + endpoint.split("/").pop(),
          }),
        });

        const result = await response.json();

        if (response.ok) {
          addLog(`✅ ${endpoint} - Éxito`, "success");
        } else {
          addLog(`⚠️ ${endpoint} - Error ${response.status}`, "warning");
        }

        setResults((prev) => ({
          ...prev,
          [`fetch_${endpoint.split("/").pop()}`]: {
            status: response.status,
            result,
            url: response.url,
          },
        }));
      } catch (error) {
        addLog(`❌ ${endpoint} - Excepción: ${error.message}`, "error");
      }
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setResults({});
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "1200px",
      }}
    >
      <h1>🔬 Debug Completo - Registro Frontend</h1>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={testDirectHttpService} style={buttonStyle}>
          🧪 Probar httpService
        </button>
        <button onClick={testAuthService} style={buttonStyle}>
          🔐 Probar authService
        </button>
        <button onClick={testDirectFetch} style={buttonStyle}>
          🌐 Probar fetch directo
        </button>
        <button
          onClick={clearLogs}
          style={{ ...buttonStyle, background: "#dc3545" }}
        >
          🗑️ Limpiar
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ flex: 1 }}>
          <h3>📋 Logs</h3>
          <div style={logContainerStyle}>
            {logs.map((log, index) => (
              <div key={index} style={getLogStyle(log.type)}>
                <strong>[{log.timestamp}]</strong> {log.message}
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h3>📊 Resultados</h3>
          <pre style={resultsStyle}>{JSON.stringify(results, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

const buttonStyle = {
  background: "#007cba",
  color: "white",
  padding: "10px 15px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  margin: "5px",
  fontSize: "14px",
};

const logContainerStyle = {
  background: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "5px",
  padding: "15px",
  height: "400px",
  overflow: "auto",
  fontSize: "12px",
  fontFamily: "monospace",
};

const resultsStyle = {
  background: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "5px",
  padding: "15px",
  height: "400px",
  overflow: "auto",
  fontSize: "11px",
};

const getLogStyle = (type) => ({
  color:
    type === "error"
      ? "#dc3545"
      : type === "success"
      ? "#28a745"
      : type === "warning"
      ? "#ffc107"
      : "#333",
  marginBottom: "3px",
});

export default CompleteDebugTest;
