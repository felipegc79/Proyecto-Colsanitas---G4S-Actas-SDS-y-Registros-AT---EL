// src/components/ReporteAccidente.js
import React, { useState, useMemo, useEffect } from "react";
import {
  Shield,
  FileText,
  Save,
  Trash2,
  Edit,
  PlusCircle,
  Search,
  Download,
  Filter,
  Eye
} from "lucide-react";
import {
  dataAT,
  addNewRecord,
  updateRecord,
  deleteRecord,
  DEPARTAMENTOS_COLOMBIA,
  loadFromStorage,
  syncFromDB
} from "../data";
import * as XLSX from "xlsx";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";

// --- LISTAS DE OPCIONES ---
const OPCIONES_GENERO = ["Masculino", "Femenino", "Otro"];
const OPCIONES_EMPRESA = ["COLLECTIVE SAS", "CENTRO MÉDICO", "EPS COLSANITAS", "ESTRATÉGICOS 360 SAS"];
const OPCIONES_ESTADO_EMPRESA = ["Activa", "Inactiva", "En Liquidación"];
const OPCIONES_MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const OPCIONES_SEVERIDAD = ["Leve", "Grave", "Fatal", "Severo"];
const OPCIONES_SINO = ["SI", "NO"];
const OPCIONES_ESTADO_CASO = ["Abierto", "Anulado", "Cerrado", "Desistido", "Objetado"];
const OPCIONES_JORNADA = ["Diurna", "Nocturna", "Mixta", "Por turnos"];
const OPCIONES_DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const OPCIONES_LATERALIDAD = ["Derecha", "Izquierda", "Bilateral", "N/A"];

const ReporteAccidente = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("list"); // create, view, edit -> list
  const [currentId, setCurrentId] = useState(null);

  // Estado inicial vacío, carga asíncrona desde IndexedDB
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await syncFromDB("AT");
      if (data) setRecords([...data]);
    };
    load();
  }, []);

  const [filters, setFilters] = useState({
    radicado: "",
    fecha: "",
    trabajador: "",
    empresa: "",
    severidad: "",
    estado: ""
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const userRole = localStorage.getItem("userRole");



  const initialForm = {
    // 1. Información del Registro
    radicado: "",
    siniestro: "",

    // 2. Datos del Trabajador
    cedula: "",
    apellidosNombres: "",
    genero: "",
    grupoEmpresarial: "",
    empresa: "",
    nit: "",
    estadoEmpresa: "",
    cargo: "",

    // 3. Información General
    departamento: "",
    ciudad: "",

    // 4. Detalles del Evento
    fechaAT: "",
    mes: "",
    anio: new Date().getFullYear().toString(),
    origenAprobado: "",
    oportunidadReporte: "",

    // 5. Análisis de Gravedad
    severidad: "",
    reclasificado: "",
    tipoAT: "",
    riesgoBiologico: "",
    soat: "",
    furatDiligenciado: "",
    jornada: "",
    diaSemana: "",
    lugarOcurrencia: "",
    parteCuerpo: "",
    lateralidad: "",
    agente: "",
    sitio: "",
    tipoLesion: "",
    mecanismo: "",
    diagnostico: "",
    manejoInicial: "",
    pertinente: "",
    ipsRemision: "",
    asiste: "",
    casoPRI: "",
    fechaIngresoPRI: "",
    atMortal: "",
    estadoCaso: "Abierto",
    fechaCierre: "",
    mesCierre: "",
    anioCierre: "",
    fechaReapertura: "",
    diasIncapacidad: "",
    valorTotalIT: "",
    atGrave1401: "",
    fechaNotificacion1401: "",
    recomendacionesLaborales: "",
    pclReal: "",
    porcentajePCL: "",
    fechaDictamen: "",
    apelaPCLARL: "",
    juntaRegional: "",
    pclJRCI: "",
    apelaPCLJRCI: "",
    pclJNCI: "",
    fechaPCLJNCI: "",
    fechaEstructuracion: "",
    pclFirme: "",
    fechaFirmeza: "",
    indemnizado: "",
    valorIndemnizacion: "",
    administradora: "",
    actividadEconomica: "",
    mailEmpresa: ""
  };

  const [formData, setFormData] = useState(initialForm);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (record) => {
    setFormData(record);
    setCurrentId(record.id);
    setMode("edit");
  };

  const handleView = (record) => {
    setFormData(record);
    setCurrentId(record.id);
    setMode("view");
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      deleteRecord(id);
      setRecords(dataAT.filter((r) => r.id !== id)); // Force refresh local state
    }
  };

  const handleSave = () => {
    if (!formData.cedula || !formData.apellidosNombres) {
      alert("Por favor complete los campos obligatorios del trabajador");
      return;
    }

    const newRec = {
      ...formData,
      id: mode === "edit" ? currentId : `AT-${Date.now()}`,
    };

    if (mode === "edit") {
      updateRecord(newRec);
      alert("Registro Actualizado");
    } else {
      addNewRecord(newRec);
      alert("Registro Creado");
    }

    // Refresh records
    setRecords(dataAT); // Re-read from data source
    setMode("list");
    setFormData(initialForm);
  };

  const handleCancel = () => {
    setMode("list");
    setFormData(initialForm);
  };

  const handleExportListPDF = () => {
    const columns = ["Radicado", "Fecha AT", "Trabajador", "Empresa", "Severidad", "Estado"];
    const data = filteredRecords.map(r => [
      r.radicado,
      r.fechaAT,
      r.apellidosNombres,
      r.empresa,
      r.severidad,
      r.estadoCaso
    ]);
    exportToPDF("Reporte de Accidentes de Trabajo", columns, data, "Listado_AT.pdf");
  };

  const handleExportListExcel = () => {
    exportToExcel(filteredRecords, "Listado_AT.xlsx");
  };

  const handleExportMaster = () => {
    // Exportar TODOS los registros (Base Maestra) sin filtrar, si el usuario tiene permiso (ej. Admin o Analyst)
    // Aquí asumimos que cualquiera puede si el botón está visible, pero idealmente checked by role.
    if (userRole !== "admin") {
      // Optional: alert("No tiene permisos para exportar la base maestra.");
      // But per requirement, we should restrict permissions. Let's assume the button is only shown if permitted.
    }
    exportToExcel(dataAT, "Base_Maestra_AT_Completa.xlsx");
  };

  const handleExportFormPDF = () => {
    // Simple vertical list for form
    const columns = ["Campo", "Valor"];
    const data = Object.entries(formData).map(([k, v]) => [k, v]);
    exportToPDF(`Reporte Accidente - ${formData.radicado || "Borrador"}`, columns, data, `Formulario_AT_${formData.radicado || "temp"}.pdf`);
  };

  const handleExportFormExcel = () => {
    exportToExcel([formData], `Formulario_AT_${formData.radicado || "temp"}.xlsx`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // --- FILTRADO ---
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchRadicado = !filters.radicado || (r.radicado && r.radicado.toLowerCase().includes(filters.radicado.toLowerCase()));
      const matchFecha = !filters.fecha || (r.fechaAT && r.fechaAT.includes(filters.fecha));
      const matchTrabajador = !filters.trabajador ||
        (r.apellidosNombres && r.apellidosNombres.toLowerCase().includes(filters.trabajador.toLowerCase())) ||
        (r.cedula && r.cedula.includes(filters.trabajador));
      const matchEmpresa = !filters.empresa || (r.empresa && r.empresa === filters.empresa);
      const matchSeveridad = !filters.severidad || (r.severidad && r.severidad === filters.severidad);
      const matchEstado = !filters.estado || (r.estadoCaso && r.estadoCaso === filters.estado);

      return matchRadicado && matchFecha && matchTrabajador && matchEmpresa && matchSeveridad && matchEstado;
      return matchRadicado && matchFecha && matchTrabajador && matchEmpresa && matchSeveridad && matchEstado;
    });
  }, [records, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // --- PAGINACIÓN ---
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- RENDER FORM ---
  const renderForm = () => {
    const isReadOnly = mode === "view"; // Determinar si es solo lectura

    return (
      <div className="card" style={{ padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          <h2 style={{ color: "var(--colsanitas-blue)", margin: 0 }}>
            {mode === "create" ? "Nuevo Registro de Accidente (AT)" : mode === "edit" ? "Editar Registro AT" : "Ver Detalle de Accidente"}
          </h2>
          <button onClick={handleCancel} className="btn-colsanitas-outline" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            Volver
          </button>
        </div>

        {/* Usamos fieldset para deshabilitar todo el contenido si es vista */}
        <fieldset disabled={isReadOnly} style={{ border: "none", padding: 0, margin: 0 }}>

          {/* 1. Información del Registro */}
          <h3 className="section-title">1. Información del Registro</h3>
          <div className="form-grid">
            <label style={{ gridColumn: "span 2", fontWeight: "bold", color: "#C53030" }}>
              Estado del Caso:
              <select name="estadoCaso" value={formData.estadoCaso} onChange={handleChange} className="input-colsanitas" style={{ fontWeight: "bold" }}>
                <option value="">Seleccione...</option>
                {OPCIONES_ESTADO_CASO.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label>
              Número de Radicado:
              <input name="radicado" value={formData.radicado} onChange={handleChange} className="input-colsanitas" />
            </label>
            <label>
              Número de Siniestro:
              <input name="siniestro" value={formData.siniestro} onChange={handleChange} className="input-colsanitas" />
            </label>
          </div>

          {/* 2. Datos del Trabajador */}
          <h3 className="section-title">2. Datos del Trabajador</h3>
          <div className="form-grid">
            <label>
              Cédula *:
              <input name="cedula" value={formData.cedula} onChange={handleChange} className="input-colsanitas" />
            </label>
            <label>
              Apellidos y Nombres *:
              <input name="apellidosNombres" value={formData.apellidosNombres} onChange={handleChange} className="input-colsanitas" />
            </label>
            <label>
              Género:
              <select name="genero" value={formData.genero} onChange={handleChange} className="input-colsanitas">
                <option value="">Seleccione</option>
                {OPCIONES_GENERO.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label>
              Grupo Empresarial:
              <input name="grupoEmpresarial" value={formData.grupoEmpresarial} onChange={handleChange} className="input-colsanitas" />
            </label>
            <label>
              Empresa:
              <select name="empresa" value={formData.empresa} onChange={handleChange} className="input-colsanitas">
                <option value="">Seleccione</option>
                {OPCIONES_EMPRESA.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>
            <label>
              NIT:
              <input name="nit" value={formData.nit} onChange={handleChange} className="input-colsanitas" />
            </label>
            <label>
              Estado de la Empresa:
              <select name="estadoEmpresa" value={formData.estadoEmpresa} onChange={handleChange} className="input-colsanitas">
                <option value="">Seleccione</option>
                {OPCIONES_ESTADO_EMPRESA.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>
            <label>
              Cargo:
              <input name="cargo" value={formData.cargo} onChange={handleChange} className="input-colsanitas" />
            </label>
          </div>

          {/* 3. Información General */}
          <h3 className="section-title">3. Información General</h3>
          <div className="form-grid">
            <label>
              Departamento:
              <select name="departamento" value={formData.departamento} onChange={handleChange} className="input-colsanitas">
                <option value="">Seleccione</option>
                {Object.keys(DEPARTAMENTOS_COLOMBIA).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>
              Ciudad:
              <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="input-colsanitas" disabled={!formData.departamento || isReadOnly}>
                <option value="">Seleccione</option>
                {formData.departamento && (DEPARTAMENTOS_COLOMBIA[formData.departamento] || DEPARTAMENTOS_COLOMBIA[formData.departamento.toUpperCase()] || []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          {/* 4. Detalles del Evento */}
          <h3 className="section-title">4. Detalles del Evento</h3>
          <div className="form-grid">
            <label>
              Fecha AT:
              <input type="date" name="fechaAT" value={formData.fechaAT} onChange={handleChange} className="input-colsanitas" />
            </label>
            <label>
              Mes:
              <select name="mes" value={formData.mes} onChange={handleChange} className="input-colsanitas">
                <option value="">Seleccione</option>
                {OPCIONES_MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label>
              Año:
              <input name="anio" value={formData.anio} onChange={handleChange} className="input-colsanitas" />
            </label>
            <label>
              Origen Aprobado:
              <select name="origenAprobado" value={formData.origenAprobado} onChange={handleChange} className="input-colsanitas">
                <option value="">Seleccione</option>
                {OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label>
              Oportunidad reporte:
              <input name="oportunidadReporte" value={formData.oportunidadReporte} onChange={handleChange} className="input-colsanitas" />
            </label>
          </div>

          {/* 5. Análisis de Gravedad (Extenso) */}
          <h3 className="section-title">5. Análisis de Gravedad y Seguimiento</h3>
          <div className="form-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <label>
              Severidad:
              <select name="severidad" value={formData.severidad} onChange={handleChange} className="input-colsanitas">
                <option value="">Sel...</option>
                {OPCIONES_SEVERIDAD.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>Reclasificado: <select name="reclasificado" value={formData.reclasificado} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Tipo AT: <input name="tipoAT" value={formData.tipoAT} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Riesgo biológico: <select name="riesgoBiologico" value={formData.riesgoBiologico} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>SOAT: <select name="soat" value={formData.soat} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>FURAT Diligenciado: <select name="furatDiligenciado" value={formData.furatDiligenciado} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Jornada: <select name="jornada" value={formData.jornada} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_JORNADA.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Día semana: <select name="diaSemana" value={formData.diaSemana} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_DIAS.map(o => <option key={o} value={o}>{o}</option>)}</select></label>

            <label>Lugar ocurrencia: <input name="lugarOcurrencia" value={formData.lugarOcurrencia} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Parte cuerpo: <input name="parteCuerpo" value={formData.parteCuerpo} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Lateralidad: <select name="lateralidad" value={formData.lateralidad} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_LATERALIDAD.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Agente: <input name="agente" value={formData.agente} onChange={handleChange} className="input-colsanitas" /></label>

            <label>Sitio: <input name="sitio" value={formData.sitio} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Tipo lesión: <input name="tipoLesion" value={formData.tipoLesion} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Mecanismo: <input name="mecanismo" value={formData.mecanismo} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Diagnostico: <input name="diagnostico" value={formData.diagnostico} onChange={handleChange} className="input-colsanitas" /></label>

            <label>Manejo inicial canal: <input name="manejoInicial" value={formData.manejoInicial} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Pertinente: <select name="pertinente" value={formData.pertinente} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>IPS Remisión: <input name="ipsRemision" value={formData.ipsRemision} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Asiste: <select name="asiste" value={formData.asiste} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>

            <label>Caso PRI: <select name="casoPRI" value={formData.casoPRI} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Fecha ingreso PRI: <input type="date" name="fechaIngresoPRI" value={formData.fechaIngresoPRI} onChange={handleChange} className="input-colsanitas" /></label>
            <label>AT Mortal: <select name="atMortal" value={formData.atMortal} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            {/* Estado del caso moved to top */}

            <label>Fecha Cierre: <input type="date" name="fechaCierre" value={formData.fechaCierre} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Mes Cierre: <select name="mesCierre" value={formData.mesCierre} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_MESES.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Año Cierre: <input name="anioCierre" value={formData.anioCierre} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha reapertura: <input type="date" name="fechaReapertura" value={formData.fechaReapertura} onChange={handleChange} className="input-colsanitas" /></label>

            <label>Días incapacidad: <input type="number" name="diasIncapacidad" value={formData.diasIncapacidad} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Valor total IT: <input type="number" name="valorTotalIT" value={formData.valorTotalIT} onChange={handleChange} className="input-colsanitas" /></label>
            <label>AT Grave (Res 1401): <select name="atGrave1401" value={formData.atGrave1401} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Fecha notificación 1401: <input type="date" name="fechaNotificacion1401" value={formData.fechaNotificacion1401} onChange={handleChange} className="input-colsanitas" /></label>

            <label style={{ gridColumn: "span 2" }}>Recomendaciones laborales: <input name="recomendacionesLaborales" value={formData.recomendacionesLaborales} onChange={handleChange} className="input-colsanitas" /></label>
            <label>PCL Real: <input name="pclReal" value={formData.pclReal} onChange={handleChange} className="input-colsanitas" /></label>
            <label>% PCL: <input name="porcentajePCL" value={formData.porcentajePCL} onChange={handleChange} className="input-colsanitas" /></label>

            <label>Fecha Dictamen: <input type="date" name="fechaDictamen" value={formData.fechaDictamen} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Apela PCL ARL: <select name="apelaPCLARL" value={formData.apelaPCLARL} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Junta Regional: <input name="juntaRegional" value={formData.juntaRegional} onChange={handleChange} className="input-colsanitas" /></label>
            <label>PCL JRCI: <input name="pclJRCI" value={formData.pclJRCI} onChange={handleChange} className="input-colsanitas" /></label>

            <label>Apela PCL JRCI: <select name="apelaPCLJRCI" value={formData.apelaPCLJRCI} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>PCL JNCI: <input name="pclJNCI" value={formData.pclJNCI} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha PCL JNCI: <input type="date" name="fechaPCLJNCI" value={formData.fechaPCLJNCI} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha Estructuración: <input type="date" name="fechaEstructuracion" value={formData.fechaEstructuracion} onChange={handleChange} className="input-colsanitas" /></label>

            <label>PCL en firme: <select name="pclFirme" value={formData.pclFirme} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Fecha Firmeza: <input type="date" name="fechaFirmeza" value={formData.fechaFirmeza} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Indemnizado: <select name="indemnizado" value={formData.indemnizado} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Valor Indemnización: <input type="number" name="valorIndemnizacion" value={formData.valorIndemnizacion} onChange={handleChange} className="input-colsanitas" /></label>

            <label>Administradora de Casos: <input name="administradora" value={formData.administradora} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Actividad Económica: <input name="actividadEconomica" value={formData.actividadEconomica} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Mail Empresa: <input name="mailEmpresa" value={formData.mailEmpresa} onChange={handleChange} className="input-colsanitas" /></label>
          </div>
        </fieldset>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", gap: "10px" }}>
          <button onClick={handleCancel} className="btn-colsanitas-outline">{isReadOnly ? "Volver" : "Cancelar"}</button>
          <button onClick={handleExportFormPDF} className="btn-colsanitas-outline" title="Exportar a PDF">
            <FileText size={18} /> Descargar Ficha PDF
          </button>
          <button onClick={handleExportFormExcel} className="btn-colsanitas-outline" title="Exportar a Excel">
            <Download size={18} /> Descargar Datos Excel
          </button>
          {!isReadOnly && (
            <button onClick={handleSave} className="btn-colsanitas">
              <Save size={18} /> Guardar
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid" style={{ padding: "20px" }}>
      {mode === "list" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, color: "var(--colsanitas-blue)" }}>Gestión de Accidentes de Trabajo (AT)</h2>
            <button
              className="btn-colsanitas"
              onClick={() => {
                setFormData(initialForm);
                setMode("create");
              }}
            >
              <PlusCircle size={18} /> Nuevo Registro
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "10px" }}>
            <button className="btn-colsanitas-outline" onClick={handleExportListPDF} style={{ padding: "8px 15px", fontSize: "12px" }}>
              <FileText size={14} /> Exportar PDF
            </button>
            <button className="btn-colsanitas-outline" onClick={handleExportListExcel} style={{ padding: "8px 15px", fontSize: "12px" }}>
              <Download size={14} /> Exportar Excel
            </button>
            {(userRole === "admin" || userRole === "analista") && (
              <button className="btn-colsanitas" onClick={handleExportMaster} style={{ padding: "8px 15px", fontSize: "12px", backgroundColor: "#2D3748" }}>
                <Download size={14} /> Exportar Base Maestra
              </button>
            )}
          </div>

          {/* Sección de Filtros */}
          <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
              <Filter size={18} color="var(--colsanitas-green)" />
              <h3 style={{ margin: 0, fontSize: "16px" }}>Filtros de Búsqueda</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Radicado</label>
                <input name="radicado" value={filters.radicado} onChange={handleFilterChange} className="input-colsanitas" placeholder="Buscar radicado..." />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Fecha AT</label>
                <input type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} className="input-colsanitas" />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Trabajador (Nombre/Cédula)</label>
                <input name="trabajador" value={filters.trabajador} onChange={handleFilterChange} className="input-colsanitas" placeholder="Nombre o cédula..." />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Empresa</label>
                <select name="empresa" value={filters.empresa} onChange={handleFilterChange} className="input-colsanitas">
                  <option value="">Todas</option>
                  {OPCIONES_EMPRESA.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Severidad</label>
                <select name="severidad" value={filters.severidad} onChange={handleFilterChange} className="input-colsanitas">
                  <option value="">Todas</option>
                  {OPCIONES_SEVERIDAD.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Estado</label>
                <select name="estado" value={filters.estado} onChange={handleFilterChange} className="input-colsanitas">
                  <option value="">Todos</option>
                  {OPCIONES_ESTADO_CASO.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button className="btn-colsanitas-outline" onClick={() => setFilters({ radicado: "", fecha: "", trabajador: "", empresa: "", severidad: "", estado: "" })} style={{ width: "100%", justifyContent: "center" }}>
                  Limpiar
                </button>
              </div>
            </div>
          </div>

          <div className="card" style={{ overflowX: "auto" }}>
            <table className="table-colsanitas">
              <thead>
                <tr>
                  <th>Radicado</th>
                  <th>Fecha AT</th>
                  <th>Trabajador</th>
                  <th>Empresa</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((item) => (
                    <tr key={item.id}>
                      <td>{item.radicado}</td>
                      <td>{item.fechaAT}</td>
                      <td>{item.apellidosNombres}</td>
                      <td>{item.empresa}</td>
                      <td>{item.severidad}</td>
                      <td>
                        <span className={`status-badge ${item.estadoCaso === "Abierto" ? "warning" : "success"}`}>
                          {item.estadoCaso}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button className="icon-btn" onClick={() => handleView(item)} title="Ver detalles">
                            <Eye size={16} color="var(--colsanitas-blue)" />
                          </button>
                          <button className="icon-btn" onClick={() => handleEdit(item)} title="Editar">
                            <Edit size={16} color="var(--colsanitas-green)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#A0AEC0" }}>
                      No se encontraron registros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Controls de Paginación */}
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
        renderForm()
      )}
    </div>
  );
};

export default ReporteAccidente;
