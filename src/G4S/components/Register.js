// src/components/Register.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../G4S_styles.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: "",
    identificacion: "",
    telefono: "",
    email: "",
    rol: "Asesor de G4S", // Valor por defecto
  });

  const [generatedUsername, setGeneratedUsername] = useState("");

  useEffect(() => {
    if (formData.nombres) {
      // Genera usuario: juan.perez
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
      password: "123456", // Contraseña por defecto para demo
    };

    // Guardamos en LocalStorage para simular persistencia
    localStorage.setItem("userName", finalData.nombres);
    localStorage.setItem("userRole", finalData.rol);

    alert(
      `Registro Exitoso.\n\nSus credenciales asignadas son:\nUsuario: ${finalData.username}\nContraseña: ${finalData.password}\n\nAhora será redirigido al Login.`
    );

    console.log("Datos registrados:", finalData);
    navigate("/g4s");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="g4s-root"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        className="card"
        style={{ width: "400px", borderTop: "5px solid #CD1920" }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src="/logo-G4S.png"
            alt="G4S Logo"
            style={{ width: "200px", marginBottom: "-50px" }}
          />
          <h2>Registro de Usuario</h2>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <label>Nombres y Apellidos</label>
          <input
            name="nombres"
            onChange={handleChange}
            placeholder="Ej. Juan Perez"
            required
            style={{ padding: "8px" }}
          />

          <label>Número de Identificación</label>
          <input
            name="identificacion"
            type="number"
            onChange={handleChange}
            required
            style={{ padding: "8px" }}
          />

          <label>Teléfono de Contacto</label>
          <input
            name="telefono"
            type="tel"
            onChange={handleChange}
            required
            style={{ padding: "8px" }}
          />

          <label>Correo Electrónico</label>
          <input
            name="email"
            type="email"
            onChange={handleChange}
            required
            style={{ padding: "8px" }}
          />

          {/* AJUSTE: LISTA DE ROLES ACTUALIZADA */}
          <label>Rol</label>
          <select name="rol" onChange={handleChange} style={{ padding: "8px" }}>
            <option value="Gerente H&S">Gerente H&S</option>
            <option value="Líder H&S">Líder H&S</option>
            <option value="Asesor Accidentalidad G4S">
              Asesor Accidentalidad G4S
            </option>
            <option value="Asesor EL">Asesor EL</option>
            <option value="Asesor de G4S">Asesor de G4S</option>
          </select>

          <button
            type="submit"
            className="btn-g4s"
            style={{ marginTop: "10px" }}
          >
            REGISTRARSE
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          <Link to="/g4s" style={{ color: "#CD1920" }}>
            Volver al Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
