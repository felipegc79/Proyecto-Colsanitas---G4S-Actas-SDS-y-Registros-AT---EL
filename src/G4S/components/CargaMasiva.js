import React, { useState } from "react";
import * as XLSX from "xlsx";
import { addNewRecord, addNewRecordEL } from "../data";

// --- LISTAS DE CAMPOS PARA GUIAR AL USUARIO ---
const COLUMNAS_FURAT_DOC = [
  "ID",
  "Línea de Negocio",
  "Ciudad",
  "Departamento",
  "Regional",
  "Sector (GES)",
  "Puesto Armado",
  "Cliente",
  "Unidades de Negocio",
  "Cédula (CC)",
  "Apellidos y Nombres",
  "Cargo",
  "Escolaridad",
  "Edad",
  "Sexo",
  "Fecha del Accidente",
  "Fecha Reporte ARL",
  "Mes",
  "Día de la Semana",
  "Descripción del AT",
  "Días de Incapacidad",
  "Prórroga 1",
  "Prórroga 2",
  "Total Días",
  "Aplica HPI",
  "Tipo de AT",
  "Nivel de AT",
  "Sitio del Accidente",
  "Tipo de Lesión",
  "Parte del Cuerpo",
  "Agente del accidente",
  "Mecanismo y forma del accidente",
  "Clasificación del Peligro",
  "Estado Investigación",
  "Fecha Prevista Investigación",
  "Fecha que se Investigó",
  "Factores Personales",
  "Factores de Trabajo",
  "Estandares de Comportamiento Seguro  G4S",
  "Causas de comportamiento riesgoso",
  "Condiciones ambientales subestándar",
  "Fuente",
  "Medio",
  "Individuo",
  "Fecha de Cierre del Caso",
  "Observación 1",
  "Observación 2",
  "Vehiculo involucrado",
  "Causante AT",
  "Actor accidentado en la vía",
  "Tarea en la vía",
  "Lugar de evento vial",
];

const COLUMNAS_FUREL_DOC = [
  "Datos EPS/ARL/AFP",
  "Tipo Vinculación",
  "Razón Social Empresa",
  "Actividad Económica",
  "Datos Centro de Trabajo",
  "Identificación Trabajador",
  "Fecha Nacimiento",
  "Sexo",
  "Nombres y Apellidos",
  "Cargo / Ocupación",
  "Fecha Ingreso",
  "Salario",
  "Jornada",
  "Diagnóstico (CIE 10)",
  "Factores de Riesgo (Químico, Físico, Biológico, Ergonómico)",
];

// --- DICCIONARIO DE MAPEO MEJORADO ---
const MAPEO_FURAT = {
  // Identificadores
  ITEM: "id",
  ID: "id",
  ID_EVENTO: "id",

  // Ubicación y Negocio
  "LINEA DE NEGOCIO": "lineaNegocio",
  LINEA_NEGOCIO: "lineaNegocio",
  CIUDAD: "ciudad",
  DEPARTAMENTO: "departamento",
  REGIONAL: "regional",
  "SECTOR (GES)": "sectorGes",
  "SECTOR GES": "sectorGes",
  "PUESTO ARMADO": "puestoArmado",
  CLIENTE: "cliente",
  "UNIDADES DE NEGOCIO": "unidadNegocio",
  DIVISIONES: "unidadNegocio",

  // Trabajador
  CC: "cc",
  "APELLIDOS Y NOMBRES": "apellidosNombres",
  CARGO: "cargo",
  ESCOLARIDAD: "escolaridad",
  EDAD: "rangoEdad",
  GENERO: "genero",

  // Tiempos
  "FECHA DEL ACCIDENTE": "fechaAccidente",
  "FECHA DE REPORTE ANTE LA ARL": "fechaReporteArl",
  "FECHA DE REPORTE ANTE ARL": "fechaReporteArl",
  MES: "mes",
  MES_EVENTO: "mes",
  "DIA DE LA SEMANA": "diaSemana",
  "HORA DEL AT": "horaAT",

  // Detalles del Evento
  "DESCRIPCION DEL ACCIDENTE O INCIDENTE DE TRABAJO": "descripcion",
  "DESCRIPCION DEL AT": "descripcion",
  DESCRIPCION_COLUMNA_T: "descripcion",

  // Incapacidad y Prórrogas
  "NUMERO DIAS DE INCAPACIDAD": "diasIncapacidad",
  "NUMERO DE DIAS DE INCAPACIDAD": "diasIncapacidad",
  "TOTAL DIAS PERDIDOS": "totalDias",
  "PRORROGA 1": "prorroga1",
  "PRORROGA 2": "prorroga2",

  // Clasificación HPI
  "INDIQUE SI APLICA COMO HPI": "esHpi",

  // Clasificación Técnica
  "TIPO DE ACCIDENTE DE TRABAJO": "tipoAccidente",
  "TIPO DE AT": "tipoAccidente",
  "CLASIFICACION NIVEL AT": "clasificacionNivel",
  "CLASIFICACION NIVEL DE AT": "clasificacionNivel",
  CLASIFICACION_EVENTO: "clasificacionNivel",

  "SITIO DEL ACCIDENTE": "sitioAccidente",
  "TIPO DE LESION": "tipoLesion",
  "PARTE DEL CUERPO AFECTADO": "parteCuerpo",
  "AGENTE DEL ACCIDENTE": "agenteAccidente",
  "MECANISMO Y FORMA DEL ACCIDENTE": "mecanismoForma",
  "CLASIFICACION DEL PELIGRO": "clasificacionPeligro",

  // Investigación
  "ESTADO DE LA INVESTIGACION": "estadoInvestigacion",
  "FECHA PREVISTA LA INVESTIGACION": "fechaPrevistaInv",
  "FECHA PREVISTA DE LA INVESTIGACION": "fechaPrevistaInv",
  "FECHA EN LA QUE SE INVESTIGO": "fechaInvestigacion",
  "FECHA DEL CIERRE CASO O EVENTO": "fechaCierre",

  // Factores
  "FACTORES PERSONAL": "factoresPersonales",
  "FACTORES PERSONALES": "factoresPersonales",
  "FACTORES DE TRABAJO": "factoresTrabajo",

  // Observaciones
  "OBSERVACION 1": "observacion1",
  "OBSERVACION 2": "observacion2",
};

const CargaMasiva = ({ type }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const camposGuia = type === "FURAT" ? COLUMNAS_FURAT_DOC : COLUMNAS_FUREL_DOC;

  // --- NORMALIZACIÓN ROBUSTA ---
  const normalize = (str) => {
    if (!str) return "";
    return str
      .toString()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar tildes
      .replace(/[\n\r]+/g, " ") // Saltos de línea a espacios
      .replace(/[^A-Z0-9\s]/g, "") // Quitar símbolos
      .replace(/\s+/g, " ") // Unificar espacios
      .trim();
  };

  const processFile = (file) => {
    setFileName(file.name);
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });

        let foundData = null;
        let sheetFound = "";

        // 1. BUSCAR EN TODAS LAS HOJAS
        for (let i = 0; i < wb.SheetNames.length; i++) {
          const wsName = wb.SheetNames[i];
          const ws = wb.Sheets[wsName];

          const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (rawData.length < 2) continue;

          // 2. ESCANEO PROFUNDO (Hasta fila 50)
          for (
            let rowIdx = 0;
            rowIdx < Math.min(rawData.length, 50);
            rowIdx++
          ) {
            const row = rawData[rowIdx];
            if (!row || row.length === 0) continue;

            const rowStr = row.map((cell) => normalize(cell)).join(" ");

            // Palabras clave
            const keywords =
              type === "FURAT"
                ? [
                    "LINEA DE NEGOCIO",
                    "APELLIDOS Y NOMBRES",
                    "DESCRIPCION DEL AT",
                  ]
                : ["EPS", "ARL", "DIAGNOSTICO"];

            const matches = keywords.filter((k) => rowStr.includes(k));
            if (matches.length >= 2) {
              const finalData = XLSX.utils.sheet_to_json(ws, { range: rowIdx });
              foundData = finalData;
              sheetFound = wsName;
              break;
            }
          }
          if (foundData) break;
        }

        if (!foundData || foundData.length === 0) {
          throw new Error(
            `No se encontró una estructura válida de ${type} en ninguna hoja.`
          );
        }

        // --- PROCESAMIENTO ---
        let count = 0;

        foundData.forEach((row, idx) => {
          const getField = (systemKey) => {
            const possibleExcelHeaders = Object.keys(MAPEO_FURAT).filter(
              (key) => MAPEO_FURAT[key] === systemKey
            );
            for (let header of Object.keys(row)) {
              const normHeader = normalize(header);
              if (
                possibleExcelHeaders.some((ph) => normalize(ph) === normHeader)
              ) {
                return row[header];
              }
            }
            return "";
          };

          if (type === "FURAT") {
            const record = {
              id: getField("id") || Date.now() + idx,
              lineaNegocio: getField("lineaNegocio"),
              ciudad: getField("ciudad"),
              departamento: getField("departamento"),
              regional: getField("regional"),
              cliente: getField("cliente"),
              cc: getField("cc"),
              apellidosNombres: getField("apellidosNombres"),
              cargo: getField("cargo"),
              fechaAccidente: getField("fechaAccidente"),
              descripcion: getField("descripcion"),
              diasIncapacidad: getField("diasIncapacidad") || 0,
              prorroga1: getField("prorroga1") || 0,
              prorroga2: getField("prorroga2") || 0,
              esHpi: (getField("esHpi") || "NO")
                .toString()
                .toUpperCase()
                .includes("SI")
                ? "SI"
                : "NO",
              tipoAccidente: getField("tipoAccidente"),
              clasificacionNivel: getField("clasificacionNivel"),
              sitioAccidente: getField("sitioAccidente"),
              estado: "Pendiente",
            };

            if (record.apellidosNombres || record.cc || record.descripcion) {
              addNewRecord(record);
              count++;
            }
          } else {
            const recordEL = {
              id: Date.now() + idx,
              nombreCompleto:
                `${row["Primer nombre"] || ""} ${
                  row["Primer apellido"] || ""
                }`.trim() || "Sin Nombre",
              eps: row["EPS"] || row["EPS a la que está afiliado"],
              arl: row["ARL"] || row["ARL a la que está afiliado"],
              diagnosticoCie10: row["Diagnóstico"] || row["CIE 10"],
            };
            addNewRecordEL(recordEL);
            count++;
          }
        });

        if (count === 0) {
          setErrorMsg(
            `⚠️ Se encontró la hoja "${sheetFound}" pero no se extrajeron registros válidos.`
          );
        } else {
          setSuccessMsg(
            `✅ ÉXITO: Se cargaron ${count} registros desde la hoja "${sheetFound}".`
          );
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(`❌ ERROR: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0])
      processFile(e.dataTransfer.files[0]);
  };
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const styles = {
    container: {
      padding: "40px",
      fontFamily: "Arial, sans-serif",
      maxWidth: "1000px",
      margin: "0 auto",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      padding: "40px",
      textAlign: "center",
    },
    dropzone: {
      border: `2px dashed ${dragActive ? "#CD1920" : "#ccc"}`,
      backgroundColor: dragActive ? "#fff5f5" : "#fafafa",
      borderRadius: "8px",
      padding: "40px 20px",
      cursor: "pointer",
      position: "relative",
      marginBottom: "20px",
    },
    hiddenInput: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: 0,
      cursor: "pointer",
    },
    alert: (type) => ({
      marginTop: "20px",
      padding: "15px",
      borderRadius: "4px",
      backgroundColor: type === "error" ? "#f8d7da" : "#d4edda",
      color: type === "error" ? "#721c24" : "#155724",
      border: `1px solid ${type === "error" ? "#f5c6cb" : "#c3e6cb"}`,
    }),
    instructionsBox: {
      marginTop: "30px",
      textAlign: "left",
      backgroundColor: "#f9f9f9",
      padding: "20px",
      borderRadius: "8px",
      border: "1px solid #eee",
    },
    gridFields: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
      gap: "10px",
      marginTop: "15px",
    },
    badge: {
      fontSize: "12px",
      backgroundColor: "white",
      padding: "6px 10px",
      borderRadius: "4px",
      border: "1px solid #ddd",
      color: "#555",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: "#CD1920", marginBottom: "10px" }}>
          Subir Archivo - Base de Datos {type}
        </h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Arrastre el archivo o haga clic para buscar. El sistema detectará
          automáticamente la hoja correcta.
        </p>

        <div
          style={styles.dropzone}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleChange}
            style={styles.hiddenInput}
          />
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>📂</div>
          <p>
            {fileName ? <strong>{fileName}</strong> : "Seleccionar Archivo"}
          </p>
        </div>

        {loading && <div>🔄 Procesando...</div>}
        {errorMsg && <div style={styles.alert("error")}>{errorMsg}</div>}
        {successMsg && <div style={styles.alert("success")}>{successMsg}</div>}

        {/* --- SECCIÓN DE INSTRUCCIONES AGREGADA --- */}
        <div style={styles.instructionsBox}>
          <h4 style={{ margin: "0 0 5px 0", color: "#CD1920" }}>
            📋 Campos Validados por el Sistema
          </h4>
          <p style={{ fontSize: "13px", color: "#777", margin: 0 }}>
            Asegúrese de que su archivo Excel contenga las siguientes columnas
            (el orden no importa, el sistema busca los nombres en el
            encabezado):
          </p>
          <div style={styles.gridFields}>
            {camposGuia.map((campo, i) => (
              <div key={i} style={styles.badge} title={campo}>
                • {campo}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: "15px",
              fontSize: "12px",
              color: "#999",
              fontStyle: "italic",
            }}
          >
            * El sistema normaliza automáticamente tildes y
            mayúsculas/minúsculas.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargaMasiva;
