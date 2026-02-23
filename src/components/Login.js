// src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, User } from "lucide-react";
import "../styles.css";

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.password === "123456") {
      localStorage.setItem("userName", credentials.username || "Usuario Demo");

      // Check if there is a stored user matching the input
      const storedUser = localStorage.getItem("userName");
      // Simplified simulation: if user types the name they just registered, use that role.
      // Otherwise default to Gerente.
      // Ideally we would store a user object map in localStorage, but for this prototype:
      const storedRole = localStorage.getItem("userRole");

      if (credentials.username && credentials.username === localStorage.getItem("generatedUsername")) {
        // If we stored the username in register (we didn't, let's fix Register to store it better or just assume single user simulation)
      }

      // BETTER APPROACH for Prototype:
      // If localStorage has a role, use it. If not, default.
      if (!localStorage.getItem("userRole")) {
        localStorage.setItem("userRole", "Gerente Colsanitas");
      }
      navigate("/dashboard");
    } else {
      alert("Contraseña incorrecta. (Use 123456 para este prototipo)");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "var(--colsanitas-light-grey)",
      }}
    >
      <div
        className="card"
        style={{
          width: "400px",
          padding: "40px",
          textAlign: "center",
          borderTop: "6px solid var(--colsanitas-green)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          borderRadius: "12px",
          backgroundColor: "white",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <img
            src="/logo-colsanitas.png"
            alt="Colsanitas Logo"
            style={{ width: "220px", marginBottom: "20px" }}
          />
          <h1 style={{ color: "var(--colsanitas-blue)", margin: 0, fontSize: "22px", fontWeight: "800" }}>
            Portal de Reportes
          </h1>
          <p style={{ color: "var(--colsanitas-grey)", fontSize: "14px", marginTop: "5px" }}>
            Gestión Integral de Accidentabilidad
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", display: "block", color: "var(--colsanitas-blue)" }}>USUARIO</label>
            <div style={{ position: "relative" }}>
              <User size={18} style={{ position: "absolute", left: "14px", top: "12px", color: "var(--colsanitas-green)" }} />
              <input
                type="text"
                placeholder="Ingrese su correo o usuario"
                required
                className="input-colsanitas"
                style={{ paddingLeft: "45px" }}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
              />
            </div>
          </div>

          <div style={{ textAlign: "left" }}>
            <label style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", display: "block", color: "var(--colsanitas-blue)" }}>CONTRASEÑA</label>
            <div style={{ position: "relative" }}>
              <ShieldCheck size={18} style={{ position: "absolute", left: "14px", top: "12px", color: "var(--colsanitas-green)" }} />
              <input
                type="password"
                placeholder="Ingrese su contraseña"
                required
                className="input-colsanitas"
                style={{ paddingLeft: "45px" }}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
          </div>

          <button type="submit" className="btn-colsanitas" style={{ width: "100%", padding: "16px", fontSize: "14px", fontWeight: "700", marginTop: "10px" }}>
            INGRESAR AL SISTEMA
          </button>
        </form>

        <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #edf2f7" }}>
          <p style={{ fontSize: "14px", color: "var(--colsanitas-grey)" }}>
            ¿No tiene cuenta?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{ color: "var(--colsanitas-green)", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
            >
              Regístrese aquí
            </span>
          </p>
        </div>

        <p style={{ marginTop: "20px", fontSize: "11px", color: "#A0AEC0", textTransform: "uppercase", letterSpacing: "1px" }}>
          © 2026 Keralty | Seguros Colsanitas
        </p>
      </div>
    </div>
  );
};

export default Login;
