// src/G4S/components/MainLayout.js
import React, { useState } from "react";
import Dashboard from "./Dashboard";
import ReporteAccidente from "./ReporteAccidente";
import GestionRechazados from "./GestionRechazados";
import RegistrosEL from "./RegistrosEL";
import CargaMasiva from "./CargaMasiva";
import GestionHoras from "./GestionHoras";
import "../G4S_styles.css"; // Estilos aislados

const MainLayout = () => {
  // Opciones: dashboard, at, rechazados, el, carga_furat, carga_furel, gestion_horas
  const [activeModule, setActiveModule] = useState("dashboard");

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard": return <Dashboard />;
      case "gestion_horas": return <GestionHoras />;
      case "at": return <ReporteAccidente />;
      case "rechazados": return <GestionRechazados />;
      case "el": return <RegistrosEL />;
      case "carga_furat": return <CargaMasiva type="FURAT" />;
      case "carga_furel": return <CargaMasiva type="FUREL" />;
      default: return <Dashboard />;
    }
  };

  const navItemStyle = (moduleName) => ({
    padding: "15px 20px",
    cursor: "pointer",
    backgroundColor: activeModule === moduleName ? "#CD1920" : "transparent",
    borderBottom: "1px solid #444",
    transition: "0.3s",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  });

  return (
    <div className="g4s-root" style={{ display: "flex", width: "100vw" }}>
      {/* --- SIDEBAR --- */}
      <div style={{
        width: "260px",
        backgroundColor: "#333",
        color: "white",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        flexShrink: 0 // Evitar que se encoja
      }}>
        <div style={{ padding: "20px", textAlign: "center", borderBottom: "1px solid #555" }}>
          <img
            src="/logo-G4S.png"
            alt="G4S Logo"
            style={{ width: "80%", maxWidth: "150px", background: "white", padding: "10px", borderRadius: "5px" }}
          />
        </div>

        <nav style={{ flex: 1, overflowY: "auto" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li onClick={() => setActiveModule("dashboard")} style={navItemStyle("dashboard")}>
              📊 Tableros de Control
            </li>
            <li onClick={() => setActiveModule("gestion_horas")} style={navItemStyle("gestion_horas")}>
              ⚙️ Gestión Horas/Trab.
            </li>
            <li onClick={() => setActiveModule("at")} style={navItemStyle("at")}>
              📝 Registros de AT
            </li>
            <li onClick={() => setActiveModule("rechazados")} style={navItemStyle("rechazados")}>
              🚫 Gestión de Rechazos AT
            </li>
            <li onClick={() => setActiveModule("el")} style={navItemStyle("el")}>
              🩺 Registros de EL
            </li>

            <li style={{ padding: "10px 20px", fontSize: "0.8em", color: "#95a5a6", textTransform: "uppercase", marginTop: "10px" }}>
              Cargas Masivas
            </li>
            <li onClick={() => setActiveModule("carga_furat")} style={navItemStyle("carga_furat")}>
              📥 Cargar Archivo AT
            </li>
            <li onClick={() => setActiveModule("carga_furel")} style={navItemStyle("carga_furel")}>
              📥 Cargar Archivo EL
            </li>
          </ul>
        </nav>

        <div style={{ padding: "15px", fontSize: "0.7em", color: "#aaa", textAlign: "center", borderTop: "1px solid #444" }}>
          Versión Integrada 2.3
        </div>
      </div>

      {/* --- CONTENIDO --- */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {renderModule()}
      </div>
    </div>
  );
};

export default MainLayout;
