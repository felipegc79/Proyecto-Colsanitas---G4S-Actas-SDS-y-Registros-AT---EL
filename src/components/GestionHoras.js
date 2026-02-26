// src/components/GestionHoras.js
import React, { useState, useEffect } from "react";
import { Save, AlertCircle, Users, Clock, Filter } from "lucide-react";
import "../styles.css";

const GestionHoras = ({ dataWorkers, setDataWorkers }) => {
  const [localData, setLocalData] = useState(dataWorkers);
  const [mensaje, setMensaje] = useState("");
  const [filters, setFilters] = useState({
    grupoEmpresarial: "",
    empresa: "",
    anio: "2025",
    mes: ""
  });

  useEffect(() => {
    if (dataWorkers) {
      setLocalData(dataWorkers);
    }
  }, [dataWorkers]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filtrar las keys según la empresa seleccionada
  const visibleKeys = Object.keys(localData).filter(key => {
    if (filters.empresa && key !== filters.empresa) return false;
    return true;
  });

  const handleChange = (linea, field, value) => {
    setLocalData({
      ...localData,
      [linea]: {
        ...localData[linea],
        [field]: Number(value),
      },
    });
  };

  const handleSave = () => {
    setDataWorkers(localData);
    setMensaje("✅ Datos maestro actualizados. Los indicadores se han recalculado en el Dashboard.");
    setTimeout(() => setMensaje(""), 5000);
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "var(--colsanitas-light-grey)", minHeight: "100vh" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "var(--colsanitas-blue)", margin: 0 }}>Gestión de Población y Horas Hombre</h2>
        <p style={{ color: "var(--colsanitas-grey)", marginTop: "5px" }}>
          Administre el headcount y horas laboradas mensualmente para el cálculo automático de IF e IS.
        </p>
      </div>

      <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
          <Filter size={18} color="var(--colsanitas-green)" />
          <h3 style={{ margin: 0, fontSize: "16px" }}>Filtros</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
          <div className="filter-group">
            <label style={{ fontSize: "12px", color: "#718096" }}>Grupo Empresarial</label>
            <input name="grupoEmpresarial" className="input-colsanitas" value={filters.grupoEmpresarial} onChange={handleFilterChange} placeholder="Todos" />
          </div>
          <div className="filter-group">
            <label style={{ fontSize: "12px", color: "#718096" }}>Empresa</label>
            <select name="empresa" className="input-colsanitas" value={filters.empresa} onChange={handleFilterChange}>
              <option value="">Todas</option>
              {Object.keys(localData).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label style={{ fontSize: "12px", color: "#718096" }}>Año</label>
            <select name="anio" className="input-colsanitas" value={filters.anio} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label style={{ fontSize: "12px", color: "#718096" }}>Mes</label>
            <select name="mes" className="input-colsanitas" value={filters.mes} onChange={handleFilterChange}>
              <option value="">Todos</option>
              {["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {mensaje && (
        <div style={{
          padding: "15px",
          backgroundColor: "#F0FFF4",
          color: "#2F855A",
          border: "1px solid #C6F6D5",
          borderRadius: "8px",
          marginBottom: "25px",
          fontWeight: "600"
        }}>
          {mensaje}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "24px",
        marginBottom: "30px"
      }}>
        {visibleKeys.map((linea) => (
          <div key={linea} className="card" style={{ borderTop: "5px solid var(--colsanitas-blue)" }}>
            <h3 style={{ marginTop: 0, color: "var(--colsanitas-blue)", fontSize: "18px", borderBottom: "1px solid #f2f2f2", paddingBottom: "15px", marginBottom: "15px" }}>
              {linea}
            </h3>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "var(--colsanitas-grey)" }}>
                <Users size={14} /> Total Trabajadores:
              </label>
              <input
                type="text"
                value={Number(localData[linea].trabajadores || 0).toLocaleString("es-CO")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\./g, "");
                  if (!isNaN(val)) handleChange(linea, "trabajadores", val);
                }}
                className="input-colsanitas"
                style={{ backgroundColor: "white" }}
              />
            </div>

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "var(--colsanitas-grey)" }}>
                <Clock size={14} /> Horas Hombre Mes:
              </label>
              <input
                type="text"
                value={Number(localData[linea].horas || 0).toLocaleString("es-CO")}
                onChange={(e) => {
                  const val = e.target.value.replace(/\./g, "");
                  if (!isNaN(val)) handleChange(linea, "horas", val);
                }}
                className="input-colsanitas"
                style={{ backgroundColor: "white" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "right" }}>
        <button onClick={handleSave} className="btn-colsanitas" style={{ padding: "12px 40px" }}>
          <Save size={18} />
          GUARDAR PARAMETRIZACIÓN
        </button>
      </div>
    </div>
  );
};

export default GestionHoras;
