// src/components/RegistrosEL.js
import React, { useState, useMemo, useEffect } from "react";
import {
  dataEL,
  addNewRecordEL,
  updateRecordEL,
  deleteRecordEL,
} from "../data";

// --- CONSTANTES DE OPCIONES ---
const TIPOS_VINCULACION = [
  "Empleador",
  "Contratante",
  "Independiente",
  "Cooperativa de trabajo asociado",
  "Agremiación",
  "Asociación",
];
const TIPOS_ID = ["NIT", "C.C.", "C.E.", "NU", "PA"];
const ZONAS = ["Urbana (U)", "Rural (R)"];
const SEXO = ["M", "F"];
const JORNADAS = ["Diurna", "Nocturna", "Mixta", "Por turnos"];

const RegistrosEL = () => {
  const [mode, setMode] = useState("list");
  const [records, setRecords] = useState(dataEL);
  const [currentId, setCurrentId] = useState(null);

  // --- NUEVO: Estado para los filtros ---
  const [filters, setFilters] = useState({
    numIdTrabajador: "",
    anio: "",
    eps: "",
    diagnostico: "",
  });

  // Recargar datos
  useEffect(() => {
    setRecords([...dataEL]);
  }, [mode]);

  const initialForm = {
    // 1. Afiliación
    eps: "",
    codigoEps: "",
    afp: "",
    codigoAfp: "",
    arl: "",
    codigoArl: "",

    // 2. Identificación General (Empleador)
    tipoVinculacion: "",
    razonSocial: "",

    // 3. Actividad Económica (Sede Principal)
    actividadEconomica: "",
    codigoActividad: "",
    tipoIdEmpresa: "",
    numIdEmpresa: "",
    dirEmpresa: "",
    telEmpresa: "",
    emailEmpresa: "",
    deptEmpresa: "",
    muniEmpresa: "",
    zonaEmpresa: "",

    // 4. Centro de Trabajo
    centroTrabajoMismaSede: "SI",
    codigoCentro: "",
    nombreActividadCentro: "",
    codigoActividadCentro: "",
    dirCentro: "",
    deptCentro: "",
    muniCentro: "",
    zonaCentro: "",

    // 5. Trabajador
    tipoIdTrabajador: "",
    numIdTrabajador: "",
    fechaNacimiento: "",
    sexo: "",
    tipoVinculacionTrabajador: "",
    primerApellido: "",
    segundoApellido: "",
    primerNombre: "",
    segundoNombre: "",
    dirTrabajador: "",
    telTrabajador: "",
    emailTrabajador: "",
    deptTrabajador: "",
    muniTrabajador: "",
    zonaTrabajador: "",
    ocupacionCodigo: "",
    fechaIngreso: "",
    salario: "",
    jornada: "",

    // 6. Enfermedad
    medicoNombre: "",
    medicoRegistro: "",
    diagnostico1: "",
    cie10_1: "",
    fechaDiag1: "",
    diagnostico2: "",
    cie10_2: "",
    fechaDiag2: "",
    diagnostico3: "",
    cie10_3: "",
    fechaDiag3: "",

    // 7. Factores de Riesgo
    riesgoQuimicoPolvo: false,
    riesgoQuimicoHumo: false,
    riesgoQuimicoGases: false,
    riesgoQuimicoVapores: false,
    riesgoQuimicoRocios: false,
    riesgoQuimicoNeblinas: false,
    riesgoQuimicoFibras: false,
    riesgoQuimicoOtro: "",

    riesgoFisicoRuido: false,
    riesgoFisicoVibraciones: false,
    riesgoFisicoRadiaciones: false,
    riesgoFisicoIonizantes: false,
    riesgoFisicoNoIonizantes: false,
    riesgoFisicoPresiones: false,
    riesgoFisicoClima: false,
    riesgoFisicoTemp: false,
    riesgoFisicoOtro: "",

    riesgoBioAnimales: false,
    riesgoBioVirus: false,
    riesgoBioBacterias: false,
    riesgoBioHongos: false,
    riesgoBioParasitos: false,
    riesgoBioOtro: "",

    riesgoAmbAguas: false,
    riesgoAmbBasuras: false,
    riesgoAmbEmisiones: false,
  }; // Close initialForm

  const [formData, setFormData] = useState(initialForm);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (
      !formData.primerNombre ||
      !formData.primerApellido ||
      !formData.numIdTrabajador
    ) {
      alert("Por favor complete los campos obligatorios del trabajador (*)");
      return;
    }
    const nombreCompleto = `${formData.primerNombre} ${formData.segundoNombre || ""
      } ${formData.primerApellido} ${formData.segundoApellido || ""}`.trim();

    const newRec = {
      ...formData,
      nombreCompleto,
      id: mode === "edit" ? currentId : `EL-${Date.now()}`,
    };

    if (mode === "edit") {
      updateRecordEL(newRec);
      alert("Registro Actualizado");
    } else {
      addNewRecordEL(newRec);
      alert("Registro Creado");
    }

    // Recargar datos
    setRecords([...dataEL]);
    setMode("list");
  };

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      // Filtro por ID Trabajador
      const matchId =
        filters.numIdTrabajador === "" ||
        (item.numIdTrabajador &&
          item.numIdTrabajador.includes(filters.numIdTrabajador));

      // Filtro por Año (Basado en fechaDiag1)
      const itemAnio = item.fechaDiag1 ? item.fechaDiag1.split("-")[0] : "";
      const matchAnio = filters.anio === "" || itemAnio === filters.anio;

      // Filtro por EPS
      const matchEps =
        filters.eps === "" ||
        (item.eps &&
          item.eps.toLowerCase().includes(filters.eps.toLowerCase()));

      // Filtro por Diagnóstico (Nombre o CIE10)
      const matchDiag =
        filters.diagnostico === "" ||
        (item.diagnostico1 &&
          item.diagnostico1
            .toLowerCase()
            .includes(filters.diagnostico.toLowerCase())) ||
        (item.cie10_1 &&
          item.cie10_1
            .toLowerCase()
            .includes(filters.diagnostico.toLowerCase()));

      return matchId && matchAnio && matchEps && matchDiag;
    });
  }, [records, filters]);

  // --- ESTILOS MEJORADOS ---
  const styles = {
    container: { padding: "40px", background: "#f4f4f4", minHeight: "100vh" },
    card: {
      background: "white",
      padding: "30px",
      borderRadius: "10px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      marginBottom: "30px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "30px",
    },

    // Títulos de sección con más aire
    sectionTitle: {
      background: "#f9f9f9",
      padding: "12px 20px",
      borderLeft: "6px solid #CD1920",
      fontWeight: "700",
      color: "#CD1920",
      marginTop: "30px",
      marginBottom: "25px",
      fontSize: "1.1em",
      borderRadius: "0 4px 4px 0",
    },

    // Grids con mayor GAP (Separación)
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "25px",
      marginBottom: "20px",
    },
    grid3: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "25px",
      marginBottom: "20px",
    },
    grid4: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      gap: "25px",
      marginBottom: "20px",
    },

    // Etiquetas e Inputs
    label: {
      display: "block",
      marginBottom: "8px",
      fontSize: "0.9em",
      fontWeight: "600",
      color: "#555",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      fontSize: "14px",
      boxSizing: "border-box",
      backgroundColor: "#fff",
    },

    // Checkboxes más separados
    checkboxGroup: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      fontSize: "0.95em",
      marginBottom: "8px",
      color: "#444",
    },

    // Botones
    btnG4S: {
      background: "#CD1920",
      color: "white",
      border: "none",
      padding: "12px 25px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    btnCancel: {
      background: "#777",
      color: "white",
      border: "none",
      padding: "12px 25px",
      borderRadius: "6px",
      cursor: "pointer",
      marginLeft: "15px",
      fontWeight: "bold",
      fontSize: "14px",
    },
  };

  // --- RENDER FORMULARIO ---
  const renderForm = () => (
    <div style={styles.card}>
      <h2
        style={{
          color: "#CD1920",
          marginBottom: "30px",
          borderBottom: "1px solid #eee",
          paddingBottom: "15px",
        }}
      >
        {mode === "create"
          ? "Nuevo Informe de Enfermedad Laboral"
          : mode === "view"
            ? "Ver Informe EL (Solo Lectura)"
            : "Editar Informe EL"}
      </h2>

      {/* SECCIÓN 1: AFILIACIÓN */}
      <div style={styles.sectionTitle}>1. Afiliación</div>
      <div style={styles.grid4}>
        <div>
          <label style={styles.label}>EPS Afiliado</label>
          <input
            name="eps"
            value={formData.eps}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Cód. EPS</label>
          <input
            name="codigoEps"
            value={formData.codigoEps}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>AFP Afiliado</label>
          <input
            name="afp"
            value={formData.afp}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Cód. AFP</label>
          <input
            name="codigoAfp"
            value={formData.codigoAfp}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>ARL Afiliado</label>
          <input
            name="arl"
            value={formData.arl}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Cód. ARL</label>
          <input
            name="codigoArl"
            value={formData.codigoArl}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
      </div>

      {/* SECCIÓN 2: IDENTIFICACIÓN GENERAL */}
      <div style={styles.sectionTitle}>
        2. Identificación General del Empleador
      </div>
      <div style={styles.grid2}>
        <div>
          <label style={styles.label}>Tipo de Vinculación Laboral</label>
          <select
            name="tipoVinculacion"
            value={formData.tipoVinculacion}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Seleccione...</option>
            {TIPOS_VINCULACION.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Nombre o Razón Social</label>
          <input
            name="razonSocial"
            value={formData.razonSocial}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
      </div>

      {/* SECCIÓN 3: ACTIVIDAD ECONÓMICA */}
      <div style={styles.sectionTitle}>
        3. Actividad Económica (Sede Principal)
      </div>
      <div style={styles.grid4}>
        <div style={{ gridColumn: "1/3" }}>
          <label style={styles.label}>Actividad Económica</label>
          <input
            name="actividadEconomica"
            value={formData.actividadEconomica}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={{ gridColumn: "3/5" }}>
          <label style={styles.label}>Código Actividad</label>
          <input
            name="codigoActividad"
            value={formData.codigoActividad}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Tipo Identificación</label>
          <select
            name="tipoIdEmpresa"
            value={formData.tipoIdEmpresa}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Sel...</option>
            {TIPOS_ID.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Número ID</label>
          <input
            name="numIdEmpresa"
            value={formData.numIdEmpresa}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={{ gridColumn: "3 / 5" }}>
          <label style={styles.label}>Dirección Principal</label>
          <input
            name="dirEmpresa"
            value={formData.dirEmpresa}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Teléfono</label>
          <input
            name="telEmpresa"
            value={formData.telEmpresa}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Email</label>
          <input
            name="emailEmpresa"
            value={formData.emailEmpresa}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Cód. Depto</label>
          <input
            name="deptEmpresa"
            value={formData.deptEmpresa}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Cód. Municipio</label>
          <input
            name="muniEmpresa"
            value={formData.muniEmpresa}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Zona</label>
          <select
            name="zonaEmpresa"
            value={formData.zonaEmpresa}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Sel...</option>
            {ZONAS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECCIÓN 4: CENTRO DE TRABAJO */}
      <div style={styles.sectionTitle}>4. Centro de Trabajo</div>
      <div
        style={{
          marginBottom: "25px",
          background: "#e3f2fd",
          padding: "15px",
          borderRadius: "6px",
          border: "1px solid #bbdefb",
        }}
      >
        <label
          style={{ fontWeight: "bold", marginRight: "15px", color: "#0d47a1" }}
        >
          ¿Son los datos del centro de trabajo los mismos de la sede principal?
        </label>
        <select
          name="centroTrabajoMismaSede"
          value={formData.centroTrabajoMismaSede}
          onChange={handleChange}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #90caf9",
          }}
        >
          <option value="SI">SÍ</option>
          <option value="NO">NO</option>
        </select>
      </div>

      {formData.centroTrabajoMismaSede === "NO" && (
        <div
          style={{
            ...styles.grid4,
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "8px",
            border: "1px dashed #ccc",
          }}
        >
          <div>
            <label style={styles.label}>Código Centro</label>
            <input
              name="codigoCentro"
              value={formData.codigoCentro}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div style={{ gridColumn: "2 / 4" }}>
            <label style={styles.label}>
              Nombre Actividad Económica Centro
            </label>
            <input
              name="nombreActividadCentro"
              value={formData.nombreActividadCentro}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Cód. Actividad</label>
            <input
              name="codigoActividadCentro"
              value={formData.codigoActividadCentro}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={{ gridColumn: "1 / 3" }}>
            <label style={styles.label}>Dirección Centro</label>
            <input
              name="dirCentro"
              value={formData.dirCentro}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Cód. Depto</label>
            <input
              name="deptCentro"
              value={formData.deptCentro}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Cód. Mun</label>
            <input
              name="muniCentro"
              value={formData.muniCentro}
              onChange={handleChange}
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>Zona</label>
            <select
              name="zonaCentro"
              value={formData.zonaCentro}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="">Sel...</option>
              {ZONAS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* SECCIÓN 5: PERSONA DIAGNOSTICADA */}
      <div style={styles.sectionTitle}>5. Información del Trabajador</div>
      <div style={styles.grid4}>
        <div>
          <label style={styles.label}>Tipo ID</label>
          <select
            name="tipoIdTrabajador"
            value={formData.tipoIdTrabajador}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Sel...</option>
            {TIPOS_ID.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Número ID*</label>
          <input
            name="numIdTrabajador"
            value={formData.numIdTrabajador}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Fecha Nacimiento</label>
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Sexo</label>
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Sel...</option>
            {SEXO.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={styles.label}>Tipo de Vinculación Laboral</label>
          <select
            name="tipoVinculacionTrabajador"
            value={formData.tipoVinculacionTrabajador}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Seleccione...</option>
            {TIPOS_VINCULACION.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={styles.label}>Primer Apellido*</label>
          <input
            name="primerApellido"
            value={formData.primerApellido}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Segundo Apellido</label>
          <input
            name="segundoApellido"
            value={formData.segundoApellido}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Primer Nombre*</label>
          <input
            name="primerNombre"
            value={formData.primerNombre}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Segundo Nombre</label>
          <input
            name="segundoNombre"
            value={formData.segundoNombre}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={{ gridColumn: "1 / 3" }}>
          <label style={styles.label}>Dirección Principal</label>
          <input
            name="dirTrabajador"
            value={formData.dirTrabajador}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Teléfono</label>
          <input
            name="telTrabajador"
            value={formData.telTrabajador}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Email</label>
          <input
            name="emailTrabajador"
            value={formData.emailTrabajador}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Cód. Depto</label>
          <input
            name="deptTrabajador"
            value={formData.deptTrabajador}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Cód. Mun</label>
          <input
            name="muniTrabajador"
            value={formData.muniTrabajador}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Zona</label>
          <select
            name="zonaTrabajador"
            value={formData.zonaTrabajador}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Sel...</option>
            {ZONAS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Ocupación (Cód)</label>
          <input
            name="ocupacionCodigo"
            value={formData.ocupacionCodigo}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Fecha Ingreso</label>
          <input
            type="date"
            name="fechaIngreso"
            value={formData.fechaIngreso}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Salario (Mensual)</label>
          <input
            type="number"
            name="salario"
            value={formData.salario}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={{ gridColumn: "3 / 5" }}>
          <label style={styles.label}>Jornada Habitual</label>
          <select
            name="jornada"
            value={formData.jornada}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Sel...</option>
            {JORNADAS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECCIÓN 6: ENFERMEDAD */}
      <div style={styles.sectionTitle}>6. Información de la Enfermedad</div>
      <div style={styles.grid2}>
        <div>
          <label style={styles.label}>Médico Tratante</label>
          <input
            name="medicoNombre"
            value={formData.medicoNombre}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>No. Registro Médico</label>
          <input
            name="medicoRegistro"
            value={formData.medicoRegistro}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          background: "#fcfcfc",
        }}
      >
        <label
          style={{
            ...styles.label,
            fontSize: "1em",
            color: "#CD1920",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
            marginBottom: "15px",
          }}
        >
          Diagnósticos (CIE 10)
        </label>

        {/* Encabezados para Diagnósticos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "20px",
            marginBottom: "10px",
          }}
        >
          <label style={{ fontSize: "0.8em", color: "#777" }}>
            Descripción del Diagnóstico
          </label>
          <label style={{ fontSize: "0.8em", color: "#777" }}>
            Código CIE10
          </label>
          <label style={{ fontSize: "0.8em", color: "#777" }}>Fecha</label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "20px",
            marginBottom: "15px",
          }}
        >
          <input
            name="diagnostico1"
            placeholder="Diagnóstico Principal"
            value={formData.diagnostico1}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="cie10_1"
            placeholder="CIE 10"
            value={formData.cie10_1}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="date"
            name="fechaDiag1"
            value={formData.fechaDiag1}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "20px",
            marginBottom: "15px",
          }}
        >
          <input
            name="diagnostico2"
            placeholder="Diagnóstico 2"
            value={formData.diagnostico2}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="cie10_2"
            placeholder="CIE 10"
            value={formData.cie10_2}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="date"
            name="fechaDiag2"
            value={formData.fechaDiag2}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "20px",
          }}
        >
          <input
            name="diagnostico3"
            placeholder="Diagnóstico 3"
            value={formData.diagnostico3}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="cie10_3"
            placeholder="CIE 10"
            value={formData.cie10_3}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="date"
            name="fechaDiag3"
            value={formData.fechaDiag3}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
      </div>

      {/* SECCIÓN 7: FACTORES DE RIESGO */}
      <div style={styles.sectionTitle}>7. Factores de Riesgo Asociados</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "25px",
        }}
      >
        {/* QUÍMICO */}
        <div
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h5
            style={{
              margin: "0 0 15px 0",
              color: "#CD1920",
              borderBottom: "1px solid #eee",
              paddingBottom: "5px",
            }}
          >
            Químico
          </h5>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoQuimicoPolvo"
              checked={formData.riesgoQuimicoPolvo}
              onChange={handleChange}
            />{" "}
            Polvo
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoQuimicoHumo"
              checked={formData.riesgoQuimicoHumo}
              onChange={handleChange}
            />{" "}
            Humo
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoQuimicoGases"
              checked={formData.riesgoQuimicoGases}
              onChange={handleChange}
            />{" "}
            Gases
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoQuimicoVapores"
              checked={formData.riesgoQuimicoVapores}
              onChange={handleChange}
            />{" "}
            Vapores
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoQuimicoRocios"
              checked={formData.riesgoQuimicoRocios}
              onChange={handleChange}
            />{" "}
            Rocíos
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoQuimicoNeblinas"
              checked={formData.riesgoQuimicoNeblinas}
              onChange={handleChange}
            />{" "}
            Neblinas
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoQuimicoFibras"
              checked={formData.riesgoQuimicoFibras}
              onChange={handleChange}
            />{" "}
            Fibras
          </div>
          <input
            name="riesgoQuimicoOtro"
            placeholder="Otro (Cuál)"
            value={formData.riesgoQuimicoOtro}
            onChange={handleChange}
            style={{ ...styles.input, marginTop: "10px" }}
          />
        </div>

        {/* FÍSICO */}
        <div
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h5
            style={{
              margin: "0 0 15px 0",
              color: "#CD1920",
              borderBottom: "1px solid #eee",
              paddingBottom: "5px",
            }}
          >
            Físico
          </h5>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoFisicoRuido"
              checked={formData.riesgoFisicoRuido}
              onChange={handleChange}
            />{" "}
            Ruido
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoFisicoVibraciones"
              checked={formData.riesgoFisicoVibraciones}
              onChange={handleChange}
            />{" "}
            Vibraciones
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoFisicoRadiaciones"
              checked={formData.riesgoFisicoRadiaciones}
              onChange={handleChange}
            />{" "}
            Radiaciones
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoFisicoIonizantes"
              checked={formData.riesgoFisicoIonizantes}
              onChange={handleChange}
            />{" "}
            Ionizantes
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoFisicoNoIonizantes"
              checked={formData.riesgoFisicoNoIonizantes}
              onChange={handleChange}
            />{" "}
            No Ionizantes
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoFisicoPresiones"
              checked={formData.riesgoFisicoPresiones}
              onChange={handleChange}
            />{" "}
            Presiones Anormales
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoFisicoClima"
              checked={formData.riesgoFisicoClima}
              onChange={handleChange}
            />{" "}
            Clima
          </div>
          <input
            name="riesgoFisicoOtro"
            placeholder="Otro (Cuál)"
            value={formData.riesgoFisicoOtro}
            onChange={handleChange}
            style={{ ...styles.input, marginTop: "10px" }}
          />
        </div>

        {/* BIOLÓGICO */}
        <div
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h5
            style={{
              margin: "0 0 15px 0",
              color: "#CD1920",
              borderBottom: "1px solid #eee",
              paddingBottom: "5px",
            }}
          >
            Biológico
          </h5>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoBioAnimales"
              checked={formData.riesgoBioAnimales}
              onChange={handleChange}
            />{" "}
            Animales
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoBioVirus"
              checked={formData.riesgoBioVirus}
              onChange={handleChange}
            />{" "}
            Virus
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoBioBacterias"
              checked={formData.riesgoBioBacterias}
              onChange={handleChange}
            />{" "}
            Bacterias
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoBioHongos"
              checked={formData.riesgoBioHongos}
              onChange={handleChange}
            />{" "}
            Hongos
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoBioParasitos"
              checked={formData.riesgoBioParasitos}
              onChange={handleChange}
            />{" "}
            Parásitos
          </div>
          <input
            name="riesgoBioOtro"
            placeholder="Otro (Cuál)"
            value={formData.riesgoBioOtro}
            onChange={handleChange}
            style={{ ...styles.input, marginTop: "10px" }}
          />
        </div>

        {/* AMBIENTAL */}
        <div
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "8px",
            background: "#fff",
          }}
        >
          <h5
            style={{
              margin: "0 0 15px 0",
              color: "#CD1920",
              borderBottom: "1px solid #eee",
              paddingBottom: "5px",
            }}
          >
            Ambiental
          </h5>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoAmbAguas"
              checked={formData.riesgoAmbAguas}
              onChange={handleChange}
            />{" "}
            Inadecuado trat. aguas
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoAmbBasuras"
              checked={formData.riesgoAmbBasuras}
              onChange={handleChange}
            />{" "}
            Basuras / Residuos
          </div>
          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="riesgoAmbEmisiones"
              checked={formData.riesgoAmbEmisiones}
              onChange={handleChange}
            />{" "}
            Emisiones Amb.
          </div>
          <input
            name="riesgoAmbOtro"
            placeholder="Otro (Cuál)"
            value={formData.riesgoAmbOtro}
            onChange={handleChange}
            style={{ ...styles.input, marginTop: "10px" }}
          />
        </div>
      </div>

      {/* SECCIÓN 8: TIEMPO DE EXPOSICIÓN */}
      <div style={styles.sectionTitle}>8. Tiempo de Exposición (Meses)</div>
      <div style={styles.grid3}>
        <div>
          <label style={styles.label}>Empresa</label>
          <input
            name="expEmpresa"
            value={formData.expEmpresa}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Factor de Riesgo</label>
          <input
            name="expFactor"
            value={formData.expFactor}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div>
          <label style={styles.label}>Tiempo (Meses)</label>
          <input
            type="number"
            name="expTiempo"
            value={formData.expTiempo}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
      </div>

      {/* BOTONES */}
      <div
        style={{
          marginTop: "40px",
          textAlign: "right",
          borderTop: "1px solid #eee",
          paddingTop: "20px",
        }}
      >
        {mode !== "view" && (
          <button onClick={handleSave} style={styles.btnG4S}>
            💾 Guardar EL
          </button>
        )}
        <button onClick={() => setMode("list")} style={styles.btnCancel}>
          {mode === "view" ? "⬅ Volver" : "Cancelar"}
        </button>
      </div>
    </div>
  );

  if (mode === "list") {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={{ color: "#333" }}>Registros Enfermedad Laboral (EL)</h2>
          <button
            onClick={() => {
              setMode("create");
            }}
            style={styles.btnG4S}
          >
            + Nuevo EL
          </button>
        </div>

        {/* --- NUEVO: Sección de Filtros --- */}
        <div
          style={{
            background: "#eee",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)", // 4 Columnas
            gap: "15px",
            alignItems: "end",
          }}
        >
          <div>
            <label style={styles.label}>Buscar por Cédula:</label>
            <input
              name="numIdTrabajador"
              placeholder="Ej. 1010..."
              value={filters.numIdTrabajador}
              onChange={handleFilterChange}
              style={{ ...styles.input, height: "38px" }}
            />
          </div>
          <div>
            <label style={styles.label}>Filtrar por Año (Diag):</label>
            <select
              name="anio"
              value={filters.anio}
              onChange={handleFilterChange}
              style={{ ...styles.input, height: "38px" }}
            >
              <option value="">Todos</option>
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Filtrar por EPS:</label>
            <input
              name="eps"
              placeholder="Ej. Sura, Sanitas..."
              value={filters.eps}
              onChange={handleFilterChange}
              style={{ ...styles.input, height: "38px" }}
            />
          </div>
          <div>
            <label style={styles.label}>Buscar Diagnóstico:</label>
            <input
              name="diagnostico"
              placeholder="Nombre o CIE10"
              value={filters.diagnostico}
              onChange={handleFilterChange}
              style={{ ...styles.input, height: "38px" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
            <button
              onClick={() =>
                setFilters({
                  numIdTrabajador: "",
                  anio: "",
                  eps: "",
                  diagnostico: "",
                })
              }
              style={{
                ...styles.btnCancel,
                padding: "8px 15px",
                fontSize: "0.9em",
              }}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#333", color: "white" }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Nombre Trabajador
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>EPS</th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Diagnóstico Principal
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "12px" }}>{r.id}</td>
                    <td style={{ padding: "12px" }}>{r.nombreCompleto}</td>
                    <td style={{ padding: "12px" }}>{r.eps}</td>
                    <td style={{ padding: "12px" }}>
                      {r.diagnosticoCie10 || r.cie10_1}
                    </td>
                    <td style={{ padding: "12px", display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => {
                          setMode("view");
                          setCurrentId(r.id);
                          setFormData(r);
                        }}
                        style={{
                          ...styles.btnG4S,
                          padding: "6px 12px",
                          background: "#1976D2",
                          fontSize: "12px",
                        }}
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => {
                          setMode("edit");
                          setCurrentId(r.id);
                          setFormData(r);
                        }}
                        style={{
                          ...styles.btnG4S,
                          padding: "6px 12px",
                          background: "#FFA000",
                          color: "#000",
                          fontSize: "12px",
                        }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ padding: "20px", textAlign: "center" }}
                  >
                    No se encontraron registros de EL con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return <div style={styles.container}>{renderForm()}</div>;
};

export default RegistrosEL;
