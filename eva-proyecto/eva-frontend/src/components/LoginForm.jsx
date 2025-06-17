import React, { useState } from 'react';
import '../assets/css/Login.css';
import logo from '../assets/Img/lgoLogin-removebg-preview.png';

const LoginForm = () => {
    const [modalLoginOpen, setModalLoginOpen] = useState(false);
    const [modalRegisterOpen, setModalRegisterOpen] = useState(false);

    return (
        <div className="background-pattern">
            <div className="container">
                <div className="header-logo">
                    <img className="Logo" src={logo} alt="Logo EVA" />
                </div>
                <button className="abir-modal-inicial" onClick={() => setModalLoginOpen(true)}>
                    Presione para Iniciar
                </button>
                {/* Modal de Login */}
                {modalLoginOpen && (
                    <dialog className="modal" open>
                        <div className="modal-box login">
                            <h3>Iniciar Sesión</h3>
                            <form action="/api/login.php" method="POST">
                                <div className="form-group">
                                    <i className="fa fa-user"></i>
                                    <h4>USUARIO</h4>
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Nombre de usuario"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <i className="fa fa-lock"></i>
                                    <h4>Contraseña</h4>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Contraseña"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-login">
                                    <i className="fa fa-sign-in-alt"></i> Log in
                                </button>
                            </form>

                            <button
                                className="btn-register"
                                onClick={() => setModalRegisterOpen(true)}
                            >
                                Crear una cuenta
                            </button>

                            <button className="close-modal" onClick={() => setModalLoginOpen(false)}>
                                Cerrar
                            </button>
                        </div>
                    </dialog>
                )}

                {/* Modal de Registro */}
                {modalRegisterOpen && (
                    <dialog className="modal" open>
                        <div className="modal-box register">
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

                                    <input type="text" placeholder="Nombres" required />
                                    <input type="text" placeholder="Apellidos" required />
                                    <input type="text" placeholder="Teléfono" required />
                                    <input type="email" placeholder="Correo electrónico" required />
                                    <input type="text" placeholder="Nombre de usuario" required />
                                    <input type="password" placeholder="Contraseña" required />
                                    <input type="password" placeholder="Confirmar contraseña" required />

                                    <button className="btn-login-modal" type="submit">
                                        Ingresar
                                    </button>
                                </fieldset>
                            </form>

                            <button
                                className="close-modal"
                                onClick={() => setModalRegisterOpen(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </dialog>
                )}

            </div>
        </div>
    );
};

export default LoginForm;
