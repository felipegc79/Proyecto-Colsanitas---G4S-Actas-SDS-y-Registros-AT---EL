// src/components/DashboardEL.js
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
    LabelList,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { LogOut, Filter, Activity, TrendingDown, Users, FileText, Map as MapIcon, ChevronDown, ChevronUp } from "lucide-react";
import { DEPARTAMENTOS_COLOMBIA, dataEL, loadFromStorage, syncFromDB } from "../data";
import { getRegional, REGIONALES } from "../utils/regionales";
import ColombiaMap from "./ColombiaMap";


const COLORS_VARIED = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57"];
const COLORS_SEVERITY = ["#005f33", "#003366", "#6e8f17", "#b3861c", "#991616"];

const LISTA_MESES = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

// Custom Tooltip con estilo Glassmorphism (Reused from Dashboard.js)
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

const DashboardEL = ({ dataWorkers }) => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("Usuario");
    const [userRole, setUserRole] = useState("");
    const [userEntity, setUserEntity] = useState("");
    const [showFilters, setShowFilters] = useState(true);

    // Cargar datos de EL desde IndexedDB (async)
    const [rawData, setRawData] = useState([]);

    useEffect(() => {
        const load = async () => {
            const data = await syncFromDB("EL");
            if (data && data.length > 0) setRawData([...data]);
            else if (dataEL.length > 0) setRawData([...dataEL]);
        };
        load();
    }, []);

    const [filters, setFilters] = useState({
        regional: "",
        departamento: "",
        ciudad: "",
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

    // Filtrado
    const filteredData = useMemo(() => {
        return rawData.filter((item) => {
            // Note: In EL data, departamento is not explicitly in the top level in our new schema, 
            // but 'ciudad' is. We might need to infer department from city or just filter by city if department is selected.
            // For simplicity, we will filter by City if selected.
            // If we want accurate Department filtering, we would need to look up the city in the DEPARTAMENTOS_COLOMBIA map.

            // In data.js, we added 'departamento' to dataEL for convenience
            const dept = item.departamento;
            const regionItem = getRegional(dept, item.ciudad);

            const matchRegional = !filters.regional || regionItem === filters.regional;
            const matchDepto = !filters.departamento || dept === filters.departamento;
            const matchCiudad = !filters.ciudad || item.ciudad === filters.ciudad;
            const matchAnio = !filters.anio || item.anio === filters.anio;
            const matchMes = !filters.mes || item.mes === filters.mes;
            const matchGrupo = !filters.grupoEmpresarial || item.grupoEmpresarial === filters.grupoEmpresarial;
            const matchEmpresa = userEntity ? item.empresa === userEntity : (!filters.empresa || item.empresa === filters.empresa);
            const matchCentroCosto = !filters.centroCosto || item.centroCosto === filters.centroCosto;
            const matchTipoVinculacion = !filters.tipoVinculacion || item.tipoVinculacion === filters.tipoVinculacion;

            return matchRegional && matchDepto && matchCiudad && matchAnio && matchMes && matchGrupo && matchEmpresa && matchCentroCosto && matchTipoVinculacion;
        });
    }, [filters, userEntity, rawData]);

    // Flatten Diagnoses for charts
    const allDiagnoses = useMemo(() => {
        return filteredData.flatMap(r => r.diagnosticos || []);
    }, [filteredData]);

    // Indicadores
    const indicadores = useMemo(() => {
        const numCasos = filteredData.length;
        const numCalificados = filteredData.filter(i =>
            i.estadoCaso === "Calificado" ||
            i.poOrigenCalificado ||
            i.jrOrigenCalificado ||
            i.jnOrigenCalificado ||
            i.origenPrimeraOportunidad ||
            (i.origenActual && i.origenActual !== "Sin información")
        ).length;
        const numDiagnosticos = allDiagnoses.filter(d => d.cie10 || d.descripcion).length;

        return { numCasos, numCalificados, numDiagnosticos };
    }, [filteredData, allDiagnoses]);

    // Helpers para gráficas
    const getChartData = (key, useDiagnoses = false, { limit = 0, sort = false } = {}) => {
        const source = useDiagnoses ? allDiagnoses : filteredData;
        const counts = source.reduce((acc, curr) => {
            let actualKey = key;
            if (key === 'diagnosticosReconocidos') actualKey = 'descripcion';

            const val = curr[actualKey] || "Sin Dato";
            // Filter out empty diagnoses if we are looking at diagnosis data
            if (useDiagnoses && val === "Sin Dato" && !curr.cie10 && !curr.descripcion) return acc;

            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        let result = Object.entries(counts).map(([name, value]) => ({ name, value }));
        if (sort) result.sort((a, b) => b.value - a.value);
        if (limit > 0 && result.length > limit) {
            const top = result.slice(0, limit);
            const othersCount = result.slice(limit).reduce((s, i) => s + i.value, 0);
            if (othersCount > 0) top.push({ name: "Otros", value: othersCount });
            result = top;
        }
        return result;
    };

    const dataMes = getChartData("mes");
    const dataARL = getChartData("arlTraslado");
    const dataSeveridad = getChartData("severidad", true);
    const dataCiudad = getChartData("ciudad", false, { sort: true, limit: 20 });
    const dataLateralidad = getChartData("lateralidad", true);
    const dataDiagnosticos = getChartData("diagnosticosReconocidos", true, { sort: true, limit: 20 });
    const dataSistema = getChartData("sistemaAfectado", true);

    const mapData = useMemo(() => {
        // Mapa inverso Ciudad -> Departamento
        const cityToDepto = {};
        Object.entries(DEPARTAMENTOS_COLOMBIA).forEach(([depto, ciudades]) => {
            ciudades.forEach(c => cityToDepto[c.toUpperCase()] = depto);
        });

        const MANUAL_MAPPING = {
            "CALI": "VALLE DEL CAUCA",
            "MEDELLIN": "ANTIOQUIA",
            "BARRANQUILLA": "ATLANTICO",
            "CARTAGENA": "BOLIVAR",
            "BUCARAMANGA": "SANTANDER",
            "CHIA": "CUNDINAMARCA",
            "CALOTO": "CAUCA",
            "SANTA MARTA": "MAGDALENA",
            "VILLAVICENCIO": "META",
            "SOACHA": "CUNDINAMARCA",
            "MANIZALES": "CALDAS",
            "SINCELEJO": "SUCRE",
            "FUSAGASUGA": "CUNDINAMARCA",
            "FUSAGASUGÁ": "CUNDINAMARCA",
            "COTA": "CUNDINAMARCA",
            "IBAGUE": "TOLIMA",
            "BOGOTA D.C.": "BOGOTA",
            "BOGOTÁ D.C.": "BOGOTA",
            "BOGOTA": "BOGOTA"
        };
        Object.assign(cityToDepto, MANUAL_MAPPING);

        const counts = {};
        // Lógica de búsqueda mejorada: Normalización agresiva (Solo letras A-Z)
        const norm = (str) => str ? str.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "") : "";

        // Asegurar que cityToDepto tenga claves normalizadas para búsqueda rápida
        const normalizedMapping = {};
        Object.entries(cityToDepto).forEach(([c, d]) => normalizedMapping[norm(c)] = d);

        // Conjunto de departamentos válidos para validación (Normalizados agresivamente para comparar)
        const validDeptos = new Set(Object.keys(DEPARTAMENTOS_COLOMBIA).map(d => norm(d)));
        validDeptos.add("BOGOTA");
        validDeptos.add("BOGOTADC");

        filteredData.forEach(item => {
            let depto = item.departamento;
            // Validar si el departamento actual es válido (ej: evitar que 'Bucaramanga' pase como depto)
            let deptoNorm = norm(depto);
            const isValid = validDeptos.has(deptoNorm);

            // Si NO es válido o está vacío, inferir desde ciudad
            if ((!depto || !isValid) && item.ciudad) {
                const cInput = norm(item.ciudad);

                // 1. Búsqueda exacta
                let inferred = normalizedMapping[cInput];

                // 2. Búsqueda fuzzy
                if (!inferred) {
                    const match = Object.keys(normalizedMapping).find(key =>
                        (cInput.includes(key) && key.length > 3) ||
                        (key.includes(cInput) && cInput.length > 3)
                    );
                    if (match) inferred = normalizedMapping[match];
                }

                if (inferred) {
                    depto = inferred;
                }
            }

            if (depto) {
                // OJO: Para el mapa usamos el nombre estándar (CON espacios, SIN tildes)
                // NO usar 'norm' aquí porque elimina espacios y rompe nombres como "VALLE DEL CAUCA"
                const kMap = depto.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
                counts[kMap] = (counts[kMap] || 0) + 1;
            }
        });

        return counts;
    }, [filteredData]);



    return (
        <div style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                    <h2 style={{ margin: 0, color: "var(--colsanitas-blue)" }}>Panel de Control EL (Enfermedad Laboral)</h2>
                    <p style={{ margin: 0, color: "#718096", fontSize: "14px" }}>Bienvenido, <strong>{userName}</strong> ({userRole})</p>
                </div>
                <button className="btn-colsanitas btn-outline" onClick={handleLogout} style={{ border: "none", color: "#E53E3E" }}>
                    <LogOut size={18} /> Cerrar Sesión
                </button>
            </div>

            {/* Filtros */}
            <div className="card" style={{ padding: "20px" }}>
                <div
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showFilters ? "20px" : "0", cursor: "pointer" }}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Filter size={18} color="var(--colsanitas-green)" />
                        <h3 style={{ margin: 0, fontSize: "16px" }}>Filtros de Información</h3>
                    </div>
                    {showFilters ? <ChevronUp size={20} color="#718096" /> : <ChevronDown size={20} color="#718096" />}
                </div>
                {showFilters && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "15px" }}>
                        <div className="filter-group">
                            <label style={{ fontSize: "12px", color: "#718096" }}>Regional</label>
                            <select name="regional" className="input-colsanitas" value={filters.regional} onChange={handleFilterChange}>
                                <option value="">Todas</option>
                                {REGIONES_LIST.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: "12px", color: "#718096" }}>Departamento</label>
                            <select name="departamento" className="input-colsanitas" value={filters.departamento} onChange={handleFilterChange}>
                                <option value="">Todos</option>
                                {departamentosDisponibles.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: "12px", color: "#718096" }}>Ciudad</label>
                            <select name="ciudad" className="input-colsanitas" value={filters.ciudad} onChange={handleFilterChange}>
                                <option value="">Todas</option>
                                {ciudadesDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: "12px", color: "#718096" }}>Año</label>
                            <select name="anio" className="input-colsanitas" value={filters.anio} onChange={handleFilterChange}>
                                <option value="">Todos</option>
                                {["2022", "2023", "2024", "2025", "2026"].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: "12px", color: "#718096" }}>Mes</label>
                            <select name="mes" className="input-colsanitas" value={filters.mes} onChange={handleFilterChange}>
                                <option value="">Todos</option>
                                {LISTA_MESES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: "12px", color: "#718096" }}>Empresa</label>
                            <select name="empresa" className="input-colsanitas" value={filters.empresa} onChange={handleFilterChange} disabled={!!userEntity}>
                                <option value="">Todas</option>
                                {[
                                    "COLLECTIVE SAS", "CENTRO MÉDICO", "EPS COLSANITAS", "ESTRATÉGICOS 360 SAS",
                                    "CLÍNICA DENTAL KERALTY", "COMPAÑÍA DE MEDICINA PREPAGADA COLSANITAS", "CLÍNICA COLSANITAS",
                                ].map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: "12px", color: "#718096" }}>Centro de Costo</label>
                            <select name="centroCosto" className="input-colsanitas" value={filters.centroCosto} onChange={handleFilterChange}>
                                <option value="">Todos</option>
                                {["Administrativo", "Operativo", "Comercial", "Logística", "Mantenimiento", "Producción"].map(cc => <option key={cc} value={cc}>{cc}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label style={{ fontSize: "12px", color: "#718096" }}>Tipo de Vinculación</label>
                            <select name="tipoVinculacion" className="input-colsanitas" value={filters.tipoVinculacion} onChange={handleFilterChange}>
                                <option value="">Todos</option>
                                {["Dependiente", "Independiente", "Aprendiz", "Estudiante"].map(tv => <option key={tv} value={tv}>{tv}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-end" }}>
                            <button className="btn-colsanitas" onClick={() => setFilters({ regional: "", departamento: "", ciudad: "", anio: "", mes: "", grupoEmpresarial: "", empresa: userEntity || "", centroCosto: "", tipoVinculacion: "" })} style={{ width: "100%" }}>
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Indicadores */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "24px" }}>
                <div className="card" style={{ textAlign: "center", borderLeft: "5px solid var(--colsanitas-blue)" }}>
                    <Activity size={24} color="var(--colsanitas-blue)" style={{ marginBottom: "10px" }} />
                    <div style={{ fontSize: "14px", color: "#718096" }}>Número de Casos</div>
                    <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--colsanitas-blue)" }}>{indicadores.numCasos}</div>
                </div>
                <div className="card" style={{ textAlign: "center", borderLeft: "5px solid var(--colsanitas-light-green)" }}>
                    <Users size={24} color="var(--colsanitas-light-green)" style={{ marginBottom: "10px" }} />
                    <div style={{ fontSize: "14px", color: "#718096" }}>Personas Calificadas</div>
                    <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--colsanitas-light-green)" }}>{indicadores.numCalificados}</div>
                </div>
                <div className="card" style={{ textAlign: "center", borderLeft: "5px solid #E53E3E" }}>
                    <FileText size={24} color="#E53E3E" style={{ marginBottom: "10px" }} />
                    <div style={{ fontSize: "14px", color: "#718096" }}>Diagnósticos Calificados</div>
                    <div style={{ fontSize: "32px", fontWeight: "700", color: "#E53E3E" }}>{indicadores.numDiagnosticos}</div>
                </div>
            </div>

            {/* Gráficas con Estilo Moderno */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

                {/* Mes de Inicio (Vertical) */}
                <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Mes de Registro/Cobertura</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dataMes}>
                            <defs>
                                <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#004B8D" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#0088FE" stopOpacity={0.8} />
                                </linearGradient>
                                <filter id="shadowBar2" height="130%">
                                    <feDropShadow dx="3" dy="3" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" style={{ fontSize: "10px" }} interval={0} angle={-45} textAnchor="end" height={60} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="url(#barGradientBlue)" radius={[10, 10, 0, 0]} style={{ filter: "url(#shadowBar2)" }}>
                                <LabelList dataKey="value" position="top" style={{ fontSize: "12px", fill: "#4A5568", fontWeight: "bold" }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* ARL Traslado (Horizontal) */}
                <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>ARL que realiza el traslado</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dataARL} layout="vertical" margin={{ left: 20 }}>
                            <defs>
                                <linearGradient id="barGradientGreen" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#008D4C" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#48BB78" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} style={{ fontSize: "11px" }} interval={0} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="url(#barGradientGreen)" radius={[0, 10, 10, 0]} barSize={20} style={{ filter: "url(#shadowBar2)" }}>
                                <LabelList dataKey="value" position="right" style={{ fontSize: "12px", fill: "#4A5568", fontWeight: "bold" }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Severidad (Pie Chart Moderno) */}
                <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Severidad</h3>
                    <div style={{ height: 300, position: "relative" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataSeveridad}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {dataSeveridad.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_SEVERITY[index % COLORS_SEVERITY.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "13px", fontWeight: "700", color: "#2D3748", pointerEvents: "none" }}>
                            Severidad
                        </div>
                    </div>
                </div>

                {/* Ciudad (Horizontal) — Top 20 con scroll */}
                <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Ciudad (Top 20)</h3>
                    <div style={{ maxHeight: 500, overflowY: "auto" }}>
                        <ResponsiveContainer width="100%" height={Math.max(300, dataCiudad.length * 32)}>
                            <BarChart data={dataCiudad} layout="vertical" margin={{ left: 10, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} interval={0} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#D21E1E" radius={[0, 10, 10, 0]} barSize={18} style={{ filter: "url(#shadowBar2)" }}>
                                    <LabelList dataKey="value" position="right" style={{ fontSize: "12px", fill: "#4A5568", fontWeight: "bold" }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lateralidad (Pie Chart) */}
                <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Lateralidad</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dataLateralidad}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                stroke="white"
                                strokeWidth={2}
                            >
                                {dataLateralidad.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_VARIED[index % COLORS_VARIED.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Diagnosticos (Horizontal) — Top 20 con scroll */}
                <div className="card" style={{ padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Diagnósticos Reconocidos (Top 20)</h3>
                    <div style={{ maxHeight: 500, overflowY: "auto" }}>
                        <ResponsiveContainer width="100%" height={Math.max(300, dataDiagnosticos.length * 32)}>
                            <BarChart data={dataDiagnosticos} layout="vertical" margin={{ left: 10, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={200}
                                    tick={{ fontSize: 10 }}
                                    interval={0}
                                    tickFormatter={(v) => v.length > 30 ? v.substring(0, 28) + "…" : v}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" fill="#63666A" radius={[0, 10, 10, 0]} barSize={18} style={{ filter: "url(#shadowBar2)" }}>
                                    <LabelList dataKey="value" position="right" style={{ fontSize: "12px", fill: "#4A5568", fontWeight: "bold" }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sistema Afectado (Vertical) */}
                <div className="card" style={{ gridColumn: "1 / -1", padding: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Sistema Afectado</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dataSistema}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" style={{ fontSize: "11px" }} />
                            <YAxis type="number" domain={[0, dataMax => Math.ceil(dataMax * 1.2)]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="#97C01E" radius={[10, 10, 0, 0]} barSize={40} style={{ filter: "url(#shadowBar2)" }}>
                                <LabelList dataKey="value" position="top" style={{ fontSize: "12px", fill: "#4A5568", fontWeight: "bold" }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Mapa de Distribución Geográfica (Nuevo) */}
            <div className="card" style={{ padding: "24px", marginTop: "24px", borderRadius: "16px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                    <div style={{ background: "#E6FFFA", padding: "6px", borderRadius: "8px" }}><MapIcon size={20} color="var(--colsanitas-green)" /></div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#2D3748" }}>Distribución Geográfica de Enfermedades Laborales</h3>
                </div>
                <div style={{ height: "600px" }}>
                    <ColombiaMap
                        data={mapData}
                        title=""
                        thresholds={{ high: 99, medium: 50 }}
                    />
                </div>
            </div>

        </div>
    );
};

export default DashboardEL;
