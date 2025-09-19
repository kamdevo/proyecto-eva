import React from "react";
import ReactDOM from "react-dom/client";
import LoginForm from "./components/LoginForm";
import App from "./App";
import Navbar from "./components/Navbar";
import "./index.css";
import "./styles/equipment-animations.css";

// Import debug config to check environment variables
import "./debug-config.js";

// Inicializar autenticación inmediatamente
import { initializeAuth } from "./services/httpService";

// Inicializar autenticación al cargar la aplicación
initializeAuth().then((result) => {
  if (result.success) {
    console.log("✅ [MAIN] Autenticación inicializada:", result.user?.name);
  } else {
    console.log("ℹ️ [MAIN] Sin sesión previa:", result.error);
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
