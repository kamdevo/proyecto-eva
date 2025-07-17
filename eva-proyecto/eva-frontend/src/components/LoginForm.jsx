import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import useFormValidation from "../hooks/useFormValidation";
import useCentrosCosto from "../hooks/useCentrosCosto";
import AlertMessage from "./ui/AlertMessage";
import "../assets/css/Login.css";
import logo from "../assets/Img/lgoLogin-removebg-preview.png";
import ParticlesBackground from "./ParticlesBg";
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

  // Manejar cambios en formulario de login
  const handleLoginChange = (field, value) => {
    setLoginForm((prev) => {
      const newForm = { ...prev, [field]: value };

      // Validar en tiempo real si el campo ya fue tocado
      loginValidation.validateOnChange(field, value, newForm);

      return newForm;
    });

    if (loginAlert) {
      setLoginAlert(null);
    }
  };

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

  const handleRegisterBlur = (field) => {
    registerValidation.validateOnBlur(field, registerForm[field], registerForm);
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
      const result = await register(registerForm);
      if (result.success) {
        toast.success("Registro exitoso. ¡Bienvenido al sistema EVA!");
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          setModalRegisterOpen(false);
        }, 1000);
      } else {
        const errorMessage = result.error || "Error al registrar usuario";
        toast.error(errorMessage);
        setRegisterAlert({
          type: "error",
          message: errorMessage,
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

  return (
    <>
      <div style={{ position: "relative", zIndex: 1 }}>
        <ParticlesBackground />
      </div>

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

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group min-w-8">
                  <div className="*:not-first:mt-2">
                    <Label>Nombre de usuario</Label>
                    <div className="relative">
                      <Input
                        className={`peer ps-9 ${
                          loginValidation.hasError("username")
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
                        className={`pe-9 ${
                          loginValidation.hasError("password")
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

              <div className="">
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
                  className="btn-register"
                  onClick={() => setModalRegisterOpen(true)}
                  disabled={isLoading}
                >
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

              <form onSubmit={handleRegisterSubmit}>
                <fieldset>
                  <legend>Información de usuario</legend>

                  <label>Seleccione su centro de costo</label>
                  <select
                    required
                    value={registerForm.centro_id}
                    onChange={(e) =>
                      handleRegisterChange("centro_id", e.target.value)
                    }
                    onBlur={() => handleRegisterBlur("centro_id")}
                    disabled={isLoading || centrosLoading}
                    className={
                      registerValidation.hasError("centro_id")
                        ? "border-red-500"
                        : ""
                    }
                  >
                    <option value="">--Seleccione--</option>
                    {centros.map((centro) => (
                      <option key={centro.id} value={centro.id}>
                        {centro.nombre}
                      </option>
                    ))}
                  </select>
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
                          className={`peer ps-9 ${
                            registerValidation.hasError("nombre")
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
                          className={`peer ps-9 ${
                            registerValidation.hasError("apellido")
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
                          className={`peer ps-9 ${
                            registerValidation.hasError("telefono")
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
                          className={`peer ps-9 ${
                            registerValidation.hasError("email")
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
                          className={`peer ps-9 ${
                            registerValidation.hasError("username")
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
                            className={`pe-9 ${
                              registerValidation.hasError("password")
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

                        {/* Indicador de fortaleza de contraseña */}
                        {registerForm.password && (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs text-gray-600">
                              Requisitos de contraseña:
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div
                                className={`flex items-center gap-1 ${
                                  registerForm.password.length >= 8
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    registerForm.password.length >= 8
                                      ? "bg-green-600"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                                8+ caracteres
                              </div>
                              <div
                                className={`flex items-center gap-1 ${
                                  /[a-z]/.test(registerForm.password)
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    /[a-z]/.test(registerForm.password)
                                      ? "bg-green-600"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                                Minúscula
                              </div>
                              <div
                                className={`flex items-center gap-1 ${
                                  /[A-Z]/.test(registerForm.password)
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    /[A-Z]/.test(registerForm.password)
                                      ? "bg-green-600"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                                Mayúscula
                              </div>
                              <div
                                className={`flex items-center gap-1 ${
                                  /\d/.test(registerForm.password)
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    /\d/.test(registerForm.password)
                                      ? "bg-green-600"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                                Número
                              </div>
                              <div
                                className={`flex items-center gap-1 col-span-2 ${
                                  /[@$!%*?&]/.test(registerForm.password)
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    /[@$!%*?&]/.test(registerForm.password)
                                      ? "bg-green-600"
                                      : "bg-gray-300"
                                  }`}
                                ></div>
                                Carácter especial (@$!%*?&)
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="input-group">
                      <div className="*:not-first:mt-2">
                        <Label>Confirmar contraseña</Label>
                        <div className="relative">
                          <Input
                            className={`pe-9 ${
                              registerValidation.hasError(
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
