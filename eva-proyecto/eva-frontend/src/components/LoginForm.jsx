import React, { useState } from "react";
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
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
const LoginForm = () => {
  const [modalLoginOpen, setModalLoginOpen] = useState(false);
  const [modalRegisterOpen, setModalRegisterOpen] = useState(false);

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <>
      <div style={{ position: "relative", zIndex: 1 }}>
        <ParticlesBackground />
      </div>

      <div
        style={{ zIndex: 10, position: "relative", background: "transparent" }}
        className="background-pattern"
      >
        <div className=" container">
          <div className="header-logo">
            <img className="Logo" src={logo} alt="Logo EVA" />
          </div>
          <button
            className="abir-modal-inicial"
            onClick={() => setModalLoginOpen(true)}
          >
            Presione para Iniciar
          </button>
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
                <form action="/api/login.php" method="POST">
                  <div className="form-group min-w-8">
                    <div className="*:not-first:mt-2">
                      <Label>Nombre de usuario</Label>
                      <div className="relative">
                        <Input
                          className="peer ps-9"
                          placeholder="Usuario"
                          type="text"
                        />
                        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                          <CircleUser size={16} aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-group ">
                    <div className="*:not-first:mt-2">
                      <Label>Contraseña</Label>
                      <div className="relative">
                        <Input
                          className="pe-9"
                          placeholder="Contraseña"
                          type={isVisible ? "text" : "password"}
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
                    </div>
                  </div>
                </form>
                <div className="">
                  <button type="submit" className="btn-login">
                    <i className="fa fa-sign-in-alt"></i> Iniciar Sesión
                  </button>
                  <button
                    className="btn-register"
                    onClick={() => setModalRegisterOpen(true)}
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
                <form action="/api/register.php" method="POST">
                  <fieldset>
                    <legend>Información de usuario</legend>

                    <label>Seleccione su centro de costo</label>
                    <select required>
                      <option value="">--Seleccione--</option>
                      <option value="1">Centro 1</option>
                      <option value="2">Centro 2</option>
                    </select>

                    <div className="input-grid">
                      <div className="*:not-first:mt-2">
                        <Label>Nombre</Label>
                        <div className="relative">
                          <Input
                            className="peer ps-9"
                            placeholder="Nombre"
                            type="text"
                          />
                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <User size={16} aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                      <div className="*:not-first:mt-2">
                        <Label>Apellidos</Label>
                        <div className="relative">
                          <Input
                            className="peer ps-9"
                            placeholder="Apellidos"
                            type="text"
                          />
                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <User size={16} aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                      <div className="*:not-first:mt-2">
                        <Label>Telefono</Label>
                        <div className="relative">
                          <Input
                            className="peer ps-9"
                            placeholder="Telefono"
                            type="text"
                          />
                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <Phone size={16} aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                      <div className="*:not-first:mt-2">
                        <Label>Correo electrónico</Label>
                        <div className="relative">
                          <Input
                            className="peer ps-9"
                            placeholder="Correo"
                            type="text"
                          />
                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <AtSignIcon size={16} aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                      <div className="*:not-first:mt-2">
                        <Label>Nombre de usuario</Label>
                        <div className="relative">
                          <Input
                            className="peer ps-9"
                            placeholder="Usuario"
                            type="text"
                          />
                          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                            <CircleUser size={16} aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                      <div className="input-group">
                        <div className="*:not-first:mt-2">
                          <Label>Contraseña</Label>
                          <div className="relative">
                            <Input
                              className="pe-9"
                              placeholder="Contraseña"
                              type={isVisible ? "text" : "password"}
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
                        </div>
                      </div>
                      <div className="input-group">
                        <div className="*:not-first:mt-2">
                          <Label>Confirmar contraseña</Label>
                          <div className="relative">
                            <Input
                              className="pe-9"
                              placeholder="Confirma la contraseña"
                              type={isVisible ? "text" : "password"}
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
                        </div>
                      </div>
                    </div>

                    <button className="btn-login-modal" type="submit">
                      Ingresar
                    </button>
                  </fieldset>
                </form>
              </div>
            </dialog>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginForm;
