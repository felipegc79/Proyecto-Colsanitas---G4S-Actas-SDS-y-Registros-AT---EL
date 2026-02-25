import React, { useState, useMemo, useEffect } from "react";
import { FileText, Search, PlusCircle, Download, Trash2, Edit, Save, X, Filter, Eye } from "lucide-react";
import { dataEL, addNewRecordEL, deleteRecordEL, updateRecordEL, DEPARTAMENTOS_COLOMBIA, loadFromStorage, syncFromDB } from "../data";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";

// --- CONSTANTES ---
const O_CATEGORIA = ["Muy Leve", "Leve", "Moderado", "Severo", "Grave", "Mortal"];
const O_ORIGEN_ACTUAL = ["Laboral en Firme", "Común en Firme", "En controversia"];
const O_SINO = ["SI", "NO"];
const O_ESTADO_CASO = ["Abierto", "Anulado", "Cerrado", "Objetado", "Desistido", "Inválido"];
const O_ARL = ["Positiva ARL", "Equidad ARL", "AXA Colpatria ARL", "SURA ARL", "Colmena ARL", "Bolivar ARL", "Seguros de Vida Alfa", "Maphre ARL", "Aurora ARL"];
const O_ESTATUS_POLIZA = ["Vigente", "Anulada"];
const O_ESTADO_AFILIADO = ["Vigente", "Retirado", "Pensionado por Vejez", "Invalido"];
const O_ORIGEN_CALIFICADO = ["Laboral", "Común", "Mixto", "Sin pronunciamiento"];
const O_ESTADO_ORIGEN = ["En firme", "En Controversia", "Sin información"];
const O_RECURSO = ["En acuerdo", "En desacuerdo", "Sin información"];
const O_PAGO = ["Si", "No", "Sin información"];
const O_CAUSA_REHAB = ["IT igual o mayor a 30 días", "Caso que se beneficia del programa", "Enfermedad Laboral en firme"];
const O_ENTIDADES_CALIF = ["ARL", "EPS", "AFP", "Otra"];
const O_MANUAL_CALIF = ["Resolución 917 de 1999", "Resolución 1507 de 2014"];
const O_JUNTAS = [
  "Junta Regional de Antioquia", "Junta Regional de Arauca", "Junta Regional de Atlántico", "Junta Regional de Bogotá",
  "Junta Regional de Bolívar", "Junta Regional de Boyacá", "Junta Regional de Caldas", "Junta Regional de Cauca",
  "Junta Regional de Cesar", "Junta Regional de Córdoba", "Junta Regional de Cundinamarca", "Junta Regional de Huila",
  "Junta Regional de La Guajira", "Junta Regional de Magdalena", "Junta Regional de Meta", "Junta Regional de Nariño",
  "Junta Regional de Norte de Santander", "Junta Regional de Quindío", "Junta Regional de Risaralda",
  "Junta Regional de Santander", "Junta Regional de Sucre", "Junta Regional de Tolima", "Junta Regional de Valle del Cauca"
];

const formatDate = (val) => {
  if (!val) return "Sin información";
  if (!isNaN(val) && Number(val) > 10000) {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toLocaleDateString("es-CO", { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  if (typeof val === 'string' && val.includes('-')) {
    const parts = val.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return val;
};

const INITIAL_FORM = {
  // 1.
  estadoCaso: "Abierto", origenActual: "", arlTraslado: "",
  statusPoliza: "Vigente", estadoAfiliado: "Vigente",
  radicado: "", siniestro: "", fechaInicioCobertura: "", fechaAviso: "",
  grupoEmpresarial: "", empresa: "", nit: "", centroTrabajo: "",
  departamentoAfiliado: "", ciudadAfiliado: "",
  causoMuerte: "NO", fechaFallecimiento: "",
  nombreCompleto: "", cedula: "", tipoId: "", numeroId: "",

  // 2. 
  diagnosticos: [],

  // 3.1
  poFechaNotifOri: "", poFechaOri: "", poEntidadOri: "", poNumDicOri: "", poOrigenCalificado: "",
  poEstadoOrigen: "", poRecursoOri: "", poFechaRecursoOri: "", poPagoHonOri: "", poFechaSolPagoOri: "",
  poHonorariosJRCI: "", poDicFirmeOri: "", poFechaFirmezaOri: "",
  // 3.2
  jrJuntaOri: "", jrFechaNotifOri: "", jrFechaOri: "", jrNumDicOri: "", jrOrigenCalificado: "",
  jrEstadoOrigen: "", jrRecursoOri: "", jrFechaRecursoOri: "", jrPagoHonOri: "", jrFechaSolPagoOri: "",
  jrDicFirmeOri: "", jrFechaFirmezaOri: "",
  // 3.3
  jnFechaNotifOri: "", jnFechaOri: "", jnNumDicOri: "", jnOrigenCalificado: "", jnFechaFirmezaOri: "",

  // 4.
  rehabClasificado: "NO", rehabCausa: "", rehabFecha: "",

  // 5.1
  poPCLPresunta: "", poFechaSolPCL: "", poEntidadPCL: "", poManualPCL: "", poFechaDicPCL: "", poNumDicPCL: "",
  poT1PCL: "", poT2PCL: "", poTotPCL: "", poFechaEstPCL: "", poFechaNotifPCL: "", poEstadoDicPCL: "",
  poRecursoPCL: "", poFechaRecursoPCL: "", poPagoHonPCL: "", poFechaSolPagoPCL: "", poHonorariosJRCIPCL: "",
  poDicFirmePCL: "", poFechaFirmezaPCL: "", poAplicaIPPPCL: "", poFechaEnvioPagoPCL: "",
  // 5.2
  jrFechaNotifPCL: "", jrJuntaPCL: "", jrFechaDicPCL: "", jrNumDicPCL: "",
  jrT1PCL: "", jrT2PCL: "", jrTotPCL: "", jrFechaEstPCL: "", jrEstadoDicPCL: "",
  jrRecursoPCL: "", jrFechaRecursoPCL: "", jrPagoHonPCL: "", jrFechaSolPagoPCL: "",
  jrDicFirmePCL: "", jrFechaFirmezaPCL: "", jrAplicaIPPPCL: "", jrFechaEnvioPagoPCL: "",
  // 5.3
  jnFechaNotifPCL: "", jnFechaDicPCL: "", jnNumDicPCL: "", jnT1PCL: "", jnT2PCL: "", jnTotPCL: "",
  jnFechaEstPCL: "", jnFechaFirmezaPCL: "", jnAplicaIPPPCL: "", jnFechaEnvioPagoPCL: "",

  // 6.
  diasIncapacidadAcumulados: "0",

  // 7.
  ultimaAuditoria: "", proximaAuditoria: ""
};

const RegistrosEL = () => {
  const [mode, setMode] = useState("list");
  const [currentId, setCurrentId] = useState(null);
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ id: "", trabajador: "", cedula: "", ciudad: "", fechaSiniestro: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const load = async () => {
      const data = await syncFromDB("EL");
      if (data && data.length > 0) setRecords([...data]);
      else if (dataEL && dataEL.length > 0) setRecords([...dataEL]);
    };
    load();
  }, []);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const isReadOnly = mode === "view" || userRole === "cliente";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => {
      let nd = { ...p, [name]: value };
      if (name === "ultimaAuditoria" && value) {
        const ud = new Date(value);
        ud.setMonth(ud.getMonth() + 6);
        nd.proximaAuditoria = ud.toISOString().split("T")[0];
      }
      if (name === "estadoAfiliado" && value === "Pensionado por Vejez" && !isReadOnly) {
        // Future warning or alert functionality can be triggered here
      }
      return nd;
    });
  };

  const addDx = () => setFormData(p => ({ ...p, diagnosticos: [...(p.diagnosticos || []), { id: Date.now(), descripcion: "", cie10: "", fechaDiagnostico: "", fechaCalificacionEPS: "", severidad: "", origen: "", origenFirme: "", fechaFirmeza: "" }] }));
  const removeDx = (id) => setFormData(p => ({ ...p, diagnosticos: (p.diagnosticos || []).filter(d => d.id !== id) }));
  const changeDx = (id, f, val) => setFormData(p => ({ ...p, diagnosticos: (p.diagnosticos || []).map(d => d.id === id ? { ...d, [f]: val } : d) }));

  const handleEdit = (r) => {
    const original = records.find(rec => rec.id === (r.mainId || r.id)) || r;
    setFormData({ ...INITIAL_FORM, ...original });
    setCurrentId(original.id);
    setMode("edit");
  };
  const handleView = (r) => {
    const original = records.find(rec => rec.id === (r.mainId || r.id)) || r;
    setFormData({ ...INITIAL_FORM, ...original });
    setCurrentId(original.id);
    setMode("view");
  };
  const handleSave = async () => {
    const newRec = { ...formData, id: mode === "edit" ? currentId : "EL-" + Date.now() };
    if (mode === "edit") {
      await updateRecordEL(newRec);
    } else {
      await addNewRecordEL(newRec);
    }
    const data = await syncFromDB("EL");
    if (data && data.length > 0) {
      setRecords([...data]);
    } else {
      setRecords([...dataEL]);
    }
    setMode("list"); setFormData(INITIAL_FORM);
  };

  const auditState = useMemo(() => {
    if (!formData.proximaAuditoria) return null;
    const target = new Date(formData.proximaAuditoria);
    const today = new Date();
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays > 150) return { label: "VIGENTE", color: "#48BB78", bg: "#C6F6D5" };
    if (diffDays > 0 && diffDays <= 150) return { label: "PROXIMA A VENCER", color: "#DD6B20", bg: "#FEEBC8" };
    return { label: "VENCIDA", color: "#E53E3E", bg: "#FED7D7" };
  }, [formData.proximaAuditoria]);

  const handleFilterChange = (e) => { setFilters(p => ({ ...p, [e.target.name]: e.target.value })); setCurrentPage(1); };

  const filteredRecords = useMemo(() => {
    let all = [];
    records.forEach((r) => {
      let displayEstado = r.estadoCaso || "Abierto";
      let displayOrigen = r.origenActual || "";

      if (!r.origenActual) {
        if (r.subestadoCaso === "Firme") displayOrigen = "Laboral en Firme";
        if (r.subestadoCaso === "Comun en firme") displayOrigen = "Común en Firme";
        if (r.subestadoCaso === "Controversia") displayOrigen = "En controversia";
        if (r.estadoCaso === "Laboral en Firme") displayOrigen = "Laboral en Firme";
        if (r.estadoCaso === "Comun") displayOrigen = "Común en Firme";
      }

      if (displayEstado === "En Calificación") displayEstado = "Abierto";
      if (displayEstado === "Laboral en Firme" || displayEstado === "Comun") displayEstado = "Cerrado";

      let baseRec = { ...r, estadoDisplay: displayEstado, origenDisplay: displayOrigen };

      let added = false;
      if (r.diagnosticos && Array.isArray(r.diagnosticos) && r.diagnosticos.length > 0) {
        r.diagnosticos.forEach((d) => {
          if (d.cie10 || d.descripcion) {
            all.push({ ...baseRec, ...d, diagnosticKeyId: r.id + '-' + d.id, mainId: r.id, catDisplay: d.severidad || r.categoria });
            added = true;
          }
        });
      }
      if (!added) all.push({ ...baseRec, diagnosticKeyId: r.id, catDisplay: r.categoria, mainId: r.id });
    });

    return all.filter(r => {
      const rowIdStr = r.id ? String(r.id) : "";
      const f1 = !filters.id || (rowIdStr.includes(filters.id));
      const f2 = !filters.fechaSiniestro || (r.fechaAviso && r.fechaAviso.includes(filters.fechaSiniestro));
      const f3 = !filters.trabajador || (r.nombreCompleto && r.nombreCompleto.toLowerCase().includes(filters.trabajador.toLowerCase()));
      const f4 = !filters.cedula || (r.numeroId && r.numeroId.includes(filters.cedula)) || (r.cedula && r.cedula.includes(filters.cedula));
      const f5 = !filters.ciudad || (r.ciudadAfiliado && r.ciudadAfiliado.toLowerCase().includes(filters.ciudad.toLowerCase())) || (r.ciudad && r.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase()));
      return f1 && f2 && f3 && f4 && f5;
    });
  }, [records, filters]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage); };

  const handleExportListPDF = () => {
    const columns = ["ID", "Nombre trabajador", "Cédula", "Ciudad", "Fecha del siniestro"];
    const data = filteredRecords.map(r => [
      r.id || "", r.nombreCompleto || "", r.numeroId || r.cedula || "",
      r.ciudadAfiliado || r.ciudad || "", formatDate(r.fechaAviso) || ""
    ]);
    exportToPDF("Reporte de Enfermedades Laborales", columns, data, "Listado_EL.pdf");
  };
  const handleExportListExcel = () => {
    const dataForExcel = filteredRecords.map(r => ({
      ...r,
      fechaDiagnostico: formatDate(r.fechaDiagnostico)
    }));
    exportToExcel(dataForExcel, "Listado_EL.xlsx");
  };
  const handleExportFormPDF = () => exportToPDF("Reporte EL - " + (formData.radicado || "Borrador"), ["Campo", "Valor"], Object.entries(formData).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : v]), "Formulario_EL_" + (formData.radicado || "temp") + ".pdf");
  const handleExportFormExcel = () => exportToExcel([formData], "Formulario_EL_" + (formData.radicado || "temp") + ".xlsx");

  const Field = ({ label, name, type = "text", options, disabled, multiline, colSpan }) => {
    let cmp;
    if (options) {
      cmp = <select name={name} value={formData[name] || ""} onChange={handleChange} className="input-colsanitas" disabled={disabled || isReadOnly}><option value="">Seleccione...</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
    } else if (multiline) {
      cmp = <textarea name={name} value={formData[name] || ""} onChange={handleChange} className="input-colsanitas" disabled={disabled || isReadOnly} style={{ minHeight: '80px' }} />
    } else {
      cmp = <input name={name} type={type} value={formData[name] || ""} onChange={handleChange} className="input-colsanitas" disabled={disabled || isReadOnly} />
    }
    return <div className="filter-group" style={colSpan ? { gridColumn: "span " + colSpan } : {}}><label style={{ fontSize: "12px", color: "#718096" }}>{label}</label>{cmp}</div>
  };

  return (
    <div className="container-fluid" style={{ padding: "20px" }}>
      {mode === "list" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, color: "var(--colsanitas-blue)" }}>Gestión de Enfermedad Laboral (EL)</h2>
            {userRole !== "cliente" && (
              <button className="btn-colsanitas" onClick={() => { setFormData(INITIAL_FORM); setMode("create"); }}>
                <PlusCircle size={18} /> Nuevo Registro
              </button>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "10px" }}>
            <button className="btn-colsanitas-outline" onClick={handleExportListPDF} style={{ padding: "8px 15px", fontSize: "12px" }}><FileText size={14} /> Exportar PDF</button>
            <button className="btn-colsanitas-outline" onClick={handleExportListExcel} style={{ padding: "8px 15px", fontSize: "12px" }}><Download size={14} /> Exportar Excel</button>
          </div>

          <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}><Filter size={18} color="var(--colsanitas-green)" /><h3 style={{ margin: 0, fontSize: "16px" }}>Filtros de Búsqueda</h3></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "15px" }}>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>ID</label><input name="id" value={filters.id} onChange={handleFilterChange} className="input-colsanitas" /></div>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Nombre trabajador</label><input name="trabajador" value={filters.trabajador} onChange={handleFilterChange} className="input-colsanitas" /></div>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Cédula</label><input name="cedula" value={filters.cedula} onChange={handleFilterChange} className="input-colsanitas" /></div>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Ciudad</label><input name="ciudad" value={filters.ciudad} onChange={handleFilterChange} className="input-colsanitas" /></div>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Fecha del siniestro</label><input type="date" name="fechaSiniestro" value={filters.fechaSiniestro} onChange={handleFilterChange} className="input-colsanitas" /></div>
              <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn-colsanitas-outline" onClick={() => setFilters({ id: "", trabajador: "", cedula: "", ciudad: "", fechaSiniestro: "" })}>Limpiar</button></div>
            </div>
          </div>

          <div className="card" style={{ overflowX: "auto" }}>
            <table className="table-colsanitas" style={{ width: "100%", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#EDF2F7", color: "#4A5568" }}>
                  <th>ID</th>
                  <th>Nombre trabajador</th>
                  <th>Cédula</th>
                  <th>Ciudad</th>
                  <th>Fecha del siniestro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map(item => (
                    <tr key={item.diagnosticKeyId}>
                      <td style={{ padding: "12px" }}>{item.id}</td>
                      <td>{item.nombreCompleto}</td>
                      <td>{item.numeroId || item.cedula}</td>
                      <td>{item.ciudadAfiliado || item.ciudad}</td>
                      <td>{formatDate(item.fechaAviso)}</td>
                      <td>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button onClick={() => handleView(item)} title="Ver" style={{ cursor: "pointer", padding: "5px", border: "none", background: "none" }}><Eye size={18} color="#3182CE" /></button>
                          {userRole !== "cliente" && <button onClick={() => handleEdit(item)} title="Editar" style={{ cursor: "pointer", padding: "5px", border: "none", background: "none" }}><Edit size={18} color="#48BB78" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>No hay registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "20px" }}>
              <button className="btn-colsanitas-outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ opacity: currentPage === 1 ? 0.5 : 1 }}>Anterior</button>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#4A5568" }}>Página {currentPage} de {totalPages}</span>
              <button className="btn-colsanitas-outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}>Siguiente</button>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "15px" }}>
            <h2 style={{ margin: 0, color: "#2B6CB0" }}>Registro de Enfermedad Laboral ({formData.radicado || "Nuevo"})</h2>
            <button onClick={() => { setMode("list"); setFormData(INITIAL_FORM); }} className="btn-colsanitas-outline"><X size={16} /> Cerrar</button>
          </div>

          <fieldset disabled={isReadOnly} style={{ border: "none", padding: 0 }}>
            {/* 1. INFORMACION GENERAL */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE", display: "flex", justifyContent: "space-between" }}>
              <span>1. Información General del Caso</span>
              {!isReadOnly && <button type="button" className="btn-colsanitas-outline" style={{ padding: "5px 10px", fontSize: "12px", gap: "5px", display: "flex", alignItems: "center" }}><FileText size={16} /> Radicación Expediente</button>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
              <Field label="ID Registro" name="id" disabled={true} />
              <Field label="Estado de Caso" name="estadoCaso" options={O_ESTADO_CASO} />
              <Field label="Origen Actual" name="origenActual" options={O_ORIGEN_ACTUAL} />
              <Field label="ARL Traslado" name="arlTraslado" options={O_ARL} />
              <Field label="Estatus de Póliza" name="statusPoliza" options={O_ESTATUS_POLIZA} />
              <Field label="Estado del afiliado" name="estadoAfiliado" options={O_ESTADO_AFILIADO} />
              <Field label="Radicado" name="radicado" />
              <Field label="Siniestro" name="siniestro" />
              <Field label="Fecha Inicio Cobertura" name="fechaInicioCobertura" type="date" />
              <Field label="Fecha del Aviso" name="fechaAviso" type="date" />

              <Field label="Tipo de identificación" name="tipoId" options={["CC", "CE", "PPT", "PEP", "TI", "Pasaporte"]} />
              <Field label="Número de identificación" name="numeroId" />
              <Field label="Nombre Afiliado" name="nombreCompleto" colSpan={2} />

              <Field label="Depto Afiliado" name="departamentoAfiliado" options={Object.keys(DEPARTAMENTOS_COLOMBIA)} />
              <Field label="Ciudad Afiliado" name="ciudadAfiliado" options={formData.departamentoAfiliado ? DEPARTAMENTOS_COLOMBIA[formData.departamentoAfiliado] : []} />

              <Field label="Grupo Empresarial" name="grupoEmpresarial" />
              <Field label="Nombre o Razón Social" name="empresa" options={["Risk", "Technology", "Secure", "Infotec"]} colSpan={2} />
              <Field label="NIT" name="nit" />
              <Field label="Centro de Trabajo" name="centroTrabajo" />

              <Field label="Enfermedad Causó la Muerte" name="causoMuerte" options={O_SINO} />
              {formData.causoMuerte === "SI" && <Field label="Fecha de Fallecimiento" name="fechaFallecimiento" type="date" />}
            </div>

            {/* 2. DIAGNOSTICOS */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE", display: "flex", justifyContent: "space-between" }}>
              <span>2. Diagnósticos y Severidad</span>
              {!isReadOnly && <button type="button" onClick={addDx} style={{ border: "none", color: "#3182CE", background: "none", cursor: "pointer", display: "flex", gap: "5px", alignItems: "center" }}><PlusCircle size={14} />Agregar Diagnóstico</button>}
            </div>
            {formData.diagnosticos && formData.diagnosticos.map((d, index) => (
              <div key={d.id} style={{ border: "1px solid #e2e8f0", padding: "15px", marginBottom: "15px", borderRadius: "5px", position: "relative" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", alignItems: "end" }}>
                  <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Descripción</label><input value={d.descripcion} onChange={(e) => changeDx(d.id, "descripcion", e.target.value)} className="input-colsanitas" disabled={isReadOnly} /></div>
                  <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>CIE10</label><input value={d.cie10} onChange={(e) => changeDx(d.id, "cie10", e.target.value)} className="input-colsanitas" disabled={isReadOnly} /></div>
                  <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Categoría (Severidad)</label><select value={d.severidad} onChange={(e) => changeDx(d.id, "severidad", e.target.value)} className="input-colsanitas" disabled={isReadOnly}><option value="">Sel...</option>{O_CATEGORIA.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Fecha del Diagnóstico</label><input type="date" value={d.fechaDiagnostico} onChange={(e) => changeDx(d.id, "fechaDiagnostico", e.target.value)} className="input-colsanitas" disabled={isReadOnly} /></div>
                  <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Fecha de Calificación EPS</label><input type="date" value={d.fechaCalificacionEPS} onChange={(e) => changeDx(d.id, "fechaCalificacionEPS", e.target.value)} className="input-colsanitas" disabled={isReadOnly} /></div>
                  <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Origen</label><select value={d.origen} onChange={(e) => changeDx(d.id, "origen", e.target.value)} className="input-colsanitas" disabled={isReadOnly}><option value="">Sel...</option>{O_ORIGEN_CALIFICADO.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Origen en Firme</label><select value={d.origenFirme} onChange={(e) => changeDx(d.id, "origenFirme", e.target.value)} className="input-colsanitas" disabled={isReadOnly}><option value="">Sel...</option>{O_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  {d.origenFirme === "SI" && <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Fecha de firmeza</label><input type="date" value={d.fechaFirmeza} onChange={(e) => changeDx(d.id, "fechaFirmeza", e.target.value)} className="input-colsanitas" disabled={isReadOnly} /></div>}
                </div>
                {!isReadOnly && <button type="button" onClick={() => removeDx(d.id)} style={{ position: "absolute", top: "10px", right: "10px", padding: "5px", background: "#FED7D7", color: "#C53030", border: "none", borderRadius: "5px", cursor: "pointer" }}><Trash2 size={16} /></button>}
              </div>
            ))}

            {/* 3. PROCESO CALIF ORIGEN */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE" }}>3. Proceso de Calificación de Origen</div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "20px" }}>3.1 Calificación de Origen en Primera Oportunidad</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: '10px', background: '#FDF7DF' }}>
              <Field label="Fecha de notificación" name="poFechaNotifOri" type="date" />
              <Field label="Fecha origen (1ra Oport.)" name="poFechaOri" type="date" />
              <Field label="Entidad Calificadora" name="poEntidadOri" options={O_ENTIDADES_CALIF} />
              <Field label="Número de dictamen" name="poNumDicOri" />
              <Field label="Origen calificado" name="poOrigenCalificado" options={O_ORIGEN_CALIFICADO} />
              <Field label="Estado del origen en PO" name="poEstadoOrigen" options={O_ESTADO_ORIGEN} />
              <Field label="Recurso presentado" name="poRecursoOri" options={O_RECURSO} />
              <Field label="Fecha del recurso" name="poFechaRecursoOri" type="date" />
              <Field label="Pago de Honorarios" name="poPagoHonOri" options={O_PAGO} />
              <Field label="Fecha solicitud pago" name="poFechaSolPagoOri" type="date" />
              <Field label="Honorarios a JRCI" name="poHonorariosJRCI" options={O_JUNTAS} />
              <Field label="Dictamen en firme" name="poDicFirmeOri" options={O_SINO} />
              {formData.poDicFirmeOri === "SI" && <Field label="Fecha de firmeza" name="poFechaFirmezaOri" type="date" />}
            </div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "20px" }}>3.2 Calificación de Origen en Junta Regional de Calificación</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: '10px', background: '#F1F8FB' }}>
              <Field label="Junta Regional" name="jrJuntaOri" options={O_JUNTAS} />
              <Field label="Fecha de notificación" name="jrFechaNotifOri" type="date" />
              <Field label="Fecha origen JRCI" name="jrFechaOri" type="date" />
              <Field label="Número de dictamen" name="jrNumDicOri" />
              <Field label="Origen calificado" name="jrOrigenCalificado" options={O_ORIGEN_CALIFICADO} />
              <Field label="Estado del origen JRCI" name="jrEstadoOrigen" options={O_ESTADO_ORIGEN} />
              <Field label="Recurso presentado" name="jrRecursoOri" options={O_RECURSO} />
              <Field label="Fecha del recurso" name="jrFechaRecursoOri" type="date" />
              <Field label="Pago de Honorarios" name="jrPagoHonOri" options={O_PAGO} />
              <Field label="Fecha solicitud pago" name="jrFechaSolPagoOri" type="date" />
              <Field label="Dictamen en firme" name="jrDicFirmeOri" options={O_SINO} />
              {formData.jrDicFirmeOri === "SI" && <Field label="Fecha de firmeza" name="jrFechaFirmezaOri" type="date" />}
            </div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "20px" }}>3.3 Calificación de Origen en Junta Nacional de Calificación</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: '10px', background: '#E6FFFA' }}>
              <Field label="Fecha de notificación" name="jnFechaNotifOri" type="date" />
              <Field label="Fecha origen JNCI" name="jnFechaOri" type="date" />
              <Field label="Número de dictamen" name="jnNumDicOri" />
              <Field label="Origen calificado" name="jnOrigenCalificado" options={O_ORIGEN_CALIFICADO} />
              <Field label="Fecha de firmeza" name="jnFechaFirmezaOri" type="date" />
            </div>

            {/* 4. REHAB+ */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE" }}>4. Clasificación de casos REHAB+</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              <Field label="Caso Clasificado como REHAB+" name="rehabClasificado" options={O_SINO} />
              {formData.rehabClasificado === "SI" && <Field label="Causa de remisión a REHAB+" name="rehabCausa" options={O_CAUSA_REHAB} />}
              {formData.rehabClasificado === "SI" && <Field label="Fecha de categorización" name="rehabFecha" type="date" />}
            </div>

            {/* 5. PCL */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE" }}>5. Proceso de Calificación de PCL (Pérdida de Capacidad Laboral)</div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "20px" }}>5.1 Calificación PCL primera vez</p>
            <div className="filter-group" style={{ maxWidth: "300px", marginBottom: "10px" }}><label style={{ fontSize: "12px", color: "#C53030", fontWeight: "bold" }}>PCL Presunta (Alfanúmerica)</label><input name="poPCLPresunta" value={formData.poPCLPresunta} onChange={handleChange} className="input-colsanitas" disabled={isReadOnly} /></div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: '10px', background: '#FDF7DF' }}>
              <Field label="Fecha solicitud PCL" name="poFechaSolPCL" type="date" />
              <Field label="Entidad calificadora" name="poEntidadPCL" options={O_ENTIDADES_CALIF} />
              <Field label="Manual de calificación" name="poManualPCL" options={O_MANUAL_CALIF} />
              <Field label="Fecha del dictamen" name="poFechaDicPCL" type="date" />
              <Field label="Número de dictamen" name="poNumDicPCL" />

              <Field label="TITULO I" name="poT1PCL" />
              <Field label="TITULO II" name="poT2PCL" />
              <Field label="PCL TOTAL" name="poTotPCL" />
              <Field label="Fecha de estructuración" name="poFechaEstPCL" type="date" />
              <Field label="Fecha de notificación" name="poFechaNotifPCL" type="date" />
              <Field label="Estado del Dictamen" name="poEstadoDicPCL" options={O_ESTADO_ORIGEN} />
              <Field label="Recurso presentado" name="poRecursoPCL" options={O_RECURSO} />
              <Field label="Fecha del recurso" name="poFechaRecursoPCL" type="date" />
              <Field label="Pago de honorarios" name="poPagoHonPCL" options={O_PAGO} />
              <Field label="Fecha solicitud pago" name="poFechaSolPagoPCL" type="date" />
              <Field label="Honorarios a JRCI" name="poHonorariosJRCIPCL" options={O_JUNTAS} />
              <Field label="Dictamen en firme" name="poDicFirmePCL" options={O_SINO} />
              {formData.poDicFirmePCL === "SI" && <Field label="Fecha de firmeza" name="poFechaFirmezaPCL" type="date" />}
              <Field label="Aplica pago IPP" name="poAplicaIPPPCL" options={O_SINO} />
              <Field label="Fecha de envío a pago" name="poFechaEnvioPagoPCL" type="date" />
            </div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "20px" }}>5.2 Calificación PCL JRCI</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: '10px', background: '#F1F8FB' }}>
              <Field label="Fecha de notificación" name="jrFechaNotifPCL" type="date" />
              <Field label="Junta Regional" name="jrJuntaPCL" options={O_JUNTAS} />
              <Field label="Fecha del dictamen" name="jrFechaDicPCL" type="date" />
              <Field label="Número de dictamen" name="jrNumDicPCL" />
              <Field label="TITULO I" name="jrT1PCL" />
              <Field label="TITULO II" name="jrT2PCL" />
              <Field label="PCL TOTAL" name="jrTotPCL" />
              <Field label="Fecha de estructuración" name="jrFechaEstPCL" type="date" />
              <Field label="Estado del Dictamen" name="jrEstadoDicPCL" options={O_ESTADO_ORIGEN} />
              <Field label="Recurso presentado" name="jrRecursoPCL" options={O_RECURSO} />
              <Field label="Fecha del recurso" name="jrFechaRecursoPCL" type="date" />
              <Field label="Pago de honorarios" name="jrPagoHonPCL" options={O_PAGO} />
              <Field label="Fecha solicitud pago" name="jrFechaSolPagoPCL" type="date" />
              <Field label="Dictamen en firme" name="jrDicFirmePCL" options={O_SINO} />
              {formData.jrDicFirmePCL === "SI" && <Field label="Fecha de firmeza" name="jrFechaFirmezaPCL" type="date" />}
              <Field label="Aplica pago IPP" name="jrAplicaIPPPCL" options={O_SINO} />
              <Field label="Fecha de envío a pago" name="jrFechaEnvioPagoPCL" type="date" />
            </div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "20px" }}>5.3 Calificación PCL JNCI</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: '10px', background: '#E6FFFA' }}>
              <Field label="Fecha de notificación" name="jnFechaNotifPCL" type="date" />
              <Field label="Fecha del dictamen" name="jnFechaDicPCL" type="date" />
              <Field label="Número de dictamen" name="jnNumDicPCL" />
              <Field label="TITULO I" name="jnT1PCL" />
              <Field label="TITULO II" name="jnT2PCL" />
              <Field label="PCL TOTAL" name="jnTotPCL" />
              <Field label="Fecha de estructuración" name="jnFechaEstPCL" type="date" />
              <Field label="Fecha de firmeza" name="jnFechaFirmezaPCL" type="date" />
              <Field label="Aplica pago IPP" name="jnAplicaIPPPCL" options={O_SINO} />
              <Field label="Fecha de envío a pago" name="jnFechaEnvioPagoPCL" type="date" />
            </div>

            {/* 6. INCAPACIDAD TEMPORAL ACUMULADA */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE" }}>6. Incapacidad Temporal Acumulada</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              <Field label="Días de incapacidad acumulados" name="diasIncapacidadAcumulados" disabled={true} />
              <p style={{ fontSize: "12px", color: "gray", fontStyle: "italic", margin: 0, gridColumn: "span 2", alignSelf: "center" }}>* Estos días se acumulan vía masa desde los radicados generales de nómina / pagos.</p>
            </div>

            {/* 7. AUDITORIA MEDICA */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE" }}>7. Informe de Auditoría Médica</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", alignItems: "center" }}>
              <div>
                <Field label="Fecha de última auditoría" name="ultimaAuditoria" type="date" />
                <Field label="Fecha de próxima auditoría" name="proximaAuditoria" type="date" disabled={true} />
              </div>
              <div style={{ gridColumn: "span 2", padding: "15px" }}>
                {auditState && (
                  <div style={{ padding: "15px", textAlign: "center", borderRadius: "8px", background: auditState.bg, color: auditState.color, border: "2px solid " + auditState.color, fontWeight: "bold", fontSize: "18px" }}>
                    {auditState.label}
                  </div>
                )}
              </div>
            </div>

          </fieldset>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", gap: "10px" }}>
            <button onClick={() => { setMode("list"); setFormData(INITIAL_FORM); }} className="btn-colsanitas-outline">{isReadOnly ? "Volver" : "Cancelar"}</button>
            <button onClick={handleExportFormPDF} className="btn-colsanitas-outline" title="Exportar a PDF"><FileText size={18} /> Descargar Ficha PDF</button>
            <button onClick={handleExportFormExcel} className="btn-colsanitas-outline" title="Exportar a Excel"><Download size={18} /> Descargar Datos Excel</button>
            {!isReadOnly && <button onClick={handleSave} className="btn-colsanitas"><Save size={18} /> Guardar Cambios</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrosEL;
