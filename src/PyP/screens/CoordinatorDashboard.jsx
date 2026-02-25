import React, { useState, useMemo, useRef } from "react";
import AppLayout from "../components/AppLayout";

// --- COMPONENTES VISUALES ---

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

const SimpleBarChart = ({ data }) => {
  if (data.length === 0)
    return <p className="text-xs text-gray-400 py-4 text-center">Sin datos.</p>;
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-3 mt-4">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center text-xs">
          <div
            className="w-32 truncate font-medium text-gray-600 mr-2"
            title={item.label}
          >
            {item.label}
          </div>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00b288] rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxVal) * 100}%` }}
            ></div>
          </div>
          <div className="w-8 text-right font-bold text-gray-700">
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
    <div className="h-48 flex items-end justify-between gap-2 mt-4 px-2">
      {data.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col items-center flex-1 group relative"
        >
          <div className="absolute bottom-full mb-1 text-[10px] bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {item.label}: {item.value}
          </div>
          <div className="w-full bg-blue-100 rounded-t-md relative flex items-end h-32 overflow-hidden">
            <div
              className="w-full bg-blue-600 rounded-t-md transition-all duration-700 hover:bg-blue-500"
              style={{ height: `${(item.value / maxVal) * 100}%` }}
            ></div>
          </div>
          <span
            className="text-[10px] text-gray-500 mt-2 font-medium truncate w-full text-center"
            title={item.label}
          >
            {item.label}
          </span>
          <span className="text-[10px] font-bold text-gray-700">
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
    <div className="flex items-center gap-6 mt-4 justify-center">
      <div
        className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex-shrink-0"
        style={{ background: `conic-gradient(${gradientString})` }}
      ></div>
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center text-xs">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-600 font-medium">{item.label}</span>
            <span className="ml-2 font-bold text-gray-800">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MÓDULOS ESPECÍFICOS ---

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

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <h2 className="text-xl font-bold text-blue-900 border-b pb-2">
        Tableros de Control - Coordinación
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-700 mb-4 w-full text-left border-b pb-2">
            Cobertura Geográfica
          </h3>
          <div className="w-full h-64 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden relative">
            <img
              src="mapa-colombia.png"
              alt="Mapa Colombia"
              className="h-full object-contain opacity-80 mix-blend-multiply"
            />
            <span className="absolute bottom-2 right-2 text-xs bg-white px-2 py-1 rounded shadow">
              Mapa Estático
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CargarExcelModule = () => {
  const fileInputRef = useRef(null);
  const handleButtonClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file)
      alert(
        `Archivo seleccionado: ${file.name}. \n\nNota: El sistema valida que el archivo no supere los 500MB y contenga las columnas requeridas (SDS, Cliente, Póliza...).`
      );
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
        <div className="mt-8 w-full max-w-2xl bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
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
            <p className="text-xs text-blue-800 mt-1">
              El archivo debe contener obligatoriamente las columnas:{" "}
              <span className="font-bold">
                SDS, TipoEjecución, Cliente, Póliza, Proveedor, Nit Proveedor,
                Estado, Programa, TipoActividad, Actividad, FechaCreación,
                FechaPlan, FechaProgramación.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// COMPONENTE PRINCIPAL COORDINADOR
const CoordinatorDashboard = ({ onLogout, user, sdsData }) => {
  const [activeModule, setActiveModule] = useState("tableros");

  const menuItems = [
    { id: "tableros", label: "Tableros de Control", icon: "📊" },
    { id: "cargar", label: "Cargar Excel a B.D.", icon: "📥" },
  ];

  const renderContent = () => {
    switch (activeModule) {
      case "tableros":
        return <DashboardModule sdsData={sdsData} />;
      case "cargar":
        return <CargarExcelModule />;
      default:
        return <DashboardModule sdsData={sdsData} />;
    }
  };

  return (
    <AppLayout title={user?.role || "Coordinador"} onNavigate={null}>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-gray-50">
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-6 pb-2 border-b border-gray-100 flex justify-center">
            <img src="/Seguros-Colsanitas-ARL.png" alt="Logo Colsanitas" className="w-full max-w-[180px] object-contain drop-shadow-sm" />
          </div>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                {user?.name?.charAt(0) || "C"}
              </div>
              <div>
                <p
                  className="text-sm font-bold text-gray-900 truncate w-32"
                  title={user?.name}
                >
                  {user?.name || "Coordinador"}
                </p>
                <p
                  className="text-[10px] text-gray-500 truncate w-32"
                  title={user?.role}
                >
                  {user?.role}
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
                  ? "bg-purple-600 text-white shadow-md"
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

export default CoordinatorDashboard;
