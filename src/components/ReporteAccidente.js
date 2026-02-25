import React, { useState, useMemo, useEffect } from "react";
import { Shield, FileText, Save, Trash2, Edit, PlusCircle, Search, Download, Filter, Eye, AlertCircle, AlertTriangle, Calendar, X } from "lucide-react";
import { actionDataAT, dataAT, addNewRecord, updateRecord, deleteRecord, DEPARTAMENTOS_COLOMBIA, syncFromDB } from "../data";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";

// --- CONSTANTES ---
const O_GENERO = ["Masculino", "Femenino", "Otro"];
const O_EMPRESA = ["COLLECTIVE SAS", "CENTRO MÉDICO", "EPS COLSANITAS", "ESTRATÉGICOS 360 SAS"];
const O_ESTADO_EMP = ["Activa", "Inactiva", "En Liquidación"];
const O_CATEGORIA = ["Alta Inmediata", "Muy Leve", "Leve", "Moderado", "Severo", "Grave", "Mortal"];
const O_ESTADO_CASO = ["Abierto", "Cerrado", "Objetado", "Anulado", "Desistido", "Invalido"];
const O_SINO = ["SI", "NO"];
const O_OPORTUNIDAD = ["Oportuno", "Extemporáneo", "Sin Reporte"];
const O_TIPO_AT = ["Propio del Trabajo", "Biológico", "Tránsito", "Violento", "Deportivo/Cultural"];
const O_MANEJO = ["Teleconsulta", "Medico Domiciliario", "Consulta Prioritaria", "Urgencias"];
const O_TIPO_DX = ["Derivado del AT", "Adición diagnóstica AT", "Hallazgo Incidental NO AT"];
const O_CAUSA_REHAB = ["Caso Grave Res. 1401", "IT igual o mayor a 30 días", "Caso que se beneficia del programa"];
const O_TIPO_CALIF = ["PCL", "Origen", "PCL y Origen"];
const O_ENTIDADES = ["ARL", "EPS", "AFP", "Otra"];
const O_DICTAMEN_ESTADO = ["En firme", "En Controversia", "Sin información"];
const O_RECURSO = ["En acuerdo", "En desacuerdo", "Sin información"];
const O_PAGO = ["Si", "No", "Sin información"];
const O_DOCS = [
  "Ampliación de Hechos", "Versión de testigos", "Investigación del AT",
  "Certificado de cargos y funciones", "Documentos del vehículo",
  "Malla de programación o desplazamientos", "Otros"
];
const O_JUNTAS = [
  "Junta Regional de Antioquia", "Junta Regional de Arauca", "Junta Regional de Atlántico", "Junta Regional de Bogotá",
  "Junta Regional de Bolívar", "Junta Regional de Boyacá", "Junta Regional de Caldas", "Junta Regional de Cauca",
  "Junta Regional de Cesar", "Junta Regional de Córdoba", "Junta Regional de Cundinamarca", "Junta Regional de Huila",
  "Junta Regional de La Guajira", "Junta Regional de Magdalena", "Junta Regional de Meta", "Junta Regional de Nariño",
  "Junta Regional de Norte de Santander", "Junta Regional de Quindío", "Junta Regional de Risaralda",
  "Junta Regional de Santander", "Junta Regional de Sucre", "Junta Regional de Tolima", "Junta Regional de Valle del Cauca"
];

const INIT_FORM = {
  radicado: "", siniestro: "", estadoCaso: "Abierto", fechaEstado: new Date().toISOString().split('T')[0],
  descripcionEvento: "", adminCasos: "Admin Asignado Automático", asesorRehab: "Asesor Asignado Automático",
  cedula: "", apellidosNombres: "", genero: "", fechaNacimiento: "", edad: "",
  grupoEmpresarial: "", empresa: "", nit: "", estadoEmpresa: "", cargo: "", poliza: "", certificado: "",
  departamento: "", ciudad: "", fechaAT: "", fechaAvisoAT: "", origenAprobado: "", fechaAprobOrigen: "",
  oportunidadReporte: "", casoDudoso: "NO", documentosDudoso: [], fechaSolDocs: "", reapertura: "", fechaReapertura: "",
  categoriaEvento: "", recategorizado: "", fechaRecat: "", nuevaCategoria: "", tipoAT: "", manejoInicial: "",
  atMortal: "", fechaFallecimiento: "", atGrave1401: "", fechaNotif1401: "",
  furatDiligenciado: "", fechaFurat: "", oportLegalizacion: "",
  diasIncapacidadAcumulados: "0", diagnosticosReconocidos: [],
  casoRehab: "", causaRehab: "", fechaRehab: "",
  reqCalificacion: "", tipoCalifSol: "", fechaEnvioCalif: "",
  pclPresunta: "", poSolPCL: "", poEntidad: "", poFechaDic: "", poNumDic: "", poT1: "", poT2: "", poTot: "", poFechaEst: "", poFechaNot: "",
  poEstadoDic: "", poRecurso: "", poFechaRec: "", poPagoHon: "", poFechaSolPago: "", poHonorariosJRCI: "", poDicFirme: "", poFechaFirme: "",
  poAplicaIPP: "", poFechaEnvioPago: "",
  jrFechaNot: "", jrJunta: "", jrFechaDic: "", jrNumDic: "", jrT1: "", jrT2: "", jrTot: "", jrFechaEst: "", jrEstadoDic: "",
  jrRecurso: "", jrFechaRec: "", jrPagoHon: "", jrFechaSolPago: "", jrDicFirme: "", jrFechaFirme: "", jrAplicaIPP: "", jrFechaEnvioPago: "",
  jnFechaNot: "", jnFechaDic: "", jnNumDic: "", jnT1: "", jnT2: "", jnTot: "", jnFechaEst: "", jnFechaFirme: "", jnAplicaIPP: "", jnFechaEnvioPago: "",
  firmezaFecha: "", firmezaEntidad: "", firmezaPCL: "", firmezaFechaEst: "", firmezaGestion: "",
  seguimientos: [], proximoSeguimiento: "", ultimaAuditoria: "", proximaAuditoria: ""
};

const ReporteAccidente = () => {
  const [mode, setMode] = useState("list");
  const [currentId, setCurrentId] = useState(null);
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ radicado: "", fecha: "", trabajador: "", empresa: "", categoria: "", estado: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    const load = async () => {
      const data = await syncFromDB("AT");
      if (data && data.length > 0) setRecords([...data]);
      else if (dataAT && dataAT.length > 0) setRecords([...dataAT]);
    };
    load();
  }, []);

  const [formData, setFormData] = useState(INIT_FORM);
  const isReadOnly = mode === "view" || userRole === "cliente";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      let arr = [...(formData[name] || [])];
      if (checked) arr.push(value);
      else arr = arr.filter(i => i !== value);
      setFormData(p => ({ ...p, [name]: arr }));
    } else {
      setFormData(p => {
        let nd = { ...p, [name]: value };
        if (name === "fechaNacimiento" && value) {
          const today = new Date();
          const b = new Date(value);
          let a = today.getFullYear() - b.getFullYear();
          const m = today.getMonth() - b.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < b.getDate())) a--;
          nd.edad = a;
        }
        if (name === "ultimaAuditoria" && value) {
          const ud = new Date(value);
          ud.setMonth(ud.getMonth() + 6);
          nd.proximaAuditoria = ud.toISOString().split("T")[0];
        }
        if (name === "estadoCaso" && ['Cerrado', 'Objetado', 'Anulado', 'Desistido', 'Invalido'].includes(value)) {
          nd.fechaEstado = new Date().toISOString().split("T")[0];
        }
        return nd;
      });
    }
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

  const addDx = () => setFormData(p => ({ ...p, diagnosticosReconocidos: [...(p.diagnosticosReconocidos || []), { id: Date.now(), cie10: "", descripcion: "", tipo: "" }] }));
  const removeDx = (id) => setFormData(p => ({ ...p, diagnosticosReconocidos: (p.diagnosticosReconocidos || []).filter(d => d.id !== id) }));
  const changeDx = (id, f, val) => setFormData(p => ({ ...p, diagnosticosReconocidos: (p.diagnosticosReconocidos || []).map(d => d.id === id ? { ...d, [f]: val } : d) }));

  const addSeg = () => setFormData(p => ({ ...p, seguimientos: [...(p.seguimientos || []), { id: Date.now(), fecha: "", texto: "" }] }));
  const removeSeg = (id) => setFormData(p => ({ ...p, seguimientos: (p.seguimientos || []).filter(d => d.id !== id) }));
  const changeSeg = (id, f, val) => setFormData(p => ({ ...p, seguimientos: (p.seguimientos || []).map(d => d.id === id ? { ...d, [f]: val } : d) }));

  const handleEdit = (r) => { setFormData(r); setCurrentId(r.id); setMode("edit"); };
  const handleView = (r) => { setFormData(r); setCurrentId(r.id); setMode("view"); };
  const handleSave = () => {
    const newRec = { ...formData, id: mode === "edit" ? currentId : "AT-" + Date.now() };
    if (mode === "edit") updateRecord(newRec); else addNewRecord(newRec);

    syncFromDB("AT").then(data => {
      if (data) setRecords([...data]);
      else setRecords([...dataAT]);
    });

    setMode("list"); setFormData(INIT_FORM);
  };

  const handleFilterChange = (e) => { setFilters(p => ({ ...p, [e.target.name]: e.target.value })); setCurrentPage(1); };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const f1 = !filters.radicado || (r.radicado && r.radicado.toLowerCase().includes(filters.radicado.toLowerCase()));
      const f2 = !filters.fecha || (r.fechaAT && r.fechaAT.includes(filters.fecha));
      const f3 = !filters.trabajador || (r.apellidosNombres && r.apellidosNombres.toLowerCase().includes(filters.trabajador.toLowerCase())) || (r.cedula && r.cedula.includes(filters.trabajador));
      const f4 = !filters.empresa || r.empresa === filters.empresa;
      const f5 = !filters.categoria || (r.categoriaEvento && r.categoriaEvento === filters.categoria) || (r.severidad && r.severidad === filters.categoria);
      const f6 = !filters.estado || (r.estadoCaso && r.estadoCaso === filters.estado);
      return f1 && f2 && f3 && f4 && f5 && f6;
    });
  }, [records, filters]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleExportListPDF = () => {
    const columns = ["Radicado", "Fecha AT", "Trabajador", "Empresa", "Categoría", "Estado"];
    const data = filteredRecords.map(r => [
      r.radicado || "", r.fechaAT || "", r.apellidosNombres || "",
      r.empresa || "", r.categoriaEvento || "", r.estadoCaso || ""
    ]);
    exportToPDF("Reporte de Accidentes de Trabajo", columns, data, "Listado_AT.pdf");
  };
  const handleExportListExcel = () => exportToExcel(filteredRecords, "Listado_AT.xlsx");
  const handleExportMaster = () => exportToExcel(dataAT, "Base_Maestra_AT.xlsx");
  const handleExportFormPDF = () => exportToPDF(`Reporte Accidente - ${formData.radicado || "Borrador"}`, ["Campo", "Valor"], Object.entries(formData).map(([k, v]) => [k, v]), `Formulario_AT_${formData.radicado || "temp"}.pdf`);
  const handleExportFormExcel = () => exportToExcel([formData], `Formulario_AT_${formData.radicado || "temp"}.xlsx`);


  const Field = ({ label, name, type = "text", options, disabled, multiline, colSpan }) => {
    let cmp;
    if (options) {
      cmp = <select name={name} value={formData[name] || ""} onChange={handleChange} className="input-colsanitas" disabled={disabled || isReadOnly}><option value="">Seleccione...</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
    } else if (multiline) {
      cmp = <textarea name={name} value={formData[name] || ""} onChange={handleChange} className="input-colsanitas" disabled={disabled || isReadOnly} style={{ minHeight: '80px' }} />
    } else {
      cmp = <input name={name} type={type} value={formData[name] || ""} onChange={handleChange} className="input-colsanitas" disabled={disabled || isReadOnly} />
    }
    return <div className="filter-group" style={colSpan ? { gridColumn: `span ${colSpan}` } : {}}><label style={{ fontSize: "12px", color: "#718096" }}>{label}</label>{cmp}</div>
  };

  const DocsCheckboxes = () => (
    <div style={{ gridColumn: "span 3", background: "#f9fafb", padding: "10px", borderRadius: "8px" }}>
      <span style={{ fontSize: "12px", color: "#718096", display: "block", marginBottom: "10px" }}>Documentos Solicitados <small>(Casos Rechazados)</small></span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
        {O_DOCS.map(d => (
          <label key={d} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px" }}>
            <input type="checkbox" name="documentosDudoso" value={d} checked={(formData.documentosDudoso || []).includes(d)} onChange={handleChange} disabled={isReadOnly} />
            {d}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: "20px" }}>
      {mode === "list" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, color: "var(--colsanitas-blue)" }}>Gestión de Accidentes de Trabajo (AT)</h2>
            {userRole !== "cliente" && (
              <button className="btn-colsanitas" onClick={() => { setFormData(INIT_FORM); setMode("create"); }}>
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
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Radicado</label><input name="radicado" value={filters.radicado} onChange={handleFilterChange} className="input-colsanitas" /></div>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Fecha AT</label><input type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} className="input-colsanitas" /></div>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Trabajador</label><input name="trabajador" value={filters.trabajador} onChange={handleFilterChange} className="input-colsanitas" /></div>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Empresa</label><select name="empresa" value={filters.empresa} onChange={handleFilterChange} className="input-colsanitas"><option value="">Todas</option>{O_EMPRESA.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Categoría</label><select name="categoria" value={filters.categoria} onChange={handleFilterChange} className="input-colsanitas"><option value="">Todas</option>{O_CATEGORIA.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Estado</label><select name="estado" value={filters.estado} onChange={handleFilterChange} className="input-colsanitas"><option value="">Todos</option>{O_ESTADO_CASO.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn-colsanitas-outline" onClick={() => setFilters({ radicado: "", fecha: "", trabajador: "", empresa: "", categoria: "", estado: "" })}>Limpiar</button></div>
            </div>
          </div>

          <div className="card" style={{ overflowX: "auto" }}>
            <table className="table-colsanitas" style={{ width: "100%", textAlign: "left" }}>
              <thead>
                <tr style={{ backgroundColor: "#EDF2F7", color: "#4A5568" }}>
                  <th>Radicado</th>
                  <th>Fecha AT</th>
                  <th>Trabajador</th>
                  <th>Empresa</th>
                  <th>Categoría</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: "12px" }}>{item.radicado}</td>
                      <td>{item.fechaAT || item.fechaOcurrenciaAT}</td>
                      <td>{item.apellidosNombres}</td>
                      <td>{item.empresa}</td>
                      <td>{item.categoriaEvento || item.severidad}</td>
                      <td><span style={{ backgroundColor: "#EBF8FF", color: "#3182CE", padding: "4px 8px", borderRadius: "12px", fontSize: "11px" }}>{item.estadoCaso}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button onClick={() => handleView(item)} title="Ver" style={{ cursor: "pointer", padding: "5px", border: "none", background: "none" }}><Eye size={18} color="#3182CE" /></button>
                          {userRole !== "cliente" && <button onClick={() => handleEdit(item)} title="Editar" style={{ cursor: "pointer", padding: "5px", border: "none", background: "none" }}><Edit size={18} color="#48BB78" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>No hay registros</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "20px" }}>
              <button
                className="btn-colsanitas-outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#4A5568" }}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="btn-colsanitas-outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "15px" }}>
            <h2 style={{ margin: 0, color: "#2B6CB0" }}>Registro de Accidente ({formData.radicado || "Nuevo"})</h2>
            <button onClick={() => { setMode("list"); setFormData(INIT_FORM); }} className="btn-colsanitas-outline"><X size={16} /> Cerrar</button>
          </div>

          <fieldset disabled={isReadOnly} style={{ border: "none", padding: 0 }}>
            {/* 1. INFORMACION */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE" }}>1. Información del registro</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              <Field label="ID Registro" name="id" disabled={true} />
              <Field label="Estado del Caso" name="estadoCaso" options={O_ESTADO_CASO} />
              <Field label="Fecha del Estado" name="fechaEstado" type="date" />
              <Field label="Número de Radicado" name="radicado" />
              <Field label="Número de Siniestro" name="siniestro" />
              <Field label="Administradora de Casos" name="adminCasos" disabled={true} />
              <Field label="Asesor Rehab Asignado" name="asesorRehab" disabled={true} />
              <Field label="Descripción del Evento (Diligenciado por Empresa)" name="descripcionEvento" multiline={true} colSpan={3} />
            </div>

            {/* 2. TRABAJADOR */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE" }}>2. Datos del trabajador</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
              <Field label="Cédula" name="cedula" />
              <Field label="Apellidos y Nombres" name="apellidosNombres" colSpan={2} />
              <Field label="Género" name="genero" options={O_GENERO} />
              <Field label="Fecha Nacimiento" name="fechaNacimiento" type="date" />
              <Field label="Edad Calculada" name="edad" disabled={true} />
              <Field label="Número de Póliza" name="poliza" disabled={true} />
              <Field label="Certificado" name="certificado" disabled={true} />
              <Field label="Empresa" name="empresa" options={O_EMPRESA} />
              <Field label="Cargo" name="cargo" colSpan={2} />
            </div>

            {/* 3. EVENTO */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE" }}>3. Detalle del evento</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
              <Field label="Departamento" name="departamento" options={Object.keys(DEPARTAMENTOS_COLOMBIA)} />
              <Field label="Ciudad" name="ciudad" options={formData.departamento ? DEPARTAMENTOS_COLOMBIA[formData.departamento] : []} />
              <Field label="Fecha de Ocurrencia AT" name="fechaAT" type="date" />
              <Field label="Fecha del aviso AT" name="fechaAvisoAT" type="date" />
              <Field label="Origen Aprobado" name="origenAprobado" options={O_SINO} />
              {formData.origenAprobado === "SI" && <Field label="Fecha de Aprobación" name="fechaAprobOrigen" type="date" />}
              <Field label="Oportunidad del reporte" name="oportunidadReporte" options={O_OPORTUNIDAD} />
              <Field label="Caso Dudoso" name="casoDudoso" options={O_SINO} />
              {formData.casoDudoso === "SI" && <Field label="Fecha Solicitud Documentos" name="fechaSolDocs" type="date" />}
              {formData.casoDudoso === "SI" && <DocsCheckboxes />}
              <Field label="Reapertura AT" name="reapertura" options={O_SINO} />
              {formData.reapertura === "SI" && <Field label="Fecha de reapertura" name="fechaReapertura" type="date" />}

              <Field label="Categoría del Evento" name="categoriaEvento" options={O_CATEGORIA} />
              <Field label="Recategorizado" name="recategorizado" options={O_SINO} />
              {formData.recategorizado === "SI" && <Field label="Fecha de recategorización" name="fechaRecat" type="date" />}
              {formData.recategorizado === "SI" && <Field label="Nueva categoría" name="nuevaCategoria" options={O_CATEGORIA} />}

              <Field label="Tipo de AT" name="tipoAT" options={O_TIPO_AT} />
              <Field label="Manejo inicial del Canal" name="manejoInicial" options={O_MANEJO} />
              <Field label="AT Mortal" name="atMortal" options={O_SINO} />
              {formData.atMortal === "SI" && <Field label="Fecha de fallecimiento" name="fechaFallecimiento" type="date" />}
              <Field label="AT Grave (Res. 1401)" name="atGrave1401" options={O_SINO} />
              {formData.atGrave1401 === "SI" && <Field label="Fecha de notificación" name="fechaNotif1401" type="date" />}
            </div>

            {/* 4. FURAT */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE" }}>4. Categorización del Evento (FURAT)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
              <Field label="FURAT diligenciado" name="furatDiligenciado" options={O_SINO} />
              {formData.furatDiligenciado === "SI" && <Field label="Fecha de diligenciamiento" name="fechaFurat" type="date" />}
              {formData.furatDiligenciado === "SI" && <Field label="Oportunidad de Legalización" name="oportLegalizacion" options={O_OPORTUNIDAD} />}
              <Field label="Días de incapacidad acumulados" name="diasIncapacidadAcumulados" disabled={true} />
            </div>

            {/* 5. DIAGNOSTICOS / 6 */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE", display: "flex", justifyContent: "space-between" }}>
              <span>5. Diagnósticos Reconocidos</span>
              {!isReadOnly && <button type="button" onClick={addDx} style={{ border: "none", color: "#3182CE", background: "none", cursor: "pointer", display: "flex", gap: "5px", alignItems: "center" }}><PlusCircle size={14} />Agregar Diagnóstico</button>}
            </div>
            {formData.diagnosticosReconocidos && formData.diagnosticosReconocidos.map(d => (
              <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.5fr auto", gap: "10px", marginBottom: "10px", alignItems: "end" }}>
                <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>CIE10</label><input value={d.cie10} onChange={(e) => changeDx(d.id, "cie10", e.target.value)} className="input-colsanitas" disabled={isReadOnly} /></div>
                <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Descripción</label><input value={d.descripcion} onChange={(e) => changeDx(d.id, "descripcion", e.target.value)} className="input-colsanitas" disabled={isReadOnly} /></div>
                <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Tipo de Diagnóstico</label><select value={d.tipo} onChange={(e) => changeDx(d.id, "tipo", e.target.value)} className="input-colsanitas" disabled={isReadOnly}><option value="">Sel...</option>{O_TIPO_DX.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                {!isReadOnly && <button type="button" onClick={() => removeDx(d.id)} style={{ padding: "8px", background: "#FED7D7", color: "#C53030", border: "none", borderRadius: "5px", cursor: "pointer" }}><Trash2 size={16} /></button>}
              </div>
            ))}

            {/* 6. REHAB+ */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE", display: "flex", justifyContent: "space-between" }}>
              <span>6. Clasificación de casos REHAB+</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              <Field label="Caso Clasificado como REHAB+" name="casoRehab" options={O_SINO} />
              {formData.casoRehab === "SI" && <Field label="Causa de remisión a REHAB+" name="causaRehab" options={O_CAUSA_REHAB} />}
              {formData.casoRehab === "SI" && <Field label="Fecha en que se categoriza" name="fechaRehab" type="date" />}
            </div>

            {/* 7. CALIFICACION */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE", display: "flex", justifyContent: "space-between" }}>
              <span>7. Proceso de calificación del caso</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
              <Field label="Requiere inicio de calificación" name="reqCalificacion" options={O_SINO} />
              {formData.reqCalificacion === "SI" && <Field label="Tipo de Calificación Solicitada" name="tipoCalifSol" options={O_TIPO_CALIF} />}
              {formData.reqCalificacion === "SI" && <Field label="Fecha en que se envía" name="fechaEnvioCalif" type="date" />}
            </div>

            {/* 8. PCL */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE", display: "flex", justifyContent: "space-between" }}>
              <span>8. Proceso de Calificación de PCL</span>
            </div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "20px" }}>8.1 Calificación PCL primera vez</p>
            <div className="filter-group" style={{ maxWidth: "300px", marginBottom: "10px" }}><label style={{ fontSize: "12px", color: "#C53030", fontWeight: "bold" }}>PCL Presunta (Alfanúmerica)</label><input name="pclPresunta" value={formData.pclPresunta} onChange={handleChange} className="input-colsanitas" disabled={isReadOnly} /></div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: '10px', background: '#FDF7DF' }}>
              <Field label="Fecha Sol PCL" name="poSolPCL" type="date" /><Field label="Entidad" name="poEntidad" options={O_ENTIDADES} />
              <Field label="Fecha Dictamen" name="poFechaDic" type="date" /><Field label="Num Dictamen" name="poNumDic" />
              <Field label="TITULO I" name="poT1" /><Field label="TITULO II" name="poT2" /><Field label="PCL TOTAL" name="poTot" />
              <Field label="Fecha Estructuracion" name="poFechaEst" type="date" /><Field label="Fecha Notificacion" name="poFechaNot" type="date" />
              <Field label="Estado Dictamen" name="poEstadoDic" options={O_DICTAMEN_ESTADO} /><Field label="Recurso" name="poRecurso" options={O_RECURSO} /><Field label="Fecha Recurso" name="poFechaRec" type="date" />
              <Field label="Pago Hon." name="poPagoHon" options={O_PAGO} /><Field label="Fecha Sol Pago" name="poFechaSolPago" type="date" /><Field label="Honorarios a JRCI" name="poHonorariosJRCI" options={O_JUNTAS} />
              <Field label="Dict Firme" name="poDicFirme" options={O_SINO} /><Field label="Fech Firmeza" name="poFechaFirme" type="date" /><Field label="Aplica IPP" name="poAplicaIPP" options={O_SINO} /><Field label="Fech Envio Pago" name="poFechaEnvioPago" type="date" />
            </div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "20px" }}>8.2 Calificación PCL JRCI</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: '10px', background: '#F1F8FB' }}>
              <Field label="Fecha Notificación" name="jrFechaNot" type="date" /><Field label="Junta Regional" name="jrJunta" options={O_JUNTAS} />
              <Field label="Fecha Dictamen" name="jrFechaDic" type="date" /><Field label="Num Dictamen" name="jrNumDic" />
              <Field label="TITULO I" name="jrT1" /><Field label="TITULO II" name="jrT2" /><Field label="PCL TOTAL" name="jrTot" />
              <Field label="Fecha Estructuracion" name="jrFechaEst" type="date" />
              <Field label="Estado Dictamen" name="jrEstadoDic" options={O_DICTAMEN_ESTADO} /><Field label="Recurso" name="jrRecurso" options={O_RECURSO} /><Field label="Fecha Recurso" name="jrFechaRec" type="date" />
              <Field label="Pago Hon." name="jrPagoHon" options={O_PAGO} /><Field label="Fecha Sol Pago" name="jrFechaSolPago" type="date" />
              <Field label="Dict Firme" name="jrDicFirme" options={O_SINO} /><Field label="Fech Firmeza" name="jrFechaFirme" type="date" /><Field label="Aplica IPP" name="jrAplicaIPP" options={O_SINO} /><Field label="Fech Envio Pago" name="jrFechaEnvioPago" type="date" />
            </div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "20px" }}>8.3 Calificación PCL JNCI</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", padding: '10px', background: '#E6FFFA' }}>
              <Field label="Fecha Notificación" name="jnFechaNot" type="date" /><Field label="Fecha Dictamen" name="jnFechaDic" type="date" /><Field label="Num Dictamen" name="jnNumDic" />
              <Field label="TITULO I" name="jnT1" /><Field label="TITULO II" name="jnT2" /><Field label="PCL TOTAL" name="jnTot" />
              <Field label="Fecha Estructuracion" name="jnFechaEst" type="date" /><Field label="Fech Firmeza" name="jnFechaFirme" type="date" /><Field label="Aplica IPP" name="jnAplicaIPP" options={O_SINO} /><Field label="Fech Envio Pago" name="jnFechaEnvioPago" type="date" />
            </div>

            <p style={{ fontWeight: "bold", color: "#4A5568", marginTop: "30px" }}>8.4 Firmeza de PCL</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", padding: '10px', background: '#E2E8F0', borderRadius: "5px" }}>
              <Field label="Fecha firmeza" name="firmezaFecha" type="date" />
              <Field label="Entidad emite firmeza" name="firmezaEntidad" options={["ARL", "JRCI", "JNCI", "Justicia Ordinaria"]} />
              <Field label="PCL en firme" name="firmezaPCL" />
              <Field label="Fecha estructuración" name="firmezaFechaEst" type="date" />
              <Field label="Gestión del caso" name="firmezaGestion" options={["PCL Presencial", "PCL Teleconsulta", "Manejo RHB", "Manejo AT/EL", "Cierre del caso"]} />
            </div>

            {/* 9. SEGUIMIENTOS */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE", display: "flex", justifyContent: "space-between" }}>
              <span>9. Seguimiento del caso</span>
              {!isReadOnly && <button type="button" onClick={addSeg} style={{ border: "none", color: "#3182CE", background: "none", cursor: "pointer", display: "flex", gap: "5px", alignItems: "center" }}><PlusCircle size={14} />Agregar Seguimiento</button>}
            </div>
            {formData.seguimientos && formData.seguimientos.map(s => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr 4fr auto", gap: "10px", marginBottom: "10px", alignItems: "start" }}>
                <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Fecha</label><input type="date" value={s.fecha} onChange={(e) => changeSeg(s.id, "fecha", e.target.value)} className="input-colsanitas" disabled={isReadOnly} /></div>
                <div className="filter-group"><label style={{ fontSize: "12px", color: "#718096" }}>Seguimiento Realizado</label><textarea value={s.texto} onChange={(e) => changeSeg(s.id, "texto", e.target.value)} className="input-colsanitas" disabled={isReadOnly} style={{ height: "40px" }} /></div>
                {!isReadOnly && <button type="button" onClick={() => removeSeg(s.id)} style={{ padding: "8px", background: "#FED7D7", color: "#C53030", border: "none", borderRadius: "5px", cursor: "pointer", marginTop: "24px" }}><Trash2 size={16} /></button>}
              </div>
            ))}
            <div style={{ padding: "10px", maxWidth: "300px" }}>
              <Field label="Fecha próximo seguimiento" name="proximoSeguimiento" type="date" />
            </div>

            {/* 10. AUDITORIA */}
            <div style={{ background: "#F7FAFC", padding: "10px", margin: "15px 0", fontWeight: "bold", borderLeft: "4px solid #3182CE", display: "flex", justifyContent: "space-between" }}>
              <span>10. Informe de Auditoría Médica</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", alignItems: "center" }}>
              <div>
                <Field label="Fecha de última auditoría" name="ultimaAuditoria" type="date" />
                <Field label="Fecha de próxima auditoría" name="proximaAuditoria" type="date" disabled={true} />
              </div>
              <div style={{ gridColumn: "span 2", padding: "15px" }}>
                {auditState && (
                  <div style={{ padding: "15px", textAlign: "center", borderRadius: "8px", background: auditState.bg, color: auditState.color, border: `2px solid ${auditState.color}`, fontWeight: "bold", fontSize: "18px" }}>
                    {auditState.label}
                  </div>
                )}
              </div>
            </div>

          </fieldset>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", gap: "10px" }}>
            <button onClick={() => { setMode("list"); setFormData(INIT_FORM); }} className="btn-colsanitas-outline">{isReadOnly ? "Volver" : "Cancelar"}</button>
            <button onClick={handleExportFormPDF} className="btn-colsanitas-outline" title="Exportar a PDF">
              <FileText size={18} /> Descargar Ficha PDF
            </button>
            <button onClick={handleExportFormExcel} className="btn-colsanitas-outline" title="Exportar a Excel">
              <Download size={18} /> Descargar Datos Excel
            </button>
            {!isReadOnly && <button onClick={handleSave} className="btn-colsanitas"><Save size={18} /> Guardar Cambios</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporteAccidente;
