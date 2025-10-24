import React from "react";
import ParticlesBackground from "./ParticlesBg";
import LoginForm from "./LoginForm";

/**
 * ✅ OPTIMIZACIÓN DE RENDIMIENTO: LoginPage
 * 
 * Este componente separa las partículas del formulario de login para evitar 
 * re-renders innecesarios de las partículas cuando cambian los inputs del formulario.
 * 
 * ANTES: ParticlesBackground se renderizaba dentro de LoginForm
 * DESPUÉS: ParticlesBackground está separado y usa React.memo
 * 
 * Beneficios:
 * - Las partículas NO se re-renderizan cuando el usuario escribe
 * - Mejor performance general de la página de login
 * - Separación clara de responsabilidades
 */
const LoginPage = () => {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* 
        ✅ Partículas en capa separada y optimizada con React.memo 
        - Solo se renderiza una vez al cargar la página
        - No se re-renderiza cuando cambian los inputs del formulario
      */}
      <div style={{ 
        position: "absolute", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%", 
        zIndex: 1 
      }}>
        <ParticlesBackground />
      </div>

      {/* 
        ✅ Formulario en capa superior 
        - Se puede re-renderizar sin afectar las partículas
        - Mejor performance de escritura en inputs
      */}
      <div style={{ 
        position: "relative", 
        zIndex: 10, 
        width: "100%", 
        height: "100%" 
      }}>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
