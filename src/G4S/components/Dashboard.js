
// src/components/Dashboard.js
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
  Legend,
} from "recharts";
import { dataAT, dataEL, dataWorkers, DEPARTAMENTOS_COLOMBIA } from "../data";
import ColombiaMap from "./ColombiaMap";

// --- COLORES MODERNOS ---
const COLORES_SEVERIDAD = ["#4CAF50", "#FF9800", "#F44336", "#212121"];
const COLORES_GENERO = { Masculino: "#1565C0", Femenino: "#E53935" };
const COLORES_MODERNOS = [
  "url(#colorGradient1)",
  "url(#colorGradient2)",
  "url(#colorGradient3)",
  "url(#colorGradient4)",
  "url(#colorGradient5)",
];

const COLORES_PASTEL = [
  "#CD1920",
  "#333333",
  "#63666A",
  "#999999",
  "#d32f2f",
  "#FFA000",
  "#1976D2",
];

const LISTA_MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

// --- MAPEO DE REGIONALES A DEPARTAMENTOS ---
const DEPARTAMENTOS_POR_REGIONAL = {
  "BOGOTA - GIRARDOT": ["Cundinamarca", "Tolima"],
  SABANA: ["Cundinamarca", "Meta", "Casanare", "Boyacá"],
  "NOR OCCIDENTE": ["Chocó", "Antioquia", "Córdoba", "Quibdó"],
  COSTA: ["Atlántico", "Bolívar", "Sucre", "Magdalena", "Santander"],
  "SUR OCCIDENTE": ["Cauca", "Valle del Cauca", "Putumayo", "Nariño"],
  "EJE CAFETERO": ["Quindío", "Risaralda", "Tolima", "Caldas", "Huila"],
  SANTANDERS: ["Norte de Santander", "Santander", "Cesar"],
};

// Función auxiliar para normalizar textos
const normalizeText = (text) => {
  if (text === null || text === undefined) return "";
  return text
    .toString()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuario G4S");
  const [userRole, setUserRole] = useState("Rol no asignado");
  const [caracterizacionMode, setCaracterizacionMode] =
    useState("parteCuerpo");

  // --- DATOS directos desde data.js ---
  const rawData = dataAT;

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("userName");
      const storedRole = localStorage.getItem("userRole");
      if (storedName) {
        setUserName(storedName);
        setUserRole(storedRole || "Rol no asignado");
      }
    } catch (error) {
      console.warn("LocalStorage no disponible");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    navigate("/g4s");
  };

  const [filters, setFilters] = useState({
    regional: "",
    departamento: "",
    ciudad: "",
    mes: "",
    anio: "2025",
    linea_negocio: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "regional") {
      setFilters({ ...filters, regional: value, departamento: "", ciudad: "" });
    } else if (name === "departamento") {
      setFilters({ ...filters, departamento: value, ciudad: "" });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  const departamentosDisponibles = useMemo(() => {
    if (filters.regional && DEPARTAMENTOS_POR_REGIONAL[filters.regional]) {
      return DEPARTAMENTOS_POR_REGIONAL[filters.regional].sort();
    }
    return Object.keys(DEPARTAMENTOS_COLOMBIA).sort();
  }, [filters.regional]);

  const ciudadesDisponibles = useMemo(() => {
    if (!filters.departamento) return [];
    let ciudades = DEPARTAMENTOS_COLOMBIA[filters.departamento];
    if (!ciudades) {
      const key = Object.keys(DEPARTAMENTOS_COLOMBIA).find(
        (k) => normalizeText(k) === normalizeText(filters.departamento)
      );
      if (key) ciudades = DEPARTAMENTOS_COLOMBIA[key];
    }
    return ciudades ? [...ciudades].sort() : [];
  }, [filters.departamento]);

  // --- CÁLCULO DE TOTALES DE TRABAJADORES Y HORAS ---
  const { currentTrabajadores, currentHorasHombre } = useMemo(() => {
    if (!dataWorkers) return { currentTrabajadores: 1, currentHorasHombre: 1 };

    let totalT = 0;
    let totalH = 0;

    const workerKeys = Object.keys(dataWorkers);

    let keysToSum = [];
    if (filters.linea_negocio) {
      const matchKey = workerKeys.find(
        (k) => normalizeText(k) === normalizeText(filters.linea_negocio)
      );
      if (matchKey) keysToSum = [matchKey];
    } else {
      keysToSum = workerKeys;
    }

    keysToSum.forEach((key) => {
      const item = dataWorkers[key];
      if (item) {
        totalT += Number(item.trabajadores) || 0;
        totalH += Number(item.horas) || 0;
      }
    });

    // Ajuste temporal para la visualización de Horas Hombre
    if (filters.mes !== "") {
      totalH = totalH / 12;
      // No dividimos trabajadores porque es headcount (población)
    }

    return {
      currentTrabajadores: totalT > 0 ? totalT : 1,
      currentHorasHombre: totalH > 0 ? totalH : 1,
    };
  }, [dataWorkers, filters.linea_negocio, filters.mes]);

  // --- FILTRADO DE DATOS (NUMERADOR) ---
  const filteredData = useMemo(() => {
    const safeData = rawData;

    return safeData.filter((item) => {
      const itemAnio = normalizeText(item.anio || item.ano);
      const itemRegional = normalizeText(item.regional);
      const itemDepto = normalizeText(item.departamento);
      const itemCiudad = normalizeText(item.ciudad);
      const itemMes = normalizeText(item.mes);
      const itemLinea = normalizeText(item.linea_negocio || item.lineaNegocio);

      const filterRegional = normalizeText(filters.regional);
      const filterDepto = normalizeText(filters.departamento);
      const filterCiudad = normalizeText(filters.ciudad);
      const filterMes = normalizeText(filters.mes);
      const filterAnio = normalizeText(filters.anio);
      const filterLinea = normalizeText(filters.linea_negocio);

      const matchRegional =
        filters.regional === "" || itemRegional === filterRegional;
      const matchDepto =
        filters.departamento === "" || itemDepto === filterDepto;
      const matchCiudad = filters.ciudad === "" || itemCiudad === filterCiudad;
      const matchMes = filters.mes === "" || itemMes === filterMes;
      const matchAnio = filters.anio === "" || itemAnio === filterAnio;
      const matchLinea =
        filters.linea_negocio === "" || itemLinea === filterLinea;

      return (
        matchRegional &&
        matchDepto &&
        matchCiudad &&
        matchMes &&
        matchAnio &&
        matchLinea
      );
    });
  }, [filters, rawData]);

  const filteredEL = useMemo(() => {
    const safeDataEL = dataEL;

    return safeDataEL.filter((item) => {
      let anioTemp = item.anio;
      if (!anioTemp && item.fechaDiag1)
        anioTemp = item.fechaDiag1.split("-")[0];

      const itemAnio = normalizeText(anioTemp);
      const itemMes = normalizeText(item.mes);
      const itemRegional = normalizeText(item.regional);
      const itemDepto = normalizeText(item.departamento);
      const itemLinea = normalizeText(item.lineaNegocio || item.linea_negocio);

      const filterRegional = normalizeText(filters.regional);
      const filterDepto = normalizeText(filters.departamento);
      const filterMes = normalizeText(filters.mes);
      const filterAnio = normalizeText(filters.anio);
      const filterLinea = normalizeText(filters.linea_negocio);

      return (
        (filters.regional === "" || itemRegional === filterRegional) &&
        (filters.departamento === "" || itemDepto === filterDepto) &&
        (filters.linea_negocio === "" || itemLinea === filterLinea) &&
        (filters.mes === "" || itemMes === filterMes) &&
        (filters.anio === "" || itemAnio === filterAnio)
      );
    });
  }, [filters, dataEL]);

  // --- CÁLCULO DE INDICADORES AT (CORREGIDO SEGÚN FÓRMULA USUARIO) ---
  const indicadores = useMemo(() => {
    // Denominador: Total Trabajadores
    const denominador =
      Number(currentTrabajadores) > 0 ? Number(currentTrabajadores) : 1;

    // Numerador Frecuencia: Número de Eventos
    const numEventos = filteredData.length;

    // Numerador Severidad: Número de Días Perdidos
    const numDiasPerdidos = filteredData.reduce((acc, curr) => {
      const dias = Number(curr.totalDias) || Number(curr.diasIncapacidad) || 0;
      return acc + dias;
    }, 0);

    // FÓRMULA 1: IF = (Eventos / Trabajadores) * 100
    const IF = ((numEventos / denominador) * 100).toFixed(2);

    // FÓRMULA 2: IS = (Días Perdidos / Trabajadores) * 100
    const IS = ((numDiasPerdidos / denominador) * 100).toFixed(2);

    return { numEventos, numDiasPerdidos, IF, IS };
  }, [filteredData, currentTrabajadores]);

  // --- CÁLCULO DE INDICADORES EL ---
  const indicadoresEL = useMemo(() => {
    const totalCasosEL = filteredEL.length;
    const denominadorTrabajadores =
      Number(currentTrabajadores) > 0 ? Number(currentTrabajadores) : 1;

    const prevalenciaIncidencia = (
      (totalCasosEL / denominadorTrabajadores) *
      100
    ).toFixed(2);

    const ausentismoEL = filteredEL.reduce(
      (acc, curr) => acc + (Number(curr.diasIncapacidad) || 0),
      0
    );

    return { totalCasosEL, prevalenciaIncidencia, ausentismoEL };
  }, [filteredEL, currentTrabajadores]);

  // --- META COMPARATIVA ---
  const metaComparativa = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;

    const anioActual = parseInt(filters.anio) || 2025;
    const anioAnterior = anioActual - 1;

    const denominadorTrabActual = Number(currentTrabajadores) || 1;
    // Asumimos misma población para año anterior para mantener consistencia
    const denominadorTrabAnterior = denominadorTrabActual;

    const dataAnterior = rawData.filter(
      (i) => normalizeText(i.anio) == anioAnterior.toString()
    );

    const ifActualVal = parseFloat(indicadores.IF);

    // Cálculo IF Año Anterior usando la misma fórmula: (Eventos / Trabajadores) * 100
    const eventosAnterior = dataAnterior.length;
    const ifAnteriorVal = (eventosAnterior / denominadorTrabAnterior) * 100;

    const metaIFVal = ifAnteriorVal * 0.96;
    const cumplimiento = ifActualVal <= metaIFVal;

    let reduccionRealVal = 0;
    if (ifAnteriorVal > 0) {
      reduccionRealVal = ((ifAnteriorVal - ifActualVal) / ifAnteriorVal) * 100;
    }

    return {
      anioActual,
      anioAnterior,
      ifActual: ifActualVal.toFixed(2),
      ifAnterior: ifAnteriorVal.toFixed(2),
      metaIF: metaIFVal.toFixed(2),
      cumplimiento,
      reduccionReal: reduccionRealVal.toFixed(2),
    };
  }, [rawData, filters.anio, currentTrabajadores, indicadores.IF]);

  // --- KPI DATA ---
  const kpis = useMemo(() => {
    return {
      total: filteredData.length,
      hpi: filteredData.filter((i) => normalizeText(i.esHpi) === "SI").length,
      pendientes: filteredData.filter(
        (i) => normalizeText(i.estadoInvestigacion) === "PENDIENTE"
      ).length,
      fatales: filteredData.filter(
        (i) => normalizeText(i.clasificacionNivel) === "FATAL" || normalizeText(i.severidad) === "FATAL"
      ).length,
    };
  }, [filteredData]);

  const alertasActivas = useMemo(() => {
    return filteredData
      .filter(
        (i) =>
          normalizeText(i.severidad) === "FATAL" ||
          normalizeText(i.esHpi) === "SI"
      )
      .slice(0, 5);
  }, [filteredData]);

  // --- GRÁFICOS ---
  const dataByTipo = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      let key = curr.tipoAccidente || curr.tipo_accidente || "SIN INFORMACIÓN";
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += 1;
      return acc;
    }, {});
    return Object.values(counts);
  }, [filteredData]);

  const dataCaracterizacion = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      const key = curr[caracterizacionMode] || "SIN DATO";
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += 1;
      return acc;
    }, {});
    return Object.values(counts);
  }, [filteredData, caracterizacionMode]);

  const dataByLinea = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      const key = curr.lineaNegocio || curr.linea_negocio || "Sin Definir";
      if (!acc[key]) acc[key] = { name: key, total: 0 };
      acc[key].total += 1;
      return acc;
    }, {});
    return Object.values(counts);
  }, [filteredData]);

  const mapData = useMemo(() => {
    const counts = {};
    filteredData.forEach((item) => {
      if (item.departamento) {
        let dep = normalizeText(item.departamento);
        if (dep === "BOGOTA D.C." || dep === "BOGOTA DC")
          dep = "SANTAFE DE BOGOTA";
        counts[dep] = (counts[dep] || 0) + 1;
      }
    });
    return counts;
  }, [filteredData]);

  // --- DATOS PARA GRÁFICOS DE SEVERIDAD Y GÉNERO ---
  const dataBySeveridad = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      const key = curr.clasificacionNivel || curr.severidad || "Sin Dato";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const dataByGenero = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      const key = curr.genero || "Sin Dato";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const getColor = (valor) => {
    if (valor > 50) return "#CD1920";
    if (valor >= 30) return "#FFC107";
    return "#4CAF50";
  };

  const kpiCardStyle = {
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    textAlign: "center",
    minWidth: "120px",
  };
  const kpiValueStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: "5px 0",
  };
  const kpiLabelStyle = { fontSize: "14px", color: "#666" };

  // --- ESTILOS PARA TABLAS ---
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    fontSize: "0.9em",
  };
  const thStyle = {
    background: "#f0f0f0",
    padding: "8px",
    borderBottom: "2px solid #ddd",
    textAlign: "left",
  };
  const tdStyle = {
    padding: "8px",
    borderBottom: "1px solid #eee",
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#f4f4f4" }}>
      <header
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          background: "#333",
          color: "white",
        }}
      >
        <h2 style={{ margin: 0 }}>Tableros de Control</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ textAlign: "right", lineHeight: "1.2" }}>
            <span style={{ fontWeight: "bold", fontSize: "0.95em" }}>
              {userName}
            </span>{" "}
            <br />
            <small style={{ color: "#ccc" }}>{userRole}</small>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "#CD1920",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.85em",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* FILTROS */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h3>Filtros de Búsqueda Global</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
          }}
        >
          <select
            name="regional"
            value={filters.regional}
            onChange={handleFilterChange}
            className="input-g4s"
          >
            <option value="">Regional: Todas</option>
            {Object.keys(DEPARTAMENTOS_POR_REGIONAL).map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <select
            name="departamento"
            value={filters.departamento}
            onChange={handleFilterChange}
            className="input-g4s"
          >
            <option value="">Depto: Todos</option>
            {departamentosDisponibles.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            name="ciudad"
            value={filters.ciudad}
            onChange={handleFilterChange}
            className="input-g4s"
            disabled={!filters.departamento}
          >
            <option value="">Ciudad: Todas</option>
            {ciudadesDisponibles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            name="anio"
            value={filters.anio}
            onChange={handleFilterChange}
            className="input-g4s"
          >
            <option value="">Año: Todos</option>
            {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            name="mes"
            value={filters.mes}
            onChange={handleFilterChange}
            className="input-g4s"
          >
            <option value="">Mes: Todos</option>
            {LISTA_MESES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            name="linea_negocio"
            value={filters.linea_negocio}
            onChange={handleFilterChange}
            className="input-g4s"
          >
            <option value="">Línea: Todas</option>
            {["SECURE", "RISK", "TECHNOLOGY", "INFOTEC"].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            onClick={() =>
              setFilters({
                regional: "",
                departamento: "",
                ciudad: "",
                mes: "",
                anio: "2025",
                linea_negocio: "",
              })
            }
            className="btn-g4s"
            style={{ background: "#666" }}
          >
            Limpiar
          </button>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* --- PANEL DE CONFIGURACIÓN DE DATOS BASE (SOLO LECTURA) --- */}
        <div
          className="card"
          style={{
            marginBottom: "20px",
            background: "#fff3e0",
            border: "1px solid #ffe0b2",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              color: "#e65100",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <strong>
              ⚙️ Datos Base para Cálculos (Dinámicos según Filtro):
            </strong>
            <small style={{ color: "#666", fontWeight: "normal" }}>
              Cálculo de Indicadores: (Cantidad de registros / Cantidad de
              Trabajadores) * 100
            </small>
          </div>

          <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
            {/* INPUT TRABAJADORES (READ ONLY) */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "0.9em",
                }}
              >
                Total Trabajadores:
              </label>
              <input
                type="number"
                value={Math.round(currentTrabajadores)}
                readOnly
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  width: "140px",
                  textAlign: "center",
                  fontSize: "1.1em",
                  backgroundColor: "#e9ecef",
                  cursor: "not-allowed",
                }}
              />
            </div>

            {/* INPUT HORAS HOMBRE (READ ONLY) - AGREGADO DE VUELTA */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  marginBottom: "5px",
                  fontWeight: "bold",
                  fontSize: "0.9em",
                }}
              >
                Horas Hombre Trabajadas:
              </label>
              <input
                type="number"
                value={Math.round(currentHorasHombre)}
                readOnly
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  width: "140px",
                  textAlign: "center",
                  fontSize: "1.1em",
                  backgroundColor: "#e9ecef",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>
        </div>

        {/* --- PANEL DE INDICADORES PRINCIPALES --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            className="card"
            style={{ textAlign: "center", borderTop: "4px solid #1976D2" }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>
              IF (Frecuencia AT)
            </h4>
            <div
              style={{
                fontSize: "2.5em",
                fontWeight: "bold",
                color: "#1976D2",
              }}
            >
              {indicadores.IF}
            </div>
            <small style={{ color: "#888" }}>
              {indicadores.numEventos} Eventos
            </small>
          </div>

          <div
            className="card"
            style={{ textAlign: "center", borderTop: "4px solid #FFA000" }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>
              IS (Severidad AT)
            </h4>
            <div
              style={{
                fontSize: "2.5em",
                fontWeight: "bold",
                color: "#FFA000",
              }}
            >
              {indicadores.IS}
            </div>
            <small style={{ color: "#888" }}>
              {indicadores.numDiasPerdidos} Días Perdidos
            </small>
          </div>

          {metaComparativa && (
            <div
              className="card"
              style={{
                textAlign: "center",
                borderTop: `4px solid ${metaComparativa.cumplimiento ? "#4CAF50" : "#CD1920"
                  }`,
              }}
            >
              <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>
                Meta Reducción IF (4%)
              </h4>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginBottom: "5px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.2em",
                      color: "#999",
                    }}
                  >
                    {metaComparativa.ifAnterior}
                  </span>
                  <br />
                  <small>{metaComparativa.anioAnterior}</small>
                </div>
                <div style={{ fontSize: "1.5em", color: "#ccc" }}>➔</div>
                <div>
                  <span style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                    {metaComparativa.ifActual}
                  </span>
                  <br />
                  <small>{metaComparativa.anioActual}</small>
                </div>
              </div>
              <div
                style={{
                  background: metaComparativa.cumplimiento
                    ? "#e8f5e9"
                    : "#ffebee",
                  color: metaComparativa.cumplimiento ? "#2e7d32" : "#c62828",
                  padding: "5px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  fontSize: "0.9em",
                }}
              >
                {metaComparativa.cumplimiento
                  ? `✔ CUMPLE (-${metaComparativa.reduccionReal}%)`
                  : `✘ NO CUMPLE`}
              </div>
            </div>
          )}
        </div>

        {/* BLOQUE DE KPIs y ALERTAS */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: 2,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "10px",
            }}
          >
            <div style={{ ...kpiCardStyle, borderTop: "4px solid #1976D2" }}>
              <div style={kpiLabelStyle}>Eventos AT</div>
              <div style={kpiValueStyle}>{kpis.total}</div>
            </div>
            <div style={{ ...kpiCardStyle, borderTop: "4px solid #FFA000" }}>
              <div style={kpiLabelStyle}>Registros Pendientes AT</div>
              <div style={kpiValueStyle}>{kpis.pendientes}</div>
            </div>
            <div style={{ ...kpiCardStyle, borderTop: "4px solid #CD1920" }}>
              <div style={kpiLabelStyle}>Casos HPI</div>
              <div style={kpiValueStyle}>{kpis.hpi}</div>
            </div>
            <div style={{ ...kpiCardStyle, borderTop: "4px solid black" }}>
              <div style={kpiLabelStyle}>Fatales</div>
              <div style={kpiValueStyle}>{kpis.fatales}</div>
            </div>

            <div
              style={{
                ...kpiCardStyle,
                borderTop: "4px solid #673AB7",
                background: "#f3e5f5",
              }}
            >
              <div
                style={{
                  ...kpiLabelStyle,
                  color: "#4527a0",
                  fontWeight: "bold",
                }}
              >
                Prevalencia Incidencia
              </div>
              <div style={{ ...kpiValueStyle, color: "#673AB7" }}>
                {indicadoresEL.prevalenciaIncidencia}%
              </div>
              <small style={{ fontSize: "0.75em", color: "#666" }}>
                ({indicadoresEL.totalCasosEL} Casos)
              </small>
            </div>

            <div
              style={{
                ...kpiCardStyle,
                borderTop: "4px solid #E91E63",
                background: "#fce4ec",
              }}
            >
              <div
                style={{
                  ...kpiLabelStyle,
                  color: "#ad1457",
                  fontWeight: "bold",
                }}
              >
                Ausentismo EL
              </div>
              <div style={{ ...kpiValueStyle, color: "#E91E63" }}>
                {indicadoresEL.ausentismoEL}
              </div>
              <small style={{ fontSize: "0.75em", color: "#666" }}>
                Días Perdidos
              </small>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              background: "#fff3cd",
              padding: "15px",
              borderRadius: "8px",
              border: "1px solid #ffeeba",
              minWidth: "250px",
            }}
          >
            <h4
              style={{
                marginTop: 0,
                color: "#856404",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              ⚠️ Alertas Críticas Recientes
            </h4>
            {alertasActivas.length > 0 ? (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "0.9em",
                  color: "#856404",
                }}
              >
                {alertasActivas.map((a, idx) => (
                  <li key={idx}>
                    <strong>{a.fechaAccidente}:</strong> {a.tipo_accidente} (
                    {a.severidad}) en {a.regional}
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ fontSize: "0.9em", color: "#666" }}>
                No hay alertas críticas en los filtros actuales.
              </span>
            )}
          </div>
        </div>

        {/* GRÁFICAS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div className="card">
            <h3>Accidentes por Línea de Negocio</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dataByLinea}>
                <defs>
                  <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="3" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
                  </filter>
                  <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff4d4d" stopOpacity={1} />
                    <stop offset="100%" stopColor="#CD1920" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="url(#gradBar)" filter="url(#shadow3d)">
                  <LabelList
                    dataKey="total"
                    position="top"
                    fill="#333"
                    fontWeight="bold"
                  />
                  {dataByLinea.map((e, i) => (
                    <Cell key={i} fill="url(#gradBar)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3>Accidentes Por Tipo</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <defs>
                  <filter id="shadow3dPie" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" />
                  </filter>
                </defs>
                <Pie
                  data={dataByTipo}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name }) => name}
                  filter="url(#shadow3dPie)"
                  stroke="none"
                >
                  {dataByTipo.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORES_PASTEL[index % COLORES_PASTEL.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Tipo de Accidente</th>
                    <th style={thStyle}>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {dataByTipo.map((item, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>
                        <strong>{item.value}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h3>Caracterización Detallada</h3>
              <select
                value={caracterizacionMode}
                onChange={(e) => setCaracterizacionMode(e.target.value)}
                style={{ padding: "5px" }}
              >
                <option value="parteCuerpo">Parte del Cuerpo</option>
                <option value="mecanismoForma">Mecanismo de Lesión</option>
                <option value="agenteAccidente">Agente Causal</option>
                <option value="sitioAccidente">Sitio de la Lesión</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart margin={{ top: 20, bottom: 20 }}>
                <defs>
                  <filter id="shadow3dPie2" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" />
                  </filter>
                </defs>
                <Pie
                  data={dataCaracterizacion}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, percent }) => {
                    // Solo mostrar etiqueta si representa más del 3% del total
                    if (percent < 0.03) return null;
                    // Truncar nombres largos
                    const displayName = name.length > 20 ? name.substring(0, 18) + '...' : name;
                    return `${displayName} (${(percent * 100).toFixed(0)}%)`;
                  }}
                  labelLine={{ stroke: '#999', strokeWidth: 1 }}
                  filter="url(#shadow3dPie2)"
                  stroke="none"
                  isAnimationActive={true}
                >
                  {dataCaracterizacion.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORES_PASTEL[index % COLORES_PASTEL.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} casos`, name]} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Categoría ({caracterizacionMode})</th>
                    <th style={thStyle}>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {dataCaracterizacion.map((item, idx) => (
                    <tr key={idx}>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={tdStyle}>
                        <strong>{item.value}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <ColombiaMap data={mapData} highlightedDepts={[]} />
          </div>
        </div>

        {/* GRÁFICOS DE SEVERIDAD Y GÉNERO - Donut Charts */}
        <div className="card" style={{ padding: "24px", marginTop: "20px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: "18px", margin: "0 0 20px 0", fontWeight: "700", color: "#333", borderBottom: "2px solid #CD1920", paddingBottom: "10px" }}>
            Distribución por Severidad y Género
          </h3>
          <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", justifyContent: "space-around" }}>
            {/* DONUT SEVERIDAD */}
            <div style={{ flex: "1 1 340px", minWidth: "280px" }}>
              <div style={{ height: 280, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="shadow3dSev" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.35)" />
                      </filter>
                    </defs>
                    <Pie
                      data={dataBySeveridad}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      filter="url(#shadow3dSev)"
                      stroke="none"
                    >
                      {dataBySeveridad.map((entry, index) => (
                        <Cell key={`sev-${index}`} fill={COLORES_SEVERIDAD[index % COLORES_SEVERIDAD.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: "absolute",
                  top: "43%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "14px",
                  color: "#333",
                  textAlign: "center",
                  fontWeight: "700",
                  pointerEvents: "none",
                }}>
                  Severidad
                </div>
              </div>
              <div style={{ maxHeight: "130px", overflowY: "auto", marginTop: "10px" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Nivel</th>
                      <th style={thStyle}>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataBySeveridad.map((item, idx) => (
                      <tr key={idx}>
                        <td style={tdStyle}>{item.name}</td>
                        <td style={tdStyle}><strong>{item.value}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* DONUT GÉNERO */}
            <div style={{ flex: "1 1 340px", minWidth: "280px" }}>
              <div style={{ height: 280, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <filter id="shadow3dGen" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.35)" />
                      </filter>
                    </defs>
                    <Pie
                      data={dataByGenero}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      filter="url(#shadow3dGen)"
                      stroke="none"
                    >
                      {dataByGenero.map((entry, index) => (
                        <Cell key={`gen-${index}`} fill={COLORES_GENERO[entry.name] || COLORES_SEVERIDAD[index % COLORES_SEVERIDAD.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: "absolute",
                  top: "43%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "14px",
                  color: "#333",
                  textAlign: "center",
                  fontWeight: "700",
                  pointerEvents: "none",
                }}>
                  Género
                </div>
              </div>
              <div style={{ maxHeight: "130px", overflowY: "auto", marginTop: "10px" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Género</th>
                      <th style={thStyle}>Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataByGenero.map((item, idx) => (
                      <tr key={idx}>
                        <td style={tdStyle}>{item.name}</td>
                        <td style={tdStyle}><strong>{item.value}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
