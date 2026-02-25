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

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumber = (str) => {
    if (!str) return 0;
    const cleanStr = str.replace(/\./g, "");
    const parsed = Number(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
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

      {/* --- FILTROS LLAMATIVOS --- */}
      <div style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fbfbfb 100%)",
        padding: "25px",
        marginBottom: "30px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        borderLeft: "6px solid red",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Adorno visual */}
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "150px", height: "150px", background: "radial-gradient(circle, rgba(205,25,32,0.1) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>
        <div style={{ position: "absolute", bottom: "-20px", left: "40%", width: "100px", height: "100px", background: "radial-gradient(circle, rgba(21,101,192,0.05) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%", pointerEvents: "none" }}></div>

        <h4 style={{
          margin: "0 0 20px 0",
          color: "red",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <span style={{ background: "red", color: "white", padding: "6px 10px", borderRadius: "8px", fontSize: "16px" }}>🔍</span>
          Panel de Filtros Globales
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "13px", color: "#475569", fontWeight: "700", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>🏢 Empresa</label>
            <select name="empresa" value={filters.empresa} onChange={handleFilterChange} style={{
              width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#fff", color: "#1e293b", fontSize: "14px", outline: "none", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)", cursor: "pointer", transition: "all 0.3s ease"
            }}
              onFocus={(e) => e.target.style.borderColor = "red"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}>
              <option value="">🌟 Todas las Empresas</option>
              {EMPRESAS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "13px", color: "#475569", fontWeight: "700", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📅 Año</label>
            <select name="anio" value={filters.anio} onChange={handleFilterChange} style={{
              width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#fff", color: "#1e293b", fontSize: "14px", outline: "none", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)", cursor: "pointer", transition: "all 0.3s ease"
            }}
              onFocus={(e) => e.target.style.borderColor = "red"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}>
              <option value="">∞ Histórico Completo</option>
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "13px", color: "#475569", fontWeight: "700", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>📆 Mes</label>
            <select name="mes" value={filters.mes} onChange={handleFilterChange} style={{
              width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#fff", color: "#1e293b", fontSize: "14px", outline: "none", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)", cursor: "pointer", transition: "all 0.3s ease"
            }}
              onFocus={(e) => e.target.style.borderColor = "red"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}>
              <option value="">🗓️ Todos los Meses</option>
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
          <div key={empresa} className="card" style={{ borderTop: "5px solid red", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <h3 style={{
              marginTop: 0,
              color: "#1e293b",
              fontSize: "18px",
              borderBottom: "2px solid #f1f5f9",
              paddingBottom: "15px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "700"
            }}>
              <span style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", color: "#475569" }}>🏢</span> {empresa}
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontWeight: "700", fontSize: "13px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                👥 Total Trabajadores
              </label>
              <input
                type="text"
                value={formatNumber(localData[empresa]?.trabajadores || 0)}
                onChange={(e) => handleChange(empresa, "trabajadores", parseNumber(e.target.value))}
                style={{
                  width: "100%", padding: "12px 15px", fontSize: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "600", color: "#0f172a", outline: "none", transition: "border-color 0.3s, box-shadow 0.3s"
                }}
                onFocus={(e) => { e.target.style.borderColor = "red"; e.target.style.boxShadow = "0 0 0 3px rgba(205,25,32,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", fontWeight: "700", fontSize: "13px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ⏱️ Horas Hombre Mes
              </label>
              <input
                type="text"
                value={formatNumber(localData[empresa]?.horas || 0)}
                onChange={(e) => handleChange(empresa, "horas", parseNumber(e.target.value))}
                style={{
                  width: "100%", padding: "12px 15px", fontSize: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "600", color: "#0f172a", outline: "none", transition: "border-color 0.3s, box-shadow 0.3s"
                }}
                onFocus={(e) => { e.target.style.borderColor = "red"; e.target.style.boxShadow = "0 0 0 3px rgba(205,25,32,0.1)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
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
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "red" }}>{totales.trabajadores.toLocaleString()}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>Total Trabajadores</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1565C0" }}>{totales.horas.toLocaleString()}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>Total Horas Hombre</div>
          </div>
        </div>
      </div>

      {/* --- BOTÓN GUARDAR --- */}
      <div style={{ textAlign: "right", marginTop: "10px" }}>
        <button
          onClick={handleSave}
          style={{
            background: "#CD1920",
            color: "white",
            border: "none",
            padding: "16px 50px",
            borderRadius: "50px",
            fontWeight: "800",
            cursor: "pointer",
            fontSize: "15px",
            boxShadow: "0 10px 20px rgba(205,25,32,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}
          onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 15px 25px rgba(205,25,32,0.4)"; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 20px rgba(205,25,32,0.3)"; }}
        >
          💾 GUARDAR PARAMETRIZACIÓN
        </button>
      </div>
    </div>
  );
};

export default GestionHoras;
