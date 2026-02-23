
import { REGIONALES } from "./utils/regionales";
import { saveToDB, getAllFromDB } from "./utils/db";

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- LISTAS DE REFERENCIA ---
export const DEPARTAMENTOS_COLOMBIA = {
  AMAZONAS: ["LETICIA"],
  ANTIOQUIA: ["MEDELLÍN", "BELLO", "ITAGÜÍ", "ENVIGADO", "RIONEGRO", "APARTADÓ"],
  ARAUCA: ["ARAUCA"],
  ATLÁNTICO: ["BARRANQUILLA", "SOLEDAD", "PUERTO COLOMBIA"],
  BOLÍVAR: ["CARTAGENA", "MAGANGUÉ"],
  BOYACÁ: ["TUNJA", "DUITAMA", "SOGAMOSO"],
  CALDAS: ["MANIZALES", "LA DORADA"],
  CAQUETÁ: ["FLORENCIA"],
  CASANARE: ["YOPAL"],
  CAUCA: ["POPAYÁN"],
  CESAR: ["VALLEDUPAR", "AGUACHICA"],
  CHOCÓ: ["QUIBDÓ"],
  CÓRDOBA: ["MONTERÍA"],
  CUNDINAMARCA: ["BOGOTÁ D.C.", "SOACHA", "GIRARDOT", "ZIPAQUIRÁ", "CHÍA", "MOSQUERA"],
  HUILA: ["NEIVA", "PITALITO"],
  "LA GUAJIRA": ["RIOHACHA", "MAICAO"],
  MAGDALENA: ["SANTA MARTA", "CIÉNAGA"],
  META: ["VILLAVICENCIO", "ACACÍAS"],
  NARIÑO: ["PASTO", "TUMACO", "IPIALES"],
  "NORTE DE SANTANDER": ["CÚCUTA", "OCAÑA"],
  PUTUMAYO: ["MOCOA"],
  QUINDÍO: ["ARMENIA"],
  RISARALDA: ["PEREIRA", "DOSQUEBRADAS"],
  "SAN ANDRÉS Y PROVIDENCIA": ["SAN ANDRÉS"],
  SANTANDER: ["BUCARAMANGA", "FLORIDABLANCA", "GIRÓN", "BARRANCABERMEJA"],
  SUCRE: ["SINCELEJO"],
  TOLIMA: ["IBAGUÉ", "ESPINAL"],
  "VALLE DEL CAUCA": ["CALI", "PALMIRA", "BUENAVENTURA", "TULUÁ", "YUMBO"],
  BOGOTA: ["BOGOTA"]
};

export const EMPRESAS = [
  "COLLECTIVE SAS",
  "CENTRO MÉDICO",
  "EPS COLSANITAS",
  "ESTRATÉGICOS 360 SAS",
  "CLÍNICA DENTAL KERALTY",
  "COMPAÑÍA DE MEDICINA PREPAGADA COLSANITAS",
  "CLÍNICA COLSANITAS",
  "CENTROS MÉDICOS COLSANITAS SAS",
  "SEGUROS COLSANITAS",
  "YAZAKI CIEMEL SA",
  "INDUSTRIAL GOYA INCOL SAS"
];

// --- GESTIÓN DE DATOS (INDEXEDDB) ---

// Arrays en memoria para acceso rápido síncrono en la UI
export let dataAT = [];
export let dataEL = [];

/**
 * Sincroniza los datos desde IndexedDB a memoria.
 * IMPORTANTE: Esta función es la ÚNICA fuente de verdad tras un refresh.
 */
export const syncFromDB = async (type = "AT") => {
  try {
    const storeName = type === "AT" ? "accidentes" : "enfermedades";
    console.log(`🔄 syncFromDB("${type}") → Leyendo de store "${storeName}"...`);

    const records = await getAllFromDB(storeName);

    console.log(`🔄 syncFromDB("${type}") → ${records.length} registros obtenidos`);

    if (records && records.length > 0) {
      // Log de diagnóstico: mostrar campos del primer registro
      const sample = records[0];
      console.log(`🔑 syncFromDB("${type}") Muestra:`, {
        campos: Object.keys(sample).length,
        tieneDepto: !!sample.departamento,
        tieneParteCuerpo: !!sample.parteCuerpo,
        tieneEmpresa: !!sample.empresa,
        departamento: sample.departamento,
        parteCuerpo: sample.parteCuerpo,
        empresa: sample.empresa,
      });

      // Actualizar cache en memoria
      if (type === "AT") {
        dataAT.length = 0;
        dataAT.push(...records);
        return dataAT;
      } else {
        dataEL.length = 0;
        dataEL.push(...records);
        return dataEL;
      }
    }

    console.warn(`⚠️ syncFromDB("${type}"): Store vacío. No hay datos.`);
    return [];
  } catch (err) {
    console.error(`❌ syncFromDB("${type}") FALLÓ:`, err);
    return [];
  }
};

/**
 * Legacy: devuelve la referencia en memoria.
 */
export const loadFromStorage = (key) => {
  return key.endsWith("_AT") ? dataAT : dataEL;
};

/**
 * Guarda en IndexedDB asíncronamente.
 */
const saveToStorage = async (key, data) => {
  try {
    const storeName = key.endsWith("_AT") ? "accidentes" : "enfermedades";
    console.log(`💾 saveToStorage("${key}") → Store: "${storeName}" (${data.length} registros)`);

    await saveToDB(storeName, data);

    console.log(`💾 saveToStorage("${key}") → ✅ Completado`);

    // Limpieza de localStorage antiguo (ya no se usa)
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(key + "_chunks");
    } catch (e) { /* ignorar */ }

    return true;
  } catch (error) {
    console.error(`❌ saveToStorage("${key}") FALLÓ:`, error);
    return false;
  }
};

export const getLocalStorageUsage = () => 0;

// --- CRUD ---

export const addNewRecord = (record) => {
  dataAT.unshift(record);
  return saveToStorage("COLSANITAS_DATA_AT", dataAT);
};

export const updateRecord = (updatedRecord) => {
  const index = dataAT.findIndex((r) => r.id === updatedRecord.id);
  if (index !== -1) {
    dataAT[index] = updatedRecord;
    return saveToStorage("COLSANITAS_DATA_AT", dataAT);
  }
  return true;
};

export const deleteRecord = (id) => {
  const index = dataAT.findIndex((r) => r.id === id);
  if (index !== -1) {
    dataAT.splice(index, 1);
    return saveToStorage("COLSANITAS_DATA_AT", dataAT);
  }
  return true;
};

export const addNewRecordEL = (record) => {
  dataEL.unshift(record);
  return saveToStorage("COLSANITAS_DATA_EL", dataEL);
};

export const updateRecordEL = (updatedRecord) => {
  const index = dataEL.findIndex((r) => r.id === updatedRecord.id);
  if (index !== -1) {
    dataEL[index] = updatedRecord;
    return saveToStorage("COLSANITAS_DATA_EL", dataEL);
  }
  return true;
};

export const deleteRecordEL = (id) => {
  const index = dataEL.findIndex((r) => r.id === id);
  if (index !== -1) {
    dataEL.splice(index, 1);
    return saveToStorage("COLSANITAS_DATA_EL", dataEL);
  }
  return true;
};

// --- ESTRATEGIAS DE CARGA MASIVA ---

export const bulkAddRecordsAT = async (records) => {
  console.log(`📦 bulkAddRecordsAT: ${records.length} registros`);
  dataAT.length = 0;
  dataAT.push(...records);
  const ok = await saveToStorage("COLSANITAS_DATA_AT", dataAT);
  console.log(`📦 bulkAddRecordsAT: resultado = ${ok}`);
  return ok;
};

export const bulkAddRecordsEL = async (records) => {
  console.log(`📦 bulkAddRecordsEL: ${records.length} registros`);
  dataEL.length = 0;
  dataEL.push(...records);
  const ok = await saveToStorage("COLSANITAS_DATA_EL", dataEL);
  console.log(`📦 bulkAddRecordsEL: resultado = ${ok}`);
  return ok;
};

export const replaceAllAT = bulkAddRecordsAT;
export const replaceAllEL = bulkAddRecordsEL;