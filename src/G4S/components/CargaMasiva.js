import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { addNewRecord, addNewRecordEL, dataAT, dataEL, resetDatabase } from "../data";

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

const LISTA_MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

const DEPARTAMENTOS_MUNICIPIOS = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": ["Medellín", "Abejorral", "Abriaquí", "Alejandría", "Amagá", "Amalfi", "Andes", "Angelópolis", "Angostura", "Anorí", "Anzá", "Apartadó", "Arboletes", "Argelia", "Armenia", "Barbosa", "Bello", "Belmira", "Betania", "Betulia", "Briceño", "Buriticá", "Cáceres", "Caicedo", "Caldas", "Campamento", "Cañasgordas", "Caracolí", "Caramanta", "Carepa", "Carmen de Viboral", "Carolina", "Caucasia", "Chigorodó", "Cisneros", "Ciudad Bolívar", "Cocorná", "Concepción", "Concordia", "Copacabana", "Dabeiba", "Donmatías", "Ebéjico", "El Bagre", "Entrerríos", "Envigado", "Fredonia", "Frontino", "Giraldo", "Girardota", "Gómez Plata", "Granada", "Guadalupe", "Guarne", "Guatapé", "Heliconia", "Hispania", "Itagüí", "Ituango", "Jardín", "Jericó", "La Ceja", "La Estrella", "La Pintada", "La Unión", "Liborina", "Maceo", "Marinilla", "Montebello", "Murindó", "Mutatá", "Nariño", "Nechí", "Necoclí", "Olaya", "Peñol", "Peque", "Pueblorrico", "Puerto Berrío", "Puerto Nare", "Puerto Triunfo", "Remedios", "Retiro", "Rionegro", "Sabanalarga", "Sabaneta", "Salgar", "San Andrés de Cuerquía", "San Carlos", "San Francisco", "San Jerónimo", "San José de la Montaña", "San Juan de Urabá", "San Luis", "San Pedro de los Milagros", "San Pedro de Urabá", "San Rafael", "San Roque", "San Vicente", "Santa Bárbara", "Santa Fe de Antioquia", "Santa Rosa de Osos", "Santo Domingo", "Santuario", "Segovia", "Sonsón", "Sopetrán", "Támesis", "Tarazá", "Tarso", "Titiribí", "Toledo", "Turbo", "Uramita", "Urrao", "Valdivia", "Valparaíso", "Vegachí", "Venecia", "Vigía del Fuerte", "Yalí", "Yarumal", "Yolombó", "Yondó", "Zaragoza"],
  "Arauca": ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón", "Saravena", "Tame"],
  "Atlántico": ["Barranquilla", "Baranoa", "Campo de la Cruz", "Candelaria", "Galapa", "Juan de Acosta", "Luruaco", "Malambo", "Manatí", "Palmar de Varela", "Piojó", "Polonuevo", "Ponedera", "Puerto Colombia", "Repelón", "Sabanagrande", "Sabanalarga", "Santa Lucía", "Santo Tomás", "Soledad", "Suán", "Tubará", "Usiacurí"],
  "Bogotá D.C.": ["Bogotá"],
  "Bolívar": ["Cartagena de Indias", "Achí", "Altos del Rosario", "Arenal", "Arjona", "Arroyohondo", "Barranco de Loba", "Calamar", "Cantagallo", "Cicuco", "Córdoba", "Clemencia", "El Carmen de Bolívar", "El Guamo", "El Peñón", "Hatillo de Loba", "Magangué", "Mahates", "Margarita", "María La Baja", "Montecristo", "Mompós", "Morales", "Norosí", "Pinillos", "Regidor", "Río Viejo", "San Cristóbal", "San Estanislao", "San Fernando", "San Jacinto", "San Jacinto del Cauca", "San Juan Nepomuceno", "San Martín de Loba", "San Pablo", "Santa Catalina", "Santa Rosa", "Santa Rosa del Sur", "Simití", "Soplaviento", "Talaigua Nuevo", "Tiquisio", "Turbaco", "Turbaná", "Villanueva", "Zambrano"],
  "Boyacá": ["Tunja", "Almeida", "Aquitania", "Arcabuco", "Belén", "Berbeo", "Betéitiva", "Boavita", "Boyacá", "Briceño", "Buenavista", "Busbanzá", "Caldas", "Campohermoso", "Cerinza", "Chinavita", "Chiquinquirá", "Chíquiza", "Chiscas", "Chita", "Chitaraque", "Chivatá", "Ciénega", "Cómbita", "Coper", "Corrales", "Covarachía", "Cubará", "Cucaita", "Cuítiva", "Duitama", "El Cocuy", "El Espino", "Firavitoba", "Floresta", "Gachantivá", "Garagoa", "Guacamayas", "Guateque", "Guayatá", "Güicán", "Iza", "Jenesano", "Jericó", "Labranzagrande", "La Capilla", "La Victoria", "La Uvita", "Macanal", "Macaravita", "Miraflores", "Mongua", "Monguí", "Moniquirá", "Motavita", "Muzo", "Nobsa", "Nuevo Colón", "Oicatá", "Otanche", "Pachavita", "Páez", "Paipa", "Pajarito", "Panqueba", "Pauna", "Paya", "Paz de Río", "Pesca", "Pisba", "Puerto Boyacá", "Quípama", "Ramiriquí", "Ráquira", "Rondón", "Saboyá", "Sáchica", "Samacá", "San Eduardo", "San José de Pare", "San Luis de Gaceno", "San Mateo", "San Miguel de Sema", "San Pablo de Borbur", "Santa María", "Santa Rosa de Viterbo", "Santa Sofía", "Sativanorte", "Sativasur", "Siachoque", "Soatá", "Socotá", "Socha", "Sogamoso", "Somondoco", "Sora", "Sotaquirá", "Soracá", "Susacón", "Sutamarchán", "Sutatenza", "Tasco", "Tenza", "Tibaná", "Tibasosa", "Tinjacá", "Tipacoque", "Toca", "Togüí", "Tópaga", "Tota", "Tununguá", "Turmequé", "Tuta", "Tutazá", "Umbita", "Ventaquemada", "Viracachá", "Zetaquira"],
  "Caldas": ["Manizales", "Aguadas", "Anserma", "Aranzazu", "Belalcázar", "Chinchiná", "Filadelfia", "La Dorada", "La Merced", "Manzanares", "Marmato", "Marquetalia", "Marulanda", "Neira", "Norcasia", "Pácora", "Palestina", "Pensilvania", "Riosucio", "Risaralda", "Salamina", "Samaná", "San José", "Supía", "Victoria", "Villamaría", "Viterbo"],
  "Caquetá": ["Florencia", "Albania", "Belén de los Andaquíes", "Cartagena del Chairá", "Curillo", "El Doncello", "El Paujil", "La Montañita", "Milán", "Morelia", "Puerto Rico", "San José del Fragua", "San Vicente del Caguán", "Solano", "Solita", "Valparaíso"],
  "Casanare": ["Yopal", "Aguazul", "Chámeza", "Hato Corozal", "La Salina", "Maní", "Monterrey", "Nunchía", "Orocué", "Paz de Ariporo", "Pore", "Recetor", "Sabanalarga", "Sácama", "San Luis de Palenque", "Támara", "Tauramena", "Trinidad", "Villanueva"],
  "Cauca": ["Popayán", "Almaguer", "Argelia", "Balboa", "Bolívar", "Buenos Aires", "Cajibío", "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guachené", "Guapí", "Inzá", "Jambaló", "La Sierra", "La Vega", "López", "Mercaderes", "Miranda", "Morales", "Padilla", "Páez", "Patía", "Piamonte", "Piendamó", "Puerto Tejada", "Puracé", "Rosas", "San Sebastián", "Santander de Quilichao", "Santa Rosa", "Silvia", "Sotara", "Suárez", "Sucre", "Timbío", "Timbiquí", "Toribio", "Totoró", "Villa Rica"],
  "Cesar": ["Valledupar", "Aguachica", "Agustín Codazzi", "Astrea", "Becerril", "Bosconia", "Chimichagua", "Chiriguaná", "Curumaní", "El Copey", "El Paso", "Gamarra", "González", "La Gloria", "La Jagua de Ibirico", "La Paz", "Manaure", "Pailitas", "Pelaya", "Pueblo Bello", "Río de Oro", "San Alberto", "San Diego", "San Martín", "Tamalameque"],
  "Chocó": ["Quibdó", "Acandí", "Alto Baudo", "Atrato", "Bagadó", "Bahía Solano", "Bajo Baudó", "Bojaya", "El Cantón del San Pablo", "Carmen del Darién", "Cértegui", "Condoto", "El Carmen de Atrato", "El Litoral del San Juan", "Istmina", "Juradó", "Lloró", "Medio Atrato", "Medio Baudó", "Medio San Juan", "Nóvita", "Nuquí", "Río Iro", "Río Quito", "Riosucio", "San José del Palmar", "Sipí", "Tadó", "Unguía", "Unión Panamericana"],
  "Córdoba": ["Montería", "Ayapel", "Buenavista", "Canalete", "Cereté", "Chimá", "Chinú", "Ciénaga de Oro", "Cotorra", "La Apartada", "Lorica", "Los Córdobas", "Momil", "Moñitos", "Montelíbano", "Planeta Rica", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purísima", "Sahagún", "San Andrés Sotavento", "San Antero", "San Bernardo del Viento", "San Carlos", "San José de Uré", "San Pelayo", "Tierralta", "Tuchín", "Valencia"],
  "Cundinamarca": ["Agua de Dios", "Albán", "Anapoima", "Anolaima", "Arbeláez", "Beltrán", "Bituima", "Bojacá", "Cabrera", "Cachipay", "Cajicá", "Caparrapí", "Cáqueza", "Carmen de Carupa", "Chaguaní", "Chía", "Chipaque", "Choachí", "Chocontá", "Cogua", "Cota", "Cucunubá", "El Colegio", "El Peñón", "El Rosal", "Facatativá", "Fómeque", "Fosca", "Funza", "Fúquene", "Fusagasugá", "Gachalá", "Gachancipá", "Gachetá", "Gama", "Girardot", "Granada", "Guachetá", "Guaduas", "Guasca", "Guataquí", "Guatavita", "Guayabal de Síquima", "Guayabetal", "Gutiérrez", "Jerusalén", "Junín", "La Calera", "La Mesa", "La Palma", "La Peña", "La Vega", "Lenguazaque", "Machetá", "Madrid", "Manta", "Medina", "Mosquera", "Nariño", "Nemocón", "Nilo", "Nimaima", "Nocaima", "Venecia", "Pacho", "Paime", "Pandi", "Paratebueno", "Pasca", "Puerto Salgar", "Pulí", "Quebradanegra", "Quetame", "Quipile", "Apulo", "Ricaurte", "San Antonio del Tequendama", "San Bernardo", "San Cayetano", "San Francisco", "San Juan de Rioseco", "Sasaima", "Sesquilé", "Sibaté", "Silvania", "Simijaca", "Soacha", "Sopó", "Subachoque", "Suesca", "Supatá", "Susa", "Sutatausa", "Tabio", "Tausa", "Tena", "Tenjo", "Tibacuy", "Tibirita", "Tocaima", "Tocancipá", "Topaipí", "Ubalá", "Ubaque", "Villa de San Diego de Ubate", "Une", "Útica", "Vergara", "Vianí", "Villagómez", "Villapinzón", "Villeta", "Viotá", "Yacopí", "Zipacón", "Zipaquirá"],
  "Guainía": ["Inírida"],
  "Guaviare": ["San José del Guaviare", "Calamar", "El Retorno", "Miraflores"],
  "Huila": ["Neiva", "Acevedo", "Agrado", "Aipe", "Algeciras", "Altamira", "Baraya", "Campoalegre", "Colombia", "Elías", "Garzón", "Gigante", "Guadalupe", "Hobo", "Íquira", "Isnos", "La Argentina", "La Plata", "Nátaga", "Oporapa", "Paicol", "Palermo", "Palestina", "Pital", "Pitalito", "Rivera", "Saladoblanco", "San Agustín", "Santa María", "Suaza", "Tarqui", "Tesalia", "Tello", "Teruel", "Timaná", "Villavieja", "Yaguará"],
  "La Guajira": ["Riohacha", "Albania", "Barrancas", "Dibulla", "Distracción", "El Molino", "Fonseca", "Hatonuevo", "La Jagua del Pilar", "Maicao", "Manaure", "San Juan del Cesar", "Uribia", "Urumita", "Villanueva"],
  "Magdalena": ["Santa Marta", "Algarrobo", "Aracataca", "Ariguaní", "Cerro San Antonio", "Chivolo", "Ciénaga", "Concordia", "El Banco", "El Piñón", "El Retén", "Fundación", "Guamal", "Nueva Granada", "Pedraza", "Pijiño del Carmen", "Pivijay", "Plato", "Puebloviejo", "Remolino", "Sabanas de San Angel", "Salamina", "San Sebastián de Buenavista", "San Zenón", "Santa Ana", "Santa Bárbara de Pinto", "Sitionuevo", "Tenerife", "Zapayán", "Zona Bananera"],
  "Meta": ["Villavicencio", "Acacías", "Barranca de Upía", "Cabuyaro", "Castilla la Nueva", "Cubarral", "Cumaral", "El Calvario", "El Castillo", "El Dorado", "Fuente de Oro", "Granada", "Guamal", "Mapiripán", "Mesetas", "La Macarena", "Uribe", "Lejanías", "Puerto Concordia", "Puerto Gaitán", "Puerto López", "Puerto Lleras", "Puerto Rico", "Restrepo", "San Carlos de Guaroa", "San Juan de Arama", "San Juanito", "San Martín", "Vistahermosa"],
  "Nariño": ["Pasto", "Albán", "Aldana", "Ancuya", "Arboleda", "Barbacoas", "Belén", "Buesaco", "Colón", "Consaca", "Contadero", "Córdoba", "Cuaspud", "Cumbal", "Cumbitara", "Chachagüí", "El Charco", "El Peñol", "El Rosario", "El Tablón de Gómez", "El Tambo", "Funes", "Guachucal", "Guaitarilla", "Gualmatán", "Iles", "Imués", "Ipiales", "La Cruz", "La Florida", "La Llanada", "La Tola", "La Unión", "Leiva", "Linares", "Los Andes", "Magüí", "Mallama", "Mosquera", "Nariño", "Olaya Herrera", "Ospina", "Francisco Pizarro", "Policarpa", "Potosí", "Providencia", "Puerres", "Pupiales", "Ricaurte", "Roberto Payán", "Samaniego", "Sandoná", "San Bernardo", "San Lorenzo", "San Pablo", "San Pedro de Cartago", "Santa Bárbara", "Santacruz", "Sapuyes", "Taminango", "Tangua", "San Andres de Tumaco", "Túquerres", "Yacuanquer"],
  "Norte de Santander": ["Cúcuta", "Abrego", "Arboledas", "Bochalema", "Bucarasica", "Cácota", "Cachirá", "Chinácota", "Chitagá", "Convención", "Cucutilla", "Durania", "El Carmen", "El Tarra", "El Zulia", "Gramalote", "Hacarí", "Herrán", "Labateca", "La Esperanza", "La Playa", "Los Patios", "Lourdes", "Mutiscua", "Ocaña", "Pamplona", "Pamplonita", "Puerto Santander", "Ragonvalia", "Salazar", "San Calixto", "San Cayetano", "Santiago", "Sardinata", "Silos", "Teorama", "Tibú", "Toledo", "Villa Caro", "Villa del Rosario"],
  "Putumayo": ["Mocoa", "Colón", "Orito", "Puerto Asís", "Puerto Caicedo", "Puerto Guzmán", "Leguízamo", "Sibundoy", "San Francisco", "San Miguel", "Santiago", "Valle del Guamuez", "Villagarzón"],
  "Quindío": ["Armenia", "Buenavista", "Calarcá", "Circasia", "Córdoba", "Filandia", "Génova", "La Tebaida", "Montenegro", "Pijao", "Quimbaya", "Salento"],
  "Risaralda": ["Pereira", "Apía", "Balboa", "Belén de Umbría", "Dosquebradas", "Guática", "La Celia", "La Virginia", "Marsella", "Mistrató", "Pueblo Rico", "Quinchía", "Santa Rosa de Cabal", "Santuario"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  "Santander": ["Bucaramanga", "Aguada", "Albania", "Aratoca", "Barbosa", "Barichara", "Barrancabermeja", "Betulia", "Bolívar", "Cabrera", "California", "Capitanejo", "Carcasí", "Cepitá", "Cerrito", "Charalá", "Charta", "Chima", "Chipatá", "Cimitarra", "Concepción", "Confines", "Contratación", "Coromoro", "Curití", "El Carmen de Chucurí", "El Guacamayo", "El Peñón", "El Playón", "Encino", "Enciso", "Florián", "Floridablanca", "Galán", "Gámbita", "Girón", "Guaca", "Guadalupe", "Guapotá", "Guavatá", "Güepsa", "Hato", "Jesús María", "Jordán", "La Belleza", "Landázuri", "La Paz", "Lebríja", "Los Santos", "Macaravita", "Málaga", "Matanza", "Mogotes", "Molagavita", "Ocamonte", "Oiba", "Onzaga", "Palmar", "Palmas del Socorro", "Páramo", "Piedecuesta", "Pinchote", "Puente Nacional", "Puerto Parra", "Puerto Wilches", "Rionegro", "Sabana de Torres", "San Andrés", "San Benito", "San Gil", "San Joaquín", "San José de Miranda", "San Miguel", "San Vicente de Chucurí", "Santa Bárbara", "Santa Helena del Opón", "Simacota", "Socorro", "Suaita", "Sucre", "Suratá", "Tona", "Valle de San José", "Vélez", "Vetas", "Villanueva", "Zapatoca"],
  "Sucre": ["Sincelejo", "Buenavista", "Caimito", "Coloso", "Corozal", "Coveñas", "Chalán", "El Roble", "Galeras", "Guaranda", "La Unión", "Los Palmitos", "Majagual", "Morroa", "Ovejas", "Palmito", "Sampués", "San Benito Abad", "San Juan de Betulia", "San Marcos", "San Onofre", "San Pedro", "Sincé", "Sucre", "Santiago de Tolú", "Tolú Viejo"],
  "Tolima": ["Ibagué", "Alpujarra", "Alvarado", "Ambalema", "Anzoátegui", "Armero", "Ataco", "Cajamarca", "Carmen de Apicalá", "Casabianca", "Chaparral", "Coello", "Coyaima", "Cunday", "Dolores", "Espinal", "Falan", "Flandes", "Fresno", "Guamo", "Herveo", "Honda", "Icononzo", "Lérida", "Líbano", "Mariquita", "Melgar", "Murillo", "Natagaima", "Ortega", "Palocabildo", "Piedras", "Planadas", "Prado", "Purificación", "Rioblanco", "Roncesvalles", "Rovira", "Saldaña", "San Antonio", "San Luis", "Santa Isabel", "Suárez", "Valle de San Juan", "Venadillo", "Villahermosa", "Villarrica"],
  "Valle del Cauca": ["Cali", "Alcalá", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Buenaventura", "Guadalajara de Buga", "Bugalagrande", "Caicedonia", "Calima", "Candelaria", "Cartago", "Dagua", "El Águila", "El Cairo", "El Cerrito", "El Dovio", "Florida", "Ginebra", "Guacarí", "Jamundí", "La Cumbre", "La Unión", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo", "Riofrío", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo", "Tuluá", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"],
  "Vaupés": ["Mitú", "Caruru", "Pacoa", "Taraira", "Papunaua", "Yavaraté"],
  "Vichada": ["Puerto Carreño", "La Primavera", "Santa Rosalía", "Cumaribo"]
};

const CargaMasiva = ({ type }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  useEffect(() => {
    setFileName("");
    setErrorMsg("");
    setSuccessMsg("");
    setWarningMsg("");
  }, [type]);

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
    setWarningMsg("");

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

            const keywords =
              type === "FURAT"
                ? ["LINEA DE NEGOCIO", "APELLIDOS Y NOMBRES", "DESCRIPCION DEL AT"]
                : ["EPS", "ARL", "DIAGNOSTICO", "CREACION DEL SINIESTRO", "DIAGNOSTICOSFECHA", "DICTAMEN", "APELLIDOS Y NOMBRES"];

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
        let dupsAT = 0;
        let dupsEL = 0;

        foundData.forEach((row, idx) => {
          const getField = (systemKey) => {
            const possibleExcelHeaders = Object.keys(MAPEO_FURAT).filter(
              (key) => MAPEO_FURAT[key] === systemKey
            );
            for (let header of Object.keys(row)) {
              if (possibleExcelHeaders.some((ph) => normalize(ph) === normalize(header))) {
                return row[header];
              }
            }
            return "";
          };

          const parseDateMs = (d) => {
            if (!d) return 0;
            const str = String(d).trim();
            if (!isNaN(str) && Number(str) > 10000) {
              return new Date(Math.round((Number(str) - 25569) * 86400 * 1000) + new Date().getTimezoneOffset() * 60000).getTime();
            }
            if (str.includes('/')) {
              const parts = str.split('/');
              if (parts.length >= 3) return new Date(`${parts[2].substr(0, 4)}-${parts[1]}-${parts[0]}T00:00:00`).getTime();
            }
            return new Date(str).getTime();
          };

          const cleanLocation = (rawDept, rawCity) => {
            const tryFindDept = (val) => {
              if (!val) return null;
              const norm = normalize(val).toLowerCase().replace(/[^a-z0-9]/g, '');
              if (norm.includes('bogota') || norm.includes('dc')) return 'Bogotá D.C.';
              return Object.keys(DEPARTAMENTOS_MUNICIPIOS).find(
                d => normalize(d).toLowerCase().replace(/[^a-z0-9]/g, '') === norm || norm.includes(normalize(d).toLowerCase().replace(/[^a-z0-9]/g, ''))
              ) || Object.keys(DEPARTAMENTOS_MUNICIPIOS).find(d => normalize(d).toLowerCase() === normalize(val).toLowerCase());
            };

            const tryFindCity = (dept, val) => {
              if (!val || !dept) return null;
              const norm = normalize(val).toLowerCase().replace(/[^a-z0-9]/g, '');
              if (norm.includes('bogota') || norm.includes('dc')) return 'Bogotá';
              const cities = DEPARTAMENTOS_MUNICIPIOS[dept] || [];
              return cities.find(
                c => normalize(c).toLowerCase().replace(/[^a-z0-9]/g, '') === norm || norm.includes(normalize(c).toLowerCase().replace(/[^a-z0-9]/g, ''))
              ) || cities.find(c => normalize(c).toLowerCase() === normalize(val).toLowerCase());
            };

            // Intentar orden correcto
            let d1 = tryFindDept(rawDept);
            let c1 = tryFindCity(d1, rawCity);

            // Si no detecta ambos, probar invirtiendo (por error humano en columnas)
            let d2 = tryFindDept(rawCity);
            let c2 = tryFindCity(d2, rawDept);

            if (d1 && c1) {
              return { dept: d1, city: c1 };
            } else if (d2 && c2) {
              return { dept: d2, city: c2 }; // Inversión confirmada
            } else if (d1) {
              return { dept: d1, city: rawCity || "" };
            } else if (d2) {
              return { dept: d2, city: rawDept || "" };
            }

            return { dept: rawDept || "", city: rawCity || "" };
          };

          if (type === "FURAT") {
            const tempId = getField("id");
            const tempCC = getField("cc");
            const tempNombres = getField("apellidosNombres");
            const tempFecha = getField("fechaAccidente");

            const rawDept = getField("departamento");
            const rawCity = getField("ciudad");

            const loc = cleanLocation(rawDept, rawCity);
            const matchedDept = loc.dept;
            const matchedCity = loc.city;

            const isDuplicate = dataAT.some(existing => {
              const sameId = tempId && normalize(existing.id) === normalize(tempId);
              const sameCCFecha = tempCC && tempFecha && normalize(existing.cc) === normalize(tempCC) && normalize(existing.fechaAccidente) === normalize(tempFecha);
              const sameNameFecha = tempNombres && tempFecha && normalize(existing.apellidosNombres) === normalize(tempNombres) && normalize(existing.fechaAccidente) === normalize(tempFecha);
              // Only consider duplicate if we actually have data to compare
              if (!tempId && !tempCC && !tempNombres) return false;
              return sameId || sameCCFecha || sameNameFecha;
            });

            if (isDuplicate) {
              dupsAT++;
              return; // Skip adding
            }

            const record = {
              id: tempId || Date.now() + idx,
              lineaNegocio: getField("lineaNegocio"),
              ciudad: getField("ciudad"), // Default/raw
              departamento: getField("departamento"), // Default/raw
              deptCentro: matchedDept,
              muniCentro: matchedCity,
              deptTrabajador: matchedDept,
              muniTrabajador: matchedCity,
              regional: getField("regional"),
              cliente: getField("cliente"),
              empresa: getField("cliente") || getField("empresa"), // For Form
              cc: tempCC,
              cedula: tempCC, // For Form
              apellidosNombres: tempNombres,
              cargo: getField("cargo"),
              fechaAccidente: tempFecha,
              fechaAT: parseDateMs(tempFecha) ? new Date(parseDateMs(tempFecha)).toISOString().split('T')[0] : "", // For Form
              descripcion: getField("descripcion"),
              descripcionEvento: getField("descripcion"), // For Form
              diasIncapacidad: getField("diasIncapacidad") || 0,
              prorroga1: getField("prorroga1") || 0,
              prorroga2: getField("prorroga2") || 0,
              esHpi: (getField("esHpi") || "NO").toString().toUpperCase().includes("SI") ? "SI" : "NO",
              tipoAccidente: getField("tipoAccidente"),
              tipoAT: getField("tipoAccidente"), // For Form
              clasificacionNivel: getField("clasificacionNivel"),
              categoriaEvento: getField("clasificacionNivel"), // For Form
              sitioAccidente: getField("sitioAccidente"),
              parteCuerpo: getField("parteCuerpo"),
              agenteAccidente: getField("agenteAccidente"),
              mecanismoForma: getField("mecanismoForma"),
              clasificacionPeligro: getField("clasificacionPeligro"),
              genero: getField("genero"),
              estado: "Pendiente",
              anio: tempFecha ? String(new Date(parseDateMs(tempFecha)).getFullYear() || 2025) : "2025",
              mes: tempFecha ? LISTA_MESES[new Date(parseDateMs(tempFecha)).getMonth()] || "" : "",
            };

            if (record.apellidosNombres || record.cc || record.descripcion) {
              addNewRecord(record);
              count++;
            }
          } else {
            // FUREL
            const buscarCampo = (claves) => {
              for (let k of claves) {
                for (let fk of Object.keys(row)) {
                  if (normalize(fk) === normalize(k)) return row[fk];
                }
              }
              return "";
            };

            const diagCie10 = buscarCampo(["Diagnóstico", "CIE 10", "Diagnóstico (CIE 10)", "CIE-10", "DIAGNOSTICOS/FECHA DEL DICTAMEN JNC", "DIAGNOSTICOS FECHA DEL DICTAMEN JNC"]);
            const cc = buscarCampo(["Identificación Trabajador", "Cédula", "Identificación", "CC"]);
            const rawNombres = buscarCampo(["Nombres", "NOMBRES", "Primer nombre", "Trabajador", "Nombres y Apellidos", "APELLIDOS Y NOMBRES"]);
            const rawApellidos = buscarCampo(["Apellidos", "APELLIDOS", "Primer apellido", "Apellidos y Nombres"]);
            const fechaDato = buscarCampo(["Fecha", "Fecha de Calificación", "Fecha Ingreso", "FECHA DE CREACION DEL SINIESTRO"]);
            const cargo = buscarCampo(["CARGO"]);
            const genero = buscarCampo(["GENERO"]);
            const lineaNegocio = buscarCampo(["LINEA DE NEGOCIO"]);
            const ciudad = buscarCampo(["CIUDAD", "MUNICIPIO", "CIUDAD TRABAJADOR", "MUNICIPIO TRABAJADOR"]);
            const departamento = buscarCampo(["DEPARTAMENTO", "DEPTO", "DEPARTAMENTO TRABAJADOR", "COD DEPTO", "CÓD. DEPTO"]);
            const regional = buscarCampo(["REGIONAL"]);
            const estadoCaso = buscarCampo(["ESTADO"]);
            const observaciones = buscarCampo(["OBSERVACIONES"]);
            const diasPerdidos = buscarCampo(["DIAS PERDIDOS"]);

            const finalCie10 = diagCie10 || "Sin Dato";

            // Si hay división explícita, los unimos para `finalName` del master record, pero guardamos las partes para evitar la heurística.
            const hasExplicitSplit = rawNombres && rawApellidos && !rawNombres.includes(rawApellidos) && !rawApellidos.includes(rawNombres);
            const finalName = hasExplicitSplit ? `${rawApellidos} ${rawNombres}` : (rawNombres || "Sin Nombre");

            const getCleanLinea = (val) => {
              if (!val) return "";
              const lower = String(val).toLowerCase();
              if (lower.includes("technology")) return "Technology";
              if (lower.includes("secure")) return "Secure";
              if (lower.includes("risk")) return "Risk";
              if (lower.includes("infotec")) return "Infotec";
              return val;
            };

            const loc = cleanLocation(departamento, ciudad);
            const matchedDept = loc.dept;
            const matchedCity = loc.city;

            let primerApellido = "";
            let segundoApellido = "";
            let primerNombre = "";
            let segundoNombre = "";

            if (hasExplicitSplit) {
              const appParts = String(rawApellidos).split(" ").filter(p => p.trim() !== "");
              const nomParts = String(rawNombres).split(" ").filter(p => p.trim() !== "");

              primerApellido = appParts[0] || "";
              segundoApellido = appParts.slice(1).join(" ") || "";

              primerNombre = nomParts[0] || "";
              segundoNombre = nomParts.slice(1).join(" ") || "";
            } else {
              const nameParts = (finalName === "Sin Nombre" ? "" : finalName).split(" ").filter(p => p.trim() !== "");

              const APELLIDOS_COMUNES = new Set([
                "RODRIGUEZ", "MARTINEZ", "GARCIA", "GOMEZ", "LOPEZ", "GONZALEZ", "PEREZ", "SANCHEZ", "RAMIREZ", "DIAZ",
                "HERNANDEZ", "RUIZ", "VARGAS", "CASTRO", "SUAREZ", "ORTIZ", "MARIN", "MONTOYA", "GIRALDO", "VELASQUEZ",
                "ROJAS", "GUTIERREZ", "MORALES", "QUINTERO", "RESTREPO", "MORENO", "MUNOZ", "MUÑOZ", "HERRERA", "MEDINA",
                "AGUILAR", "CARDENAS", "GUZMAN", "SALAZAR", "VALENCIA", "OSORIO", "FRANCO", "ALVAREZ", "MEJIA", "PINEDA",
                "RIVERA", "LONDOÑO", "LONDONO", "ESCOBAR", "ARANGO", "JARAMILLO", "CARDONA", "VELEZ", "DUQUE", "ALZATE",
                "ARIZMENDI", "BEDOYA", "BERMUDEZ", "BOHORQUEZ", "BUITRAGO", "CADAVID", "CALLE", "CANO", "CARMONA",
                "CASTAÑEDA", "CASTANEDA", "CASTAÑO", "CASTANO", "CHICA", "CIFUENTES", "COLORADO", "CORREA", "CUARTAS",
                "ECHAVARRIA", "ECHEVERRI", "FLOREZ", "GALLEGO", "GARCES", "GUARIN", "HENAO", "HOYOS", "ISAZA", "LOAIZA",
                "MACIAS", "MESA", "MIRANDA", "MURILLO", "NARANJO", "NAVARRO", "OCAMPO", "OSPINA", "PALACIO", "PALACIOS",
                "PARRA", "PELAEZ", "PENAGOS", "PIEDRAHITA", "POSADA", "PUERTA", "RENDON", "RINCÓN", "RINCON", "ROLDAN",
                "SALGADO", "TABARES", "TAMAYO", "TORO", "TORRES", "TRUJILLO", "URIBE", "VALDERRAMA", "VALLEJO", "VARELA",
                "VASQUEZ", "VILLEGAS", "YEPES", "ZULUAGA", "ACUNA", "ACUÑA", "AGUDELO", "ALONSO", "ALVARADO", "AMEZQUITA",
                "APONTE", "ARBELAEZ", "ARENAS", "ARIAS", "AVILA", "BAENA", "BARRIOS", "BASTIDAS", "BENAVIDES", "BLANCO",
                "BOLIVAR", "CABALLERO", "CACERES", "CALDERON", "CAMARGO", "CAMILLO", "CANTILLO", "CARO", "CARVAJAL",
                "CASALLAS", "CASTELLANOS", "CASTILLO", "CEPEDA", "CHACON", "CHAPARRO", "CONTRERAS", "CORONADO", "CORTES",
                "CRUZ", "CUERVO", "DELGADO", "DOMINGUEZ", "DUARTE", "ESPINOSA", "ESTRADA", "FAJARDO", "FONSECA", "FORERO",
                "GALVIS", "GAMBOA", "GARZON", "HUERTAS", "HURTADO", "IBAÑEZ", "IBANEZ", "JAIMES", "LEAL", "LEMOS", "LEON",
                "LIZARAZO", "LOBO", "LOZANO", "MACHADO", "MANTILLA", "MARQUINA", "MARQUEZ", "MAYORGA", "MELO", "MENDOZA",
                "MORA", "MOSQUERA", "MOYA", "NARVAEZ", "NIÑO", "NINO", "NOVOA", "OCHOA", "OROZCO", "ORTEGA", "PACHECO",
                "PADILLA", "PAEZ", "PARDO", "PATIÑO", "PATINO", "PEÑA", "PENA", "PINZON", "POLANCO", "PONCE", "PORRAS",
                "PUENTES", "QUIROGA", "RAMOS", "REYES", "RIOS", "ROA", "ROMERO", "RUBIO", "RUEDA", "SALAMANCA", "SALINAS",
                "SANABRIA", "SANTAMARIA", "SARMIENTO", "SEPULVEDA", "SERNA", "SIERRA", "SILVA", "SOCARRAS", "SOLANO", "SOSA",
                "SOTO", "TAVERA", "TOVAR", "TRIANA", "VALDES", "VALDIVIA", "VEGA", "VELA", "VELASCO", "VERGARA", "VILLAMIZAR",
                "VILLANUEVA", "VILLARRAGA", "ZAMBRANO", "ZAPATA", "ANDRADE", "GAONA"
              ]);

              let isApellidosNombres = true;
              if (nameParts.length >= 3) {
                const scoreNombresApellidos =
                  (APELLIDOS_COMUNES.has(nameParts[nameParts.length - 1].toUpperCase()) ? 1 : 0) +
                  (APELLIDOS_COMUNES.has(nameParts[nameParts.length - 2].toUpperCase()) ? 1 : 0);
                const scoreApellidosNombres =
                  (APELLIDOS_COMUNES.has(nameParts[0].toUpperCase()) ? 1 : 0) +
                  (APELLIDOS_COMUNES.has(nameParts[1].toUpperCase()) ? 1 : 0);

                if (scoreNombresApellidos > scoreApellidosNombres) {
                  isApellidosNombres = false;
                }
              } else if (nameParts.length === 2) {
                if (!APELLIDOS_COMUNES.has(nameParts[0].toUpperCase()) && APELLIDOS_COMUNES.has(nameParts[1].toUpperCase())) {
                  isApellidosNombres = false;
                }
              }

              if (isApellidosNombres) {
                if (nameParts.length === 1) {
                  primerApellido = nameParts[0] || "";
                } else if (nameParts.length === 2) {
                  primerApellido = nameParts[0] || "";
                  primerNombre = nameParts[1] || "";
                } else if (nameParts.length === 3) {
                  primerApellido = nameParts[0] || "";
                  segundoApellido = nameParts[1] || "";
                  primerNombre = nameParts[2] || "";
                } else if (nameParts.length >= 4) {
                  primerApellido = nameParts[0] || "";
                  segundoApellido = nameParts[1] || "";
                  primerNombre = nameParts[2] || "";
                  segundoNombre = nameParts.slice(3).join(" ") || "";
                }
              } else {
                if (nameParts.length === 2) {
                  primerNombre = nameParts[0] || "";
                  primerApellido = nameParts[1] || "";
                } else if (nameParts.length === 3) {
                  primerNombre = nameParts[0] || "";
                  primerApellido = nameParts[1] || "";
                  segundoApellido = nameParts[2] || "";
                } else if (nameParts.length >= 4) {
                  const numNombres = nameParts.length - 2;
                  primerNombre = nameParts[0] || "";
                  segundoNombre = nameParts.slice(1, numNombres).join(" ") || "";
                  primerApellido = nameParts[numNombres] || "";
                  segundoApellido = nameParts.slice(numNombres + 1).join(" ") || "";
                }
              }
            } // Fin else (heuristic)

            const msDate = parseDateMs(fechaDato) || Date.now();
            const twelveMonthsMs = 365 * 24 * 60 * 60 * 1000;

            const isDuplicateEL = dataEL.some(existing => {
              const hasValidName = finalName !== "Sin Nombre" && !finalName.includes("Sin Nombre");
              const hasValidCie10 = finalCie10 !== "Sin Dato";

              if (!cc && !hasValidName) return false; // If both CC and Name are empty/default, cannot reliably deduplicate
              if (!hasValidCie10) return false; // Cannot deduplicate without a valid diagnosis code

              const sameWorker = (cc && existing.cc === cc) || (existing.nombreCompleto && hasValidName && normalize(existing.nombreCompleto) === normalize(finalName));
              const sameDiag = existing.diagnosticoCie10 && hasValidCie10 && normalize(existing.diagnosticoCie10) === normalize(finalCie10);

              if (sameWorker && sameDiag) {
                const existMs = parseDateMs(existing.fechaDiag1) || parseDateMs(existing.fechaIngreso) || existing.id;
                const isWithin12Months = Math.abs(msDate - existMs) < twelveMonthsMs;
                return isWithin12Months;
              }
              return false;
            });

            if (isDuplicateEL) {
              dupsEL++;
              return; // Skip adding
            }

            const safeDateStr = fechaDato ? new Date(msDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const recordEL = {
              id: Date.now() + idx,
              nombreCompleto: finalName,
              cc: cc,
              cedula: cc, // For Form
              tipoId: cc ? "CC" : "", // Capture column "CC" mapping
              numeroId: cc, // Capture the value representing CC
              tipoIdTrabajador: cc ? "C.C." : "", // Added for G4S Form
              numIdTrabajador: cc, // Added for G4S Form
              primerApellido,
              segundoApellido,
              primerNombre,
              segundoNombre,
              sexo: genero ? (genero.toUpperCase().startsWith("M") ? "M" : (genero.toUpperCase().startsWith("F") ? "F" : "")) : "",
              eps: buscarCampo(["EPS", "EPS a la que está afiliado"]),
              arl: buscarCampo(["ARL", "ARL a la que está afiliado"]),
              arlTraslado: buscarCampo(["ARL", "ARL a la que está afiliado"]), // For form
              diagnosticoCie10: finalCie10,
              diagnosticos: [{ id: 1, cie10: finalCie10, descripcion: "Cargado Automáticamente", tipo: "" }], // For form array
              fechaIngreso: safeDateStr,
              fechaAviso: safeDateStr, // For form
              fechaDiag1: safeDateStr,
              anio: String(new Date(msDate).getFullYear() || 2025),
              mes: LISTA_MESES[new Date(msDate).getMonth()] || "",
              cargo: cargo,
              genero: genero,
              empresa: getCleanLinea(lineaNegocio), // Matches the dropdown in Form
              lineaNegocio: getCleanLinea(lineaNegocio),
              linea_negocio: getCleanLinea(lineaNegocio),
              ciudad: matchedCity || ciudad,
              ciudadAfiliado: matchedCity || ciudad, // For form
              departamento: matchedDept || departamento,
              departamentoAfiliado: matchedDept || departamento, // For form
              deptTrabajador: matchedDept, // Explicitly matched for Form Dropdown
              muniTrabajador: matchedCity, // Explicitly matched for Form Dropdown
              regional: regional,
              estadoCaso: estadoCaso || "Abierto", // For form
              observaciones: observaciones,
              diasIncapacidadAcumulados: String(diasPerdidos || "0"), // For form
              totalDias: diasPerdidos || 0
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
          if (dupsAT > 0) setWarningMsg(`⚠️ Se detectaron y omitieron ${dupsAT} registros de AT ya existentes en el sistema (duplicados).`);
          if (dupsEL > 0) setWarningMsg(`⚠️ Se detectaron y omitieron ${dupsEL} registros de EL (CIE-10 repetido para el mismo trabajador en menos de 12 meses).`);
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

  const handleReset = async () => {
    if (window.confirm("⚠️ ¿Estás seguro de querer BORRAR TODA LA BASE DE DATOS de AT y EL? Esto es solo para pruebas.")) {
      setLoading(true);
      await resetDatabase();
      setSuccessMsg("✅ Base de datos reseteada con éxito.");
      setErrorMsg("");
      setWarningMsg("");
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: "40px",
      fontFamily: "Arial, sans-serif",
      maxWidth: "1000px",
      margin: "0 auto",
      position: "relative",
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
      border: `1px solid ${type === "error" ? "#f5c6cb" : (type === "warning" ? "#ffeeba" : "#c3e6cb")}`,
      backgroundColor: type === "error" ? "#f8d7da" : (type === "warning" ? "#fff3cd" : "#d4edda"),
      color: type === "error" ? "#721c24" : (type === "warning" ? "#856404" : "#155724"),
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "#CD1920", marginBottom: "10px" }}>
            Subir Archivo - Base de Datos {type}
          </h2>
          <button
            onClick={handleReset}
            style={{ padding: "8px 15px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            🗑️ Resetear DB (Pruebas)
          </button>
        </div>
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
        {warningMsg && <div style={styles.alert("warning")}>{warningMsg}</div>}

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
