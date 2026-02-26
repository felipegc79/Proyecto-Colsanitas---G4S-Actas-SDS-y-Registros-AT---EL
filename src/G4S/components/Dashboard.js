
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
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { dataAT, dataEL, dataWorkers, DEPARTAMENTOS_COLOMBIA } from "../data";
import ColombiaMap from "./ColombiaMap";

// --- COLORES MODERNOS ---
const COLORES_SEVERIDAD = [
  "#4CAF50", "#FF9800", "#F44336", "#212121",
  "#3F51B5", "#9C27B0", "#00BCD4", "#FFC107",
  "#E91E63", "#009688", "#795548", "#607D8B"
];
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

const THEME_RED = {
  top: "#fca5a5",
  from: "#b91c1c",
  via: "#ef4444",
  to: "#991b1b",
  text: "#7f1d1d",
};

const THEME_GRAY = {
  top: "#d1d5db",
  from: "#374151",
  via: "#6b7280",
  to: "#1f2937",
  text: "#374151",
};

const THEMES_VARIED = [
  { top: "#93c5fd", from: "#1d4ed8", via: "#3b82f6", to: "#1e3a8a", text: "#1e3a8a" }, // Azul
  { top: "#fca5a5", from: "#b91c1c", via: "#ef4444", to: "#991b1b", text: "#7f1d1d" }, // Rojo
  { top: "#9ca3af", from: "#111827", via: "#374151", to: "#000000", text: "#000000" }, // Negro
  { top: "#e5e7eb", from: "#6b7280", via: "#9ca3af", to: "#4b5563", text: "#374151" }, // Gris
  { top: "#fef08a", from: "#b45309", via: "#eab308", to: "#92400e", text: "#713f12" }, // Amarillo
];

const VerticalBarChart3D = ({ data, theme, themes }) => {
  if (!data || data.length === 0)
    return <p style={{ fontSize: "12px", color: "#999", padding: "16px 0", textAlign: "center" }}>Sin datos.</p>;
  const maxVal = Math.max(...data.map((d) => d.total || d.value || 0), 1);
  return (
    <>
      <style>{`
        .vbar-chart-container {
          height: 256px;
          display: flex;
          align-items: flex-end;
          gap: 20px;
          margin-top: 16px;
          padding: 0 16px 8px 16px;
          border-bottom: 1px solid #f3f4f6;
          overflow-x: auto;
          width: 100%;
        }
        .vbar-chart-container::-webkit-scrollbar {
          height: 6px;
        }
        .vbar-chart-container::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        .vbar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          height: 100%;
          justify-content: flex-end;
          min-width: 50px;
          flex: 1;
        }
        .vbar-tooltip {
          position: absolute;
          bottom: 105%;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: bold;
          background-color: #111827;
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          opacity: 0;
          transition: opacity 0.2s;
          white-space: nowrap;
          z-index: 20;
          pointer-events: none;
        }
        .vbar-group:hover .vbar-tooltip {
          opacity: 1;
        }
        .vbar-tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 4px;
          border-style: solid;
          border-color: #111827 transparent transparent transparent;
        }
        .vbar-bar-wrapper {
          width: 100%;
          position: relative;
          display: flex;
          align-items: flex-end;
          height: 160px;
          cursor: pointer;
        }
        .vbar-bar {
          width: 100%;
          position: relative;
          margin: 0 auto;
          transition: filter 0.3s ease-in-out;
        }
        .vbar-group:hover .vbar-bar {
          filter: brightness(1.1);
        }
        .vbar-label {
          font-size: 10px;
          color: #4b5563;
          margin-top: 16px;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .vbar-value {
          font-size: 12px;
          font-weight: 900;
          margin-top: 4px;
        }
      `}</style>
      <div className="vbar-chart-container">
        {data.map((item, idx) => (
          <div key={idx} className="vbar-group">
            <div className="vbar-tooltip">
              {item.name}: {item.total || item.value || 0}
            </div>
            <div className="vbar-bar-wrapper">
              <div
                className="vbar-bar"
                style={{
                  height: `${((item.total || item.value || 0) / maxVal) * 100}%`,
                  minHeight: '15px'
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "12px",
                    borderRadius: "50%",
                    transform: "translateY(-50%)",
                    boxShadow: "inset 0 2px 4px rgba(255,255,255,0.8)",
                    zIndex: 10,
                    backgroundColor: themes ? themes[idx % themes.length].top : theme.top
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(to right, ${themes ? themes[idx % themes.length].from : theme.from}, ${themes ? themes[idx % themes.length].via : theme.via}, ${themes ? themes[idx % themes.length].to : theme.to})`,
                    borderBottomLeftRadius: '50% 12px',
                    borderBottomRightRadius: '50% 12px',
                    boxShadow: '-4px 0px 8px rgba(0,0,0,0.1) inset, 4px 0px 8px rgba(255,255,255,0.2) inset, 0px 10px 15px -3px rgba(0,0,0,0.3)'
                  }}
                ></div>
              </div>
            </div>
            <span className="vbar-label" title={item.name}>
              {item.name}
            </span>
            <span className="vbar-value" style={{ color: themes ? themes[idx % themes.length].text : theme.text }}>
              {item.total || item.value || 0}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuario G4S");
  const [userRole, setUserRole] = useState("Rol no asignado");
  const [caracterizacionMode, setCaracterizacionMode] = useState("parteCuerpo");
  const [showInvestigaciones, setShowInvestigaciones] = useState(true);

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
    anio: "",
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

  const alertasInvestigacion = useMemo(() => {
    const isClosed = (estado) => {
      if (!estado) return false;
      const t = estado.toLowerCase();
      return t.includes("cerrad") || t.includes("finaliz") || t.includes("aprob") || t.includes("complet");
    };

    const parseDate = (d) => {
      if (!d) return 0;
      const str = String(d).trim();
      if (!isNaN(str) && Number(str) > 10000) {
        const serial = Number(str);
        return new Date(Math.round((serial - 25569) * 86400 * 1000) + new Date().getTimezoneOffset() * 60000).getTime();
      }
      if (str.includes('/')) {
        const parts = str.split('/');
        if (parts.length === 3) {
          const [dPart, mPart, yPart] = parts;
          return new Date(`${yPart}-${mPart}-${dPart}T00:00:00`).getTime();
        }
      }
      return new Date(str).getTime();
    };

    const formatDate = (ms) => {
      if (!ms) return "N/D";
      const d = new Date(ms);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const now = new Date().getTime();

    const withDays = filteredData.map(item => {
      const t = parseDate(item.fechaAT || item.fechaAccidente);
      const deadline = t ? t + (15 * 24 * 60 * 60 * 1000) : 0;
      const remaining = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : 0;

      return {
        ...item,
        daysRemaining: remaining,
        originalMs: t,
        dueDateStr: deadline ? formatDate(deadline) : "N/D"
      };
    });

    let openCases = withDays.filter(item => {
      return !isClosed(item.estadoCaso || item.estado_caso || item.estado);
    });

    // Ordenar de menor cantidad de días (más vencido) a mayor.
    openCases.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return openCases.slice(0, 15);
  }, [filteredData]);

  // --- GRÁFICOS ---
  const dataByTipo = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      let key = curr.tipoAccidente || curr.tipo_accidente || "SIN INFORMACIÓN";
      if (!acc[key]) acc[key] = { name: key, total: 0 };
      acc[key].total += 1;
      return acc;
    }, {});
    return Object.values(counts);
  }, [filteredData]);

  const dataCaracterizacion = useMemo(() => {
    const formatCategoriaName = (rawName, mode) => {
      if (!rawName) return "Sin dato";
      let cleanName = rawName.replace(/^\d+[\s.-]*/, "").trim();
      if (!cleanName || cleanName.toUpperCase() === "SIN DATO" || cleanName.toUpperCase() === "SIN INFORMACIÓN") return "Sin dato";

      if (mode === "parteCuerpo") {
        const lower = cleanName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (lower.includes("ubicaciones multiples")) return "Ubicaciones Multiples";
        if (lower.includes("lesiones generales")) return "Lesiones generales u otras";
        if (lower.includes("miembros inferiores")) return "Miembros inferiores";
        if (lower.includes("cabeza")) return "Cabeza";
        if (lower.includes("ojos") || lower.includes("ojo")) return "Ojos";
        if (lower.includes("manos") || lower.includes("mano")) return "Manos";
        if (lower.includes("tronco") || lower.includes("espalda") || lower.includes("columna") || lower.includes("pelvis")) return "Tronco (incluye espalda, columna vertebral, medula espinal, pelvis)";
        if (lower.includes("pies") || lower.includes("pie")) return "Pies";
        if (lower.includes("miembros superiores")) return "Miembros superiores";
        if (lower.includes("torax")) return "Torax";
        if (lower.includes("cuello")) return "Cuello";
      }

      return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
    };

    const counts = filteredData.reduce((acc, curr) => {
      const rawVal = curr[caracterizacionMode];
      const key = formatCategoriaName(rawVal, caracterizacionMode);
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += 1;
      return acc;
    }, {});

    // Sort descending by value to make the chart look nice
    return Object.values(counts).sort((a, b) => b.value - a.value);
  }, [filteredData, caracterizacionMode]);

  const dataByLinea = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      let rawKey = curr.lineaNegocio || curr.linea_negocio || "Sin Definir";
      rawKey = String(rawKey).trim().toLowerCase();

      let key = "Sin Definir";
      if (rawKey.includes("technology")) key = "Technology";
      else if (rawKey.includes("secure")) key = "Secure";
      else if (rawKey.includes("risk")) key = "Risk";
      else if (rawKey.includes("infotec")) key = "Infotec";

      if (!acc[key]) acc[key] = { name: key, total: 0 };
      acc[key].total += 1;
      return acc;
    }, {});

    return [
      { name: "Technology", total: counts["Technology"]?.total || 0 },
      { name: "Secure", total: counts["Secure"]?.total || 0 },
      { name: "Risk", total: counts["Risk"]?.total || 0 },
      { name: "Infotec", total: counts["Infotec"]?.total || 0 },
      { name: "Sin Definir", total: counts["Sin Definir"]?.total || 0 }
    ].filter(i => i.total > 0 || Object.keys(counts).length >= 0); // Always keep 5 bars
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
    <div style={{ height: "100%", overflowY: "auto", background: "#f9fafb" }}>
      <header
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 24px",
          background: "#ffffff",
          color: "#333",
          borderBottom: "1px solid #eee",
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
        }}
      >
        <h2 style={{ margin: 0, fontWeight: "800", color: "#CD1920" }}>Tableros de Control</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ textAlign: "right", lineHeight: "1.2" }}>
            <span style={{ fontWeight: "bold", fontSize: "0.95em" }}>
              {userName}
            </span>{" "}
            <br />
            <small style={{ color: "#777" }}>{userRole}</small>
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
          className="datos-base-section"
          style={{
            marginBottom: "20px",
            background: "linear-gradient(135deg, #E53935 0%, #B71C1C 100%)",
            borderLeft: "6px solid #8E0000",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 8px 16px rgba(183,28,28,0.3)"
          }}
        >
          <div
            style={{
              marginBottom: "15px",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid rgba(255,255,255,0.3)",
              paddingBottom: "10px"
            }}
          >
            <strong style={{ fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ background: "rgba(255,255,255,0.2)", padding: "5px", borderRadius: "6px" }}>⚙️</span>
              Datos Base para Cálculos (Dinámicos según Filtro):
            </strong>
            <small style={{ color: "#FFCDD2", fontWeight: "normal", fontSize: "13px" }}>
              Cálculo de Indicadores: (Cantidad de registros / Cantidad de Trabajadores) * 100
            </small>
          </div>

          <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "center" }}>
            {/* INPUT TRABAJADORES (READ ONLY) */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  marginBottom: "8px",
                  fontWeight: "800",
                  fontSize: "13px",
                  color: "#FFFFFF"
                }}
              >
                Total Trabajadores:
              </label>
              <div
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.5)",
                  minWidth: "140px",
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "700",
                  background: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                {Math.round(currentTrabajadores).toLocaleString('es-CO')}
              </div>
            </div>

            {/* INPUT HORAS HOMBRE (READ ONLY) */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                style={{
                  marginBottom: "8px",
                  fontWeight: "800",
                  fontSize: "13px",
                  color: "#FFFFFF"
                }}
              >
                Horas Hombre Trabajadas:
              </label>
              <div
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.5)",
                  minWidth: "140px",
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "700",
                  background: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                {Math.round(currentHorasHombre).toLocaleString('es-CO')}
              </div>
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

        </div>

      </div>
      {/* Alerta Investigaciones por Vencer */}
      <div className="card" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FBD38D", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 15px", borderBottom: showInvestigaciones ? "1px solid #FBD38D" : "none", backgroundColor: "#FFFAF0", borderRadius: showInvestigaciones ? "12px 12px 0 0" : "12px", cursor: "pointer" }}
          onClick={() => setShowInvestigaciones(!showInvestigaciones)}
        >
          <h3 style={{ fontSize: "15px", color: "#975A16", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={18} />
            Alertas Críticas Recientes (Plazo 10 días)
          </h3>
          {showInvestigaciones ? <ChevronUp size={20} color="#975A16" /> : <ChevronDown size={20} color="#975A16" />}
        </div>
        {showInvestigaciones && (
          <div style={{ padding: "0 15px 15px 15px", paddingTop: "15px", maxHeight: "400px", overflowY: "auto" }}>
            <table style={{ width: "100%", fontSize: "13px", borderCollapse: "separate", borderSpacing: "0 8px" }}>
              <thead>
                <tr>
                  <th align="left" style={{ padding: "8px", color: "#744210" }}>Días Faltantes</th>
                  <th align="left" style={{ padding: "8px", color: "#744210" }}>Fecha Límite</th>
                  <th align="left" style={{ padding: "8px", color: "#744210" }}>Trabajador</th>
                  <th align="left" style={{ padding: "8px", color: "#744210" }}>Empresa</th>
                  <th align="left" style={{ padding: "8px", color: "#744210" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {alertasInvestigacion.length > 0 ? alertasInvestigacion.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <td style={{ padding: "12px", borderRadius: "8px 0 0 8px" }}>
                      <span style={{
                        color: item.daysRemaining <= 5 ? "#C53030" : (item.daysRemaining <= 8 ? "#D69E2E" : "#38A169"),
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}>
                        <AlertCircle size={12} /> {item.daysRemaining} días
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontWeight: "bold" }}>{item.dueDateStr}</td>
                    <td style={{ padding: "12px", fontWeight: "500" }}>{item.apellidosNombres || item.nombreCompleto || item.trabajador || "PENDIENTE"}</td>
                    <td style={{ padding: "12px" }}>{item.empresa}</td>
                    <td style={{ padding: "12px", borderRadius: "0 8px 8px 0" }}>
                      <span style={{ backgroundColor: "#FEF2F2", color: "#991B1B", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", border: "1px solid #FECACA" }}>
                        {item.estadoCaso || item.estado_caso || "Abierto"}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                      No hay reportes de accidente de trabajo próximos a vencer con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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
          <VerticalBarChart3D data={dataByLinea} theme={THEME_RED} />
          <div style={{ maxHeight: "150px", overflowY: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Línea de Negocio</th>
                  <th style={thStyle}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {dataByLinea.map((item, idx) => (
                  <tr key={idx}>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>
                      <strong>{item.total}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <h3>Accidentes Por Tipo</h3>
          <VerticalBarChart3D data={dataByTipo} theme={THEME_GRAY} />
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
                      <strong>{item.total}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
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
          <VerticalBarChart3D data={dataCaracterizacion} themes={THEMES_VARIED} />
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
                      <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                      <feSpecularLighting in="blur" surfaceScale="4" specularConstant="1" specularExponent="30" lightingColor="white">
                        <fePointLight x="-50" y="-50" z="200" />
                      </feSpecularLighting>
                      <feComposite in2="SourceAlpha" operator="in" result="specOut" />
                      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
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
                      <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.4" />
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                      <feSpecularLighting in="blur" surfaceScale="4" specularConstant="1" specularExponent="30" lightingColor="white">
                        <fePointLight x="-50" y="-50" z="200" />
                      </feSpecularLighting>
                      <feComposite in2="SourceAlpha" operator="in" result="specOut" />
                      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
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

      {/* MAPA */}
      <div className="card" style={{ marginTop: "20px", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <div style={{ width: "100%", maxWidth: "800px" }}>
          <ColombiaMap data={mapData} highlightedDepts={[]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
