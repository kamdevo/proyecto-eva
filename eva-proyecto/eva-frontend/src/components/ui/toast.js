// Sistema simple de toasts para notificaciones

export const showSuccessToast = (message) => {
  console.log('✅ [SUCCESS]', message);
  
  // Crear elemento toast
  const toast = document.createElement('div');
  toast.className = `
    fixed top-4 right-4 z-50 
    bg-green-500 text-white 
    px-6 py-3 rounded-lg shadow-lg 
    flex items-center space-x-2
    animate-fade-in
  `;
  
  toast.innerHTML = `
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Remover después de 4 segundos
  setTimeout(() => {
    toast.style.animation = 'fade-out 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 4000);
};

export const showErrorToast = (message) => {
  console.error('❌ [ERROR]', message);
  
  // Crear elemento toast
  const toast = document.createElement('div');
  toast.className = `
    fixed top-4 right-4 z-50 
    bg-red-500 text-white 
    px-6 py-3 rounded-lg shadow-lg 
    flex items-center space-x-2
    animate-fade-in
  `;
  
  toast.innerHTML = `
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
    </svg>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Remover después de 5 segundos
  setTimeout(() => {
    toast.style.animation = 'fade-out 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 5000);
};

// Agregar estilos CSS globales
const addToastStyles = () => {
  if (document.getElementById('toast-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fade-out {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
    
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
  `;
  
  document.head.appendChild(style);
};

// Inicializar estilos
addToastStyles();

// Hacer funciones disponibles globalmente para httpService
if (typeof window !== 'undefined') {
  window.showSuccessToast = showSuccessToast;
  window.showErrorToast = showErrorToast;
}
