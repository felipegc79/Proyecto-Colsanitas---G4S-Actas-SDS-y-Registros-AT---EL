import React, { useState, useMemo, useRef, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import colombiaGeo from "../colombia.json";
import * as XLSX from "xlsx";

// --- COMPONENTES VISUALES COMPARTIDOS ---

const FilterInput = ({ label, value, onChange, options = null }) => (
  <div className="flex flex-col">
    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1">
      {label}
    </label>
    {options ? (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
        placeholder="Buscar..."
      />
    )}
  </div>
);

// --- CARD SDS ---
const SdsCard = ({ item, onSelect }) => {
  const horasPlaneadas = Number(item.HorasPlaneadas) || 0;
  const horasEjecutadas = Number(item.HorasEjecutadas) || 0;
  const horasPendientes = Math.max(0, horasPlaneadas - horasEjecutadas);

  const isPending = item.Estado === "Programada";
  const labelEjecutadas = isPending ? "Acumulado" : "En esta Acta";

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-3 active:bg-gray-50 transition-all cursor-pointer relative overflow-hidden group"
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPending ? "bg-blue-500" : "bg-green-500"
          }`}
      ></div>

      <div className="pl-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {item.IsChildAct
                ? `ACTA DE SDS #${item.ParentSDS}`
                : `SDS #${item.SDS}`}
            </span>
            <h3 className="text-base font-bold text-blue-900 leading-tight mt-1 line-clamp-2">
              {item.Cliente}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Prov: {item.Proveedor}</p>
          </div>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${isPending
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
              }`}
          >
            {item.Estado}
          </span>
        </div>

        <div className="space-y-1 mt-2 mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-gray-700">📅 Fecha:</span>{" "}
            {item.FechaProgramada}
          </p>
          <p className="text-sm text-gray-600 truncate">
            <span className="font-bold text-gray-700">📋 Actividad:</span>{" "}
            {item.Actividad}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 border border-gray-100 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-gray-500">
              {isPending ? "Progreso General" : "Detalle Ejecución"}
            </span>
            <span className="text-gray-400 font-medium">
              Meta: {horasPlaneadas}h
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border border-green-200 rounded px-2 py-1 flex flex-col items-center">
              <span className="text-[10px] text-green-600 font-bold uppercase">
                {labelEjecutadas}
              </span>
              <span className="text-sm font-extrabold text-gray-800">
                {horasEjecutadas}h
              </span>
            </div>
            {isPending && (
              <>
                <span className="text-gray-300">/</span>
                <div
                  className={`flex-1 bg-white border rounded px-2 py-1 flex flex-col items-center ${horasPendientes > 0
                    ? "border-orange-200"
                    : "border-gray-200"
                    }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase ${horasPendientes > 0 ? "text-orange-600" : "text-gray-400"
                      }`}
                  >
                    Pendientes
                  </span>
                  <span className="text-sm font-extrabold text-gray-800">
                    {horasPendientes}h
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="absolute right-4 bottom-4 text-gray-300 group-hover:text-blue-500 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// --- ACORDEÓN ---
const AccordionSection = ({
  title,
  count,
  isOpen,
  onToggle,
  children,
  iconColor,
  iconSvg,
}) => (
  <div className="mb-4">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor} shadow-sm`}
        >
          {iconSvg}
        </div>
        <div className="text-left">
          <h2 className="text-base font-bold text-gray-800">
            {title}{" "}
            <span className="text-gray-500 font-normal ml-1">({count})</span>
          </h2>
        </div>
      </div>
      <div
        className={`text-gray-400 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""
          }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          )}
        </svg>
      </div>
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[3000px] mt-3" : "max-h-0"
        }`}
    >
      {children}
    </div>
  </div>
);

// --- GRÁFICOS SIMPLES ---
const SimpleBarChart = ({ data }) => {
  if (data.length === 0)
    return <p className="text-xs text-gray-400 py-4 text-center">Sin datos.</p>;
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-4 mt-4 px-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center text-xs group">
          <div
            className="w-32 truncate font-bold text-gray-600 mr-3 group-hover:text-blue-700 transition-colors"
            title={item.label}
          >
            {item.label}
          </div>
          <div className="flex-1 h-5 bg-gray-200 rounded-full shadow-[inset_0px_2px_4px_rgba(0,0,0,0.2)] overflow-hidden relative">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(item.value / maxVal) * 100}%`,
                background: "linear-gradient(180deg, #34d399 0%, #059669 100%)",
                boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.4), inset 0px -2px 4px rgba(0,0,0,0.2)"
              }}
            ></div>
          </div>
          <div className="w-10 text-right font-black text-gray-800 ml-2">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const VerticalBarChart = ({ data }) => {
  if (data.length === 0)
    return <p className="text-xs text-gray-400 py-4 text-center">Sin datos.</p>;
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="h-56 flex items-end justify-between gap-3 mt-4 px-4 border-b-2 border-gray-200 pb-2">
      {data.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center flex-1 group relative h-full justify-end"
        >
          <div className="absolute bottom-[105%] mb-2 text-xs font-bold bg-blue-900 text-white px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {item.label}: {item.value}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-900"></div>
          </div>
          <div className="w-full relative flex items-end h-[140px]">
            {/* Contenedor del cilindro 3D */}
            <div
              className="w-full relative mx-auto transition-all duration-700 ease-in-out group-hover:brightness-110"
              style={{
                height: `${(item.value / maxVal) * 100}%`,
                minHeight: '10px' // Para que el de 0 o valores muy chicos al menos se note como base
              }}
            >
              {/* Tapa superior del cilindro */}
              <div className="absolute top-0 left-0 w-full h-3 bg-blue-300 rounded-[50%] -translate-y-1/2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] z-10"></div>
              {/* Cuerpo del cilindro */}
              <div
                className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-r from-blue-700 via-blue-500 to-blue-800"
                style={{
                  borderBottomLeftRadius: '50% 12px',
                  borderBottomRightRadius: '50% 12px',
                  boxShadow: '-4px 0px 8px rgba(0,0,0,0.1) inset, 4px 0px 8px rgba(255,255,255,0.2) inset, 0px 10px 15px -3px rgba(0,0,0,0.3)'
                }}
              ></div>
            </div>
          </div>
          <span
            className="text-[10px] text-gray-600 mt-4 font-bold truncate w-full text-center uppercase tracking-wider"
            title={item.label}
          >
            {item.label}
          </span>
          <span className="text-xs font-black text-blue-900 mt-1">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const PieChart = ({ data }) => {
  if (data.length === 0)
    return <p className="text-xs text-gray-400 py-4 text-center">Sin datos.</p>;
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;
  const gradientString = data
    .map((item) => {
      const start = cumulativePercent;
      const percent = (item.value / total) * 100;
      cumulativePercent += percent;
      return `${item.color} ${start}% ${cumulativePercent}%`;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-8 mt-6 justify-center">
      <div className="relative group perspective-1000">
        <div
          className="w-36 h-36 rounded-full border-[6px] border-white cursor-pointer transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:rotate-6"
          style={{
            background: `conic-gradient(${gradientString})`,
            boxShadow: '10px 10px 20px rgba(0,0,0,0.3), inset -5px -5px 15px rgba(0,0,0,0.2), inset 5px 5px 15px rgba(255,255,255,0.4)',
          }}
        >
          {/* Brillo estilo esfera 3D */}
          <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
        </div>
        {/* Sombra base */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-black/20 rounded-[50%] blur-md transition-all duration-500 group-hover:w-20"></div>
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center text-xs bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div
              className="w-4 h-4 rounded-full mr-3 shadow-inner"
              style={{ backgroundColor: item.color, border: '1px solid rgba(0,0,0,0.1)' }}
            ></div>
            <span className="text-gray-700 font-bold uppercase tracking-wider text-[10px] w-32 border-r border-gray-200">{item.label}</span>
            <span className="ml-3 font-black text-blue-900 text-sm">{item.value}</span>
            <span className="ml-2 text-[10px] text-gray-400">({((item.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTE MAPA DE COLOMBIA ---
const ColombiaMap = ({ data }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Normalización para que coincidan los nombres (ignora tildes y mayúsculas)
  const normalizeName = (name) => {
    if (!name) return "";
    let str = name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar tildes
      .trim();

    // Estandarización forzosa para evitar cualquier discrepancia de la B.D con el GeoJSON
    if (str.includes("bogota") || str.includes("santafe de bogota")) return "bogota";
    if (str.includes("valle del cauca")) return "valle del cauca";
    if (str === "san andres" || str.includes("providencia")) return "san andres y providencia";
    return str;
  };

  const handleMouseEnter = (geo, e) => {
    // EN EL ARCHIVO LOCAL, EL NOMBRE ES "NOMBRE_DPT"
    const deptName = geo.properties.NOMBRE_DPT;

    // Buscamos si existe en tus datos
    const dataKey = Object.keys(data).find(k => normalizeName(k) === normalizeName(deptName));
    const cantidad = dataKey ? data[dataKey] : 0;

    setTooltipContent(`${deptName}: ${cantidad} Actividades`);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 30
    });
  };

  const handleMouseLeave = () => {
    setTooltipContent("");
  };

  return (
    <div
      className="relative w-full h-96 bg-blue-50/30 rounded-lg flex items-center justify-center overflow-hidden border border-blue-100"
      onMouseMove={handleMouseMove}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1700, // Zoom ajustado para Colombia
          center: [-74, 4] // Centro ajustado
        }}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup>
          {/* AQUÍ USAMOS LA VARIABLE IMPORTADA, NO UNA URL */}
          <Geographies geography={colombiaGeo}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoName = geo.properties.NOMBRE_DPT;

                // Buscar coincidencia en tus datos
                const dataKey = Object.keys(data).find(key => normalizeName(key) === normalizeName(geoName));
                const count = dataKey ? data[dataKey] : 0;

                // Lógica de color: Verde si hay datos (count > 0), Amarillo por defecto si no hay o si no rastreamos la ciudad
                let fillColor = count > 0 ? "#10b981" : "#fcd34d";

                return (
                  <Geography
                    key={geo.properties.DPTO || Math.random()}
                    geography={geo}
                    onMouseEnter={(e) => handleMouseEnter(geo, e)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: fillColor,
                        stroke: "#FFFFFF",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "all 250ms"
                      },
                      hover: {
                        fill: count > 0 ? "#059669" : "#fbbf24",
                        stroke: "#FFFFFF",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "#E42",
                        outline: "none"
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* TOOLTIP */}
      {tooltipContent && (
        <div
          className="absolute bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-xl pointer-events-none z-10 font-bold tracking-wide uppercase"
          style={{ top: tooltipPos.y, left: tooltipPos.x }}
        >
          {tooltipContent}
        </div>
      )}

      {/* LEYENDA */}
      <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-xl shadow-sm text-[10px] space-y-2 border border-gray-100 backdrop-blur-sm pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#10b981] rounded-sm shadow-sm"></span>
          <span className="text-gray-600 font-bold">Con Actividad</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#fcd34d] rounded-sm shadow-sm"></span>
          <span className="text-gray-600 font-bold">Sin Actividad</span>
        </div>
      </div>
    </div>
  );
};

// --- MÓDULOS DE FUNCIONALIDAD ---

const DashboardModule = ({ sdsData }) => {
  const [filters, setFilters] = useState({
    sds: "",
    cliente: "",
    proveedor: "",
    estado: "",
    programa: "",
    tipoActividad: "",
  });
  const uniqueClients = [...new Set(sdsData.map((d) => d.Cliente))];
  const uniqueProvs = [...new Set(sdsData.map((d) => d.Proveedor))];
  const uniqueProgs = [...new Set(sdsData.map((d) => d.Programa))];
  const uniqueTypes = [...new Set(sdsData.map((d) => d.TipoActividad))];

  const filteredData = useMemo(() => {
    return sdsData.filter((item) => {
      return (
        (!filters.sds || String(item.SDS).includes(filters.sds)) &&
        (!filters.cliente || item.Cliente === filters.cliente) &&
        (!filters.proveedor || item.Proveedor === filters.proveedor) &&
        (!filters.estado || item.Estado === filters.estado) &&
        (!filters.programa || item.Programa === filters.programa) &&
        (!filters.tipoActividad || item.TipoActividad === filters.tipoActividad)
      );
    });
  }, [sdsData, filters]);

  // --- LÓGICA GRÁFICOS ---
  const datosPorPrograma = Object.entries(
    filteredData.reduce((acc, curr) => {
      acc[curr.Programa] = (acc[curr.Programa] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const datosPorEstado = Object.entries(
    filteredData.reduce((acc, curr) => {
      acc[curr.Estado] = (acc[curr.Estado] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];
  const datosPorTipo = Object.entries(
    filteredData.reduce((acc, curr) => {
      acc[curr.TipoActividad] = (acc[curr.TipoActividad] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, value], idx) => ({
    label,
    value,
    color: colors[idx % colors.length],
  }));

  const totalSDS = filteredData.length;
  const totalValor = filteredData.reduce(
    (acc, curr) => acc + (curr.Total || 0),
    0
  );
  const pendientes = filteredData.filter(
    (d) => d.Estado === "Programada"
  ).length;

  // --- LÓGICA MAPA (Dinámica para Todo el País) ---
  const conteoPorDepartamento = filteredData.reduce((acc, curr) => {
    // Tomamos el Departamento si existe (de INITIAL_DATA), o de lo contrario el Municipio (que viene del excel)
    let rawStr = curr.Departamento || curr.Municipio || "Bogota";
    let locRaw = rawStr.trim() !== "" ? rawStr.trim() : "Bogota";

    // Normalizamos para hacer el match de ciudad sin importar mayúsculas o tildes.
    let locNorm = locRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Mapa de ciudades principales hacia su Departamento correspondiente, todo en minúsculas y sin tildes.
    const mapCiudades = {
      "medellin": "Antioquia", "bello": "Antioquia", "envigado": "Antioquia", "itagui": "Antioquia", "rionegro": "Antioquia",
      "bogota d.c.": "Bogota", "bogota": "Bogota", "santafe de bogota": "Bogota", "bogota d.c": "Bogota",
      "manizales": "Caldas", "chinchina": "Caldas", "villamaria": "Caldas",
      "pereira": "Risaralda", "dosquebradas": "Risaralda",
      "cali": "Valle del Cauca", "palmira": "Valle del Cauca", "yumbo": "Valle del Cauca", "buenaventura": "Valle del Cauca",
      "barranquilla": "Atlantico", "soledad": "Atlantico", "malambo": "Atlantico",
      "cartagena": "Bolivar", "turbaco": "Bolivar",
      "bucaramanga": "Santander", "floridablanca": "Santander", "piedecuesta": "Santander", "giron": "Santander",
      "cucuta": "Norte de Santander", "villa del rosario": "Norte de Santander",
      "santa marta": "Magdalena", "cienaga": "Magdalena",
      "ibague": "Tolima", "espinal": "Tolima",
      "villavicencio": "Meta", "acacias": "Meta",
      "neiva": "Huila", "pitalito": "Huila",
      "pasto": "Narino", "tumaco": "Narino",
      "popayan": "Cauca",
      "armenia": "Quindio", "valledupar": "Cesar", "monteria": "Cordoba", "sincelejo": "Sucre",
      "riohacha": "La Guajira", "tunja": "Boyaca", "sogamoso": "Boyaca",
      "chia": "Cundinamarca", "cota": "Cundinamarca", "cajica": "Cundinamarca", "facatativa": "Cundinamarca", "zipaquira": "Cundinamarca", "fusagasuga": "Cundinamarca", "soacha": "Cundinamarca", "mosquera": "Cundinamarca", "madrid": "Cundinamarca", "funza": "Cundinamarca", "tocancipa": "Cundinamarca",
      "quibdo": "Choco", "choco": "Choco",
      "yopal": "Casanare", "casanare": "Casanare",
      "florencia": "Caqueta", "caqueta": "Caqueta",
      "mocoa": "Putumayo", "putumayo": "Putumayo",
      "arauca": "Arauca",
      "leticia": "Amazonas", "amazonas": "Amazonas",
      "puerto inirida": "Guainia", "inirida": "Guainia", "guainia": "Guainia",
      "san jose del guaviare": "Guaviare", "guaviare": "Guaviare",
      "mitu": "Vaupes", "vaupes": "Vaupes",
      "puerto carreno": "Vichada", "vichada": "Vichada"
    };

    // Buscamos si la localidad hace match con nuestro mapeo inteligente, si no, se guarda la locación directa.
    const deptoKey = mapCiudades[locNorm] || locRaw;

    acc[deptoKey] = (acc[deptoKey] || 0) + 1;
    return acc;
  }, {});

  // Aseguramos que algunos departamentos base aparezcan en amarillo (0) si no tienen registros, 
  // en vez de quedar en gris "Resto del País".
  ["Antioquia", "Bogota", "Caldas", "Risaralda", "Valle del Cauca", "Atlantico", "Santander", "Cundinamarca"].forEach(
    (d) => {
      if (conteoPorDepartamento[d] === undefined) conteoPorDepartamento[d] = 0;
    }
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-xl font-bold text-blue-900 border-b pb-2">
        Tableros de Control
      </h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <FilterInput
          label="SDS"
          value={filters.sds}
          onChange={(v) => setFilters({ ...filters, sds: v })}
        />
        <FilterInput
          label="Cliente"
          value={filters.cliente}
          onChange={(v) => setFilters({ ...filters, cliente: v })}
          options={uniqueClients}
        />
        <FilterInput
          label="Proveedor"
          value={filters.proveedor}
          onChange={(v) => setFilters({ ...filters, proveedor: v })}
          options={uniqueProvs}
        />
        <FilterInput
          label="Estado"
          value={filters.estado}
          onChange={(v) => setFilters({ ...filters, estado: v })}
          options={["Programada", "Concluida", "Aprobada"]}
        />
        <FilterInput
          label="Programa"
          value={filters.programa}
          onChange={(v) => setFilters({ ...filters, programa: v })}
          options={uniqueProgs}
        />
        <FilterInput
          label="Tipo Act."
          value={filters.tipoActividad}
          onChange={(v) => setFilters({ ...filters, tipoActividad: v })}
          options={uniqueTypes}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 uppercase font-bold">
            Total Órdenes
          </p>
          <p className="text-3xl font-bold text-blue-900">{totalSDS}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 uppercase font-bold">
            Valor Total
          </p>
          <p className="text-3xl font-bold text-green-700">
            ${totalValor.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <p className="text-sm text-gray-500 uppercase font-bold">
            Pendientes
          </p>
          <p className="text-3xl font-bold text-orange-700">{pendientes}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            Top 5 Programas
          </h3>
          <SimpleBarChart data={datosPorPrograma} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            SDS por Estado
          </h3>
          <VerticalBarChart data={datosPorEstado} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">
            Distribución por Tipo de Actividad
          </h3>
          <PieChart data={datosPorTipo} />
        </div>

        {/* COMPONENTE MAPA CORREGIDO */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-700 mb-4 w-full text-left border-b pb-2">
            Cobertura Geográfica
          </h3>
          <ColombiaMap data={conteoPorDepartamento} />
        </div>
      </div>
    </div>
  );
};

// --- MÓDULO GESTIÓN DE ACTAS ---
const GestionActasModule = ({ sdsData, onNavigate }) => {
  const [expandedSection, setExpandedSection] = useState("pending");

  const pendingOrders = sdsData.filter((item) => item.Estado === "Programada");
  const visitedOrders = sdsData.filter((item) => item.Estado !== "Programada");

  const toggleSection = (section) =>
    setExpandedSection(expandedSection === section ? null : section);

  const handleSelect = (item) => {
    if (item.Estado === "Programada") {
      onNavigate("actaForm", item);
    } else {
      onNavigate("actaDetails", item);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <h2 className="text-xl font-bold text-blue-900 border-b pb-2">
        Gestión de Actas
      </h2>
      <AccordionSection
        title="SDS Pendientes de Ejecutar"
        count={pendingOrders.length}
        isOpen={expandedSection === "pending"}
        onToggle={() => toggleSection("pending")}
        iconColor="bg-blue-500"
        iconSvg={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      >
        {pendingOrders.length > 0 ? (
          pendingOrders.map((item) => (
            <SdsCard key={item.SDS} item={item} onSelect={handleSelect} />
          ))
        ) : (
          <p className="text-center text-gray-400 py-4">
            No hay SDS pendientes.
          </p>
        )}
      </AccordionSection>

      <AccordionSection
        title="SDS Ejecutadas / Histórico"
        count={visitedOrders.length}
        isOpen={expandedSection === "visited"}
        onToggle={() => toggleSection("visited")}
        iconColor="bg-green-500"
        iconSvg={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      >
        {visitedOrders.length > 0 ? (
          visitedOrders.map((item) => (
            <SdsCard key={item.SDS} item={item} onSelect={handleSelect} />
          ))
        ) : (
          <p className="text-center text-gray-400 py-4">
            Sin historial reciente.
          </p>
        )}
      </AccordionSection>
    </div>
  );
};

const CrearAsesorModule = ({ asesores, setAsesores, showModal }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    identificacion: "",
    telefono: "",
    email: "",
    empresa: "",
    cargo: "Asesor de Prevención",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.nombre ||
      !formData.identificacion ||
      !formData.telefono ||
      !formData.email ||
      !formData.empresa
    ) {
      showModal("Error", "Todos los campos son obligatorios.");
      return;
    }

    const newAsesor = { ...formData, id: Date.now() };
    setAsesores([...asesores, newAsesor]);
    showModal("Éxito", "Asesor creado correctamente.");
    setFormData({
      nombre: "",
      identificacion: "",
      telefono: "",
      email: "",
      empresa: "",
      cargo: "Asesor de Prevención",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-blue-900 border-b pb-2">
        Crear Asesor de Prevención SDS
      </h2>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Nombres y Apellidos
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00b288] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              No. Identificación
            </label>
            <input
              type="number"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00b288] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00b288] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00b288] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Empresa
            </label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#00b288] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              name="cargo"
              value="Asesor de Prevención"
              disabled
              className="w-full p-3 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-4">
            <button
              type="submit"
              className="px-8 py-3 bg-[#00b288] text-white rounded-lg font-bold hover:bg-[#009670] shadow-md transition-transform active:scale-95"
            >
              Crear Asesor
            </button>
          </div>
        </form>
        <div className="mt-8 border-t pt-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">
            Asesores Existentes ({asesores.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {asesores.map((a) => (
              <div
                key={a.id}
                className="text-xs p-3 bg-gray-50 rounded border flex justify-between"
              >
                <span className="font-bold text-gray-700">{a.nombre}</span>
                <span className="text-gray-500">{a.empresa}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AsignarSDSModule = ({ sdsData, asesores, onSaveAssignments }) => {
  const [filters, setFilters] = useState({
    sds: "",
    cliente: "",
    proveedor: "",
    estado: "",
    programa: "",
    tipoActividad: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState({});
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAsesorId, setBulkAsesorId] = useState("");

  const uniqueClients = [...new Set(sdsData.map((d) => d.Cliente))];
  const uniqueProvs = [...new Set(sdsData.map((d) => d.Proveedor))];
  const uniqueProgs = [...new Set(sdsData.map((d) => d.Programa))];
  const uniqueTypes = [...new Set(sdsData.map((d) => d.TipoActividad))];

  const filteredData = sdsData.filter((item) => {
    const isProgramada = item.Estado === "Programada";
    const matchesFilters =
      (!filters.sds || String(item.SDS).includes(filters.sds)) &&
      (!filters.cliente || item.Cliente === filters.cliente) &&
      (!filters.proveedor || item.Proveedor === filters.proveedor) &&
      (!filters.estado || item.Estado === filters.estado) &&
      (!filters.programa || item.Programa === filters.programa) &&
      (!filters.tipoActividad || item.TipoActividad === filters.tipoActividad);
    return isProgramada && matchesFilters;
  });

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id))
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    else setSelectedRows([...selectedRows, id]);
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(filteredData.map((item) => item.SDS));
    else setSelectedRows([]);
  };
  const handleIndividualChange = (sdsId, asesorId) => {
    setPendingAssignments((prev) => ({ ...prev, [sdsId]: asesorId }));
  };
  const applyBulkAssignment = () => {
    if (!bulkAsesorId) return;
    const newAssignments = { ...pendingAssignments };
    selectedRows.forEach((sdsId) => {
      newAssignments[sdsId] = bulkAsesorId;
    });
    setPendingAssignments(newAssignments);
    setShowBulkModal(false);
    setBulkAsesorId("");
  };
  const handleCancel = () => {
    setPendingAssignments({});
    setSelectedRows([]);
  };
  const handleSave = () => {
    onSaveAssignments(pendingAssignments);
    setPendingAssignments({});
    setSelectedRows([]);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-24 relative">
      <h2 className="text-xl font-bold text-blue-900 border-b pb-2">
        Asignar SDS
      </h2>
      <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <FilterInput
          label="SDS"
          value={filters.sds}
          onChange={(v) => setFilters({ ...filters, sds: v })}
        />
        <FilterInput
          label="Cliente"
          value={filters.cliente}
          onChange={(v) => setFilters({ ...filters, cliente: v })}
          options={uniqueClients}
        />
        <FilterInput
          label="Proveedor"
          value={filters.proveedor}
          onChange={(v) => setFilters({ ...filters, proveedor: v })}
          options={uniqueProvs}
        />
        <FilterInput
          label="Estado"
          value={filters.estado}
          onChange={(v) => setFilters({ ...filters, estado: v })}
          options={["Programada"]}
        />
        <FilterInput
          label="Programa"
          value={filters.programa}
          onChange={(v) => setFilters({ ...filters, programa: v })}
          options={uniqueProgs}
        />
        <FilterInput
          label="Tipo Act."
          value={filters.tipoActividad}
          onChange={(v) => setFilters({ ...filters, tipoActividad: v })}
          options={uniqueTypes}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <div className="p-4 bg-yellow-50 border-b border-yellow-100 flex justify-between items-center">
          <p className="text-sm text-yellow-800 font-bold">
            ⚠ SDS Disponibles ({filteredData.length}) | Seleccionadas:{" "}
            {selectedRows.length}
          </p>
          <button
            onClick={() => selectedRows.length > 0 && setShowBulkModal(true)}
            className={`text-xs px-3 py-1 rounded border font-bold transition-colors ${selectedRows.length > 0
              ? "bg-white border-yellow-300 hover:bg-yellow-100 text-yellow-800 cursor-pointer"
              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
          >
            Asignación Múltiple
          </button>
          {showBulkModal && (
            <div className="absolute top-12 right-4 bg-white shadow-xl border border-gray-200 p-4 rounded-lg z-20 w-64">
              <h4 className="text-xs font-bold text-gray-700 mb-2">
                Asignar {selectedRows.length} SDS a:
              </h4>
              <select
                className="w-full p-2 border border-gray-300 rounded text-xs mb-3"
                value={bulkAsesorId}
                onChange={(e) => setBulkAsesorId(e.target.value)}
              >
                <option value="">Seleccionar Asesor...</option>
                {asesores.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyBulkAssignment}
                  className="flex-1 py-1 bg-[#00b288] text-white text-xs rounded hover:bg-[#009670]"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto max-h-[450px]">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedRows.length === filteredData.length &&
                      filteredData.length > 0
                    }
                  />
                </th>
                <th className="px-4 py-3">SDS</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Actividad</th>
                <th className="px-4 py-3 text-center">Acción (Asignar a)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item.SDS}
                  className={`border-b hover:bg-gray-50 ${selectedRows.includes(item.SDS) ? "bg-blue-50" : "bg-white"
                    }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item.SDS)}
                      onChange={() => handleSelectRow(item.SDS)}
                    />
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-900">
                    {item.SDS}
                  </td>
                  <td className="px-4 py-3">{item.Cliente}</td>
                  <td className="px-4 py-3">{item.Municipio}</td>
                  <td
                    className="px-4 py-3 truncate max-w-[200px]"
                    title={item.Actividad}
                  >
                    {item.Actividad}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      className={`p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-green-500 w-48 ${pendingAssignments[item.SDS]
                        ? "border-green-500 bg-green-50 text-green-800 font-bold"
                        : "border-gray-300 bg-white"
                        }`}
                      value={pendingAssignments[item.SDS] || ""}
                      onChange={(e) =>
                        handleIndividualChange(item.SDS, e.target.value)
                      }
                    >
                      <option value="">Seleccionar Asesor</option>
                      {asesores.map((asesor) => (
                        <option key={asesor.id} value={asesor.id}>
                          {asesor.nombre} - {asesor.empresa}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {Object.keys(pendingAssignments).length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex gap-3 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 animate-slide-up">
          <div className="flex flex-col justify-center mr-2">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Cambios pendientes
            </span>
            <span className="text-sm font-bold text-blue-900">
              {Object.keys(pendingAssignments).length} Asignaciones
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#00b288] text-white font-bold rounded-lg hover:bg-[#009670] shadow-lg transition-transform active:scale-95"
          >
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

const CargarExcelModule = ({ sdsData, setSdsData, showModal, setActiveModule }) => {
  const fileInputRef = useRef(null);
  const handleButtonClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show loading modal immediately to give feedback
    showModal("Cargando...", "Por favor, espere mientras se procesa el archivo Excel.");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Obtener los encabezados crudos siempre desde la primera fila (header: 1), 
        // evitando el problema de celdas vacías en la primera fila de datos.
        const rawHeaders = XLSX.utils.sheet_to_json(ws, { header: 1 })[0] || [];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        // Required columns based on image
        const requiredColumns = [
          "SDS", "TipoEjecución", "Cliente", "Póliza", "Proveedor",
          "Nit Proveedor", "Estado", "Programa", "TipoActividad",
          "Actividad", "FechaCreación", "FechaPlan", "FechaProgramación",
          "FechaEjecución", "FechaCancelación", "Fecha Aprobación",
          "Nro. Ordende Pago", "Unidad", "Cantidad", "Valor", "Total",
          "Lider de prevención asignado", "NúmeroFactura", "FechaPago",
          "NúmeroParticipantes", "Calificación Obtenida", "Lugar de ejecución",
          "SDS Cierre", "Total Cierre", "Comparación Totales", "Valor real SDS"
        ];

        const fileHeaders = rawHeaders.filter(h => h !== undefined && h !== null);

        // Helper to normalize strings (remove accents, spaces, and punctuation)
        const normalizeHeader = (str) => {
          if (!str) return "";
          return str.toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove accents
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ""); // remove spaces and non-alphanumeric chars
        };

        const normalizedHeaders = fileHeaders.map(h => normalizeHeader(h));

        // Robust column validation 
        const missingColumns = requiredColumns.filter(col =>
          !normalizedHeaders.includes(normalizeHeader(col))
        );

        if (missingColumns.length > 0) {
          showModal("Error de Estructura", `Le faltan columnas obligatorias: ${missingColumns.join(', ')}`);
          return;
        }

        // Map data to the system model
        const newData = data.map(row => {
          const getVal = (colName) => {
            const actualKey = fileHeaders.find(h => normalizeHeader(h) === normalizeHeader(colName));
            return actualKey ? row[actualKey] : "";
          };

          return {
            SDS: getVal("SDS"),
            TipoEjecucion: getVal("TipoEjecución"),
            Cliente: getVal("Cliente"),
            Poliza: getVal("Póliza"),
            Proveedor: getVal("Proveedor"),
            NitProveedor: getVal("Nit Proveedor"),
            Estado: getVal("Estado") || "Programada",
            Programa: getVal("Programa"),
            TipoActividad: getVal("TipoActividad"),
            Actividad: getVal("Actividad"),
            FechaCreacion: getVal("FechaCreación"),
            FechaProgramada: getVal("FechaProgramación") || getVal("FechaPlan"),
            FechaEjecucion: getVal("FechaEjecución"),
            FechaCancelacion: getVal("FechaCancelación"),
            FechaAprobacion: getVal("Fecha Aprobación"),
            NroOrdenPago: getVal("Nro. Ordende Pago"),
            Unidad: getVal("Unidad"),
            Cantidad: Number(getVal("Cantidad")) || 0,
            Valor: Number(getVal("Valor")) || 0,
            Total: Number(getVal("Total")) || 0,
            LiderAsignado: getVal("Lider de prevención asignado"),
            NumeroFactura: getVal("NúmeroFactura"),
            FechaPago: getVal("FechaPago"),
            NumeroParticipantes: getVal("NúmeroParticipantes"),
            CalificacionObtenida: getVal("Calificación Obtenida"),
            LugarEjecucion: getVal("Lugar de ejecución"),
            SDSCierre: getVal("SDS Cierre"),
            TotalCierre: Number(getVal("Total Cierre")) || 0,
            ComparacionTotales: getVal("Comparación Totales"),
            ValorRealSDS: Number(getVal("Valor real SDS")) || 0,

            // System fields used by Dashboards and Actas
            HorasPlaneadas: Number(getVal("Cantidad")) || 0,
            HorasEjecutadas: 0,
            Municipio: getVal("Lugar de ejecución") || "Bogotá",
          };
        });

        // Skip existing SDS
        const existingSdsKeys = new Set(sdsData.map(item => String(item.SDS)));
        const uniqueNewData = newData.filter(item => item.SDS && !existingSdsKeys.has(String(item.SDS)));

        if (uniqueNewData.length === 0) {
          showModal("Atención", "Todas las SDS del archivo ya existen en el sistema.");
          return;
        }

        setSdsData([...sdsData, ...uniqueNewData]);
        showModal("Carga Exitosa", `Se han cargado ${uniqueNewData.length} registros nuevos correctamente. Ya se encuentran sincronizados con los demás módulos.`);

        // Auto-navigate to tableros
        setTimeout(() => setActiveModule("tableros"), 1500);

      } catch (err) {
        showModal("Error al leer Excel", "El archivo no se pudo leer. Asegúrese de que no esté corrupto y en formato .xlsx válido.");
      }
    };
    reader.readAsBinaryString(file);
    fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4 animate-fade-in h-full flex flex-col">
      <h2 className="text-xl font-bold text-blue-900 border-b pb-2">
        Cargar Excel a Base de Datos
      </h2>
      <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div
          onClick={handleButtonClick}
          className="w-full max-w-2xl border-4 border-dashed border-gray-300 rounded-3xl bg-gray-50 p-12 text-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group"
        >
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-gray-400 group-hover:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2 group-hover:text-blue-700">
            Arrastra tu archivo Excel aquí
          </h3>
          <p className="text-gray-500 mb-6">
            o haz clic para seleccionar desde tu ordenador
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xlsx, .csv"
            onChange={handleFileChange}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick();
            }}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-transform transform active:scale-95"
          >
            Seleccionar Archivo
          </button>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>Formatos soportados: .xlsx, .csv</p>
            <p className="font-bold text-blue-600">
              Tamaño máximo permitido: 500 MB
            </p>
          </div>
        </div>
        <div className="mt-8 w-full max-w-4xl bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <h4 className="font-bold text-blue-900 text-sm">
              Instrucciones Obligatorias
            </h4>
            <div className="text-xs text-blue-800 mt-2 space-y-2">
              <p>El archivo debe contener <span className="font-bold uppercase text-blue-900">exactamente</span> las siguientes columnas para que la sincronización en los demás módulos proceda sin errores:</p>
              <div className="grid grid-cols-3 gap-2 p-2 bg-blue-100 rounded text-[10px] font-bold">
                <span>• SDS</span>
                <span>• TipoEjecución</span>
                <span>• Cliente</span>
                <span>• Póliza</span>
                <span>• Proveedor</span>
                <span>• Nit Proveedor</span>
                <span>• Estado</span>
                <span>• Programa</span>
                <span>• TipoActividad</span>
                <span>• Actividad</span>
                <span>• FechaCreación</span>
                <span>• FechaPlan</span>
                <span>• FechaProgramación</span>
                <span>• FechaEjecución</span>
                <span>• FechaCancelación</span>
                <span>• Fecha Aprobación</span>
                <span>• Nro. Ordende Pago</span>
                <span>• Unidad</span>
                <span>• Cantidad</span>
                <span>• Valor</span>
                <span>• Total</span>
                <span>• Lider de prevención asignado</span>
                <span>• NúmeroFactura</span>
                <span>• FechaPago</span>
                <span>• NúmeroParticipantes</span>
                <span>• Calificación Obtenida</span>
                <span>• Lugar de ejecución</span>
                <span>• SDS Cierre</span>
                <span>• Total Cierre</span>
                <span>• Comparación Totales</span>
                <span>• Valor real SDS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// COMPONENTE PRINCIPAL
const DirectorDashboard = ({
  onLogout,
  user,
  sdsData,
  setSdsData,
  onNavigate,
  initialModule,
  asesores,
  setAsesores,
  showModal,
  onSaveAssignments,
}) => {
  const [activeModule, setActiveModule] = useState(initialModule || "tableros");

  useEffect(() => {
    if (initialModule) setActiveModule(initialModule);
  }, [initialModule]);

  const menuItems = [
    { id: "tableros", label: "Tableros de Control", icon: "📊" },
    { id: "gestion", label: "Gestión de Actas", icon: "📑" },
    { id: "crearAsesor", label: "Crear Asesor Prevención", icon: "👤" },
    { id: "asignar", label: "Asignar SDS", icon: "✍" },
    { id: "cargar", label: "Cargar Excel a B.D.", icon: "📥" },
  ];

  const renderContent = () => {
    switch (activeModule) {
      case "tableros":
        return <DashboardModule sdsData={sdsData} />;
      case "gestion":
        return <GestionActasModule sdsData={sdsData} onNavigate={onNavigate} />;
      case "crearAsesor":
        return (
          <CrearAsesorModule
            asesores={asesores}
            setAsesores={setAsesores}
            showModal={showModal}
          />
        );
      case "asignar":
        return (
          <AsignarSDSModule
            sdsData={sdsData}
            asesores={asesores}
            onSaveAssignments={onSaveAssignments}
          />
        );
      case "cargar":
        return <CargarExcelModule
          sdsData={sdsData}
          setSdsData={setSdsData}
          showModal={showModal}
          setActiveModule={setActiveModule}
        />;
      default:
        return <DashboardModule sdsData={sdsData} />;
    }
  };

  return (
    <AppLayout title="Director de Prevención" onNavigate={null}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-gray-50">
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-6 pb-2 border-b border-gray-100 flex justify-center">
            <img src="/Seguros-Colsanitas-ARL.png" alt="Logo Colsanitas" className="w-full max-w-[180px] object-contain drop-shadow-sm" />
          </div>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                {user?.name?.charAt(0) || "D"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {user?.name || "Director"}
                </p>
                <p className="text-xs text-green-600 font-medium">● En línea</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeModule === item.id
                  ? "bg-[#00b288] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 mt-auto border-t border-gray-100">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
            >
              <span>🚪</span> Cerrar Sesión
            </button>
          </div>
        </aside>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
          {renderContent()}
        </main>
      </div>
    </AppLayout>
  );
};

export default DirectorDashboard;
