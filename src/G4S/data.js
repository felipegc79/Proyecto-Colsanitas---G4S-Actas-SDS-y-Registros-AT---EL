// src/data.js

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Lista completa de Departamentos y Capitales
export const DEPARTAMENTOS_COLOMBIA = {
  AMAZONAS: ["LETICIA"],
  ANTIOQUIA: ["MEDELLÍN", "BELLO", "ITAGÜÍ", "ENVIGADO", "RIONEGRO"],
  ARAUCA: ["ARAUCA"],
  ATLÁNTICO: ["BARRANQUILLA", "SOLEDAD"],
  BOLÍVAR: ["CARTAGENA", "MAGANGUÉ"],
  BOYACÁ: ["TUNJA", "DUITAMA", "SOGAMOSO"],
  CALDAS: ["MANIZALES", "LA DORADA"],
  CAQUETÁ: ["FLORENCIA"],
  CASANARE: ["YOPAL"],
  CAUCA: ["POPAYÁN"],
  CESAR: ["VALLEDUPAR", "AGUACHICA"],
  CHOCÓ: ["QUIBDÓ"],
  CÓRDOBA: ["MONTERÍA"],
  CUNDINAMARCA: ["BOGOTÁ D.C.", "SOACHA", "GIRARDOT", "ZIPAQUIRÁ"],
  GUAINÍA: ["INÍRIDA"],
  GUAVIARE: ["SAN JOSÉ DEL GUAVIARE"],
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
  "VALLE DEL CAUCA": ["CALI", "PALMIRA", "BUENAVENTURA", "TULUÁ"],
  VAUPÉS: ["MITÚ"],
  VICHADA: ["PUERTO CARREÑO"],
};

// --- LAS 4 EMPRESAS (LÍNEAS DE NEGOCIO) G4S ---
const LINEAS_NEGOCIO = ["SECURE", "RISK", "TECHNOLOGY", "INFOTEC"];

const OPCIONES_REGIONAL = [
  "Bogotá-Girardot",
  "Sabana",
  "Noroccidente",
  "Santanderes-Costa",
  "Sur Occidente",
  "Eje Cafetero"
];

const CLIENTES = [
  "ECOPETROL", "GRUPO ÉXITO", "BANCOLOMBIA", "BAVARIA", "ALPINA",
  "NUTRESA", "CEMEX", "SODIMAC", "FALABELLA", "BIMBO",
  "COLGATE-PALMOLIVE", "NESTLÉ", "POSTOBÓN", "COCA-COLA FEMSA", "DAVIVIENDA",
  "CLARO", "MOVISTAR", "ETB", "ISA", "TIGO"
];

const CARGOS = [
  "Guarda de Seguridad", "Supervisor de Operaciones", "Técnico Electrónico",
  "Operador de Monitoreo", "Conductor Escolta", "Analista de Seguridad",
  "Auxiliar de Aseo", "Operario de Mantenimiento", "Recepcionista", "Escolta"
];

const GENEROS = ["Masculino", "Femenino"];

const OPCIONES_TIPO_ACCIDENTE = [
  "Caída de alturas", "Caída al mismo nivel", "Golpe con objetos",
  "Tránsito", "Agresión", "Sobreesfuerzo",
  "Mordedura de animal", "Lesión por herramientas", "Riesgo biológico",
  "Atrapamiento", "Quemadura", "Contacto eléctrico"
];

const OPCIONES_NIVEL_AT = ["Leve", "AT Moderado", "AT Grave", "Fatal"];

const OPCIONES_PARTE_CUERPO = [
  "Cabeza", "Ojo", "Cuello", "Tronco", "Tórax",
  "Miembros Superiores", "Manos", "Miembros inferiores", "Pies",
  "Ubicaciones múltiples", "Lesiones Generales u otras"
];

const OPCIONES_MECANISMO = [
  "Caída de persona", "Caída de objetos", "Pisadas, choques o golpes",
  "Atrapamiento", "Exposición", "Sobreesfuerzo",
  "Contacto con electricidad", "Agresión"
];

const OPCIONES_PELIGRO = [
  "Locativo", "Biomecánico", "Tránsito", "Físico",
  "Mecánico", "Psicosocial", "Publico", "Químico", "Naturales"
];

const OPCIONES_SITIO = [
  "En la empresa", "Fuera de la empresa", "En la vía", "En la sede del cliente"
];

const ESTADOS_AT = ["Aprobado", "Pendiente", "Objetado ARL", "Rechazado G4S"];
const ESTADOS_INV = ["Ejecutada", "Pendiente"];

const LISTA_MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

// --- NOMBRES PARA GENERAR DATOS REALISTAS ---
const NOMBRES_M = ["JUAN", "CARLOS", "PEDRO", "ANDRÉS", "JORGE", "LUIS", "MIGUEL", "DAVID", "SANTIAGO", "DANIEL", "FERNANDO", "ALEJANDRO", "RICARDO", "OSCAR", "CAMILO", "NELSON", "FABIÁN", "HÉCTOR", "GUSTAVO", "EDGAR"];
const NOMBRES_F = ["MARIA", "ANA", "CLAUDIA", "DIANA", "LUISA", "PAULA", "ANDREA", "SANDRA", "PATRICIA", "CAROLINA", "NATALIA", "LORENA", "ANGELA", "MARCELA", "ADRIANA", "CATALINA", "JENNY", "LILIANA", "ELIZABETH", "NORMA"];
const APELLIDOS = ["PEREZ", "RODRIGUEZ", "GOMEZ", "MARTINEZ", "LOPEZ", "GARCIA", "HERNANDEZ", "DIAZ", "TORRES", "RAMIREZ", "SUAREZ", "JIMENEZ", "HERRERA", "MORENO", "CASTRO", "VARGAS", "ORTIZ", "RUIZ", "MENDOZA", "SILVA"];

const EPS_LIST = ["SURA", "SANITAS", "COMPENSAR", "NUEVA EPS", "COOMEVA", "SALUD TOTAL", "FAMISANAR", "MEDIMAS", "ALIANSALUD", "SOS"];

const DIAGNOSTICOS_EL = [
  { nombre: "SINDROME DEL TUNEL CARPIANO", cie10: "G560" },
  { nombre: "LUMBAGO NO ESPECIFICADO", cie10: "M545" },
  { nombre: "EPICONDILITIS LATERAL", cie10: "M771" },
  { nombre: "TRASTORNO DE DISCO LUMBAR", cie10: "M511" },
  { nombre: "SINDROME DE MANGUITO ROTADOR", cie10: "M751" },
  { nombre: "TENOSINOVITIS DE ESTILOIDES RADIAL", cie10: "M654" },
  { nombre: "HIPOACUSIA NEUROSENSORIAL", cie10: "H903" },
  { nombre: "DISFONIA", cie10: "R490" },
  { nombre: "DERMATITIS DE CONTACTO", cie10: "L239" },
  { nombre: "ANSIEDAD GENERALIZADA (Origen Laboral)", cie10: "F411" },
  { nombre: "BURSITIS DEL HOMBRO", cie10: "M755" },
  { nombre: "EPICONDILITIS MEDIAL", cie10: "M770" },
  { nombre: "CERVICALGIA", cie10: "M542" },
  { nombre: "DORSALGIA NO ESPECIFICADA", cie10: "M549" },
  { nombre: "MONONEUROPATIA MIEMBRO SUPERIOR", cie10: "G561" },
];
const ESTADOS_EL = ["Calificado", "En proceso", "En estudio", "Pendiente dictamen"];

// --- GENERADOR DE DATOS AT (20 por año × 4 empresas × 7 años = 560) ---
const generateATData = () => {
  const data = [];
  let idCounter = 1;
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  years.forEach(year => {
    // 20 accidentes por año repartidos entre las 4 empresas (5 por empresa aprox)
    LINEAS_NEGOCIO.forEach(empresa => {
      const count = 5; // 5 por empresa × 4 empresas = 20 por año
      for (let i = 0; i < count; i++) {
        const mesIndex = getRandomInt(0, 11);
        const mes = LISTA_MESES[mesIndex];
        const day = getRandomInt(1, 28);
        const fecha = `${year}-${(mesIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        const depto = getRandom(Object.keys(DEPARTAMENTOS_COLOMBIA));
        const ciudad = getRandom(DEPARTAMENTOS_COLOMBIA[depto]);
        const regional = getRandom(OPCIONES_REGIONAL);
        const nivel = getRandom(OPCIONES_NIVEL_AT);
        const diasInc = nivel === "Fatal" ? 0 : getRandomInt(1, 45);
        const esHpi = getRandom(["SI", "NO", "NO", "NO", "NO"]);
        const genero = getRandom(GENEROS);
        const nombre = genero === "Masculino"
          ? `${getRandom(NOMBRES_M)} ${getRandom(APELLIDOS)} ${getRandom(APELLIDOS)}`
          : `${getRandom(NOMBRES_F)} ${getRandom(APELLIDOS)} ${getRandom(APELLIDOS)}`;

        data.push({
          id: `AT-${year}-${String(idCounter++).padStart(4, '0')}`,
          lineaNegocio: empresa,
          ciudad,
          departamento: depto,
          regional,
          sectorGes: getRandom(["Sector 1", "Sector 2", "Sector 3"]),
          puestoArmado: getRandom(["SI", "NO"]),
          cliente: getRandom(CLIENTES),
          unidadNegocio: empresa,
          cc: `CC-${getRandomInt(1000, 9999)}`,
          apellidosNombres: nombre,
          cargo: getRandom(CARGOS),
          escolaridad: getRandom(["Bachiller", "Técnico", "Tecnólogo", "Profesional"]),
          rangoEdad: getRandom(["18-25", "26-35", "36-45", "46-55", "56+"]),
          genero,
          fechaAccidente: fecha,
          horaAT: `${getRandomInt(6, 22).toString().padStart(2, '0')}:${getRandomInt(0, 59).toString().padStart(2, '0')}`,
          diaSemana: getRandom(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]),
          mes,
          anio: year,
          descripcion: `Evento de accidentalidad ocurrido en ${ciudad}, ${depto}. Empresa ${empresa}.`,
          diasIncapacidad: diasInc,
          prorroga1: getRandomInt(0, 5),
          prorroga2: 0,
          totalDias: diasInc + getRandomInt(0, 5),
          esHpi,
          detalleHpi: [],
          esTransito: "NO",
          vehiculoInvolucrado: "",
          causanteAT: "",
          actorVial: "",
          tareaVia: "",
          lugarEventoVial: "",
          tipoAccidente: getRandom(OPCIONES_TIPO_ACCIDENTE),
          clasificacionNivel: nivel,
          sitioAccidente: getRandom(OPCIONES_SITIO),
          tipoLesion: getRandom(["Contusión", "Herida", "Fractura", "Esguince", "Luxación", "Amputación"]),
          parteCuerpo: getRandom(OPCIONES_PARTE_CUERPO),
          agenteAccidente: getRandom(["Maquinas y/o Equipos", "Medios de transporte", "Herramientas", "Animales", "ambientes de trabajo"]),
          mecanismoForma: getRandom(OPCIONES_MECANISMO),
          clasificacionPeligro: getRandom(OPCIONES_PELIGRO),
          estadoInvestigacion: getRandom(ESTADOS_INV),
          fechaPrevistaInv: "",
          fechaInvestigacion: "",
          factoresPersonales: "",
          factoresTrabajo: "",
          fechaCierre: "",
          estandaresSeguros: "",
          causasRiesgosas: "",
          condicionesAmbientales: "",
          planFuente: "",
          planMedio: "",
          planIndividuo: "",
          estado: getRandom(ESTADOS_AT),
        });
      }
    });
  });
  return data;
};

// --- GENERADOR DE DATOS EL (20 por año × 7 años = 140) ---
const generateELData = () => {
  const data = [];
  let idCounter = 1;
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  years.forEach(year => {
    // 20 enfermedades por año repartidas entre las 4 empresas (5 por empresa)
    LINEAS_NEGOCIO.forEach(empresa => {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const mesIndex = getRandomInt(0, 11);
        const mes = LISTA_MESES[mesIndex];
        const day = getRandomInt(1, 28);
        const fecha = `${year}-${(mesIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        const genero = getRandom(GENEROS);
        const nombre = genero === "Masculino"
          ? `${getRandom(NOMBRES_M)} ${getRandom(APELLIDOS)} ${getRandom(APELLIDOS)}`
          : `${getRandom(NOMBRES_F)} ${getRandom(APELLIDOS)} ${getRandom(APELLIDOS)}`;

        const diag = getRandom(DIAGNOSTICOS_EL);
        const depto = getRandom(Object.keys(DEPARTAMENTOS_COLOMBIA));
        const eps = getRandom(EPS_LIST);

        data.push({
          id: `EL-${year}-${String(idCounter++).padStart(4, '0')}`,
          nombreCompleto: nombre,
          primerNombre: nombre.split(" ")[0],
          primerApellido: nombre.split(" ")[1] || "",
          segundoApellido: nombre.split(" ")[2] || "",
          numIdTrabajador: `${getRandomInt(10000000, 99999999)}`,
          eps,
          arl: "SURA",
          regional: getRandom(OPCIONES_REGIONAL),
          departamento: depto,
          ciudad: getRandom(DEPARTAMENTOS_COLOMBIA[depto]),
          lineaNegocio: empresa,
          fechaDiag1: fecha,
          diagnostico1: diag.nombre,
          cie10_1: diag.cie10,
          diagnosticoCie10: diag.cie10,
          diasIncapacidad: getRandomInt(0, 60),
          estado: getRandom(ESTADOS_EL),
          anio: String(year),
          mes,
          genero,
          cargo: getRandom(CARGOS),
        });
      }
    });
  });
  return data;
};

// --- DATOS DE TRABAJADORES POR EMPRESA (LÍNEA DE NEGOCIO) ---
const INITIAL_WORKERS = {
  SECURE: { trabajadores: 12500, horas: 2400000 },
  RISK: { trabajadores: 3200, horas: 614400 },
  TECHNOLOGY: { trabajadores: 1800, horas: 345600 },
  INFOTEC: { trabajadores: 4500, horas: 864000 }
};

// --- GESTIÓN CON LOCALSTORAGE ---
const STORAGE_KEY_AT = "g4s_accidents_db_v4";
const STORAGE_KEY_EL = "g4s_enfermedades_db_v4";
const STORAGE_KEY_WORKERS = "g4s_workers_db_v2";

const loadDataAT = () => {
  const stored = localStorage.getItem(STORAGE_KEY_AT);
  if (stored) return JSON.parse(stored);
  const initialData = generateATData();
  localStorage.setItem(STORAGE_KEY_AT, JSON.stringify(initialData));
  return initialData;
};

const loadDataEL = () => {
  const stored = localStorage.getItem(STORAGE_KEY_EL);
  if (stored) return JSON.parse(stored);
  const initialData = generateELData();
  localStorage.setItem(STORAGE_KEY_EL, JSON.stringify(initialData));
  return initialData;
};

const loadWorkers = () => {
  const stored = localStorage.getItem(STORAGE_KEY_WORKERS);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(INITIAL_WORKERS));
  return INITIAL_WORKERS;
};

export let dataAT = loadDataAT();
export let dataEL = loadDataEL();
export let dataWorkers = loadWorkers();

// --- CRUD AT ---
export const addNewRecord = (record) => {
  dataAT.unshift(record);
  localStorage.setItem(STORAGE_KEY_AT, JSON.stringify(dataAT));
};

export const updateRecord = (updatedRecord) => {
  dataAT = dataAT.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
  localStorage.setItem(STORAGE_KEY_AT, JSON.stringify(dataAT));
};

export const deleteRecord = (id) => {
  dataAT = dataAT.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY_AT, JSON.stringify(dataAT));
};

// --- CRUD EL ---
export const addNewRecordEL = (record) => {
  dataEL.unshift(record);
  localStorage.setItem(STORAGE_KEY_EL, JSON.stringify(dataEL));
};

export const updateRecordEL = (updatedRecord) => {
  dataEL = dataEL.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
  localStorage.setItem(STORAGE_KEY_EL, JSON.stringify(dataEL));
};

export const deleteRecordEL = (id) => {
  dataEL = dataEL.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY_EL, JSON.stringify(dataEL));
};

// --- CRUD Workers ---
export const saveWorkers = (workers) => {
  Object.assign(dataWorkers, workers);
  localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(dataWorkers));
};

export default dataAT;