import React from "react";
import ReactDOM from "react-dom/client";
import LoginForm from "./components/LoginForm";
import App from "./App";
import Navbar from "./components/Navbar";
import "./index.css";
import "./styles/equipment-animations.css";
import {ClickToComponent} from "click-to-react-component";
// Import debug config to check environment variables
import "./debug-config.js";

// Inicializar autenticación inmediatamente
import { initializeAuth } from "./services/httpService";

// Inicializar sistema de toasts
import "./components/ui/toast";

// Inicializar autenticación al cargar la aplicación
initializeAuth();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />

  </React.StrictMode>
);
