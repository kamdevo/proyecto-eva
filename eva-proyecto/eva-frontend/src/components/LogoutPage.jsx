import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log("🔐 Ejecutando logout desde página dedicada...");
        await logout();
        console.log("✅ Logout exitoso, redirigiendo...");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("❌ Error durante logout:", error);
        // Forzar navegación incluso si falla
        navigate("/", { replace: true });
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Cerrando sesión...</p>
      </div>
    </div>
  );
};

export default LogoutPage;
