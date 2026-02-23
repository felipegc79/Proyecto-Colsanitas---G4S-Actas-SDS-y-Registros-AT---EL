// src/components/Register.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: "",
    identificacion: "",
    telefono: "",
    email: "",
    rol: "Asesor AT",
  });

  const [generatedUsername, setGeneratedUsername] = useState("");

  useEffect(() => {
    if (formData.nombres) {
      const user = formData.nombres.trim().toLowerCase().replace(/\s+/g, ".");
      setGeneratedUsername(user);
    } else {
      setGeneratedUsername("");
    }
  }, [formData.nombres]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      username: generatedUsername,
      password: "123456",
    };

    localStorage.setItem("userName", finalData.nombres);
    localStorage.setItem("userRole", finalData.rol);

    alert(
      `¡SOLICITUD DE REGISTRO ENVIADA!\n\nSe ha enviado un correo al administrador para otorgar los permisos de acceso.\n\nUSUARIO TEMPORAL: ${finalData.username}\nCONTRASEÑA: ${finalData.password}\n\nPodrá ingresar una vez aprobada la solicitud.`
    );

    navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "var(--colsanitas-light-grey)",
        padding: "20px",
      }}
    >
      <div
        className="card"
        style={{
          width: "450px",
          borderTop: "6px solid var(--colsanitas-green)",
          borderRadius: "12px",
          padding: "40px",
          backgroundColor: "white",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img
            src="/logo-colsanitas-seguros.png"
            alt="Colsanitas Logo"
            style={{ width: "220px", marginBottom: "20px" }}
          />
          <h2 style={{ color: "var(--colsanitas-blue)", fontSize: "20px", fontWeight: "800" }}>Crear Nueva Cuenta</h2>
          <p style={{ color: "var(--colsanitas-grey)", fontSize: "14px" }}>Ingrese los datos para el registro en el sistema</p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--colsanitas-blue)", marginBottom: "5px", display: "block" }}>NOMBRES Y APELLIDOS</label>
            <input
              name="nombres"
              onChange={handleChange}
              placeholder="Ej. Juan Perez"
              required
              className="input-colsanitas"
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--colsanitas-blue)", marginBottom: "5px", display: "block" }}>IDENTIFICACIÓN</label>
            <input
              name="identificacion"
              type="number"
              onChange={handleChange}
              required
              className="input-colsanitas"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--colsanitas-blue)", marginBottom: "5px", display: "block" }}>TELÉFONO</label>
              <input
                name="telefono"
                type="tel"
                onChange={handleChange}
                required
                className="input-colsanitas"
              />
            </div>
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--colsanitas-blue)", marginBottom: "5px", display: "block" }}>ROL ASIGNADO</label>
              <select name="rol" onChange={handleChange} className="input-colsanitas">
                <option value="Gerente Colsanitas">Gerente Colsanitas</option>
                <option value="Coordinador Colsanitas">Coordinador Colsanitas</option>
                <option value="Asesor Colsanitas">Asesor Colsanitas</option>
                <option value="Asesor Empresa Cliente">Asesor Empresa Cliente</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--colsanitas-blue)", marginBottom: "5px", display: "block" }}>CORREO ELECTRÓNICO</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              required
              className="input-colsanitas"
            />
          </div>

          {formData.rol === "Asesor Empresa Cliente" && (
            <div>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--colsanitas-blue)", marginBottom: "5px", display: "block" }}>EMPRESA ASIGNADA</label>
              <input
                name="empresa"
                onChange={handleChange}
                placeholder="Nombre de la empresa"
                className="input-colsanitas"
              />
            </div>
          )}

          <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px dashed #cbd5e0", marginTop: "5px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
              Su usuario sugerido será: <strong style={{ color: "var(--colsanitas-green)" }}>{generatedUsername || "..."}</strong>
            </p>
          </div>

          <button
            type="submit"
            className="btn-colsanitas"
            style={{ marginTop: "10px", padding: "16px", fontWeight: "700" }}
          >
            COMPLETAR REGISTRO
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "25px", fontSize: "14px", color: "var(--colsanitas-grey)" }}>
          ¿Ya tiene una cuenta?{" "}
          <span
            onClick={() => navigate("/")}
            style={{ color: "var(--colsanitas-green)", fontWeight: "700", cursor: "pointer", textDecoration: "underline" }}
          >
            Volver al Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
