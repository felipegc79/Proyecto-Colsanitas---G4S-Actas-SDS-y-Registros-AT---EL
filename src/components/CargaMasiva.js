import React, { useState } from "react";
import * as XLSX from "xlsx";
import { bulkAddRecordsAT, bulkAddRecordsEL, getLocalStorageUsage } from "../data";

// --- CONFIGURACIÓN DE VALIDACIÓN ---

// 1. AT (Accidentes de Trabajo)
const MANDATORY_COLUMNS_AT = [
  "Estado del Caso", "Numero de Radicado", "Numero de Siniestro", "Cédula",
  "Apellidos y Nombres del Trabajador", "Género", "Grupo Empresarial", "Empresa",
  "NIT", "Estado de la Empresa", "Cargo", "Departamento", "Ciudad", "Fecha AT",
  "Mes", "Año", "Origen Aprobado", "Oportunidad en el reporte del AT", "Severidad",
  "Reclasificado", "Tipo de AT", "Riesgo biológico", "SOAT", "FURAT diligenciado",
  "Jornada", "Dia de la semana del evento", "lugar de ocurrencia", "Parte del cuerpo afectada",
  "Lateralidad", "Agente del Accidente", "Sitio del Accidente", "Tipo de lesión",
  "Mecanismo o forma del Accidente", "Diagnostico del evento", "Manejo inicial canal",
  "Pertinente", "IPS Remisión", "Asiste", "Caso PRI", "Fecha de ingreso a PRI",
  "AT Mortal", "Fecha de cierre", "Mes cierre", "Año cierre", "Fecha reapertura",
  "Total días de incapacidad", "Valor total IT", "AT Grave por Resolución 1401",
  "Fecha notificación 1401", "Recomendaciones laborales", "PCL real", "%PCL",
  "Fecha dictamen", "Apela PCL ARL", "Junta Regional", "PCL JRCI", "Apela PCL JRCI",
  "PCL JNCI", "Fecha PCL JNCI", "Fecha estructuración", "PCL en firme", "Fecha firmeza",
  "Indemnizado", "Valor indemnización", "Administradora de casos", "Actividad económica",
  "Mail de Empresa"
];

const REQUIRED_VALUES_AT = [
  "Fecha AT", "Departamento", "Ciudad", "Estado del Caso", "Cédula",
  "Apellidos y Nombres del Trabajador", "Género", "Grupo Empresarial", "Empresa",
  "NIT", "Estado de la Empresa", "Cargo", "Total días de incapacidad"
];

// 2. EL (Enfermedades Laborales)
const MANDATORY_COLUMNS_EL = [
  "Estado del caso", "Subestado del caso", "Caso trasladado", "ARL que realiza el traslado",
  "Nombre completo", "Cedula", "Status de la póliza", "Expediente completo drive",
  "Estado del afiliado", "Etapa del caso", "Fecha inicio cobertura ARL Colsanitas",
  "Mes", "Año", "Radicado", "Siniestro", "Empresa", "Ciudad", "NIT",
  "Grupo Empresarial", "Cargo", "CIE 10", "Diagnósticos reconocidos laborales",
  "Lateralidad", "Fecha del diagnóstico", "Severidad", "Entidad calificadora primera oportunidad",
  "Origen primera oportunidad", "Fecha calificación primera oportunidad", "Recurso",
  "Junta regional calificadora", "Origen junta regional", "Fecha origen JRCI",
  "Recurso al origen JRCI", "Origen JUNAL", "Fecha dictamen JUNAL", "Fecha calificación en firme",
  "PCL ARL", "Fecha de calificación PCL ARL", "Recurso a la PCL ARL", "PCL JRCI",
  "Fecha PCL JRCI", "Recurso a la PCL JRCI", "PCL JUNAL", "Fecha PCL JUNAL",
  "Fecha estructuración", "Fecha firmeza PCL", "Fecha de pago IPP", "Carta de cierre",
  "Indemnización", "Mortal", "Valor de las IT pagadas", "Recomendaciones laborales",
  "Sistema afectado", "Correo electrónico"
];

const REQUIRED_VALUES_EL = [
  "Nombre completo", "Cedula", "Radicado", "Siniestro",
  "Empresa", "Ciudad", "Diagnósticos reconocidos laborales", "CIE 10",
  "Fecha del diagnóstico", "Estado del caso"
];

const normalize = (str) => {
  if (!str) return "";
  return str.toString().trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Sin tildes
    .replace(/\s+/g, " "); // Espacios unificados
};

const CargaMasiva = ({ type }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const mandatoryCols = type === "FURAT" ? MANDATORY_COLUMNS_AT : MANDATORY_COLUMNS_EL;
  const requiredVals = type === "FURAT" ? REQUIRED_VALUES_AT : REQUIRED_VALUES_EL;

  // Función auxiliar para ceder control al navegador entre lotes
  const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

  const processFile = (file) => {
    setFileName(file.name);
    setLoading(true);
    setProgress(0);
    setProgressText("Leyendo archivo...");
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0]; // Leer la primera hoja
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Array de arrays

        if (!data || data.length < 2) {
          throw new Error("El archivo está vacío o no tiene encabezados.");
        }

        let headers = data[0].map(h => normalize(h));

        // Alias de columnas para permitir nombres alternativos y mapeo exacto
        let ALIAS_MAP = {};

        if (type === "FURAT") {
          ALIAS_MAP = {
            // RADICADO
            "RADICADO": "NUMERO DE RADICADO",
            "NO. RADICADO": "NUMERO DE RADICADO",
            "NUMERO RADICADO": "NUMERO DE RADICADO",

            // SINIESTRO
            "SINIESTRO": "NUMERO DE SINIESTRO",
            "NO. SINIESTRO": "NUMERO DE SINIESTRO",
            "NUMERO SINIESTRO": "NUMERO DE SINIESTRO",

            // FURAT
            "FURAT": "FURAT DILIGENCIADO",
            "FURAT DILIGENCIADO": "FURAT DILIGENCIADO",
            "FURAT DILIGENCIADO (SI/NO)": "FURAT DILIGENCIADO", // Match exacto con el excel

            // ASISTE
            "ASISTE A PRI": "ASISTE",
            "ASISTE A PROGRAMA": "ASISTE",
            "ASISTE": "ASISTE",
            "¿ASISTE? SI - NO": "ASISTE", // Match exacto con el excel
            "¿ASISTE?": "ASISTE",

            // FECHA DE INGRESO
            "FECHA INGRESO PRI": "FECHA DE INGRESO A PRI",
            "FECHA DE INGRESO": "FECHA DE INGRESO A PRI",
            "FECHA INGRESO": "FECHA DE INGRESO A PRI",
            "FECHA DE INGRESO PRI": "FECHA DE INGRESO A PRI",
            "FECHA INGRESO A PRI": "FECHA DE INGRESO A PRI", // Match exacto con el excel

            // AT GRAVE
            "AT GRAVE": "AT GRAVE POR RESOLUCION 1401",
            "AT GRAVE 1401": "AT GRAVE POR RESOLUCION 1401",
            "ACCIDENTE GRAVE": "AT GRAVE POR RESOLUCION 1401",
            "RESOLUCION 1401": "AT GRAVE POR RESOLUCION 1401",
            "AT GRAVE POR RES 1401": "AT GRAVE POR RESOLUCION 1401", // Match exacto con el excel

            // PCL
            "PCL": "%PCL",
            "PORCENTAJE PCL": "%PCL",
            "% PCL": "%PCL",
            "%PCL": "%PCL",

            // MAIL (AT usa 'Mail de Empresa')
            "MAIL DE EMPRESA": "MAIL DE EMPRESA",
            "CORREO ELECTRONICO": "MAIL DE EMPRESA",
            "CORREO": "MAIL DE EMPRESA",
            "EMAIL": "MAIL DE EMPRESA"
          };
        } else {
          // Mapeos específicos para Enfermedades Laborales (EL)
          ALIAS_MAP = {
            // ESTATUS
            "ESTATUS DE LA POLIZA": "STATUS DE LA POLIZA",

            // RADICADO (EL usa 'Radicado', Excel trae 'Numero de Radicado')
            "NUMERO DE RADICADO": "RADICADO",
            "NO. RADICADO": "RADICADO",

            // SINIESTRO (EL usa 'Siniestro')
            "NUMERO DE SINIESTRO": "SINIESTRO",
            "NO. SINIESTRO": "SINIESTRO",

            // CARTA DE CIERRE
            "CARTA DE CIERRE (FECHA)": "CARTA DE CIERRE",

            // MAIL (EL usa 'Correo electrónico')
            "MAIL DE EMPRESA": "CORREO ELECTRONICO",
            "CORREO": "CORREO ELECTRONICO",
            "EMAIL": "CORREO ELECTRONICO"
          };
        }

        headers = headers.map(h => ALIAS_MAP[h] || h);

        // 1. VERIFICAR COLUMNAS OBLIGATORIAS
        const missingColumns = mandatoryCols.filter(col => !headers.includes(normalize(col)));

        if (missingColumns.length > 0) {
          throw new Error(`Faltan las siguientes columnas obligatorias: ${missingColumns.join(", ")}. (Encabezados encontrados: ${headers.join(", ")})`);
        }

        // 2. VALIDAR FILAS Y CONSTRUIR REGISTROS (ASÍNCRONO POR LOTES)
        const totalRows = data.length - 1;
        setProgressText(`Procesando ${totalRows.toLocaleString()} filas...`);

        // Procesamos de forma asíncrona para no bloquear la UI
        const processRowsAsync = async () => {
          const errors = [];
          const validRecords = [];
          const BATCH_SIZE = 500; // Procesar 500 filas por lote

          for (let i = 1; i < data.length; i++) {
            const rowRaw = data[i];
            if (!rowRaw || rowRaw.length === 0 || rowRaw.every(cell => !cell)) continue;

            const record = {};
            headers.forEach((header, idx) => {
              record[header] = rowRaw[idx] !== undefined ? String(rowRaw[idx]).trim() : "";
            });

            // Validar campos obligatorios con valor
            const emptyRequired = requiredVals.filter(col => {
              const val = record[normalize(col)];
              return !val || val === "";
            });

            if (emptyRequired.length > 0) {
              errors.push({ row: i + 1, missing: emptyRequired });
              continue;
            }

            // Mapeo a estructura interna del dashboard
            // NO usar ...record para evitar duplicar datos y exceder cuota de localStorage
            const internalRecord = {
              id: Date.now() + i,
              // AT / General Mappings
              empresa: record[normalize("Empresa")],
              departamento: record[normalize("Departamento")] || record[normalize("Ciudad")],
              ciudad: record[normalize("Ciudad")],
              fechaAT: record[normalize("Fecha AT")],
              fechaAccidente: record[normalize("Fecha AT")],
              estadoCaso: record[normalize("Estado del Caso")] || record[normalize("Estado del caso")],
              severidad: record[normalize("Severidad")],
              genero: record[normalize("Género")] || record[normalize("Genero")],
              cedula: record[normalize("Cédula")] || record[normalize("Cedula")],
              apellidosNombres: record[normalize("Apellidos y Nombres del Trabajador")] || record[normalize("Nombre completo")],
              nombreCompleto: record[normalize("Nombre completo")] || record[normalize("Apellidos y Nombres del Trabajador")],
              cargo: record[normalize("Cargo")],
              diasIncapacidad: record[normalize("Total días de incapacidad")] || 0,

              // Campos para Filtros del Dashboard
              anio: record[normalize("Año")] || record[normalize("Ano")] || new Date().getFullYear().toString(),
              mes: record[normalize("Mes")],
              grupoEmpresarial: record[normalize("Grupo Empresarial")],
              tipoVinculacion: record[normalize("Tipo de Vinculación")] || record[normalize("Tipo de vinculacion")],
              centroCosto: record[normalize("Centro de Costo")] || record[normalize("Centro de costo")],

              // Caracterización (AT)
              parteCuerpo: record[normalize("Parte del cuerpo afectada")],
              mecanismo: record[normalize("Mecanismo o forma del Accidente")],
              agente: record[normalize("Agente del Accidente")],
              sitio: record[normalize("Sitio del Accidente")],

              // EL Specific Mappings
              radicado: record[normalize("Numero de Radicado")] || record[normalize("Radicado")],
              siniestro: record[normalize("Numero de Siniestro")] || record[normalize("Siniestro")],
              diagnosticosReconocidos: record[normalize("Diagnósticos reconocidos laborales")],
              fechaDiagnostico: record[normalize("Fecha del diagnóstico")],
              cie10: record[normalize("CIE 10")],
              arlTraslado: record[normalize("ARL que realiza el traslado")],

              // Campos adicionales del formulario AT
              nit: record[normalize("NIT")],
              estadoEmpresa: record[normalize("Estado de la Empresa")],
              origenAprobado: record[normalize("Origen Aprobado")],
              oportunidadReporte: record[normalize("Oportunidad en el reporte del AT")],
              reclasificado: record[normalize("Reclasificado")],
              tipoAT: record[normalize("Tipo de AT")],
              riesgoBiologico: record[normalize("Riesgo biológico")],
              soat: record[normalize("SOAT")],
              furatDiligenciado: record[normalize("FURAT diligenciado")],
              jornada: record[normalize("Jornada")],
              diaSemana: record[normalize("Dia de la semana del evento")],
              lugarOcurrencia: record[normalize("lugar de ocurrencia")],
              lateralidad: record[normalize("Lateralidad")],
              tipoLesion: record[normalize("Tipo de lesión")],
              diagnostico: record[normalize("Diagnostico del evento")],
              manejoInicial: record[normalize("Manejo inicial canal")],
              pertinente: record[normalize("Pertinente")],
              ipsRemision: record[normalize("IPS Remisión")],
              asiste: record[normalize("Asiste")],
              casoPRI: record[normalize("Caso PRI")],
              fechaIngresoPRI: record[normalize("Fecha de ingreso a PRI")],
              atMortal: record[normalize("AT Mortal")],
              fechaCierre: record[normalize("Fecha de cierre")],
              mesCierre: record[normalize("Mes cierre")],
              anioCierre: record[normalize("Año cierre")],
              fechaReapertura: record[normalize("Fecha reapertura")],
              valorTotalIT: record[normalize("Valor total IT")],
              atGrave1401: record[normalize("AT Grave por Resolución 1401")],
              fechaNotificacion1401: record[normalize("Fecha notificación 1401")],
              recomendacionesLaborales: record[normalize("Recomendaciones laborales")],
              pclReal: record[normalize("PCL real")],
              porcentajePCL: record[normalize("%PCL")],
              fechaDictamen: record[normalize("Fecha dictamen")],
              apelaPCLARL: record[normalize("Apela PCL ARL")],
              juntaRegional: record[normalize("Junta Regional")],
              pclJRCI: record[normalize("PCL JRCI")],
              apelaPCLJRCI: record[normalize("Apela PCL JRCI")],
              pclJNCI: record[normalize("PCL JNCI")],
              fechaPCLJNCI: record[normalize("Fecha PCL JNCI")],
              fechaEstructuracion: record[normalize("Fecha estructuración")],
              pclFirme: record[normalize("PCL en firme")],
              fechaFirmeza: record[normalize("Fecha firmeza")],
              indemnizado: record[normalize("Indemnizado")],
              valorIndemnizacion: record[normalize("Valor indemnización")],
              administradora: record[normalize("Administradora de casos")],
              actividadEconomica: record[normalize("Actividad económica")],
              mailEmpresa: record[normalize("Mail de Empresa")],

              // EL Additional fields
              estado: record[normalize("Estado del caso")],
              subestado: record[normalize("Subestado del caso")],
              casoTrasladado: record[normalize("Caso trasladado")],
              statusPoliza: record[normalize("Status de la póliza")],
              expedienteCompletoDrive: record[normalize("Expediente completo drive")],
              estadoAfiliado: record[normalize("Estado del afiliado")],
              etapaCaso: record[normalize("Etapa del caso")],
              fechaInicioCobertura: record[normalize("Fecha inicio cobertura ARL Colsanitas")],
              entidadCalificadora: record[normalize("Entidad calificadora primera oportunidad")],
              origenPrimeraOportunidad: record[normalize("Origen primera oportunidad")],
              fechaCalificacionPrimeraOportunidad: record[normalize("Fecha calificación primera oportunidad")],
              recurso: record[normalize("Recurso")],
              juntaRegionalCalificadora: record[normalize("Junta regional calificadora")],
              origenJuntaRegional: record[normalize("Origen junta regional")],
              fechaOrigenJRCI: record[normalize("Fecha origen JRCI")],
              recursoOrigenJRCI: record[normalize("Recurso al origen JRCI")],
              origenJUNAL: record[normalize("Origen JUNAL")],
              fechaDictamenJUNAL: record[normalize("Fecha dictamen JUNAL")],
              fechaCalificacionFirme: record[normalize("Fecha calificación en firme")],
              pclARL: record[normalize("PCL ARL")],
              fechaCalificacionPCLARL: record[normalize("Fecha de calificación PCL ARL")],
              recursoPCLARL: record[normalize("Recurso a la PCL ARL")],
              pclJRCIel: record[normalize("PCL JRCI")],
              fechaPCLJRCIel: record[normalize("Fecha PCL JRCI")],
              recursoPCLJRCI: record[normalize("Recurso a la PCL JRCI")],
              pclJUNAL: record[normalize("PCL JUNAL")],
              fechaPCLJUNAL: record[normalize("Fecha PCL JUNAL")],
              fechaFirmezaPCL: record[normalize("Fecha firmeza PCL")],
              fechaPagoIPP: record[normalize("Fecha de pago IPP")],
              cartaCierre: record[normalize("Carta de cierre")],
              indemnizacion: record[normalize("Indemnización")],
              mortal: record[normalize("Mortal")],
              valorITPagadas: record[normalize("Valor de las IT pagadas")],
              sistemaAfectado: record[normalize("Sistema afectado")],
              correoElectronico: record[normalize("Correo electrónico")],

              // Diagnósticos para DashboardEL
              diagnosticos: [
                {
                  id: 1,
                  cie10: record[normalize("CIE 10")],
                  descripcion: record[normalize("Diagnósticos reconocidos laborales")],
                  fechaDiagnostico: record[normalize("Fecha del diagnóstico")],
                  lateralidad: record[normalize("Lateralidad")],
                  severidad: record[normalize("Severidad")],
                  sistemaAfectado: record[normalize("Sistema afectado")],
                  estado: record[normalize("Estado del caso")]
                }
              ],

              trabajadores: 1,
            };

            // Eliminar campos vacíos/undefined para reducir tamaño JSON (~50% menos)
            const cleanRecord = {};
            for (const [k, v] of Object.entries(internalRecord)) {
              if (v !== undefined && v !== null && v !== "") {
                // Para diagnosticos, limpiar internamente también
                if (k === "diagnosticos" && Array.isArray(v)) {
                  const cleanDiags = v.map(d => {
                    const cd = {};
                    for (const [dk, dv] of Object.entries(d)) {
                      if (dv !== undefined && dv !== null && dv !== "") cd[dk] = dv;
                    }
                    return cd;
                  }).filter(d => Object.keys(d).length > 1); // al menos algo además de 'id'
                  if (cleanDiags.length > 0) cleanRecord[k] = cleanDiags;
                } else {
                  cleanRecord[k] = v;
                }
              }
            }

            validRecords.push(cleanRecord);

            // Cada BATCH_SIZE filas, ceder control al navegador y actualizar progreso
            if (validRecords.length % BATCH_SIZE === 0) {
              const pct = Math.round((i / totalRows) * 100);
              setProgress(pct);
              setProgressText(`Procesando fila ${i.toLocaleString()} de ${totalRows.toLocaleString()} (${pct}%)`);
              await yieldToMain();
            }
          }

          // 3. GUARDAR EN BLOQUE (IndexedDB - Async)
          if (validRecords.length > 0) {
            setProgress(90);
            setProgressText(`Guardando ${validRecords.length.toLocaleString()} registros en base de datos...`);
            await yieldToMain();

            let saveOk = false;
            try {
              if (type === "FURAT") {
                saveOk = await bulkAddRecordsAT(validRecords);
              } else {
                saveOk = await bulkAddRecordsEL(validRecords);
              }
            } catch (e) {
              console.error("Error guardando:", e);
              saveOk = false;
            }

            if (!saveOk) {
              setErrorMsg(
                `⚠️ ERROR DE PERSISTENCIA: No se pudieron guardar los registros en la base de datos local. ` +
                `Por favor intente nuevamente o verifique los permisos del navegador.`
              );
            } else {
              console.log("✅ Guardado exitoso en IndexedDB");
            }
          }

          setProgress(100);
          setProgressText("¡Completado!");

          if (errors.length > 0) {
            setErrorMsg(`Atención: Se encontraron errores en ${errors.length} filas. Se cargaron ${validRecords.length} registros válidos.`);
            console.warn("Errores de validación:", errors);
          } else if (validRecords.length > 0) {
            setSuccessMsg(`✅ ÉXITO: Se cargaron ${validRecords.length.toLocaleString()} registros correctamente en la base de datos.`);
          }

          if (validRecords.length === 0 && errors.length === 0) {

            setErrorMsg("No se encontraron registros de datos en el archivo.");
          } else if (validRecords.length === 0 && errors.length > 0) {
            setErrorMsg("❌ No se pudo cargar ningún registro debido a filas incompletas.");
          }

          setLoading(false);
        };

        // Iniciar procesamiento asíncrono
        processRowsAsync().catch(err => {
          console.error(err);
          setErrorMsg(`❌ ERROR CRÍTICO: ${err.message}`);
          setLoading(false);
        });

      } catch (err) {
        console.error(err);
        setErrorMsg(`❌ ERROR CRÍTICO: ${err.message}`);
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const styles = {
    container: { padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "1000px", margin: "0 auto" },
    card: { backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "40px", textAlign: "center" },
    dropzone: { border: `2px dashed ${dragActive ? "#CD1920" : "#ccc"}`, backgroundColor: dragActive ? "#fff5f5" : "#fafafa", borderRadius: "8px", padding: "40px 20px", cursor: "pointer", position: "relative", marginBottom: "20px" },
    hiddenInput: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" },
    alert: (type) => ({ marginTop: "20px", padding: "15px", borderRadius: "4px", backgroundColor: type === "error" ? "#f8d7da" : "#d4edda", color: type === "error" ? "#721c24" : "#155724", border: `1px solid ${type === "error" ? "#f5c6cb" : "#c3e6cb"}` }),
    badge: { fontSize: "11px", backgroundColor: "#f0f4f8", padding: "5px 10px", borderRadius: "4px", border: "1px solid #d9e2ec", color: "#102a43", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "5px" },
    gridFields: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px", marginTop: "15px", maxHeight: "400px", overflowY: "auto", textAlign: "left", paddingRight: "10px" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ color: "#CD1920", marginBottom: "10px" }}>Carga Masiva - {type === "FURAT" ? "Accidentes (AT)" : "Enfermedades (EL)"}</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>Arrastre el archivo Excel (.xlsx, .xls) o haga clic para buscar.</p>

        <div style={styles.dropzone} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => { if (e.target.files[0]) processFile(e.target.files[0]); }} style={styles.hiddenInput} />
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>📂</div>
          <p>{fileName ? <strong>{fileName}</strong> : "Seleccionar Archivo"}</p>
        </div>

        {loading && (
          <div style={{ marginTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#CD1920", fontWeight: "bold", fontSize: "14px" }}>🔄 {progressText}</span>
              <span style={{ color: "#4A5568", fontWeight: "600", fontSize: "14px" }}>{progress}%</span>
            </div>
            <div style={{ width: "100%", height: "12px", backgroundColor: "#E2E8F0", borderRadius: "6px", overflow: "hidden" }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: progress === 100 ? "#38A169" : "#CD1920",
                borderRadius: "6px",
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>
        )}
        {errorMsg && <div style={styles.alert("error")}>{errorMsg}</div>}
        {successMsg && <div style={styles.alert("success")}>{successMsg}</div>}

        <div style={{ marginTop: "30px", textAlign: "left", backgroundColor: "#fff", padding: "20px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
            <h4 style={{ margin: 0, color: "#2d3748" }}>📋 Columnas Requeridas en el Archivo</h4>
            <span style={{ fontSize: "12px", color: "#718096" }}>{mandatoryCols.length} columnas</span>
          </div>

          <div style={styles.gridFields}>
            {mandatoryCols.map((col, i) => {
              const isRequired = requiredVals.includes(col);
              return (
                <div key={i} style={{
                  ...styles.badge,
                  backgroundColor: isRequired ? "#FFF5F5" : "#F7FAFC",
                  borderColor: isRequired ? "#FEB2B2" : "#EDF2F7",
                  color: isRequired ? "#C53030" : "#4A5568",
                  fontWeight: isRequired ? "600" : "400"
                }}>
                  {col}
                  {isRequired && <span title="Campo obligatorio (No puede estar vacío)" style={{ color: "#E53E3E", fontWeight: "bold", fontSize: "14px" }}>*</span>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "15px", fontSize: "12px", color: "#718096", fontStyle: "italic", display: "flex", gap: "15px" }}>
            <span><strong style={{ color: "#E53E3E" }}>*</strong> Indica que el campo no puede estar vacío.</span>
            <span>El sistema verifica automáticamente que todas las columnas existan.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargaMasiva;
