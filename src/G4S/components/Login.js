// src/components/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../G4S_styles.css";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();
    // Validación simple para el prototipo
    if (credentials.password === "123456") {
      console.log("Login exitoso con:", credentials);
      navigate("/g4s/dashboard");
    } else {
      alert("Contraseña incorrecta. (Pista: es 123456)");
    }
  };

  return (
    <div
      className="g4s-root"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#fff",
      }}
    >
      <div
        className="card"
        style={{
          width: "350px",
          textAlign: "center",
          borderTop: "5px solid #CD1920",
        }}
      >
        <img
          src="/logo-G4S.png"
          alt="G4S Logo"
          style={{ width: "200px", marginBottom: "-50px" }}
        />
        <h2>Iniciar Sesión</h2>
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          {/* CAMBIO 1: Campo Nombre de Usuario */}
          <input
            type="text"
            placeholder="Nombre de Usuario"
            required
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Contraseña"
            required
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
          />
          <button type="submit" className="btn-g4s">
            INGRESAR
          </button>
        </form>
        <p style={{ marginTop: "15px", fontSize: "0.9em" }}>
          ¿No tienes cuenta?{" "}
          <Link to="/g4s/register" style={{ color: "#CD1920" }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
