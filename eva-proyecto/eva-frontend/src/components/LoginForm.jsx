import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import useFormValidation from "../hooks/useFormValidation";
import { useCentrosCosto } from "../hooks/useCentrosCosto";
import { useFormSubmit } from "../hooks/useFormSubmit";
import AlertMessage from "./ui/AlertMessage";
import SearchableSelect from "./ui/searchable-select";
import { UserRoundPlus } from "lucide-react";
import "../assets/css/Login.css";
import logo from "../assets/Img/lgoLogin-removebg-preview.png";
import {
  AtSignIcon,
  User,
  Phone,
  CircleUser,
  EyeOffIcon,
  EyeIcon,
  X,
  Loader2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, register, isLoading, clearError } = useAuth();
  const { toast } = useToast();
  const { centros, loading: centrosLoading } = useCentrosCosto();
  const loginValidation = useFormValidation("login");
  const registerValidation = useFormValidation("register");

  const [modalLoginOpen, setModalLoginOpen] = useState(false);
  const [modalRegisterOpen, setModalRegisterOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  // Estados para formularios
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "",
    centro_id: "",
  });

  const [loginAlert, setLoginAlert] = useState(null);
  const [registerAlert, setRegisterAlert] = useState(null);

  // Transform centros data for SearchableSelect
  const centrosForSelect = centros
    .filter((centro) => centro && centro.id && centro.nombre) // Filter out invalid entries
    .map((centro) => {
      // Extract codigo from nombre if it follows the pattern "CODIGO - NOMBRE"
      const parts = centro.nombre.split(" - ");
      const codigo = parts.length > 1 ? parts[0] : "";

      return {
        id: centro.id,
        nombre: centro.nombre, // Keep original format for display
        codigo: codigo, // Add codigo for search
      };
    });

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);
  const toggleConfirmVisibility = () =>
    setIsConfirmVisible((prevState) => !prevState);

  // Limpiar errores al cerrar modales
  useEffect(() => {
    if (!modalLoginOpen) {
      loginValidation.clearErrors();
      setLoginAlert(null);
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalLoginOpen]);

  useEffect(() => {
    if (!modalRegisterOpen) {
      registerValidation.clearErrors();
      setRegisterAlert(null);
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalRegisterOpen]);

  // ✅ Optimización: useCallback para evitar re-creación de función
  const handleLoginChange = useCallback((field, value) => {
    setLoginForm((prev) => {
      const newForm = { ...prev, [field]: value };

      // ✅ CORRECCIÓN: Usar validateOnChange para que el estado de errores se actualice
      loginValidation.validateOnChange(field, value, newForm);

      return newForm;
    });
  }, [loginValidation]);

  // Manejar cambios en formulario de registro
  const handleRegisterChange = (field, value) => {
    setRegisterForm((prev) => {
      const newForm = { ...prev, [field]: value };

      // Validar en tiempo real si el campo ya fue tocado
      registerValidation.validateOnChange(field, value, newForm);

      // Si es confirmación de contraseña, también revalidar el campo password_confirmation
      if (
        field === "password" &&
        registerValidation.isTouched("password_confirmation")
      ) {
        registerValidation.validateOnChange(
          "password_confirmation",
          newForm.password_confirmation,
          newForm
        );
      }

      return newForm;
    });

    if (registerAlert) {
      setRegisterAlert(null);
    }
  };

  // Manejar blur en campos
  const handleLoginBlur = (field) => {
    loginValidation.validateOnBlur(field, loginForm[field], loginForm);
  };

  const handleRegisterBlur = (field, customValue = null) => {
    // Si se proporciona un valor (ej: de SearchableSelect), usarlo; si no, usar el estado actual
    const value = customValue !== null ? customValue : registerForm[field];
    registerValidation.validateOnBlur(field, value, { ...registerForm, [field]: value });
  };

  // Manejar envío de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginAlert(null);

    const validation = loginValidation.validateForm(loginForm);
    if (!validation.isValid) {
      const errorMessage = "Por favor, corrija los errores en el formulario.";
      toast.error(errorMessage);
      setLoginAlert({
        type: "error",
        message: errorMessage,
      });
      return;
    }

    try {
      const result = await login(loginForm);
      if (result.success) {
        toast.success("Inicio de sesión exitoso. ¡Bienvenido!");
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          setModalLoginOpen(false);
        }, 1000);
      } else {
        const errorMessage = result.error || "Error al iniciar sesión";
        toast.error(errorMessage);
        setLoginAlert({
          type: "error",
          message: errorMessage,
        });
      }
    } catch (error) {
      const errorMessage = error.message || "Error de conexión";
      toast.error(errorMessage);
      setLoginAlert({
        type: "error",
        message: errorMessage,
      });
    }
  };

  // Manejar envío de registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterAlert(null);

    const validation = registerValidation.validateForm(registerForm);
    if (!validation.isValid) {
      const errorMessage = "Por favor, corrija los errores en el formulario.";
      toast.error(errorMessage);
      setRegisterAlert({
        type: "error",
        message: errorMessage,
      });
      return;
    }

    try {
      console.log("🔄 [LOGIN] Iniciando registro con datos:", registerForm);
      const result = await register(registerForm);
      console.log("✅ [LOGIN] Resultado del registro:", result);

      if (result.success) {
        // ⚠️ NUEVO FLUJO: Si requiere verificación, redirigir a página de verificación
        if (result.verification_required) {
          // Verificar si el email se envió o no
          if (result.email_sent) {
            toast.success("¡Cuenta creada! Revisa tu correo para verificar tu cuenta.");
          } else {
            toast.warning("Cuenta creada, pero el email no pudo ser enviado. Contacta al administrador.");
          }
          setModalRegisterOpen(false);
          // Redirigir a página de verificación pendiente con datos del usuario
          navigate('/verificacion-pendiente', {
            state: {
              userData: result.user,
              emailSent: result.email_sent
            }
          });
        } else {
          // FLUJO ANTIGUO: Login automático exitoso
          toast.success("Registro exitoso. ¡Bienvenido al sistema EVA!");
          // Cerrar modal después de un breve delay
          setTimeout(() => {
            setModalRegisterOpen(false);
          }, 1000);
        }
      } else {
        // Extraer el primer error específico de campo si existe (422 validation)
        const errors = result.errors || {};
        const firstErrorKey = Object.keys(errors)[0];
        let firstErrorMsg = null;

        if (firstErrorKey && errors[firstErrorKey]) {
          const errorValue = errors[firstErrorKey];
          if (typeof errorValue === 'string') {
            firstErrorMsg = errorValue;
          } else if (Array.isArray(errorValue)) {
            firstErrorMsg = errorValue[0];
          } else if (typeof errorValue === 'object' && errorValue.message) {
            firstErrorMsg = errorValue.message;
          } else if (typeof errorValue === 'object' && Array.isArray(errorValue.all_messages)) {
            firstErrorMsg = errorValue.all_messages[0];
          }
        }

        const errorMessage = firstErrorMsg || result.message || result.error || "Error al registrar usuario";
        console.error("❌ [LOGIN] Error en registro:", result);
        toast.error(typeof errorMessage === 'string' ? errorMessage : "Error de validación en el formulario");
        setRegisterAlert({
          type: "error",
          message: typeof errorMessage === 'string' ? errorMessage : "Error de validación en el formulario",
        });
      }
    } catch (error) {
      const errorMessage = error.message || "Error de conexión";
      toast.error(errorMessage);
      setRegisterAlert({
        type: "error",
        message: errorMessage,
      });
    }
  };

  // Hooks para accesibilidad de formularios (Enter para submit)
  const loginFormProps = useFormSubmit(handleLoginSubmit);
  const registerFormProps = useFormSubmit(handleRegisterSubmit);

  return (
    <>
      <div
        style={{ zIndex: 10, position: "relative", background: "transparent" }}
        className="background-pattern"
      >
        <div className="login-container">
          <div className="login-content">
            <div className="header-logo">
              <img className="Logo" src={logo} alt="Logo EVA" />
            </div>
            <button
              className="abir-modal-inicial"
              onClick={() => setModalLoginOpen(true)}
            >
              Presione para Iniciar
            </button>
          </div>
        </div>

        {/* Modal de Login */}
        {modalLoginOpen && (
          <dialog className="modal" open>
            <div className="modal-box login">
              <Button
                type="submit"
                className="modal-close-btn"
                onClick={() => setModalLoginOpen(false)}
                variant="ghost"
                size="sm"
              >
                <X size={18} />
              </Button>
              <h3>Iniciar Sesión</h3>

              {loginAlert && (
                <AlertMessage
                  type={loginAlert.type}
                  message={loginAlert.message}
                  onClose={() => setLoginAlert(null)}
                />
              )}

              <form {...loginFormProps.formProps}>
                <div className="form-group min-w-8">
                  <div className="*:not-first:mt-2">
                    <Label>Nombre de usuario</Label>
                    <div className="relative">
                      <Input
                        className={`peer ps-9 ${loginValidation.hasError("username")
                          ? "border-red-500"
                          : ""
                          }`}
                        placeholder="Usuario"
                        type="text"
                        value={loginForm.username}
                        onChange={(e) =>
                          handleLoginChange("username", e.target.value)
                        }
                        onBlur={() => handleLoginBlur("username")}
                        disabled={isLoading}
                      />
                      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                        <CircleUser size={16} aria-hidden="true" />
                      </div>
                    </div>
                    {loginValidation.hasError("username") && (
                      <p className="text-red-500 text-xs mt-1">
                        {loginValidation.getError("username")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <div className="*:not-first:mt-2">
                    <Label>Contraseña</Label>
                    <div className="relative">
                      <Input
                        className={`pe-9 ${loginValidation.hasError("password")
                          ? "border-red-500"
                          : ""
                          }`}
                        placeholder="Contraseña"
                        type={isVisible ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) =>
                          handleLoginChange("password", e.target.value)
                        }
                        onBlur={() => handleLoginBlur("password")}
                        disabled={isLoading}
                      />
                      <button
                        className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        onClick={toggleVisibility}
                        aria-label={
                          isVisible ? "Hide password" : "Show password"
                        }
                        aria-pressed={isVisible}
                        aria-controls="password"
                      >
                        {isVisible ? (
                          <EyeOffIcon size={16} aria-hidden="true" />
                        ) : (
                          <EyeIcon size={16} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {loginValidation.hasError("password") && (
                      <p className="text-red-500 text-xs mt-1">
                        {loginValidation.getError("password")}
                      </p>
                    )}
                  </div>
                </div>
              </form>

              <div className="flex flex-col gap-2 ">
                <button
                  type="submit"
                  className="btn-login"
                  onClick={handleLoginSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-sign-in-alt"></i> Iniciar Sesión
                    </>
                  )}
                </button>
                <button
                  className="btn-register flex items-center gap-2"
                  onClick={() => setModalRegisterOpen(true)}
                  disabled={isLoading}
                >
                  <UserRoundPlus size={17} strokeWidth={3} />
                  Crear una cuenta
                </button>
              </div>
            </div>
          </dialog>
        )}

        {/* Modal de Registro */}
        {modalRegisterOpen && (
          <dialog className="modal" open>
            <div className="modal-box register">
              <Button
                className="modal-close-btn"
                onClick={() => setModalRegisterOpen(false)}
                variant="ghost"
                size="sm"
              >
                <X size={18} />
              </Button>
              <h3>Registrarse</h3>

              {registerAlert && (
                <AlertMessage
                  type={registerAlert.type}
                  message={registerAlert.message}
                  onClose={() => setRegisterAlert(null)}
                />
              )}

              <form {...registerFormProps.formProps}>
                <fieldset>
                  <legend>Información de usuario</legend>

                  <Label>Seleccione su centro de costo</Label>
                  <SearchableSelect
                    placeholder="Buscar o seleccionar centro de costo..."
                    options={centrosForSelect}
                    value={registerForm.centro_id}
                    onValueChange={(value) => {
                      handleRegisterChange("centro_id", value);
                      // ✅ MEJORA: Pasar el valor directamente para evitar race conditions con el estado
                      handleRegisterBlur("centro_id", value);
                    }}
                    disabled={isLoading || centrosLoading}
                    loading={centrosLoading}
                    className="w-full"
                  />
                  {registerValidation.hasError("centro_id") && (
                    <p className="text-red-500 text-xs mt-1">
                      {registerValidation.getError("centro_id")}
                    </p>
                  )}

                  <div className="input-grid">
                    <div className="*:not-first:mt-2">
                      <Label>Nombre</Label>
                      <div className="relative">
                        <Input
                          className={`peer ps-9 ${registerValidation.hasError("nombre")
                            ? "border-red-500"
                            : ""
                            }`}
                          placeholder="Nombre"
                          type="text"
                          value={registerForm.nombre}
                          onChange={(e) =>
                            handleRegisterChange("nombre", e.target.value)
                          }
                          onBlur={() => handleRegisterBlur("nombre")}
                          disabled={isLoading}
                        />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                          <User size={16} aria-hidden="true" />
                        </div>
                      </div>
                      {registerValidation.hasError("nombre") && (
                        <p className="text-red-500 text-xs mt-1">
                          {registerValidation.getError("nombre")}
                        </p>
                      )}
                    </div>

                    <div className="*:not-first:mt-2">
                      <Label>Apellidos</Label>
                      <div className="relative">
                        <Input
                          className={`peer ps-9 ${registerValidation.hasError("apellido")
                            ? "border-red-500"
                            : ""
                            }`}
                          placeholder="Apellidos"
                          type="text"
                          value={registerForm.apellido}
                          onChange={(e) =>
                            handleRegisterChange("apellido", e.target.value)
                          }
                          onBlur={() => handleRegisterBlur("apellido")}
                          disabled={isLoading}
                        />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                          <User size={16} aria-hidden="true" />
                        </div>
                      </div>
                      {registerValidation.hasError("apellido") && (
                        <p className="text-red-500 text-xs mt-1">
                          {registerValidation.getError("apellido")}
                        </p>
                      )}
                    </div>

                    <div className="*:not-first:mt-2">
                      <Label>Teléfono</Label>
                      <div className="relative">
                        <Input
                          className={`peer ps-9 ${registerValidation.hasError("telefono")
                            ? "border-red-500"
                            : ""
                            }`}
                          placeholder="Teléfono"
                          type="text"
                          value={registerForm.telefono}
                          onChange={(e) =>
                            handleRegisterChange("telefono", e.target.value)
                          }
                          onBlur={() => handleRegisterBlur("telefono")}
                          disabled={isLoading}
                        />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                          <Phone size={16} aria-hidden="true" />
                        </div>
                      </div>
                      {registerValidation.hasError("telefono") && (
                        <p className="text-red-500 text-xs mt-1">
                          {registerValidation.getError("telefono")}
                        </p>
                      )}
                    </div>

                    <div className="*:not-first:mt-2">
                      <Label>Correo electrónico</Label>
                      <div className="relative">
                        <Input
                          className={`peer ps-9 ${registerValidation.hasError("email")
                            ? "border-red-500"
                            : ""
                            }`}
                          placeholder="Correo"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) =>
                            handleRegisterChange("email", e.target.value)
                          }
                          onBlur={() => handleRegisterBlur("email")}
                          disabled={isLoading}
                        />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                          <AtSignIcon size={16} aria-hidden="true" />
                        </div>
                      </div>
                      {registerValidation.hasError("email") && (
                        <p className="text-red-500 text-xs mt-1">
                          {registerValidation.getError("email")}
                        </p>
                      )}
                    </div>

                    <div className="*:not-first:mt-2">
                      <Label>Nombre de usuario</Label>
                      <div className="relative">
                        <Input
                          className={`peer ps-9 ${registerValidation.hasError("username")
                            ? "border-red-500"
                            : ""
                            }`}
                          placeholder="Usuario"
                          type="text"
                          value={registerForm.username}
                          onChange={(e) =>
                            handleRegisterChange("username", e.target.value)
                          }
                          onBlur={() => handleRegisterBlur("username")}
                          disabled={isLoading}
                        />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                          <CircleUser size={16} aria-hidden="true" />
                        </div>
                      </div>
                      {registerValidation.hasError("username") && (
                        <p className="text-red-500 text-xs mt-1">
                          {registerValidation.getError("username")}
                        </p>
                      )}
                    </div>

                    <div className="input-group">
                      <div className="*:not-first:mt-2">
                        <Label>Contraseña</Label>
                        <div className="relative">
                          <Input
                            className={`pe-9 ${registerValidation.hasError("password")
                              ? "border-red-500"
                              : ""
                              }`}
                            placeholder="Contraseña"
                            type={isVisible ? "text" : "password"}
                            value={registerForm.password}
                            onChange={(e) =>
                              handleRegisterChange("password", e.target.value)
                            }
                            onBlur={() => handleRegisterBlur("password")}
                            disabled={isLoading}
                          />
                          <button
                            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                            type="button"
                            onClick={toggleVisibility}
                            aria-label={
                              isVisible ? "Hide password" : "Show password"
                            }
                            aria-pressed={isVisible}
                            aria-controls="password"
                          >
                            {isVisible ? (
                              <EyeOffIcon size={16} aria-hidden="true" />
                            ) : (
                              <EyeIcon size={16} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        {registerValidation.hasError("password") && (
                          <p className="text-red-500 text-xs mt-1">
                            {registerValidation.getError("password")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="*:not-first:mt-2">
                        <Label>Confirmar contraseña</Label>
                        <div className="relative">
                          <Input
                            className={`pe-9 ${registerValidation.hasError(
                              "password_confirmation"
                            )
                              ? "border-red-500"
                              : ""
                              }`}
                            placeholder="Confirma la contraseña"
                            type={isConfirmVisible ? "text" : "password"}
                            value={registerForm.password_confirmation}
                            onChange={(e) =>
                              handleRegisterChange(
                                "password_confirmation",
                                e.target.value
                              )
                            }
                            onBlur={() =>
                              handleRegisterBlur("password_confirmation")
                            }
                            disabled={isLoading}
                          />
                          <button
                            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                            type="button"
                            onClick={toggleConfirmVisibility}
                            aria-label={
                              isConfirmVisible
                                ? "Hide password"
                                : "Show password"
                            }
                            aria-pressed={isConfirmVisible}
                            aria-controls="password"
                          >
                            {isConfirmVisible ? (
                              <EyeOffIcon size={16} aria-hidden="true" />
                            ) : (
                              <EyeIcon size={16} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                        {registerValidation.hasError(
                          "password_confirmation"
                        ) && (
                            <p className="text-red-500 text-xs mt-1">
                              {registerValidation.getError(
                                "password_confirmation"
                              )}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-login-modal"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Registrarse"
                    )}
                  </button>
                </fieldset>
              </form>
            </div>
          </dialog>
        )}
      </div>
    </>
  );
};

export default LoginForm;
