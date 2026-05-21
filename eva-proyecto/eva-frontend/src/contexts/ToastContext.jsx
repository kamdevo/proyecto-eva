import React, { createContext, useContext } from "react";
import { Toaster, toast } from "sonner";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  // Importamos toast directamente de sonner para usar sus métodos
  const toastMethods = {
    success: (message, options = {}) => {
      return toast.success(message, {
        duration: options.duration || 4000,
        ...options,
      });
    },
    error: (message, options = {}) => {
      return toast.error(message, {
        duration: options.duration || 5000,
        ...options,
      });
    },
    warning: (message, options = {}) => {
      return toast.warning(message, {
        duration: options.duration || 4000,
        ...options,
      });
    },
    info: (message, options = {}) => {
      return toast.info(message, {
        duration: options.duration || 4000,
        ...options,
      });
    },
    loading: (message, options = {}) => {
      return toast.loading(message, options);
    },
    promise: (promise, messages, options = {}) => {
      return toast.promise(promise, messages, options);
    },
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={true}
        toastOptions={{
          className: "toast-sonner",
          duration: 4000,
        }}
      />
    </ToastContext.Provider>
  );
};
