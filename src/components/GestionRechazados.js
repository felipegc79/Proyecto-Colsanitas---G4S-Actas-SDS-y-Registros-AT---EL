// src/components/GestionRechazados.js
import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Search,
  Filter,
  Edit,
  Save,
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  dataAT,
  updateRecord,
  DEPARTAMENTOS_COLOMBIA,
  loadFromStorage,
  syncFromDB
} from "../data";

// --- CONSTANTES ---
const OPCIONES_GENERO = ["Masculino", "Femenino", "Otro"];
const OPCIONES_EMPRESA = ["COLLECTIVE SAS", "CENTRO MÉDICO", "EPS COLSANITAS", "ESTRATÉGICOS 360 SAS"];
const OPCIONES_ESTADO_EMPRESA = ["Activa", "Inactiva", "En Liquidación"];
const OPCIONES_MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const OPCIONES_SEVERIDAD = ["Leve", "Grave", "Fatal", "Severo"];
const OPCIONES_SINO = ["SI", "NO"];
const OPCIONES_ESTADO_CASO = ["Abierto", "Cerrado", "Reaperturado"];
const OPCIONES_JORNADA = ["Diurna", "Nocturna", "Mixta", "Por turnos"];
const OPCIONES_DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const OPCIONES_LATERALIDAD = ["Derecha", "Izquierda", "Bilateral", "N/A"];

// Estados permitidos para esta vista
const ESTADOS_RECHAZO = ["Rechazado", "Objetado"];

const GestionRechazados = () => {
  const [mode, setMode] = useState("list"); // list, edit, view
  const [currentId, setCurrentId] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await syncFromDB("AT");
      if (data && data.length > 0) setRecords([...data]);
    };
    loadData();
  }, []);

  // Modal de carga de evidencia
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  const [filters, setFilters] = useState({
    radicado: "",
    fecha: "",
    departamento: "",
    ciudad: "",
    empresa: "",
    estado: ""
  });

  const initialForm = {
    // Estado de Gestión (Campo Nuevo Principal)
    estadoGestion: "", // Aprobado, Rechazado, Objetado

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
    setFormData({ ...record, estadoGestion: record.estado || "" });
    setCurrentId(record.id);
    setMode("edit");
  };

  const handleView = (record) => {
    setFormData({ ...record, estadoGestion: record.estado || "" });
    setCurrentId(record.id);
    setMode("view");
  };

  const handleSave = () => {
    if (!formData.estadoGestion) {
      alert("Por favor seleccione un estado (Aprobado, Rechazado, Objetado)");
      return;
    }

    const updatedRecord = {
      ...formData,
      estado: formData.estadoGestion, // Actualizar el estado principal del registro
      id: currentId
    };

    updateRecord(updatedRecord);
    setRecords(dataAT); // Refrescar localmente

    // Mostrar modal de carga
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setMode("list");
    setFormData(initialForm);
  };

  const handleUpload = () => {
    if (!uploadFile) {
      alert("Por favor seleccione un archivo PDF");
      return;
    }
    alert("✅ Archivo cargado correctamente y asociado al caso.");
    handleCloseModal();
  };

  const handleCancel = () => {
    setMode("list");
    setFormData(initialForm);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset page on filter change
  };



  // --- FILTRADO ---
  const filteredRecords = useMemo(() => {
    // PASO 1: Filtrar solo registros Rechazados u Objetados
    const rejectedOnly = records.filter(r => ESTADOS_RECHAZO.includes(r.estado) || (r.estadoCaso && ESTADOS_RECHAZO.includes(r.estadoCaso)));

    // PASO 2: Aplicar filtros de usuario
    return rejectedOnly.filter(r => {
      const matchRadicado = !filters.radicado || (r.radicado && r.radicado.toLowerCase().includes(filters.radicado.toLowerCase()));
      const matchFecha = !filters.fecha || (r.fechaAT && r.fechaAT.includes(filters.fecha));
      const matchDepartamento = !filters.departamento || (r.departamento && r.departamento === filters.departamento);
      const matchCiudad = !filters.ciudad || (r.ciudad && r.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase()));
      const matchEmpresa = !filters.empresa || (r.empresa && r.empresa === filters.empresa);
      const matchEstado = !filters.estado || (r.estado && r.estado === filters.estado);

      return matchRadicado && matchFecha && matchDepartamento && matchCiudad && matchEmpresa && matchEstado;
    });
  }, [records, filters]);

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- RENDER FORM ---
  const isReadOnly = mode === "view";



  const renderForm = () => (
    <div className="card" style={{ padding: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
        <h2 style={{ color: "var(--colsanitas-blue)", margin: 0 }}>
          {isReadOnly ? "Detalle del Caso" : "Gestionar Caso Rechazado / Objetado"}
        </h2>
        <button onClick={handleCancel} className="btn-colsanitas-outline" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          Volver
        </button>
      </div>

      <fieldset disabled={isReadOnly} style={{ border: "none", padding: 0, margin: 0 }}>

        {/* CAMPO ESTADO PRINCIPAL */}
        <div style={{ backgroundColor: "#EFF6FF", padding: "15px", borderRadius: "8px", border: "1px solid #BFDBFE", marginBottom: "20px" }}>
          <h3 style={{ color: "#1E3A8A", marginTop: 0, fontSize: "16px" }}>Gestión del Estado</h3>
          <div className="form-grid">
            <label style={{ fontWeight: "bold", color: "#1E3A8A" }}>
              Nuevo Estado del Caso:
              <select
                name="estadoGestion"
                value={formData.estadoGestion}
                onChange={handleChange}
                className="input-colsanitas"
                disabled={isReadOnly}
                style={{ border: "2px solid #2563EB" }}
              >
                <option value="">Seleccione...</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </label>
          </div>
        </div>

        {/* 1. Información del Registro */}
        <h3 className="section-title">1. Información del Registro</h3>
        <div className="form-grid">
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
            <select name="ciudad" value={formData.ciudad} onChange={handleChange} className="input-colsanitas" disabled={!formData.departamento}>
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

        {/* 5. Análisis de Gravedad y Seguimiento */}
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
          <label>Estado del caso: <select name="estadoCaso" value={formData.estadoCaso} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_ESTADO_CASO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>

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
        {!isReadOnly && (
          <button onClick={handleSave} className="btn-colsanitas">
            <Save size={18} /> Guardar
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container-fluid" style={{ padding: "20px" }}>
      {/* MODAL DE SUBIDA DE ARCHIVO */}
      {showUploadModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
          display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", width: "400px", maxWidth: "90%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Subir Evidencia PDF</h3>
              <button onClick={handleCloseModal} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ border: "2px dashed #CBD5E0", padding: "40px", borderRadius: "8px", textAlign: "center", marginBottom: "20px", backgroundColor: "#F7FAFC" }}>
              <Upload size={40} color="#A0AEC0" style={{ marginBottom: "10px" }} />
              <p style={{ color: "#718096", marginBottom: "20px" }}>Seleccione el archivo PDF de soporte</p>
              <input type="file" accept=".pdf" onChange={(e) => setUploadFile(e.target.files[0])} />
            </div>
            {uploadFile && <p style={{ fontSize: "12px", color: "green", textAlign: "center" }}>Archivo seleccionado: {uploadFile.name}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={handleCloseModal} className="btn-colsanitas-outline">Cancelar</button>
              <button onClick={handleUpload} className="btn-colsanitas">Subir Archivo</button>
            </div>
          </div>
        </div>
      )}


      {mode === "list" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, color: "var(--colsanitas-blue)" }}>Gestión de Casos Rechazados / Objetados</h2>
          </div>

          <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
              <Filter size={18} color="var(--colsanitas-green)" />
              <h3 style={{ margin: 0, fontSize: "16px" }}>Filtros de Gestión</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Radicado</label>
                <input name="radicado" value={filters.radicado} onChange={handleFilterChange} className="input-colsanitas" placeholder="Buscar radicado..." />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Fecha</label>
                <input type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} className="input-colsanitas" />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Departamento</label>
                <select name="departamento" value={filters.departamento} onChange={handleFilterChange} className="input-colsanitas">
                  <option value="">Todos</option>
                  {Object.keys(DEPARTAMENTOS_COLOMBIA).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Ciudad</label>
                <input name="ciudad" value={filters.ciudad} onChange={handleFilterChange} className="input-colsanitas" placeholder="Buscar ciudad..." />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Empresa</label>
                <select name="empresa" value={filters.empresa} onChange={handleFilterChange} className="input-colsanitas">
                  <option value="">Todas</option>
                  {OPCIONES_EMPRESA.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Estado</label>
                <select name="estado" value={filters.estado} onChange={handleFilterChange} className="input-colsanitas">
                  <option value="">Todos</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="Objetado">Objetado</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button className="btn-colsanitas-outline" onClick={() => setFilters({ radicado: "", fecha: "", departamento: "", ciudad: "", empresa: "", estado: "" })} style={{ width: "100%", justifyContent: "center" }}>
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
                  <th>Departamento</th>
                  <th>Ciudad</th>
                  <th>Empresa</th>
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
                      <td>{item.departamento}</td>
                      <td>{item.ciudad}</td>
                      <td>{item.empresa}</td>
                      <td>
                        <span className="status-badge warning" style={{ backgroundColor: "#FEF2F2", color: "#991B1B" }}>
                          {item.estado}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            className="btn-colsanitas"
                            style={{ padding: "5px", fontSize: "12px", backgroundColor: "#4299E1", border: "1px solid #3182CE" }}
                            onClick={() => handleView(item)}
                            title="Ver detalle"
                          >
                            <FileText size={16} /> {/* Usamos FileText como "Ver" si no hay Eye importado, pero mejor Eye */}
                          </button>
                          <button
                            className="btn-colsanitas"
                            style={{ padding: "5px", fontSize: "12px" }}
                            onClick={() => handleEdit(item)}
                            title="Gestionar / Editar"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#A0AEC0" }}>
                      No se encontraron registros rechazados u objetados
                    </td>
                  </tr>
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
        renderForm()
      )}
    </div>
  );
};

export default GestionRechazados;
