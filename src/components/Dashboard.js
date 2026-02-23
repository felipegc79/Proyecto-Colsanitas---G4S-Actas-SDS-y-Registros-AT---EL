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
  Legend,
  LabelList
} from "recharts";
import { LogOut, Filter, Map as MapIcon, TrendingDown, Users, AlertCircle, SimpleLineIcons, FileText, Table as TableIcon, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { DEPARTAMENTOS_COLOMBIA, dataAT, loadFromStorage, syncFromDB } from "../data";
import { getRegional, REGIONALES } from "../utils/regionales";
import ColombiaMap from "./ColombiaMap";

// Colores Variados y Vibrantes para "Progreso de Casos" y otros
const COLORS_VARIED = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57"];
const COLORS_SEVERITY = ["#005f33", "#003366", "#6e8f17", "#b3861c", "#991616"];

const LISTA_MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

// Custom Tooltip con estilo Glassmorphism
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        padding: "15px",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        textAlign: "left"
      }}>
        <p style={{ margin: "0 0 5px", fontWeight: "bold", color: "#2D3748", fontSize: "14px" }}>{label || (payload[0].payload && payload[0].payload.name)}</p>
        <p style={{ margin: 0, color: "#4A5568", fontSize: "13px" }}>
          Cantidad: <span style={{ fontWeight: "600", color: "#008D4C" }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Componente de Tabla Reutilizable
const DataTable = ({ data, columns }) => (
  <div style={{ overflowX: "auto", marginTop: "20px", border: "1px solid #E2E8F0", borderRadius: "10px" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
      <thead>
        <tr style={{ background: "#F7FAFC" }}>
          {columns.map((col, idx) => (
            <th key={idx} style={{ padding: "12px", textAlign: "left", color: "#4A5568", borderBottom: "1px solid #E2E8F0" }}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} style={{ borderBottom: idx === data.length - 1 ? "none" : "1px solid #E2E8F0" }}>
            {columns.map((col, cIdx) => (
              <td key={cIdx} style={{ padding: "10px", color: "#2D3748" }}>{row[col === "Nombre" ? "name" : "value"]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


const Dashboard = ({ dataWorkers }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Usuario");
  const [userRole, setUserRole] = useState("");
  const [userEntity, setUserEntity] = useState("");
  const [caracterizacionMode, setCaracterizacionMode] = useState("parteCuerpo");
  const [showFilters, setShowFilters] = useState(true);
  const [showInvestigaciones, setShowInvestigaciones] = useState(true);

  // Cargar datos de AT desde IndexedDB (async)
  const [rawData, setRawData] = useState([]);

  // Carga inicial asíncrona robusta
  useEffect(() => {
    const loadData = async () => {
      console.log("🔄 Iniciando carga de datos AT en Dashboard...");
      try {
        const data = await syncFromDB("AT");
        if (data && data.length > 0) {
          setRawData([...data]); // Nueva referencia para forzar render
          console.log(`✅ Dashboard actualizado con ${data.length} registros.`);
        } else {
          // Fallback si syncFromDB retorna vacío pero la memoria ya tenía algo (raro en refresh, común en nav)
          if (dataAT.length > 0) setRawData([...dataAT]);
        }
      } catch (e) {
        console.error("Error cargando dashboard:", e);
      }
    };
    loadData();
  }, []);


  const [filters, setFilters] = useState({
    departamento: "",
    ciudad: "",
    regional: "",
    anio: "",
    mes: "",
    grupoEmpresarial: "",
    empresa: "",
    centroCosto: "",
    tipoVinculacion: ""
  });

  const REGIONES_LIST = useMemo(() => {
    const allRegions = new Set();
    Object.values(REGIONALES).forEach(cities => {
      Object.values(cities).forEach(reg => allRegions.add(reg));
    });
    return Array.from(allRegions);
  }, []);

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("userRole");
    const entity = localStorage.getItem("userEntity");
    setUserName(name || "Usuario");
    setUserRole(role || "");
    setUserEntity(entity || "");

    if (entity) {
      setFilters(prev => ({ ...prev, empresa: entity }));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

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
    if (!filters.regional) return Object.keys(DEPARTAMENTOS_COLOMBIA);
    return Object.keys(DEPARTAMENTOS_COLOMBIA).filter(dpto => {
      const citiesMap = REGIONALES[dpto];
      if (!citiesMap) return false;
      return Object.values(citiesMap).some(reg => reg === filters.regional);
    });
  }, [filters.regional]);

  const ciudadesDisponibles = useMemo(() => {
    if (!filters.departamento) return [];
    return DEPARTAMENTOS_COLOMBIA[filters.departamento] || [];
  }, [filters.departamento]);

  const filteredData = useMemo(() => {
    return rawData.filter((item) => {
      const matchDepto = !filters.departamento || item.departamento === filters.departamento;
      const matchCiudad = !filters.ciudad || item.ciudad === filters.ciudad;
      const matchAnio = !filters.anio || item.anio === filters.anio;
      const matchMes = !filters.mes || item.mes === filters.mes;
      const matchGrupo = !filters.grupoEmpresarial || item.grupoEmpresarial === filters.grupoEmpresarial;

      const regionItem = getRegional(item.departamento, item.ciudad);
      const matchRegional = !filters.regional || regionItem === filters.regional;
      const matchEmpresa = userEntity ? item.empresa === userEntity : (!filters.empresa || item.empresa === filters.empresa);
      const matchCentroCosto = !filters.centroCosto || item.centroCosto === filters.centroCosto;
      const matchTipoVinculacion = !filters.tipoVinculacion || item.tipoVinculacion === filters.tipoVinculacion;

      return matchDepto && matchCiudad && matchAnio && matchMes && matchGrupo && matchEmpresa && matchRegional && matchCentroCosto && matchTipoVinculacion;
    });
  }, [filters, userEntity, rawData]);

  const datosBase = useMemo(() => {
    let trabajadores = 0;
    let horas = 0;
    if (filters.empresa && dataWorkers[filters.empresa]) {
      trabajadores = dataWorkers[filters.empresa].trabajadores;
      horas = dataWorkers[filters.empresa].horas;
    } else {
      Object.values(dataWorkers).forEach(d => {
        trabajadores += d.trabajadores || 0;
        horas += d.horas || 0;
      });
    }
    return { trabajadores, horas };
  }, [filters.empresa, dataWorkers]);

  const indicadores = useMemo(() => {
    // Usar datosBase para los cálculos de tasas
    const totalTrabajadores = datosBase.trabajadores || 1;
    const eventosMes = filteredData.length;
    const diasIncapacidad = filteredData.reduce((acc, curr) => acc + (Number(curr.diasIncapacidad) || 0), 0);
    const fatalidades = filteredData.filter(i => i.severidad === "Fatal").length;

    const IF = ((eventosMes / totalTrabajadores) * 100).toFixed(2);
    const IS = ((diasIncapacidad / totalTrabajadores) * 100).toFixed(2);
    const Mortalidad = eventosMes > 0 ? ((fatalidades / eventosMes) * 100).toFixed(2) : "0.00";

    return { IF, IS, Mortalidad, fatalidades, eventosMes };
  }, [filteredData, datosBase]); // Depend on datosBase now

  const metaStatus = useMemo(() => {
    const currentYearStr = filters.anio || new Date().getFullYear().toString();
    const prevYearStr = (parseInt(currentYearStr) - 1).toString();

    const countAccidentsByYear = (yearStr) => {
      return rawData.filter(item => {
        if (item.anio !== yearStr) return false;
        const matchDepto = !filters.departamento || item.departamento === filters.departamento;
        const matchCiudad = !filters.ciudad || item.ciudad === filters.ciudad;
        const matchGrupo = !filters.grupoEmpresarial || item.grupoEmpresarial === filters.grupoEmpresarial;
        const regionItem = getRegional(item.departamento, item.ciudad);
        const matchRegional = !filters.regional || regionItem === filters.regional;
        const matchEmpresa = userEntity ? item.empresa === userEntity : (!filters.empresa || item.empresa === filters.empresa);
        return matchDepto && matchCiudad && matchGrupo && matchRegional && matchEmpresa;
      }).length;
    };

    const countCurrent = countAccidentsByYear(currentYearStr);
    const countPrev = countAccidentsByYear(prevYearStr);

    // Usar el worker count del contexto actual como aproximación
    const totalWorkers = datosBase.trabajadores || 1;

    // Formula de Tasa de Accidentalidad: (Número de eventos / Total trabajadores) * 100
    // Calculamos para el año Anterior (que servirá de Meta) y el Actual
    const ratePrev = (countPrev / totalWorkers) * 100;
    const rateCurrent = (countCurrent / totalWorkers) * 100;

    // Meta: Tasa del año anterior. Cumple si la tasa actual es <= a la anterior.
    const IF_Meta = ratePrev.toFixed(2);

    // Determinar si cumple (reducir o mantener tasa)
    const cumple = rateCurrent <= ratePrev;
    const alRas = Math.abs(rateCurrent - ratePrev) < 0.01;

    return {
      IF_Meta: `${IF_Meta}%`,
      cumple,
      alRas,
      labelYear: `Meta (vs ${prevYearStr})`
    };
  }, [filters, userEntity, datosBase, rawData]);

  const dataByEmpresa = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      acc[curr.empresa] = (acc[curr.empresa] || 0) + 1;
      return acc;
    }, {});

    let data = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    if (data.length > 10) {
      const top10 = data.slice(0, 10);
      const others = data.slice(10).reduce((acc, curr) => acc + curr.value, 0);
      data = [...top10, { name: "Otros", value: others }];
    }
    return data;
  }, [filteredData]);

  const dataByEstado = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      const estado = curr.estadoCaso || "Desconocido";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    // Convert directly to array for PieChart
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

  }, [filteredData]);

  const dataBySeveridad = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      acc[curr.severidad] = (acc[curr.severidad] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const dataByGenero = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      acc[curr.genero] = (acc[curr.genero] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const dataCaracterizacion = useMemo(() => {
    const counts = filteredData.reduce((acc, curr) => {
      const val = curr[caracterizacionMode] || "Sin Datos";
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [filteredData, caracterizacionMode]);

  const mapData = useMemo(() => {
    const counts = {};
    filteredData.forEach(item => {
      if (item.departamento) counts[item.departamento] = (counts[item.departamento] || 0) + 1;
    });
    return counts;
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
      // Excel serial date detection (commonly between 30000 and 60000 for recent years)
      if (!isNaN(str) && Number(str) > 10000) {
        const serial = Number(str);
        // Convert Excel serial to JS MS, adjusting for local timezone offset to avoid day shifts
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
      const t = parseDate(item.fechaAT);
      // Deadline is strictly 15 calendar days max. Plazo interno de Colsanitas es de 10 días para gestión (colores).
      const deadline = t ? t + (15 * 24 * 60 * 60 * 1000) : 0;
      let remaining = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : 0;

      if (remaining > 15) remaining = 15;
      if (remaining < 0) remaining = 0;

      return {
        ...item,
        daysRemaining: remaining,
        originalMs: t,
        dueDateStr: deadline ? formatDate(deadline) : "N/D"
      };
    });

    const currentYearStr = new Date().getFullYear().toString();

    let openCases = withDays.filter(item => {
      const isCurrentYear = item.anio === currentYearStr || (item.originalMs && new Date(item.originalMs).getFullYear().toString() === currentYearStr);
      return !isClosed(item.estadoCaso) && item.daysRemaining >= 1 && isCurrentYear;
    });

    // Sort ascending by remaining days (1 day, 2 days, etc.)
    openCases.sort((a, b) => a.daysRemaining - b.daysRemaining);

    if (openCases.length > 0) {
      return openCases.slice(0, 15);
    } else {
      let allCases = withDays.filter(item => {
        const isCurrentYear = item.anio === currentYearStr || (item.originalMs && new Date(item.originalMs).getFullYear().toString() === currentYearStr);
        return item.daysRemaining >= 1 && isCurrentYear;
      });
      allCases.sort((a, b) => a.daysRemaining - b.daysRemaining);
      return allCases.slice(0, 15);
    }
  }, [filteredData]);

  return (
    <div style={{ padding: "30px", backgroundColor: "#F7FAFC", minHeight: "100vh" }}>
      {/* Header Interactivo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--colsanitas-blue)", fontWeight: "800", textShadow: "1px 1px 2px rgba(0,0,0,0.1)" }}>Panel de Control AT</h2>
          <p style={{ margin: "5px 0 0", color: "#718096", fontSize: "14px" }}>Bienvenido, <strong>{userName}</strong> ({userRole})</p>
        </div>
        <button className="btn-colsanitas btn-outline" onClick={handleLogout} style={{ border: "none", color: "#E53E3E", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>

      {/* RF03: Filtros */}
      <div className="card" style={{ padding: "24px", marginBottom: "30px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showFilters ? "20px" : "0", cursor: "pointer" }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#E6FFFA", padding: "8px", borderRadius: "10px" }}>
              <Filter size={20} color="var(--colsanitas-green)" />
            </div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#2D3748" }}>Filtros de Información</h3>
          </div>
          {showFilters ? <ChevronUp size={20} color="#718096" /> : <ChevronDown size={20} color="#718096" />}
        </div>
        {showFilters && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
            <div className="filter-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568", marginBottom: "5px", display: "block" }}>Regional</label>
              <select name="regional" value={filters.regional} onChange={handleFilterChange} className="input-colsanitas" style={{ width: "100%" }}>
                <option value="">Todas</option>
                {REGIONES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568", marginBottom: "5px", display: "block" }}>Departamento</label>
              <select name="departamento" className="input-colsanitas" value={filters.departamento} onChange={handleFilterChange} style={{ width: "100%" }}>
                <option value="">Todos</option>
                {departamentosDisponibles.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568", marginBottom: "5px", display: "block" }}>Ciudad</label>
              <select name="ciudad" className="input-colsanitas" value={filters.ciudad} onChange={handleFilterChange} disabled={!filters.departamento} style={{ width: "100%" }}>
                <option value="">Todas</option>
                {ciudadesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568", marginBottom: "5px", display: "block" }}>Año</label>
              <select name="anio" className="input-colsanitas" value={filters.anio} onChange={handleFilterChange} style={{ width: "100%" }}>
                <option value="">Todos</option>
                {["2022", "2023", "2024", "2025", "2026"].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568", marginBottom: "5px", display: "block" }}>Mes</label>
              <select name="mes" className="input-colsanitas" value={filters.mes} onChange={handleFilterChange} style={{ width: "100%" }}>
                <option value="">Todos</option>
                {LISTA_MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568", marginBottom: "5px", display: "block" }}>Empresa</label>
              <select name="empresa" className="input-colsanitas" value={filters.empresa} onChange={handleFilterChange} disabled={!!userEntity} style={{ width: "100%" }}>
                <option value="">Todas</option>
                {[
                  "COLLECTIVE SAS", "CENTRO MÉDICO", "EPS COLSANITAS", "ESTRATÉGICOS 360 SAS",
                  "CLÍNICA DENTAL KERALTY", "COMPAÑÍA DE MEDICINA PREPAGADA COLSANITAS", "CLÍNICA COLSANITAS",
                  "CENTROS MÉDICOS COLSANITAS SAS", "SEGUROS COLSANITAS", "YAZAKI CIEMEL SA", "INDUSTRIAL GOYA INCOL SAS"
                ].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568", marginBottom: "5px", display: "block" }}>Centro de Costo</label>
              <select name="centroCosto" className="input-colsanitas" value={filters.centroCosto} onChange={handleFilterChange} style={{ width: "100%" }}>
                <option value="">Todos</option>
                {["Administrativo", "Operativo", "Comercial", "Logística", "Mantenimiento", "Producción"].map(cc => <option key={cc} value={cc}>{cc}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#4A5568", marginBottom: "5px", display: "block" }}>Tipo de Vinculación</label>
              <select name="tipoVinculacion" className="input-colsanitas" value={filters.tipoVinculacion} onChange={handleFilterChange} style={{ width: "100%" }}>
                <option value="">Todos</option>
                {["Dependiente", "Independiente", "Aprendiz", "Estudiante"].map(tv => <option key={tv} value={tv}>{tv}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn-colsanitas-outline" onClick={() => setFilters({ departamento: "", ciudad: "", anio: "", mes: "", grupoEmpresarial: "", empresa: "", regional: "", centroCosto: "", tipoVinculacion: "" })} style={{ width: "100%", justifyContent: "center", height: "42px" }}>
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RF-NEW: Datos Base para Cálculos */}
      <div className="card" style={{ backgroundColor: "#FFF7ED", border: "1px solid #FDBA74", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <h3 style={{ fontSize: "15px", color: "#9A3412", marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px", padding: "10px 15px", borderBottom: "1px solid #FDBA74", margin: 0, backgroundColor: "#FFEDD5", borderRadius: "12px 12px 0 0" }}>
          <div style={{ background: "rgba(255,255,255,0.5)", padding: "4px", borderRadius: "6px" }}>
            <Settings size={18} color="#C2410C" />
          </div>
          Datos Base para Cálculos (Dinámicos según Filtro): <span style={{ fontWeight: "400", fontSize: "13px", marginLeft: "5px", color: "#C2410C" }}>Cálculo de Indicadores: (Cantidad de registros / Cantidad de Trabajadores) * 100</span>
        </h3>
        <div style={{ padding: "20px", display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "0 1 auto" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "#9A3412", marginBottom: "8px" }}>Total Trabajadores:</label>
            <div style={{
              backgroundColor: "#E2E8F0",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #CBD5E0",
              color: "#1A202C",
              fontWeight: "700",
              fontSize: "18px",
              textAlign: "center",
              minWidth: "120px"
            }}>
              {datosBase.trabajadores.toLocaleString()}
            </div>
          </div>
          <div style={{ flex: "0 1 auto" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "800", color: "#9A3412", marginBottom: "8px" }}>Horas Hombre Trabajadas:</label>
            <div style={{
              backgroundColor: "#E2E8F0",
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #CBD5E0",
              color: "#1A202C",
              fontWeight: "700",
              fontSize: "18px",
              textAlign: "center",
              minWidth: "120px"
            }}>
              {datosBase.horas.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Alerta Investigaciones por Vencer RF09 */}
      <div className="card" style={{ backgroundColor: "#FFFBEB", border: "1px solid #FBD38D", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 15px", borderBottom: showInvestigaciones ? "1px solid #FBD38D" : "none", backgroundColor: "#FFFAF0", borderRadius: showInvestigaciones ? "12px 12px 0 0" : "12px", cursor: "pointer" }}
          onClick={() => setShowInvestigaciones(!showInvestigaciones)}
        >
          <h3 style={{ fontSize: "15px", color: "#975A16", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={18} />
            Investigaciones Próximas a Vencer (Plazo 10 días)
          </h3>
          {showInvestigaciones ? <ChevronUp size={20} color="#975A16" /> : <ChevronDown size={20} color="#975A16" />}
        </div>
        {showInvestigaciones && (
          <div style={{ padding: "0 15px 15px 15px", paddingTop: "15px" }}>
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
                {alertasInvestigacion.map((item, idx) => (
                  <tr key={idx} style={{ backgroundColor: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <td style={{ padding: "12px", borderRadius: "8px 0 0 8px" }}>
                      <span style={{
                        // Colsanitas internal deadline is 10 days, so out of 15 days, if 5 or less remaining -> RED
                        // if 6 to 8 remaining -> YELLOW
                        // otherwise -> GREEN
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
                    <td style={{ padding: "12px", fontWeight: "500" }}>{item.apellidosNombres || "PENDIENTE"}</td>
                    <td style={{ padding: "12px" }}>{item.empresa}</td>
                    <td style={{ padding: "12px", borderRadius: "0 8px 8px 0" }}>
                      <span style={{ backgroundColor: "#FEF2F2", color: "#991B1B", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", border: "1px solid #FECACA" }}>{item.estadoCaso}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RF02 & RF13: Indicadores Clave */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "25px", marginBottom: "30px" }}>
        {[
          { title: "Tasa de Frecuencia", value: indicadores.IF, sub: `${indicadores.eventosMes} accidentes`, icon: Users, color: "var(--colsanitas-blue)", border: "#4299E1" },
          { title: "Tasa de Severidad", value: indicadores.IS, sub: "Días perdidos global", icon: TrendingDown, color: "var(--colsanitas-light-green)", border: "#48BB78" },
          { title: "Tasa de Fatalidad", value: `${indicadores.Mortalidad}%`, sub: `${indicadores.fatalidades} fatales`, icon: AlertCircle, color: indicadores.fatalidades > 0 ? "#E53E3E" : "#48BB78", border: indicadores.fatalidades > 0 ? "#E53E3E" : "#48BB78" }
        ].map((kpi, idx) => (
          <div key={idx} className="card" style={{
            textAlign: "center",
            borderLeft: `6px solid ${kpi.border}`,
            padding: "25px 15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            borderRadius: "12px",
            transform: "translateY(0)",
            transition: "transform 0.2s",
            cursor: "default"
          }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ background: `${kpi.color}15`, width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px" }}>
              <kpi.icon size={28} color={kpi.color} />
            </div>
            <div style={{ fontSize: "14px", color: "#718096", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.title}</div>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#2D3748", margin: "10px 0" }}>{kpi.value}</div>
            <div style={{ fontSize: "13px", color: "#A0AEC0" }}>{kpi.sub}</div>
          </div>
        ))}

        <div className="card" style={{
          textAlign: "center",
          backgroundColor: metaStatus.cumple ? "#F0FFF4" : (metaStatus.alRas ? "#FFFFF0" : "#FFF5F5"),
          borderLeft: `6px solid ${metaStatus.cumple ? "#48BB78" : (metaStatus.alRas ? "#ECC94B" : "#E53E3E")}`,
          padding: "25px 15px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          borderRadius: "12px"
        }}>
          <div style={{ background: metaStatus.cumple ? "#C6F6D5" : "#FED7D7", width: "50px", height: "50px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 15px" }}>
            <TrendingDown size={28} color={metaStatus.cumple ? "#2F855A" : "#C53030"} />
          </div>
          <div style={{ fontSize: "14px", color: "#718096", fontWeight: "600", textTransform: "uppercase" }}>Cumplimiento Meta</div>
          <div style={{ fontSize: "32px", fontWeight: "800", color: "#2D3748", margin: "10px 0" }}>{metaStatus.IF_Meta}</div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: metaStatus.cumple ? "#2F855A" : "#C53030", padding: "4px 10px", borderRadius: "10px", background: "rgba(255,255,255,0.5)", display: "inline-block" }}>
            {metaStatus.labelYear}
          </div>
        </div>
      </div>

      {/* RF04: Gráficos Dinámicos Innovadores */}
      {/* AT por Empresa - Full Width para dar espacio */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px", marginBottom: "30px" }}>
        <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px", color: "#2D3748" }}>
            <div style={{ background: "#E6FFFA", padding: "6px", borderRadius: "8px" }}><Users size={20} color="var(--colsanitas-green)" /></div>
            Top Empresas con Accidentes
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dataByEmpresa} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#008D4C" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#97C01E" stopOpacity={0.8} />
                </linearGradient>
                <filter id="shadowBar" height="130%">
                  <feDropShadow dx="3" dy="3" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 13, fill: "#2D3748", fontWeight: "500" }} interval={0} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="url(#barGradient)" radius={[0, 10, 10, 0]} barSize={25} style={{ filter: "url(#shadowBar)" }}>
                <LabelList dataKey="value" position="right" style={{ fontSize: "14px", fontWeight: "bold", fill: "#4A5568" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <DataTable data={dataByEmpresa} columns={["Nombre", "Cantidad"]} />
        </div>
      </div>

      {/* Progreso de Casos y Otros PieCharts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "30px", marginBottom: "30px" }}>
        {/* Progreso de Casos - Ahora con PieChart/Donut y colores variados */}
        <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px", color: "#2D3748" }}>
            <div style={{ background: "#E6FFFA", padding: "6px", borderRadius: "8px" }}><FileText size={20} color="var(--colsanitas-green)" /></div>
            Progreso de Casos
          </h3>
          <ResponsiveContainer width="100%" height={450}>
            <PieChart>
              <defs>
                <filter id="shadow" height="130%">
                  <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.2)" />
                </filter>
              </defs>
              <Pie
                data={dataByEstado}
                cx="50%"
                cy="40%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                style={{ filter: "url(#shadow)" }}
                stroke="none"
              >
                {dataByEstado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_VARIED[index % COLORS_VARIED.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend layout="vertical" verticalAlign="bottom" align="center" height={140} wrapperStyle={{ fontSize: "12px", fontWeight: "600", bottom: 20 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginBottom: "20px" }}></div>
          <DataTable data={dataByEstado} columns={["Nombre", "Cantidad"]} />
        </div>

        {/* Severidad y Género - Donut Charts Modernos */}
        <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", margin: 0, fontWeight: "700", color: "#2D3748" }}>Distribución por Severidad y Género</h3>
          </div>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "space-around" }}>
            <div style={{ flex: "1 1 300px", minWidth: "250px" }}>
              <div style={{ height: 260, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataBySeveridad}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      style={{ filter: "url(#shadowBar)" }}
                      stroke="none"
                    >
                      {dataBySeveridad.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_SEVERITY[index % COLORS_SEVERITY.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: "absolute",
                  top: "43%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "13px",
                  color: "#2D3748",
                  textAlign: "center",
                  fontWeight: "700",
                  pointerEvents: "none",
                  textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                }}>
                  Severidad
                </div>
              </div>
              <DataTable data={dataBySeveridad} columns={["Nombre", "Cantidad"]} />
            </div>

            <div style={{ flex: "1 1 300px", minWidth: "250px" }}>
              <div style={{ height: 260, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataByGenero}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      style={{ filter: "url(#shadowBar)" }}
                      stroke="none"
                    >
                      {dataByGenero.map((entry, index) => {
                        const name = (entry.name || "").toString().toLowerCase();
                        let color = "#A0AEC0"; // Default Gray
                        if (name.includes("masculino") || name === "m") color = "#3182CE"; // Blue
                        else if (name.includes("femenino") || name === "f") color = "#D53F8C"; // Pink
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  position: "absolute",
                  top: "43%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "13px",
                  color: "#2D3748",
                  textAlign: "center",
                  fontWeight: "700",
                  pointerEvents: "none",
                  textShadow: "0 2px 4px rgba(255,255,255,0.8)"
                }}>
                  Género
                </div>
              </div>
              <DataTable data={dataByGenero} columns={["Nombre", "Cantidad"]} />
            </div>
          </div>
        </div>
      </div>

      {/* RF14: Caracterización via PieChart ahora - Full Width */}
      <div className="card" style={{ padding: "24px", marginBottom: "30px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h3 style={{ fontSize: "18px", margin: 0, fontWeight: "700", color: "#2D3748" }}>Caracterización</h3>
          <select className="input-colsanitas" style={{ width: "auto", fontSize: "13px", padding: "8px 12px" }} value={caracterizacionMode} onChange={(e) => setCaracterizacionMode(e.target.value)}>
            <option value="parteCuerpo">Parte del Cuerpo</option>
            <option value="mecanismo">Mecanismo de Lesión</option>
            <option value="agente">Agente Causal</option>
            <option value="sitio">Sitio de la Lesión</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <defs>
              <filter id="shadowPie2" height="130%">
                <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.25)" />
              </filter>
            </defs>
            <Pie
              data={dataCaracterizacion}
              cx="50%"
              cy="50%"
              outerRadius={150}
              dataKey="value"
              style={{ filter: "url(#shadowPie2)" }}
              stroke="white"
              strokeWidth={2}
              label={({ name, percent }) => {
                if (percent < 0.03) return null;
                return `${name.substring(0, 15)}${name.length > 15 ? '..' : ''} (${(percent * 100).toFixed(0)}%)`;
              }}
            >
              {dataCaracterizacion.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_VARIED[index % COLORS_VARIED.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
        <DataTable data={dataCaracterizacion} columns={["Nombre", "Cantidad"]} />
      </div>

      {/* Mapa RF04 */}
      <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ background: "#E6FFFA", padding: "6px", borderRadius: "8px" }}><MapIcon size={20} color="var(--colsanitas-green)" /></div>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#2D3748" }}>Distribución Geográfica de Accidentes</h3>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: "15px", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: 12, height: 12, backgroundColor: "#48BB78", borderRadius: "2px" }} /> Cumple Meta</span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: 12, height: 12, backgroundColor: "#ECC94B", borderRadius: "2px" }} /> Al Ras</span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: 12, height: 12, backgroundColor: "#E53E3E", borderRadius: "2px" }} /> Incumple</span>
          </div>
        </div>
        <div style={{ height: "600px" }}>
          <ColombiaMap data={mapData} title="" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
