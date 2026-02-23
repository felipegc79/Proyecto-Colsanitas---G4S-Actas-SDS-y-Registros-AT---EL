// src/components/GestionHoras.js
import React, { useState, useEffect } from "react";
import { dataWorkers, saveWorkers } from "../data";

const EMPRESAS = ["SECURE", "RISK", "TECHNOLOGY", "INFOTEC"];

const LISTA_MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

const GestionHoras = () => {
  const [localData, setLocalData] = useState({ ...dataWorkers });
  const [mensaje, setMensaje] = useState("");

  const [filters, setFilters] = useState({
    empresa: "",
    anio: "2025",
    mes: "",
  });

  useEffect(() => {
    setLocalData({ ...dataWorkers });
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filtrar las empresas visibles según el filtro
  const visibleKeys = EMPRESAS.filter(key => {
    if (filters.empresa && key !== filters.empresa) return false;
    return true;
  });

  const handleChange = (empresa, field, value) => {
    setLocalData({
      ...localData,
      [empresa]: {
        ...localData[empresa],
        [field]: Number(value),
      },
    });
  };

  const handleSave = () => {
    saveWorkers(localData);
    setMensaje("✅ Datos maestro actualizados. Los indicadores se han recalculado en el Dashboard.");
    setTimeout(() => setMensaje(""), 5000);
  };

  // Totales
  const totales = visibleKeys.reduce(
    (acc, key) => ({
      trabajadores: acc.trabajadores + (localData[key]?.trabajadores || 0),
      horas: acc.horas + (localData[key]?.horas || 0),
    }),
    { trabajadores: 0, horas: 0 }
  );

  return (
    <div style={{ padding: "30px", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#333", margin: 0 }}>⚙️ Gestión de Población y Horas Hombre</h2>
        <p style={{ color: "#666", marginTop: "5px" }}>
          Administre el headcount y horas laboradas por empresa para el cálculo automático de IF e IS.
        </p>
      </div>

      {/* --- FILTROS --- */}
      <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 15px 0", color: "#CD1920", fontSize: "16px" }}>
          🔍 Filtros
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#718096", fontWeight: "600", display: "block", marginBottom: "4px" }}>Empresa</label>
            <select name="empresa" className="input-g4s" value={filters.empresa} onChange={handleFilterChange} style={{ width: "100%" }}>
              <option value="">Todas</option>
              {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#718096", fontWeight: "600", display: "block", marginBottom: "4px" }}>Año</label>
            <select name="anio" className="input-g4s" value={filters.anio} onChange={handleFilterChange} style={{ width: "100%" }}>
              <option value="">Todos</option>
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#718096", fontWeight: "600", display: "block", marginBottom: "4px" }}>Mes</label>
            <select name="mes" className="input-g4s" value={filters.mes} onChange={handleFilterChange} style={{ width: "100%" }}>
              <option value="">Todos</option>
              {LISTA_MESES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* --- MENSAJE --- */}
      {mensaje && (
        <div style={{
          padding: "15px",
          backgroundColor: "#d4edda",
          color: "#155724",
          border: "1px solid #c3e6cb",
          borderRadius: "8px",
          marginBottom: "25px",
          fontWeight: "600"
        }}>
          {mensaje}
        </div>
      )}

      {/* --- TARJETAS POR EMPRESA (Estilo Colsanitas) --- */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px",
        marginBottom: "30px"
      }}>
        {visibleKeys.map((empresa) => (
          <div key={empresa} className="card" style={{ borderTop: "5px solid #CD1920", padding: "20px" }}>
            <h3 style={{
              marginTop: 0,
              color: "#333",
              fontSize: "18px",
              borderBottom: "1px solid #f2f2f2",
              paddingBottom: "15px",
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              🏢 {empresa}
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                👥 Total Trabajadores:
              </label>
              <input
                type="number"
                value={localData[empresa]?.trabajadores || 0}
                onChange={(e) => handleChange(empresa, "trabajadores", e.target.value)}
                className="input-g4s"
                style={{ width: "100%", padding: "10px", fontSize: "1.1em", backgroundColor: "white" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#666" }}>
                ⏱️ Horas Hombre Mes:
              </label>
              <input
                type="number"
                value={localData[empresa]?.horas || 0}
                onChange={(e) => handleChange(empresa, "horas", e.target.value)}
                className="input-g4s"
                style={{ width: "100%", padding: "10px", fontSize: "1.1em", backgroundColor: "white" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* --- RESUMEN TOTALES --- */}
      <div className="card" style={{ padding: "15px", marginBottom: "25px" }}>
        <h4 style={{ marginTop: 0, color: "#333" }}>📊 Totales Consolidados</h4>
        <div style={{ display: "flex", gap: "40px", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#CD1920" }}>{totales.trabajadores.toLocaleString()}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>Total Trabajadores</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1565C0" }}>{totales.horas.toLocaleString()}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>Total Horas Hombre</div>
          </div>
        </div>
      </div>

      {/* --- BOTÓN GUARDAR --- */}
      <div style={{ textAlign: "right" }}>
        <button
          onClick={handleSave}
          style={{
            background: "#CD1920",
            color: "white",
            border: "none",
            padding: "12px 40px",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
          }}
        >
          💾 GUARDAR PARAMETRIZACIÓN
        </button>
      </div>
    </div>
  );
};

export default GestionHoras;
