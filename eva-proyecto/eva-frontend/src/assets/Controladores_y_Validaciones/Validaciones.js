import React, { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', clave);

    try {
      const response = await fetch('http://localhost/Proyecto-Eva/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const data = await response.json();

      if (data.success) {
        alert(`Bienvenido ${data.nombre}`);
        // Guardar en localStorage si quieres sesión temporal
        localStorage.setItem('usuario', JSON.stringify(data));
        window.location.href = '/inicio'; // Redirigir a otra ruta de React
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de servidor');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="form-group">
          <input
            type="text"
            id="usuario"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            id="clave"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-login">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
