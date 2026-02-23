// src/components/RegistrosEL.js
import React, { useState, useMemo, useEffect } from "react";
import {
  FileText,
  Search,
  PlusCircle,
  Download,
  Trash2,
  Edit,
  Save,
  X,
  Filter,
  Eye
} from "lucide-react";
import {
  dataEL,
  addNewRecordEL,
  deleteRecordEL,
  updateRecordEL,
  DEPARTAMENTOS_COLOMBIA,
  loadFromStorage,
  syncFromDB
} from "../data";
import * as XLSX from "xlsx";
import { exportToPDF, exportToExcel } from "../utils/exportUtils";

// --- CONSTANTES DE OPCIONES ---
const OPCIONES_ESTADO_CASO = ["Abierto", "Anulado", "Cerrado", "Desistido", "Objetado"];
const OPCIONES_SUBESTADO = ["Firme", "Estudio", "Apelación", "Junta"];
const OPCIONES_SINO = ["SI", "NO"];
const OPCIONES_LATERALIDAD = ["Bilateral", "Derecha", "No aplica", "Izquierda", "Sin información"];
const OPCIONES_ETAPA = ["Seguimiento", "Calificación", "Cerrado", "Rehabilitación"];
const OPCIONES_MESES = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
const OPCIONES_EMPRESA = ["COLLECTIVE SAS", "CENTRO MÉDICO", "EPS COLSANITAS", "ESTRATÉGICOS 360 SAS"];
const OPCIONES_SEVERIDAD = ["Leve", "Moderado", "Severo", "Grave", "Mortal"];
const OPCIONES_CALIFICADORA = ["ARL", "EPS", "Fondo de Pensiones", "Junta Regional"];
const OPCIONES_SISTEMA_AFECTADO = [
  "Osteomuscular", "Biológico", "Mental", "Dermatológico",
  "Cardiovascular", "Fonatorio", "Auditivo", "Nervioso",
  "Respiratorio", "Otorrinolaringología"
];

const RegistrosEL = () => {
  const [mode, setMode] = useState("list"); // list, create, edit, view
  const [currentId, setCurrentId] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await syncFromDB("EL");
      if (data && data.length > 0) setRecords([...data]);
      else if (dataEL.length > 0) setRecords([...dataEL]);
    };
    load();
  }, []);

  const [filters, setFilters] = useState({
    radicado: "",
    fecha: "",
    nombreTrabajador: "",
    empresa: "",
    cie10: "",
    severidad: "",
    estado: ""
  });

  const initialForm = {
    // Información del Caso
    estadoCaso: "En Proceso",
    subestadoCaso: "",
    casoTrasladado: "NO",
    arlTraslado: "",

    // Información del Trabajador
    nombreCompleto: "",
    cedula: "",
    statusPoliza: "Activa",
    expedienteDrive: "",
    estadoAfiliado: "Activo",
    etapaCaso: "",
    fechaInicioCobertura: "",

    // Información General
    mes: "",
    anio: new Date().getFullYear().toString(),
    radicado: "",
    siniestro: "",
    empresa: "",
    departamento: "",
    ciudad: "",
    nit: "",
    grupoEmpresarial: "",
    cargo: "",

    // Diagnóstico
    diagnosticos: [
      { id: 1, descripcion: "", cie10: "", fechaDiagnostico: "", lateralidad: "", severidad: "", sistemaAfectado: "", estado: "En Proceso" },
      { id: 2, descripcion: "", cie10: "", fechaDiagnostico: "", lateralidad: "", severidad: "", sistemaAfectado: "", estado: "En Proceso" },
    ],

    // Calificación Primera Oportunidad
    entidadCalificadora1ra: "",
    origen1ra: "",
    fechaCalificacion1ra: "",
    recurso: "NO",

    // Junta Regional
    juntaRegional: "",
    origenJR: "",
    fechaOrigenJR: "",
    recursoOrigenJR: "",

    // Junta Nacional
    origenJUNAL: "",
    fechaDictamenJUNAL: "",
    fechaCalificacionFirme: "",

    // PCL ARL
    pclARL: "",
    fechaCalificacionPCLARL: "",
    recursoPCLARL: "",

    // PCL Junta Regional
    pclJRCI: "",
    fechaPCLJRCI: "",
    recursoPCLJRCI: "",

    // PCL Junta Nacional
    pclJNCI: "",
    fechaPCLJNCI: "",

    // Fechas Clave
    fechaEstructuracion: "",
    fechaFirmezaPCL: "",
    fechaPagoIPP: "",

    // Cierre
    cartaCierre: "NO",
    indemnizacion: "NO",
    mortal: "NO",
    valorITPagadas: "",
    recomendacionesLaborales: "",
    correoElectronico: ""
  };

  const [formData, setFormData] = useState(initialForm);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiagnosisChange = (index, field, value) => {
    const newDiagnosticos = [...formData.diagnosticos];
    if (!newDiagnosticos[index]) newDiagnosticos[index] = {};
    newDiagnosticos[index][field] = value;
    setFormData((prev) => ({ ...prev, diagnosticos: newDiagnosticos }));
  };

  const handleAddDiagnosis = () => {
    setFormData(prev => ({
      ...prev,
      diagnosticos: [
        ...prev.diagnosticos,
        {
          id: prev.diagnosticos.length + 1,
          descripcion: "",
          cie10: "",
          fechaDiagnostico: "",
          lateralidad: "",
          severidad: "",
          sistemaAfectado: "",
          estado: "En Proceso"
        }
      ]
    }));
  };

  const handleRemoveDiagnosis = (index) => {
    // Prevent removing the first two diagnoses
    if (index < 2) return;

    setFormData(prev => {
      const newDiagnosticos = prev.diagnosticos.filter((_, i) => i !== index);
      return { ...prev, diagnosticos: newDiagnosticos };
    });
  };

  const handleEdit = (record) => {
    // Ensure we have 4 slots even if record has fewer
    const currentDiags = record.diagnosticos || [];
    let paddedDiags = [...currentDiags];

    // Ensure at least 2 diag slots
    while (paddedDiags.length < 2) {
      paddedDiags.push({
        id: paddedDiags.length + 1,
        descripcion: "", cie10: "", fechaDiagnostico: "",
        lateralidad: "", severidad: "", sistemaAfectado: "", estado: "En Proceso"
      });
    }

    setFormData({ ...record, diagnosticos: paddedDiags });
    setCurrentId(record.id);
    setMode("edit");
  };

  const handleView = (record) => {
    // Reutilizamos lógica de padding de diagnósticos para visualización consistente
    const currentDiags = record.diagnosticos || [];
    let paddedDiags = [...currentDiags];
    while (paddedDiags.length < 2) {
      paddedDiags.push({
        id: paddedDiags.length + 1,
        descripcion: "", cie10: "", fechaDiagnostico: "",
        lateralidad: "", severidad: "", sistemaAfectado: "", estado: "En Proceso"
      });
    }
    setFormData({ ...record, diagnosticos: paddedDiags });
    setCurrentId(record.id);
    setMode("view");
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar este registro?")) {
      deleteRecordEL(id);
      setRecords(dataEL.filter((r) => r.id !== id));
    }
  };

  const handleSave = () => {
    if (!formData.nombreCompleto || !formData.cedula) {
      alert("Por favor complete los campos obligatorios del trabajador (*)");
      return;
    }

    // Validar al menos un diagnóstico
    if (!formData.diagnosticos[0].descripcion && !formData.diagnosticos[0].cie10) {
      alert("Por favor complete al menos el Diagnóstico Principal");
      return;
    }

    const newRec = {
      ...formData,
      id: mode === "edit" ? currentId : `EL-${Date.now()}`,
    };

    if (mode === "edit") {
      updateRecordEL(newRec);
      alert("Registro Actualizado");
    } else {
      addNewRecordEL(newRec);
      alert("Registro Creado");
    }
    setRecords(dataEL);
    setMode("list");
    setFormData(initialForm);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // --- FILTRADO ---
  const filteredRecords = useMemo(() => {
    let all = [];
    records.forEach((r) => {
      let added = false;
      // Si tiene diagnósticos array, aplanamos
      if (r.diagnosticos && Array.isArray(r.diagnosticos) && r.diagnosticos.length > 0) {
        r.diagnosticos.forEach((d) => {
          // Solo mostramos diagnósticos que tengan algo de info
          if (d.cie10 || d.descripcion) {
            all.push({
              ...r,
              ...d,
              id: `${r.id}-${d.id || Math.random()}`, // Create unique ID for table key
              originalId: r.id,
              diagnosisId: d.id,
              estadoDisplay: d.estado || r.estadoCaso
            });
            added = true;
          }
        });
      }

      // Si no se añadieron diagnósticos (vacíos o no existen), mostrar registro base
      if (!added) {
        all.push({ ...r, estadoDisplay: r.estadoCaso });
      }
    });

    return all.filter(r => {
      const matchRadicado = !filters.radicado || (r.radicado && r.radicado.toLowerCase().includes(filters.radicado.toLowerCase()));
      const matchFecha = !filters.fecha || (r.fechaDiagnostico && r.fechaDiagnostico.includes(filters.fecha));
      const matchNombre = !filters.nombreTrabajador || (r.nombreCompleto && r.nombreCompleto.toLowerCase().includes(filters.nombreTrabajador.toLowerCase()));
      const matchEmpresa = !filters.empresa || (r.empresa && r.empresa === filters.empresa);
      const matchCie10 = !filters.cie10 || (r.cie10 && r.cie10.toLowerCase().includes(filters.cie10.toLowerCase()));
      const matchSeveridad = !filters.severidad || (r.severidad && r.severidad === filters.severidad);
      const matchEstado = !filters.estado || (r.estadoDisplay && r.estadoDisplay === filters.estado);

      return matchRadicado && matchFecha && matchNombre && matchEmpresa && matchCie10 && matchSeveridad && matchEstado;
    });
  }, [records, filters]);

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExportListPDF = () => {
    const columns = ["Radicado", "Fecha DX", "Trabajador", "Empresa", "CIE10", "Estado"];
    const data = filteredRecords.map(r => [
      r.radicado,
      r.fechaDiagnostico,
      r.nombreCompleto,
      r.empresa,
      r.cie10,
      r.estadoDisplay
    ]);
    exportToPDF("Reporte de Enfermedades Laborales", columns, data, "Listado_EL.pdf");
  };

  const handleExportListExcel = () => {
    exportToExcel(filteredRecords, "Listado_EL.xlsx");
  };

  const handleExportFormPDF = () => {
    // Simple vertical list for form
    const columns = ["Campo", "Valor"];
    const data = Object.entries(formData).map(([k, v]) => {
      if (typeof v === 'object') return [k, JSON.stringify(v)];
      return [k, v];
    });
    exportToPDF(`Reporte EL - ${formData.radicado || "Borrador"}`, columns, data, `Formulario_EL_${formData.radicado || "temp"}.pdf`);
  };

  const handleExportFormExcel = () => {
    exportToExcel([formData], `Formulario_EL_${formData.radicado || "temp"}.xlsx`);
  };

  // --- RENDER FORMULARIO ---
  const renderForm = () => {
    const isReadOnly = mode === "view";

    return (
      <div className="card" style={{ padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          <h2 style={{ color: "var(--colsanitas-blue)", margin: 0 }}>
            {mode === "create" ? "Nuevo Informe de Enfermedad Laboral (EL)" : mode === "edit" ? "Editar Informe EL" : "Ver Detalle EL"}
          </h2>
          <button onClick={() => setMode("list")} className="btn-colsanitas-outline" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            Volver
          </button>
        </div>

        <fieldset disabled={isReadOnly} style={{ border: "none", margin: 0, padding: 0 }}>
          {/* 1. Información del Caso */}
          <h3 className="section-title">1. Información del Caso y Trabajador</h3>
          <div className="form-grid">
            <label style={{ gridColumn: "span 2", fontWeight: "bold", color: "#C53030" }}>
              Estado del caso:
              <select name="estadoCaso" value={formData.estadoCaso} onChange={handleChange} className="input-colsanitas" style={{ fontWeight: "bold" }}>
                <option value="">Seleccione...</option>
                {OPCIONES_ESTADO_CASO.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label>Subestado del caso: <select name="subestadoCaso" value={formData.subestadoCaso} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SUBESTADO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Caso trasladado: <select name="casoTrasladado" value={formData.casoTrasladado} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>ARL Traslado: <input name="arlTraslado" value={formData.arlTraslado} onChange={handleChange} className="input-colsanitas" disabled={formData.casoTrasladado !== "SI"} /></label>

            <label>Nombre Completo *: <input name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Cédula *: <input name="cedula" value={formData.cedula} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Status Poliza: <input name="statusPoliza" value={formData.statusPoliza} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Expediente Drive: <input name="expedienteDrive" value={formData.expedienteDrive} onChange={handleChange} className="input-colsanitas" /></label>

            <label>Estado Afiliado: <input name="estadoAfiliado" value={formData.estadoAfiliado} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Etapa Caso: <select name="etapaCaso" value={formData.etapaCaso} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_ETAPA.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Fecha Inicio Cobertura: <input type="date" name="fechaInicioCobertura" value={formData.fechaInicioCobertura} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Cargo: <input name="cargo" value={formData.cargo} onChange={handleChange} className="input-colsanitas" /></label>
          </div>

          {/* 2. Información General */}
          <h3 className="section-title">2. Información General</h3>
          <div className="form-grid">
            <label>Mes: <select name="mes" value={formData.mes} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_MESES.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Año: <input name="anio" value={formData.anio} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Radicado: <input name="radicado" value={formData.radicado} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Siniestro: <input name="siniestro" value={formData.siniestro} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Empresa: <select name="empresa" value={formData.empresa} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_EMPRESA.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Departamento:
              <select name="departamento" value={formData.departamento || ""} onChange={handleChange} className="input-colsanitas">
                <option value="">Sel...</option>
                {Object.keys(DEPARTAMENTOS_COLOMBIA).sort().map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>Ciudad:
              <select name="ciudad" value={formData.ciudad || ""} onChange={handleChange} className="input-colsanitas">
                <option value="">Sel...</option>
                {formData.departamento && DEPARTAMENTOS_COLOMBIA[formData.departamento] ?
                  DEPARTAMENTOS_COLOMBIA[formData.departamento].map(c => <option key={c} value={c}>{c}</option>) :
                  (formData.ciudad ? <option value={formData.ciudad}>{formData.ciudad}</option> : <option value="">Seleccione Depto primero</option>)
                }
              </select>
            </label>
            <label>NIT: <input name="nit" value={formData.nit} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Grupo Empresarial: <input name="grupoEmpresarial" value={formData.grupoEmpresarial} onChange={handleChange} className="input-colsanitas" /></label>
          </div>

          {/* 3. Diagnóstico */}
          {/* 3. Diagnóstico y Severidad */}
          <h3 className="section-title">3. Diagnóstico y Severidad</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {formData.diagnosticos.map((diag, index) => (
              <div key={index} className="card" style={{ padding: "15px", border: "1px solid #e2e8f0", backgroundColor: "#f8f9fa", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>
                  <h4 style={{ margin: 0, color: "#C53030" }}>
                    {index === 0 ? "Diagnóstico Principal" : `Diagnóstico ${index + 1}`}
                  </h4>
                  {index >= 2 && !isReadOnly && (
                    <button
                      onClick={() => handleRemoveDiagnosis(index)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#E53E3E" }}
                      title="Eliminar diagnóstico"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="form-grid">
                  <label>Descripción del Diagnóstico:
                    <input
                      name="descripcion"
                      value={diag.descripcion || ""}
                      onChange={(e) => handleDiagnosisChange(index, "descripcion", e.target.value)}
                      className="input-colsanitas"
                    />
                  </label>
                  <label>Código CIE10:
                    <input
                      name="cie10"
                      value={diag.cie10 || ""}
                      onChange={(e) => handleDiagnosisChange(index, "cie10", e.target.value)}
                      className="input-colsanitas"
                      placeholder="CIE 10"
                    />
                  </label>
                  <label>Fecha:
                    <input
                      type="date"
                      name="fechaDiagnostico"
                      value={diag.fechaDiagnostico || ""}
                      onChange={(e) => handleDiagnosisChange(index, "fechaDiagnostico", e.target.value)}
                      className="input-colsanitas"
                    />
                  </label>
                  <label>Lateralidad:
                    <select
                      name="lateralidad"
                      value={diag.lateralidad || ""}
                      onChange={(e) => handleDiagnosisChange(index, "lateralidad", e.target.value)}
                      className="input-colsanitas"
                    >
                      <option value="">Sel...</option>
                      {OPCIONES_LATERALIDAD.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                  <label>Severidad:
                    <select
                      name="severidad"
                      value={diag.severidad || ""}
                      onChange={(e) => handleDiagnosisChange(index, "severidad", e.target.value)}
                      className="input-colsanitas"
                    >
                      <option value="">Sel...</option>
                      {OPCIONES_SEVERIDAD.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                  <label>Sistema Afectado:
                    <select
                      name="sistemaAfectado"
                      value={diag.sistemaAfectado || ""}
                      onChange={(e) => handleDiagnosisChange(index, "sistemaAfectado", e.target.value)}
                      className="input-colsanitas"
                    >
                      <option value="">Sel...</option>
                      {OPCIONES_SISTEMA_AFECTADO.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                  <label>Estado:
                    <select
                      value={diag.estado || "En Proceso"}
                      onChange={(e) => handleDiagnosisChange(index, "estado", e.target.value)}
                      className="input-colsanitas"
                    >
                      {OPCIONES_ESTADO_CASO.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            ))}


            {!isReadOnly && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button onClick={handleAddDiagnosis} className="btn-colsanitas-outline" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <PlusCircle size={16} /> Añadir Diagnóstico
                </button>
              </div>
            )}
          </div>

          {/* 4. Calificaciones */}
          <h3 className="section-title">4. Calificaciones y Recursos</h3>
          <div className="form-grid">
            <label>Entidad Calificadora 1ra: <select name="entidadCalificadora1ra" value={formData.entidadCalificadora1ra} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_CALIFICADORA.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Origen 1ra Oportunidad: <input name="origen1ra" value={formData.origen1ra} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha Calif. 1ra: <input type="date" name="fechaCalificacion1ra" value={formData.fechaCalificacion1ra} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Recurso: <select name="recurso" value={formData.recurso} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>

            <label>Junta Regional: <input name="juntaRegional" value={formData.juntaRegional} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Origen Junta Regional: <input name="origenJR" value={formData.origenJR} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha Origen JR: <input type="date" name="fechaOrigenJR" value={formData.fechaOrigenJR} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Recurso Origen JR: <input name="recursoOrigenJR" value={formData.recursoOrigenJR} onChange={handleChange} className="input-colsanitas" /></label>

            <label>Origen JUNAL: <input name="origenJUNAL" value={formData.origenJUNAL} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha Dictamen JUNAL: <input type="date" name="fechaDictamenJUNAL" value={formData.fechaDictamenJUNAL} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha Calificación Firme: <input type="date" name="fechaCalificacionFirme" value={formData.fechaCalificacionFirme} onChange={handleChange} className="input-colsanitas" /></label>
          </div>

          {/* 5. Pérdida de Capacidad Laboral (PCL) */}
          <h3 className="section-title">5. Pérdida de Capacidad Laboral (PCL)</h3>
          <div className="form-grid">
            <label>PCL ARL: <input name="pclARL" value={formData.pclARL} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha Calif. PCL ARL: <input type="date" name="fechaCalificacionPCLARL" value={formData.fechaCalificacionPCLARL} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Recurso PCL ARL: <input name="recursoPCLARL" value={formData.recursoPCLARL} onChange={handleChange} className="input-colsanitas" /></label>

            <label>PCL JRCI: <input name="pclJRCI" value={formData.pclJRCI} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha PCL JRCI: <input type="date" name="fechaPCLJRCI" value={formData.fechaPCLJRCI} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Recurso PCL JRCI: <input name="recursoPCLJRCI" value={formData.recursoPCLJRCI} onChange={handleChange} className="input-colsanitas" /></label>

            <label>PCL JNCI: <input name="pclJNCI" value={formData.pclJNCI} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha PCL JNCI: <input type="date" name="fechaPCLJNCI" value={formData.fechaPCLJNCI} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha Estructuración: <input type="date" name="fechaEstructuracion" value={formData.fechaEstructuracion} onChange={handleChange} className="input-colsanitas" /></label>

            <label>Fecha Firmeza PCL: <input type="date" name="fechaFirmezaPCL" value={formData.fechaFirmezaPCL} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Fecha Pago IPP: <input type="date" name="fechaPagoIPP" value={formData.fechaPagoIPP} onChange={handleChange} className="input-colsanitas" /></label>
          </div>

          {/* 6. Cierre e Indemnización */}
          <h3 className="section-title">6. Cierre e Indemnización</h3>
          <div className="form-grid">
            <label>Carta Cierre: <select name="cartaCierre" value={formData.cartaCierre} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Indemnización: <select name="indemnizacion" value={formData.indemnizacion} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
            <label>Mortal: <select name="mortal" value={formData.mortal} onChange={handleChange} className="input-colsanitas"><option value="">Sel...</option>{OPCIONES_SINO.map(o => <option key={o} value={o}>{o}</option>)}</select></label>

            <label>Valor IT Pagadas: <input type="number" name="valorITPagadas" value={formData.valorITPagadas} onChange={handleChange} className="input-colsanitas" /></label>
            <label>Correo Electrónico: <input type="email" name="correoElectronico" value={formData.correoElectronico} onChange={handleChange} className="input-colsanitas" /></label>
            <label style={{ gridColumn: "span 2" }}>Recomendaciones Laborales: <input name="recomendacionesLaborales" value={formData.recomendacionesLaborales} onChange={handleChange} className="input-colsanitas" /></label>
          </div>
        </fieldset>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", gap: "10px" }}>
          <button onClick={() => setMode("list")} className="btn-colsanitas-outline">{isReadOnly ? "Volver" : "Cancelar"}</button>
          <button onClick={handleExportFormPDF} className="btn-colsanitas-outline" title="Exportar a PDF">
            <FileText size={18} /> Exportar PDF
          </button>
          <button onClick={handleExportFormExcel} className="btn-colsanitas-outline" title="Exportar a Excel">
            <Download size={18} /> Exportar Excel
          </button>
          {!isReadOnly && (
            <button onClick={handleSave} className="btn-colsanitas">
              <Save size={18} /> Guardar
            </button>
          )}
        </div>
      </div >
    );
  };

  return (
    <div className="container-fluid" style={{ padding: "20px" }}>
      {mode === "list" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, color: "var(--colsanitas-blue)" }}>Gestión de Enfermedades Laborales (EL)</h2>
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
          </div>

          <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
              <Filter size={18} color="var(--colsanitas-green)" />
              <h3 style={{ margin: 0, fontSize: "16px" }}>Filtros de Búsqueda</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "15px" }}>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Radicado</label>
                <input name="radicado" value={filters.radicado} onChange={handleFilterChange} className="input-colsanitas" placeholder="Buscar radicado..." />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Fecha DX</label>
                <input type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} className="input-colsanitas" />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Trabajador</label>
                <input name="nombreTrabajador" value={filters.nombreTrabajador} onChange={handleFilterChange} className="input-colsanitas" placeholder="Nombre trabajador..." />
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>Empresa</label>
                <select name="empresa" value={filters.empresa} onChange={handleFilterChange} className="input-colsanitas">
                  <option value="">Todas</option>
                  {OPCIONES_EMPRESA.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label style={{ fontSize: "12px", color: "#718096" }}>CIE10</label>
                <input name="cie10" value={filters.cie10} onChange={handleFilterChange} className="input-colsanitas" placeholder="Código CIE10..." />
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
                <button className="btn-colsanitas-outline" onClick={() => setFilters({ radicado: "", fecha: "", nombreTrabajador: "", empresa: "", cie10: "", severidad: "", estado: "" })} style={{ width: "100%", justifyContent: "center" }}>
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
                  <th>Fecha DX</th>
                  <th>Nombre Trabajador</th>
                  <th>Empresa</th>
                  <th>CIE10</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((item) => (
                  <tr key={item.id}>
                    <td>{item.radicado}</td>
                    <td>{item.fechaDiagnostico}</td>
                    <td>{item.nombreCompleto}</td>
                    <td>{item.empresa}</td>
                    <td>{item.cie10}</td>
                    <td>{item.severidad}</td>
                    <td><span className="status-badge success">{item.estadoDisplay}</span></td>
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
                ))}

              </tbody>
            </table>
          </div>

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
        </>
      ) : (
        renderForm()
      )}
    </div >
  );
};

export default RegistrosEL;
