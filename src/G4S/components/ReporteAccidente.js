// src/components/ReporteAccidente.js
import React, { useState, useEffect, useMemo } from "react";
import {
  dataAT,
  addNewRecord,
  updateRecord,
  deleteRecord,
  DEPARTAMENTOS_COLOMBIA,
} from "../data";

// --- CONSTANTES COMPLETAS ---
const OPCIONES_REGIONAL = [
  "Bogotá-Girardot",
  "Noroccidente",
  "Sabana",
  "Santanderes-Costa",
  "Sur Occidente",
  "Eje Cafetero",
];
const OPCIONES_TIPO_ACCIDENTE = [
  "Sin información",
  "Violencia",
  "Tránsito", // Nota: Tiene tilde
  "Deportivo",
  "Recreativo",
  "Propios del trabajo",
];
const OPCIONES_NIVEL_AT = [
  "AT Leve",
  "AT Grave",
  "Acto inseguro",
  "Condición insegura",
  "Fatal",
  "Incidente",
];
const OPCIONES_SITIO = [
  "Almacenes o depósitos",
  "Áreas de producción",
  "Corredores o pasillos",
  "Escaleras",
  "Parqueaderos",
  "Oficinas",
  "Otras áreas comunes",
  "Otro (Especifique)",
];
const OPCIONES_TIPO_LESION = [
  "Fractura",
  "Luxación",
  "Torcedura",
  "Conmoción o trauma interno",
  "Herida",
  "Trauma superficial",
  "Golpe contusión o aplastamiento",
  "Quemadura",
  "Envenenamiento",
  "Lesiones Múltiples",
  "Otro",
];
const OPCIONES_PARTE_CUERPO = [
  "Cabeza",
  "Ojo",
  "Cuello",
  "Tronco",
  "Tórax",
  "Miembros Superiores",
  "Manos",
  "Miembros inferiores",
  "Pies",
  "Ubicaciones múltiples",
  "Lesiones Generales u otras",
];
const OPCIONES_AGENTE = [
  "Maquinas y/o Equipos",
  "Medios de transporte",
  "Aparatos",
  "Herramientas implementos o utensilios",
  "Materiales o sustancias",
  "ambientes de trabajo",
  "Otros agentes no clasificados",
  "Animales",
  "Agentes no clasificados por falta de datos",
];
const OPCIONES_MECANISMO = [
  "Caída de personas",
  "Caída de objetos",
  "Pisadas golpes choques",
  "Atrapamientos",
  "Sobreesfuerzo esfuerzo excesivo o falso movimiento",
  "Exposición o contacto con sustancias nocivas radiaciones o salpicaduras",
  "Otro (especifique)",
];
const OPCIONES_PELIGRO = [
  "Condiciones locativas",
  "Biológico",
  "Biomecánico",
  "Tránsito",
  "Físico",
  "Mecánico",
  "Psicosocial",
  "Publico",
  "Químico",
  "Naturales",
];
const OPCIONES_ESTADO_INV = ["Ejecutada", "Pendiente"];

// --- NUEVAS LISTAS DESDE EL ARCHIVO ADJUNTO (SECCIÓN 5) ---
const OPCIONES_ESTANDARES = [
  "1. Cumple cabalmente las Políticas, Procedimiento e Instrucciones Operativas (Estandar 1)",
  "1. Cumple cabalmente las Políticas, Procedimiento e Instrucciones Operativas (Estandar 1), 2. Usa de manera correcta los equipos  y/o herramientas para desarrollar adecuadamente su labor (Estandar 2)",
  "1. Cumple cabalmente las Políticas, Procedimiento e Instrucciones Operativas (Estandar 1), 2. Usa de manera correcta los equipos  y/o herramientas para desarrollar adecuadamente su labor (Estandar 2), 3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3)",
  "1. Cumple cabalmente las Políticas, Procedimiento e Instrucciones Operativas (Estandar 1), 3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3)",
  "1. Cumple cabalmente las Políticas, Procedimiento e Instrucciones Operativas (Estandar 1), 3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3), 4. Usa de manera correcta los medios de transporte asignados para realizar su labor (vehículos livianos y pesados - bicicletas-segway y/o motos (Estandar 4)",
  "2. Usa de manera correcta los equipos  y/o herramientas para desarrollar adecuadamente su labor (Estandar 2)",
  "2. Usa de manera correcta los equipos  y/o herramientas para desarrollar adecuadamente su labor (Estandar 2), 1.Cumple cabalmente las Políticas, Procedimiento e Instrucciones Operativas (Estandar 1)",
  "2. Usa de manera correcta los equipos  y/o herramientas para desarrollar adecuadamente su labor (Estandar 2), 4. Usa de manera correcta los medios de transporte asignados para realizar su labor (vehículos livianos y pesados - bicicletas-segway y/o motos (Estandar 4)",
  "3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3)",
  "3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3), 1.Cumple cabalmente las Políticas, Procedimiento e Instrucciones Operativas (Estandar 1)",
  "3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3), 1.Cumple cabalmente las Políticas, Procedimiento e Instrucciones Operativas (Estandar 1), 4. Usa de manera correcta los medios de transporte asignados para realizar su labor (vehículos livianos y pesados - bicicletas-segway y/o motos (Estandar 4)",
  "3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3), 2. Usa de manera correcta los equipos  y/o herramientas para desarrollar adecuadamente su labor (Estandar 2)",
  "3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3), 2. Usa de manera correcta los equipos  y/o herramientas para desarrollar adecuadamente su labor (Estandar 2), 4. Usa de manera correcta los medios de transporte asignados para realizar su labor (vehículos livianos y pesados - bicicletas-segway y/o motos (Estandar 4)",
  "3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3), 4. Usa de manera correcta los medios de transporte asignados para realizar su labor (vehículos livianos y pesados - bicicletas-segway y/o motos (Estandar 4)",
  "4. Usa de manera correcta los medios de transporte asignados para realizar su labor (vehículos livianos y pesados - bicicletas-segway y/o motos (Estandar 4), 2. Usa de manera correcta los equipos  y/o herramientas para desarrollar adecuadamente su labor (Estandar 2)",
  "4. Usa de manera correcta los medios de transporte asignados para realizar su labor (vehículos livianos y pesados - bicicletas-segway y/o motos (Estandar 4), 3. Razona y Toma de decisiones acertadas frente a la ejecución de su labor (Estandar 3)",
  "401. Evaluación deficiente de las necesidades y los riesgos",
];

const OPCIONES_CAUSAS_RIESGOSAS = [
  "1.1 Incumplimiento Individual",
  "1.1 Incumplimiento Individual, 1.2. Incumplimiento Grupal",
  "1.1 Incumplimiento Individual, 1.3. Incumplimiento de Procedimientos y/o Reglamentos",
  "1.1 Incumplimiento Individual, 1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.2. No se da la alerta del peligro",
  "1.1 Incumplimiento Individual, 1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.4.  No se sigue la advertencia de Peligro, 4.3. No hacer verificación previa de Medio de Transporte",
  "1.1 Incumplimiento Individual, 1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.3. Actividad rutinaria sin atención",
  "1.1 Incumplimiento Individual, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "1.1. Incumplimiento Individual, 3.3. Actividad rutinaria sin atención",
  "1.1. Incumplimiento Individual, 3.4.  No se sigue la advertencia de Peligro",
  "1.1. Incumplimiento Individual, 3.5. No se observa alrededor cuando se pisa",
  "1.2. Incumplimiento Grupal",
  "1.2. Incumplimiento Grupal, 1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.2. No se da la alerta del peligro",
  "1.2. Incumplimiento Grupal, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "1.2. Incumplimiento Grupal, 3.2. No se da la alerta del peligro",
  "1.2. Incumplimiento Grupal, 3.3. Actividad rutinaria sin atención",
  "1.2. Incumplimiento Grupal, 3.4.  No se sigue la advertencia de Peligro",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 2.1. Manipular equipo sin autorización",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 2.1. Manipular equipo sin autorización, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 2.2. Uso de equipos y/o herramientas sin capacitación ni entrenamiento",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.3. Actividad rutinaria sin atención",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.2. No se da la alerta del peligro",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.2. No se da la alerta del peligro, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.2. No se da la alerta del peligro, 3.3. Actividad rutinaria sin atención",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.3. Actividad rutinaria sin atención",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 4.1. Exceso de Velocidad",
  "1.3. Incumplimiento de Procedimientos y/o Reglamentos, 4.3. No hacer verificación previa de Medio de Transporte",
  "2.1. Manipular equipo sin autorización, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "2.2. Uso de equipos y/o herramientas sin capacitación ni entrenamiento",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 1.3. Incumplimiento de Procedimientos y/o Reglamentos",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.4.  No se sigue la advertencia de Peligro",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 2.2. Uso de equipos y/o herramientas sin capacitación ni entrenamiento",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.2. No se da la alerta del peligro",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.2. No se da la alerta del peligro, 3.3. Actividad rutinaria sin atención",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.2. No se da la alerta del peligro, 3.4.  No se sigue la advertencia de Peligro",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.3. Actividad rutinaria sin atención",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.3. Actividad rutinaria sin atención , 3.2. No se da la alerta del peligro, 1.2. Incumplimiento Grupal, 1.3. Incumplimiento de Procedimientos y/o Reglamentos",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.4.  No se sigue la advertencia de Peligro",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.4.  No se sigue la advertencia de Peligro, 3.5. No se observa alrededor cuando se pisa",
  "3.1. Se toman decisiones equivocadas o no se usa el sentido común, 3.5. No se observa alrededor cuando se pisa",
  "3.2. No se da la alerta del peligro",
  "3.2. No se da la alerta del peligro, 1.1. Incumplimiento Individual",
  "3.2. No se da la alerta del peligro, 1.3. Incumplimiento de Procedimientos y/o Reglamentos",
  "3.2. No se da la alerta del peligro, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "3.2. No se da la alerta del peligro, 3.3. Actividad rutinaria sin atención",
  "3.2. No se da la alerta del peligro, 3.3. Actividad rutinaria sin atención , 3.5. No se observa alrededor cuando se pisa",
  "3.2. No se da la alerta del peligro, 3.3. Actividad rutinaria sin atención , 4.3. No hacer verificación previa de Medio de Transporte",
  "3.2. No se da la alerta del peligro, 3.3. Actividad rutinaria sin atención, 4.3. No hacer verificación previa de Medio de Transporte",
  "3.2. No se da la alerta del peligro, 3.4.  No se sigue la advertencia de Peligro",
  "3.2. No se da la alerta del peligro, 3.4.  No se sigue la advertencia de Peligro, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "3.2. No se da la alerta del peligro, 3.5. No se observa alrededor cuando se pisa",
  "3.2. No se da la alerta del peligro, 3.5. No se observa alrededor cuando se pisa , 3.3. Actividad rutinaria sin atención",
  "3.3. Actividad rutinaria sin atención",
  "3.3. Actividad rutinaria sin atención , 1.1. Incumplimiento Individual, 3.4.  No se sigue la advertencia de Peligro",
  "3.3. Actividad rutinaria sin atención , 1.3. Incumplimiento de Procedimientos y/o Reglamentos, 3.5. No se observa alrededor cuando se pisa",
  "3.3. Actividad rutinaria sin atención , 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "3.3. Actividad rutinaria sin atención , 3.2. No se da la alerta del peligro",
  "3.3. Actividad rutinaria sin atención , 3.2. No se da la alerta del peligro, 3.4.  No se sigue la advertencia de Peligro",
  "3.3. Actividad rutinaria sin atención , 3.4.  No se sigue la advertencia de Peligro",
  "3.3. Actividad rutinaria sin atención , 3.4.  No se sigue la advertencia de Peligro, 3.5. No se observa alrededor cuando se pisa",
  "3.3. Actividad rutinaria sin atención , 3.5. No se observa alrededor cuando se pisa",
  "3.3. Actividad rutinaria sin atención , 3.5. No se observa alrededor cuando se pisa , 3.4.  No se sigue la advertencia de Peligro",
  "3.3. Actividad rutinaria sin atención, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "3.3. Actividad rutinaria sin atención, 3.2. No se da la alerta del peligro",
  "3.3. Actividad rutinaria sin atención, 3.4.  No se sigue la advertencia de Peligro",
  "3.3. Actividad rutinaria sin atención, 3.5. No se observa alrededor cuando se pisa",
  "3.4.  No se sigue la advertencia de Peligro",
  "3.4.  No se sigue la advertencia de Peligro, 1.1. Incumplimiento Individual, 3.3. Actividad rutinaria sin atención",
  "3.4.  No se sigue la advertencia de Peligro, 1.3. Incumplimiento de Procedimientos y/o Reglamentos",
  "3.4.  No se sigue la advertencia de Peligro, 3.3. Actividad rutinaria sin atención",
  "3.4.  No se sigue la advertencia de Peligro, 3.3. Actividad rutinaria sin atención , 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "3.4.  No se sigue la advertencia de Peligro, 3.3. Actividad rutinaria sin atención , 3.2. No se da la alerta del peligro",
  "3.4.  No se sigue la advertencia de Peligro, 3.5. No se observa alrededor cuando se pisa",
  "3.4.  No se sigue la advertencia de Peligro, 4.3. No hacer verificación previa de Medio de Transporte, 3.3. Actividad rutinaria sin atención",
  "3.5. No se observa alrededor cuando se pisa",
  "3.5. No se observa alrededor cuando se pisa , 1.1. Incumplimiento Individual",
  "3.5. No se observa alrededor cuando se pisa , 3.2. No se da la alerta del peligro",
  "3.5. No se observa alrededor cuando se pisa , 3.2. No se da la alerta del peligro, 3.3. Actividad rutinaria sin atención",
  "3.5. No se observa alrededor cuando se pisa , 3.3. Actividad rutinaria sin atención",
  "3.5. No se observa alrededor cuando se pisa , 3.3. Actividad rutinaria sin atención , 3.2. No se da la alerta del peligro",
  "3.5. No se observa alrededor cuando se pisa , 3.4.  No se sigue la advertencia de Peligro",
  "3.5. No se observa alrededor cuando se pisa , 3.4.  No se sigue la advertencia de Peligro, 1.2. Incumplimiento Grupal",
  "4.3. No hacer verificación previa de Medio de Transporte, 3.1. Se toman decisiones equivocadas o no se usa el sentido común",
  "Incumplimiento Individual, 3.2. No se da la alerta del peligro",
  "Incumplimiento Individual, 3.2. No se da la alerta del peligro, 3.1. Se toman decisiones equivocadas o no se usa el sentido común, 4.2. No tener acreditación  legal para uso de medio de transporte",
  "Incumplimiento Individual, 3.2. No se da la alerta del peligro, 4.3. No hacer verificación previa de Medio de Transporte",
];

// --- LISTA ACTUALIZADA DESDE ARCHIVO ADJUNTO (SECCIÓN 6) ---
const OPCIONES_CONDICIONES_SUBESTANDAR = [
  "10.Elaborado, construido, ensamblado inapropiadamente",
  '10.Elaborado, construido, ensamblado inapropiadamente", 630.Otros riesgos asociados con la propiedad u operaciones de extraños',
  "20.Aspero, tosco, 99.Otros defectos no especificados en otra parte",
  "210.Espacio inadecuado de los pasillos, vías de salida,etc",
  '210.Espacio inadecuado de los pasillos, vías de salida,etc, "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto)"',
  "25.Agudo, cortante",
  '25.Agudo, cortante, 630.Otros riesgos asociados con la propiedad u operaciones de extraños, "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)"',
  "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)",
  "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc), 299.Riesgos ambientales no especificados en otra parte",
  "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc), 590.materiales sin rotulo o inadecuadamente rotulados, 299.Riesgos ambientales no especificados en otra parte",
  "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc), 630.Otros riesgos asociados con la propiedad u operaciones de extraños",
  "35.Desgastado, cuarteado, raído, roto, etc",
  '35.Desgastado, cuarteado, raído, roto, etc, "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto)"',
  "35.Desgastado, cuarteado, raído, roto, etc, 200.RIESGOS AMBIENTALES NO ESPECIFICADOS EN OTRA PARTE",
  "35.Desgastado, cuarteado, raído, roto, etc, 220.Espacio libre inadecuado para movimientos de personas u objetos, 630.Otros riesgos asociados con la propiedad u operaciones de extraños",
  "35.Desgastado, cuarteado, raído, roto, etc, 340.Ayuda inadecuada para levantar cargas pesadas",
  "35.Desgastado, cuarteado, raído, roto, etc, 610.Predios o cosas defectuosas de extraños",
  "35.Desgastado, cuarteado, raído, roto, etc, 620.Materiales o equipo defectuosos de extraños",
  "350.Ubicación inapropiada del personal (sin tener en cuenta las limitaciones físicas, habilidades, etc)",
  "350.Ubicación inapropiada del personal (sin tener en cuenta las limitaciones físicas, habilidades, etc), 99.Otros defectos no especificados en otra parte",
  "400.RIESGO DE COLOCACION O EMPLAZAMIENTO (MATERIALES, EQUIPOS, ETC.,EXCEPTUANDO LAS PERSONAS), 410.Inapropiadamente apilado",
  "520.Inadecuadamente protegidos (riesgos mecánicos o físicos, exceptuando riesgos eléctricos y radiaciones)",
  '599.Inadecuadamente protegido, no especificado en otra parte, "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto)"',
  "599.Inadecuadamente protegido, no especificado en otra parte, 330.Uso de herramientas o equipos inadecuados o inapropiados (no defectuosos)",
  "600.RIESGOS AMBIENTALES EN TRABAJOS EXTERIORES, DISTINTOS A LOS OTROS RIESGOS PUBLICOS",
  "600.RIESGOS AMBIENTALES EN TRABAJOS EXTERIORES, DISTINTOS A LOS OTROS RIESGOS PUBLICOS, 1.Elaborado con materiales inadecuados",
  "600.RIESGOS AMBIENTALES EN TRABAJOS EXTERIORES, DISTINTOS A LOS OTROS RIESGOS PUBLICOS, 299.Riesgos ambientales no especificados en otra parte, 630.Otros riesgos asociados con la propiedad u operaciones de extraños",
  "600.RIESGOS AMBIENTALES EN TRABAJOS EXTERIORES, DISTINTOS A LOS OTROS RIESGOS PUBLICOS, 999.No hay condición ambiental peligrosa",
  "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto)",
  "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto), 30.Resbaloso",
  "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto), 980.CONDICIONES AMBIENTALES PELIGROSAS NO ESPECIFICADAS EN OTRA PARTE",
  "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto), 999.No hay condición ambiental peligrosa",
  "1.Elaborado con materiales inadecuados",
  "110.Carencia del equipo de protección personal necesario",
  "15.Diseñado inapropiadamente",
  '15.Diseñado inapropiadamente, "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)"',
  "15.Diseñado inapropiadamente, 200.RIESGOS AMBIENTALES NO ESPECIFICADOS EN OTRA PARTE",
  "15.Diseñado inapropiadamente, 30.Resbaloso",
  "15.Diseñado inapropiadamente, 430.Inadecuadamente asegurados contra movimientos inconvenientes (exceptuando apilamiento inestable)",
  "200.RIESGOS AMBIENTALES NO ESPECIFICADOS EN OTRA PARTE",
  '200.RIESGOS AMBIENTALES NO ESPECIFICADOS EN OTRA PARTE, "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)"',
  "200.RIESGOS AMBIENTALES NO ESPECIFICADOS EN OTRA PARTE, 1.Elaborado con materiales inadecuados",
  "205.Ruido excesivo",
  "220.Espacio libre inadecuado para movimientos de personas u objetos",
  "220.Espacio libre inadecuado para movimientos de personas u objetos, 250.Insuficiente espacio de trabajo",
  "220.Espacio libre inadecuado para movimientos de personas u objetos, 320.Uso de métodos o procedimientos de por si peligrosos",
  "220.Espacio libre inadecuado para movimientos de personas u objetos, 780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general)",
  "230.Control inadecuado del trafico",
  "230.Control inadecuado del trafico, 780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general)",
  "250.Insuficiente espacio de trabajo",
  '250.Insuficiente espacio de trabajo, "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)"',
  "299.Riesgos ambientales no especificados en otra parte",
  '299.Riesgos ambientales no especificados en otra parte, "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)"',
  '299.Riesgos ambientales no especificados en otra parte, "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto)"',
  "299.Riesgos ambientales no especificados en otra parte, 630.Otros riesgos asociados con la propiedad u operaciones de extraños",
  '299.Riesgos ambientales no especificados en otra parte, 630.Otros riesgos asociados con la propiedad u operaciones de extraños, "600.RIESGOS AMBIENTALES EN TRABAJOS EXTERIORES, DISTINTOS A LOS OTROS RIESGOS PUBLICOS',
  "30.Resbaloso",
  '30.Resbaloso, "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)"',
  '30.Resbaloso, "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)", "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto)", 720.Riesgo de tràfico',
  '30.Resbaloso, "35.Desgastado, cuarteado, raído, roto, etc"',
  '30.Resbaloso, "599.Inadecuadamente protegido, no especificado en otra parte"',
  '30.Resbaloso, "600.RIESGOS AMBIENTALES EN TRABAJOS EXTERIORES, DISTINTOS A LOS OTROS RIESGOS PUBLICOS"',
  '30.Resbaloso, "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto)"',
  "30.Resbaloso, 110.Carencia del equipo de protección personal necesario, 299.Riesgos ambientales no especificados en otra parte",
  "30.Resbaloso, 113.Ropa inadecuada o inapropiada",
  "30.Resbaloso, 220.Espacio libre inadecuado para movimientos de personas u objetos",
  "30.Resbaloso, 630.Otros riesgos asociados con la propiedad u operaciones de extraños",
  "30.Resbaloso, 720.Riesgo de tràfico",
  "30.Resbaloso, 980.CONDICIONES AMBIENTALES PELIGROSAS NO ESPECIFICADAS EN OTRA PARTE",
  "300.METODOS O PROCEDIMIENTOS PELIGROSOS",
  '300.METODOS O PROCEDIMIENTOS PELIGROSOS, "339.Métodos o procedimientos peligrosos, no especificados en otra parte"',
  "300.METODOS O PROCEDIMIENTOS PELIGROSOS, 420.Colocados o emplazados inadecuadamente",
  "300.METODOS O PROCEDIMIENTOS PELIGROSOS, 780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general)",
  "310.Uso de material o equipo de por si peligroso (no defectuoso)",
  "320.Uso de métodos o procedimientos de por si peligrosos",
  "340.Ayuda inadecuada para levantar cargas pesadas",
  "410.Inapropiadamente apilado",
  "420.Colocados o emplazados inadecuadamente",
  "420.Colocados o emplazados inadecuadamente, 430.Inadecuadamente asegurados contra movimientos inconvenientes (exceptuando apilamiento inestable)",
  "420.Colocados o emplazados inadecuadamente, 610.Predios o cosas defectuosas de extraños",
  "430.Inadecuadamente asegurados contra movimientos inconvenientes (exceptuando apilamiento inestable)",
  '430.Inadecuadamente asegurados contra movimientos inconvenientes (exceptuando apilamiento inestable), "35.Desgastado, cuarteado, raído, roto, etc"',
  "500.INADECUADAMENTE PROTEGIDO",
  '500.INADECUADAMENTE PROTEGIDO, "600.RIESGOS AMBIENTALES EN TRABAJOS EXTERIORES, DISTINTOS A LOS OTROS RIESGOS PUBLICOS"',
  "500.INADECUADAMENTE PROTEGIDO, 780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general)",
  '590.materiales sin rotulo o inadecuadamente rotulados, "35.Desgastado, cuarteado, raído, roto, etc"',
  "610.Predios o cosas defectuosas de extraños",
  "610.Predios o cosas defectuosas de extraños, 630.Otros riesgos asociados con la propiedad u operaciones de extraños",
  "620.Materiales o equipo defectuosos de extraños",
  '620.Materiales o equipo defectuosos de extraños, "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)"',
  "630.Otros riesgos asociados con la propiedad u operaciones de extraños",
  "630.Otros riesgos asociados con la propiedad u operaciones de extraños, 15.Diseñado inapropiadamente",
  "630.Otros riesgos asociados con la propiedad u operaciones de extraños, 300.METODOS O PROCEDIMIENTOS PELIGROSOS",
  "630.Otros riesgos asociados con la propiedad u operaciones de extraños, 320.Uso de métodos o procedimientos de por si peligrosos",
  "630.Otros riesgos asociados con la propiedad u operaciones de extraños, 320.Uso de métodos o procedimientos de por si peligrosos, 299.Riesgos ambientales no especificados en otra parte",
  "630.Otros riesgos asociados con la propiedad u operaciones de extraños, 420.Colocados o emplazados inadecuadamente",
  "630.Otros riesgos asociados con la propiedad u operaciones de extraños, 720.Riesgo de tràfico",
  "630.Otros riesgos asociados con la propiedad u operaciones de extraños, 780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general)",
  "630.Otros riesgos asociados con la propiedad u operaciones de extraños, 980.CONDICIONES AMBIENTALES PELIGROSAS NO ESPECIFICADAS EN OTRA PARTE",
  "700.RIESGOS PUBLICOS",
  '700.RIESGOS PUBLICOS, "640.Riesgos naturales (riesgos de terrenos irregulares e inestables, exposición a elementos, animales salvajes, encontrados en operaciones a campo abierto)"',
  "700.RIESGOS PUBLICOS, 1.Elaborado con materiales inadecuados",
  '700.RIESGOS PUBLICOS, 500.INADECUADAMENTE PROTEGIDO, "260.Iluminación inadecuada (insuficiente luz para la operación, brillo, reflejos,etc)"',
  "700.RIESGOS PUBLICOS, 630.Otros riesgos asociados con la propiedad u operaciones de extraños",
  "700.RIESGOS PUBLICOS, 780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general)",
  "700.RIESGOS PUBLICOS, 980.CONDICIONES AMBIENTALES PELIGROSAS NO ESPECIFICADAS EN OTRA PARTE",
  "710.Riesgo de transporte publico",
  "710.Riesgo de transporte publico, 720.Riesgo de tràfico",
  "720.Riesgo de tràfico",
  "720.Riesgo de tràfico, 330.Uso de herramientas o equipos inadecuados o inapropiados (no defectuosos)",
  "720.Riesgo de tràfico, 630.Otros riesgos asociados con la propiedad u operaciones de extraños",
  "720.Riesgo de tràfico, 780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general)",
  "780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general)",
  '780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general), "210.Espacio inadecuado de los pasillos, vías de salida,etc"',
  "780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general), 1.Elaborado con materiales inadecuados",
  "780.Otros riesgos públicos (riesgos de lugares públicos a los cuales también esta expuesto el publico en general), 700.RIESGOS PUBLICOS",
  "980.CONDICIONES AMBIENTALES PELIGROSAS NO ESPECIFICADAS EN OTRA PARTE",
  '980.CONDICIONES AMBIENTALES PELIGROSAS NO ESPECIFICADAS EN OTRA PARTE, "240.Ventilación general inadecuada, no debida a equipos defectuosos"',
  "99.Otros defectos no especificados en otra parte",
  '99.Otros defectos no especificados en otra parte, "240.Ventilación general inadecuada, no debida a equipos defectuosos"',
  "990.Indeterminada información suficiente",
  "999.No hay condición ambiental peligrosa",
];

// --- NUEVA ESTRUCTURA HPI POR SECCIONES ---
const CATEGORIAS_HPI = {
  "Relacionado con armas": ["Armas letales", "Armas letalidad reducida"],
  Ataque: [
    "Producido por individuo",
    "Objeto contundente",
    "Arma cortopunzante",
  ],
  Tránsito: [
    "Atropellamientos",
    "Colisiones frontales",
    "Atrapamientos-volcamientos",
  ],
  "Tareas críticas": [
    "Trabajo en alturas",
    "Espacios confinados",
    "Riesgo eléctrico",
  ],
  "Otros eventos": [
    "Violación Código de Ética y Valores Corporativos",
    "Extorsión",
    "Uso de la fuerza",
    "Perdida de arma de fuego",
    "Robo de arma de fuego",
    "Otros",
  ],
};

// --- NUEVAS OPCIONES PARA TRÁNSITO ---
const OPCIONES_VEHICULO = [
  "Motocicleta",
  "Bicicleta",
  "Segway",
  "Automóvil",
  "Camioneta",
  "Bus público",
  "Montacarga",
];
const OPCIONES_CAUSANTE_AT = [
  "Via urbana en mal estado",
  "Vía rural, baches, desniveles, etc",
  "Peatón / persona / ciclista",
  "Otro vehículo",
  "Omitir señales de prevención o normas de seguridad",
  "Omitir uso de Cinturón",
  "adoptar postura insegura",
  "Maniobra inadecuada - falta de experticia - falta de habilidad",
  "Vehículo propio en mal estado o daño",
  "Premura, afan",
  "Fatiga, sueño, cansancio, microsueño, etc",
  "Animales",
  "Clima (lluvia, lodo, niebla, etc)",
  "Agentes en la via (piedras, aceite, basura, arenilla, otros)",
  "Alta Velocidad",
  "Distracción / Falta de Atención",
];
const OPCIONES_ACTOR_VIAL = ["Peatón", "Conductor", "Pasajero", "Otro"];
const OPCIONES_TAREA_VIA = [
  "Desplazamiento",
  "Escolta",
  "Ingreso Vehicular",
  "Transporte de Valores",
  "Reacción Alarma",
  "Pasando Revista",
];
const OPCIONES_LUGAR_VIAL = [
  "Vía Urbana",
  "Vía Rural",
  "Parqueadero",
  "Vía Privada",
  "Otras Instalaciones del Cliente",
  "Otro",
];

// --- NUEVAS OPCIONES PARA PLAN DE ACCIÓN (FUENTE, MEDIO, INDIVIDUO) ---
const OPCIONES_PLAN_FUENTE = [
  "Divulgación del flayer de pausas activas de manos",
  "Capacitación uso correcto de herramientas",
  "Actualizacion de matriz de peligros-g4s infotec",
  "Sensibilización reporte oportuno, claro y veraz de condiciones de salud",
  "Sensibilización en actos inseguros",
  "Divulgación flayer uso seguro patinetas - link preoperacional - reglas de oro",
  "Inspección de seguridad",
  "Inspeccion locativa (pisos y áreas comunes)",
  "Considerar la posibilidad de reemplzar los vasos de cristal por vasos de materiales mas seguros",
  "Refuerzo en la socialización de ruto gramas",
  "Divulgacion y socializacion en flayer de capsula de seguridad h&s seguridad en las escaleras",
  "Solicitud al area admon: instalación de hablador en la pared (luz encendida)",
  "Reporte al cliente de la condicion insegura (bloque)",
  "Diseñar y divulgar leccion aprendida./solicitud acompañamiento psicológico",
  "Diseñar y divulgar leccion aprendida./reporte al cliente presencia de caninos",
  "Actualización de rutogramas para el personas de ath (costa)",
  "Inspección de seguridad del puesto de trabajo",
  "Levantamiento de matriz de peligros",
  "Divulgación video sensibilización riesgo locativo - reporte de condiciones inseguras",
  "Fumigación en zonas comunes",
  "Uso seguro de sillas - reglas de oro - como reportar un at",
  "Actualizar inspección de puesto (acceso por escaleras)",
  "Divulgación flayer tips para prevenir mordeduras de caninos",
  "Actualización de matriz e inspección de seguridad",
  "Campaña paso seguro - reporte condiciones inseguras - escaleras",
  "Diseño y socialziacion de leccion aprendida",
  "Sensibilización habitos higiene del sueño",
  "Medidas preventivas al transitar por escaleras",
  "Medidas preventivas al subir y bajar del vehículo",
  "Sensibilización de peligros y riesgos",
  "Sensibilización en identificación de peligros y riesgos viales",
  "Capsula riesgo locativo - reglas de oro",
  "Capsula informativa sobre riesgo locativo",
  "Control sobre los pacientes en el lugar de trabajo",
  "Capacitación normas de seguridad referente al cuidado de pacientes psquiatricos",
  "Actualización de matriz de peligros referente a riesgo público",
  "Refuerzo de las consignas del puesto, uso de la fuerza",
  "Gestionar linternas tipo mineras recargables",
  "Realizar inspección para propuestas de mejora de acceso seguro a los vehículos",
  "Actualizar matriz",
  "Inspeccion teorico practica de conduccion",
  "Actualización y socialización del mos",
  "Definir con el cliente el protocolo de reacción",
  "Evaluar ejecución de la actividad desde la parte contractual",
  "Rutograma",
  "Inspección de elementos de protección personal",
  "Validar ultimo mantenimiento de la patineta",
  "Soporte via correo de solicitud de iluminarias",
  "Flayer medidas de prevención al inspeccionar un vehículo",
  "Retiro de escalrta plegable de la operacion",
  "Actualización de matriz de peligros",
  "Seguimiento a la inspección de seguridad",
  "Capacitacion seguridad vial y manejo defensivo",
  "Inspección de puesto de trabajo",
  "Actualización de matrz de peligros",
  "Tips para prevenir mordeduras de caninos",
  "Matriz de riesgos y peligros",
  "Inspección y validación del estado de equipos de comunicación",
  "Actualizar manual operativo de seguridad y consignas",
  "Validar el cambio de zapato de gala por botas de seguridad",
  "Inspeccíón de seguridad del puesto de trabajo",
  "Valoración del riesgo por contacto con canino",
  "Sensibilización en tips para manejo de patinetas",
  "Flayer de uso de patinetas",
  "Charla riesgos viales e identificación de peligros y riesgos",
  "Capacitación y sensibilización riesgo vial",
  "Link rejas, puertas y portones, video, socialización estandar",
  "Identificación de peligros y riesgos - reglas de oro",
  "Divulgación video fijate bien donde miras",
  "Tips recomendaciones epocas de lluvia",
  "Retroalimentacion de la consigna específica (caninos)",
  "Refuerzo ronda segura",
  "Charla en riesgos asociados al puesto",
  "Actualización matriz de riesgos",
  "Entrega de elementos de protección personal (botas, chalecos)",
  "Divulgar campaña paso seguro e identificación de peligros",
  "Capacitar sobre uso preventivo y obligatorio de epps",
  "Actualizaión matriz de peligros",
  "Cortar y retirar elemento de la infraestructura",
  "Inspecciones preoperacionales",
  "Divulgacion manual de operaciones",
  "Inspección de motocicleta",
  "Implementación y adaptación del decalogo ronda segura",
  "Revisar la implentación de un sistema de cobertura de voz y datos",
  "Validar el retiro de los caninos del lugar de trabajo",
  "Visita a puesto de trabajo para identificacion del peligro",
  "Leccion aprendida y socializacion (pasos seguros)",
  "Actualizacion de matriz iperv",
  "Establecer en consigna prohibido caminar en escaleras en movimiento",
  "Capacitacion de autocuidado",
  "Diseñar y divulgar lección aprendida",
  "Actualización de matriz de peligros y riesgos de risk",
  "Seguimiento a vacunas asignadas al empleado",
  "Soporte descargo colaboradores",
  "Divulgación video (cuidado se va ayy)",
  "Divulgación estandar manejo de puertas, rejas, puertas y portones",
  "Sensibilización higiene postural",
  "Remplazo de cartucho y mantenimiento de arma de fuego",
  "Divulgación de consignas e indución del puesto de trabajo",
  "Inspección de seguridad en las instalaciones del cliente",
  "Iperv: incluir peligro de postura antigravitacional",
  "Reunió con el area h&s del cliente (terreno irregular)",
  "Placa de concreto fundida en zona 25",
  "Revision de procedimientos y consignas dle puesto de trabajo",
  "Charla de seguridad sobre uso seguro de armas de letalidad reducida",
  "Validar el suministro de repelentes para el puesto de trabajo",
  "Realizar actualización de matriz de peligros",
  "Realizar inspección del lugar del accidente y socialización",
  "Realizar una actualizacion de consignas (riesgo publico)",
  "Como reportar un at, charla higiene postural",
  "Realizar inspeccion en puesto (sustancias aceitosas)",
  "Reporte de condicion de luminarias fuera de servicio",
  "Capacitar al personal sobre riesgos químicos",
  "Generar un compromiso con el cliente sobre fumigación",
  "Reporte renova",
  "Revisión y actualización de la matriz de riesgos",
  "Solciitud y realizar el cambio de las rodilleras",
  "Dar continuidad a las actividades programadas en el pesv",
  "Hacer inspeccion de seguridad y presentar los hallazgos al cliente",
  "Realizar recomendacion operativa (aumento nivel de seguridad)",
  "Actualizar las consignas del puesto recepcion (restricción acceso)",
  "Sensibilización sobre la importancia de uso de epp's",
  "Solicitar instalación de tope de puerta",
  "Reunión con el cliente para validar el mantenimiento del porton",
  "Reunión con el cliente (escalera tipo gato)",
  "Inspección de seguridad y levantamiento de matriz de peligros",
  "Actualizacion de la matriz de peligros y riegsos",
  "Gestion entrega de caja de tapabocas n95 al cdo",
  "Auditoria, inspecciones y entrega de kit de sueño",
  "Charla sobre identificación de riesgo publico en sector salud",
  "Inspección de seguridad y matriz de peligros",
  "Actualización matriz de peligros",
  "Reglas de oro",
  "Reglas de oro - ronda segura - como reportar un at",
  "Rotulación e identificación de productos quimicos (sga)",
  "Orden y aseo",
  "Reglas de oro - decalogo ronda segura - como reportar un at",
  "Auditoria vial, actualización en el pesv",
  "Diseño y divulgación de protocolo de actuación (prevención agresiones)",
  "Reforzar el procedimiento de ascenso y cambios de ocupacion",
  "Incluir en el pesv",
  "Auditoria de moto",
  "Induccion sobre el pesv",
  "Incluir al en auxilio de trasporte la motocicleta",
  "Señalización inadecuada",
  "Campaña de cudiado de mano",
  "Soporte del ultimo mantenimiento de la patineta scooter",
  "Informe de inspección de motocicleta y seguimiento de mantenimientos",
];

const OPCIONES_PLAN_MEDIO = [...OPCIONES_PLAN_FUENTE];

const OPCIONES_PLAN_INDIVIDUO = [
  "Socialización lección aprendida",
  "Re induccion de roles, funciones y responsabilidades",
  "Capacitacion de riesgos y peligros en la via",
  "Diseño y socialización de lección aprendida",
  "Diseño y socializacion de leccion aprendida",
  "Re inducción al cargo y funciones mos",
  "Socializar y divulgar la realización de pausas activas",
  "Divulgación matriz de riesgo",
  "Capacitación inteligencia emocioinal",
  "Refuerzo en atención al cliente",
  "Asegurar que todo el personal realice inducción tecnica",
  "Capacitación en la retroalimentación al cumplimiento de normatividad transito",
  "Capacitación en riesgo público enfocado a conductas agresivas",
  "Entrega de folletos enfocados a riesgo público prevención",
  "Capacitación percepción de autocuidado (riesgo locativo)",
  "Entrega de folletos prevención de caídas",
  "Sensibilización en riesgos peligros (locativo)",
  "Capacitación conceptos basicos sst",
  "Capacitación enfocada al concepto, alcances y reporte de at",
  "Capacitación prevención de accidentes de trabajo",
  "Socializacion del riesgo mecanico",
  "Sensibiización identificación de peligros (biologico)",
  "Capacitacion condiciones inseguras en la vía",
  "Capacitacion decalogo de ronda segura",
  "Refuerzo ronda segura",
  "Charla en manejo seguro de puertas y portones",
  "Refuerzo en prácticas viales",
  "Sensibilización condición de seguridad riesgo locativo",
  "Realizar socialización del incidente con todo el personal",
  "Divulgación de medidas preventivas sobre riesgo publico",
  "Retroalimetación en funciones y consignas del puesto",
  "Capacitación de riesgo publico y uso de la fuerza",
  "Socialización manual de funciones",
  "Capacitación manipulación manual de cargas",
  "Capacitación en autocuidado",
  "Divulgación guia enfocada en posturas adeacuda",
  "Manipulación segura de liquidos calientes en oficina",
  "Actualización y divulgación de manual de funciones",
  "Reporte de actos y condiciones inseguras",
  "Reforzar con el trabajador el analisis de riesgos",
  "Charla de seguridad enfocada al riesgo biologico",
  "Campaña paso seguro",
  "Actualización matriz de riesgo",
  "Compartir videos - subir y bajar escaleras de forma segura",
  "Campaña seguridad vial (uso adecuado de cascos)",
  "Kit de sueño",
  "Video fijate bien donde miras",
  "Retroalimentación en uso seguro de escaleras",
  "Socialización de estandar de seguridad de rejas, puertas y portones",
  "Capacitación uso seguro de patineta",
  "Prevencion del riesgo publico",
  "Acompañamiento psicosocial",
  "Programa te acompaño - consultas psicologia",
  "Suministrar monogafas de seguridad",
  "Refuerzo del manual de uso y manipulación seguro de armas",
  "Refuerzo de calogo de armas",
  "Capacitacion escuala de conductores 11 modulos",
  "Capacitacion atencion en la via - peligros y riesgos viales",
  "Reinduccion en las consignas especificas del puesto",
  "Retroalimentación situaciones de riesgo público",
  "Refuerzo en el manejo y el uso correcto de la fuerza",
  "Capacitación manejo de cargas e higiene postural",
  "Refuerzo de plan de comunicación para evitar accidentes de transito",
  "Refuerzo de infografia decalogo de seguridad vial",
  "Auditoria trimestral de motocicleta",
  "Prueba teorica de conductores",
  "Curso de manejo defensivo moto",
  "Preoperacional de patinetas",
  "Se le indica la importancia de usar sus epp todo el tiempo",
  "Capacitación de peligros y riesgos",
  "Capacitaciòn en derechos y deberes de los empleados",
  "Capacitaciòn adecuada sobre ergonomia y lesiones",
  "Sensibilización riesgos y peligros",
  "Charla en riesgo publico y manejos de situaciones conflictivas",
  "Capacitación manipulacion correcta de carga",
  "Capacitacion de trabajo en equipo",
  "Capacitación sobre identificación de peligros y manejo de exceso de confianza",
  "Sensibiización identificación de riesgo publico",
  "Peatón seguro, medidas de seguridad vial",
  "Capacitación autocuidado y percepción del riesgo",
  "Socializar con el personal el decalogo de ronda segura",
  "Capacitacion manejo de herramientas manuales y uso de epp",
  "Infografia actos y condiciones inseguras",
  "Capacitar - autocuidado - y sobresfuerzo e higiene postural",
  "Capacitar el personal en procedimiento seguro para subir y bajar escaleras",
  "Socialización de procedimiento seguro para para subir y bajar escaleras",
  "Capacitar al personal en la identificaciòn de peligros (parqueadero)",
  "Divulgación de procedimiento seguro para la prevencion de caídas en escaleras",
  "Socializacion en seguridad vial-factores de riesgo",
  "Se reune al personal y se retroalimenta sobre el acto inseguro",
  "Se realiza charla de seguridad caida de objetos y autocuidado",
  "Entregar en proxima dotacion lentes de seguridad",
  "Divulgación de lesión aprendida- lesión ocular",
  "Campaña de levantamiento uso adecuado de los elementos de protección personal",
  "Sensibilización y autonomía de uso de las gafas",
  "Reinducción de las actividades",
  "Socialización de ats de la actividad de conteo",
  "Socialización de paso de la actividad de registro fotografico",
  "Socialización de medidas de seguridad sobre la actividad",
  "Se le indica al tecnico orden y aseo",
  "Se suspende la actividad y se le realiza la retroalimentacion",
  "Uso de guantes de seguridad",
  "Charla de prevencion de cuidado de los ojos (remota)",
  "Capacitación enfocada en el desplazamiento seguro durante las rondas",
  "Reforzar el mecanismo para el reporte y participación",
  "Socializacion del decalogo del peaton en patios (remota)",
  "Socialización dde la matriz de riesgo al dispositivo",
  "Diseño y socializaciónn lección aprendida manejo de puertas",
  "Sensibilización reporte oportuno de condiciones inseguras, higiene postural",
  "Socialización estándar manipulación segura de puertas, rejas y portones",
  "Infográfica cuidados caninos y felinos",
  "Socializar y firmar acta de compromiso (no contacto caninos)",
  "Sensibilizacion sobre identificacion de peligros en planta postobon",
  "Flayer seguridad vial - riesgos en la via",
  "Induccion de seguridad y salud en el trabajo",
  "Instruccion y capacitacion sobre uso de escopetas",
  "Socialización de medidas enfermedades derivadas de mordedura por caninos",
  "Sensibilización decalogo de armas",
  "Cambio de chaleco",
  "Sensibilización riesgo locativo",
  "Refuerzo campaña pasos seguros",
  "Capacitación en deberes y obligaciones del trabajador",
  "Cambio de puesto por seguridad",
  "Sensibilización manejo de emociones",
  "Curso de manejo defensivo",
  "Falyer reporte de actos y condiciones",
  "Retroalimentacion de ats patrullaje de mar",
  "Divulgación de lección aprendida - riesgo locativo",
  "Proceso disciplinario",
  "Dotar nuevamente el puesto con el arma y la munición",
  "Divulgacion de medidas de prevencion de riesgo biologico (insectos)",
  "Socializacion del decálogo de subir y bajar escaleras",
  "Realizar reinducción del puesto de trabaj",
  "Capacitar al personal sobre riesgios químicos (gases refrigerantes)",
  "Entrega de elementos de proteccion personal",
  "Implementar campaña del decalogo de la ronda segura",
  "Se realiza retroalimentación del uso de los epps y trabajo seguro en andamio",
  "Llamado de atención por parte de jefe inmediato",
  "Se retroalimenta al trabajador en reporte de condiciones inseguras",
  "Se realiza retroalimentacion al trabajador para reporte con encargado",
  "Se le indica la importacia de trabajar siempre acompañado",
  "Reinduccion de puesto de trabajo operativa y de sst",
  "Divulgación y refuerzo tema decálogo de arma de letalidad",
  "Socializar ats para la tarea",
  "Socializaciónn lección aprendida (accidente en la via)",
  "Sensibilización seguridad vial",
  "Reentrenamiento escuela de conductores",
  "Diseño y socializaciónn lección aprendida - riesgo mecánico proyección",
  "Sensibilización autocuidado, actos inseguros",
  "Diseño y socializaciónn lección aprendida accidentes en la vía",
  "Sensibilización manejo defensivo",
  "Capacitacion en riesgos de seguridad vial en peatones",
  "Sensibilización a despachos y jefes imediatos",
  "Brindar asesoria de programa te acompaño",
  "Divulgación de lección aprendida - estandar de seguridad para rejas",
  "Implementación y socialización de ats",
  "Capacitacion de identificacion de peligros a nivel operativo",
  "Socializacion del riesgo locativo",
  "Socializacion en estandar seguro de bajar y subir escaleras",
  "Sensibilizacion de medidas preventivas en entornos reducidos",
  "Sensibilizacion en hoja de seguridad de quimico",
  "Socialización de picaduras de insectos",
  "Realizar procesos disciplinarios al personal",
  "Capacitacion en manejo de emociones con usuarios",
  "Socialización de estándar de reja, portones, persianas",
  "Retroalimentación en la realización de preoperacional",
  "Retroalimentación en seguridad vial",
  "Retroalimentación decalogo en subir y bajar escaleras",
  "Capacitacion en caidas a desnivel",
  "Se capacita al personal en el uso de hojas de datos de seguridad",
  "Recordatorio de epp completos",
  "Se baja el tecnico y se da aviso al cliente (avispas)",
  "Se realiza llamado de atencion verbal (escaleras)",
  "Se solicita a tecnico que recoja elementos (orden y aseo)",
  "Se solicita y recomienda a tecnico que no consuma alimentos",
  "Solicita al cliente retroalimentación y severidad en politicas",
  "Retroalimentación importancia de autocuidado",
  "Retroalimentación importancia de entornos de vida saludable",
  "Gestion administrativa de recordatorio de funciones",
  "Recordatorio de procedimientos e instrucciones operativas",
  "Sensibilización transito peatonal en escaleras, pasillos y corredores",
  "Diseño lección aprendida - prevencion y atencion por ataque o mordeudras",
  "Socialización de video educativo: prevención de caídas a nivel",
  "Realización de campaña camino seguro",
  "Charla sobre decalogo de ronda segura - analisis de peligros",
  "Charla en manejo de crisis",
  "Charla de atencion al cliente",
  "Capacitar al personal sobre los pasos seguros (carros de compras)",
  "Auditorial via",
  "Realizar los modulos - pesv",
  "Rutograma actualizado",
  "Inducción operativa a todo el personal",
  "Capacitación de medidas de prevención ante los semovientes",
  "Asegurar preoperacionales de patinetas",
  "Capacitación sobre el uso adecuado de patinetas scooter",
  "Diseño y socializaciónn lección aprendida herida en parpado",
  "Realizar capacitación de autocuidado en la operación",
  "Realizar campañas de informacion a los usuarios",
  "Reforzar tecnicas de comunicación para abordar situaciones agresivas",
  "Revision por fisioterapia",
  "Retroalimentacion de decalogo de apertura y cierre de cortina metalica",
  "Capacitación de autocuidado laboral y seguridad locativa en rondas",
  "Diseño y socialización lección aprendida riesgo mecánico proyección",
  "Reinducción en consignas y manual operativo de seguridad",
  "Sensibilziacion en riesgos viales",
  "Solicitud de requerimiento de entrega gafas de seguridad",
  "Capacitación enfocada en el reporte de accidentes e incidentes",
  "Soporte de evidencia de entrega de gafas de seguridad",
  "Reunión con el cliente para validar mejor orden (guacales)",
  "No uso de patinetas en condiciones climaticas lluvia",
  "Capacitación de uso obligatorio de elementos de protección personal",
  "Refuerzo de divulgación del manual de funciones",
  "Capacitar al personal en técnicas seguras de caída",
  "Orientacion psicologica por parte de personal especializado",
  "Reevaluación de riesgo y actualización de matriz de peligros",
  "Reubicaciòn de puesto",
  "Retroalimentacion en preoperacional de moto",
  "Campaña cuidado de manos",
  "Capacitación en riesgos y controles de la tarea",
  "Verificar entrega de dotación (botas)",
  "Socializar con el cliente la falta de luminaria en la zona",
  "Entrega de bastones para desplazamientos",
  "Prohibición de alimentar, alzar los animales del entorno",
  "Reunión con el cliente (administradora) rejilla faltante",
  "Charla en linea de fuego",
  "Divulgación de medidas preventivas para la operación segura de bicicletas",
  "Retralimentacion 12 reglas de oro",
  "No uso de disctractores en la realizaciòn de su labor",
  "Capacitacion sobre inspeccion de herramientas y cuidado de manos",
  "Capacitación en riesgo bilogico-mordedura de caninos",
  "Capacitar al personal sobre el riesgo publico, legitima defensa",
  "Sensibilizacion en decalogo de peatones",
  "Socialización y retroalimentación de campaña puertas y portones",
  "Capacitacion sobre el uso de bicicletas en rondas de seguridad",
  "Sensibilizacion en ronda segura",
  "Sensibilización de riesgos en parqueaderos",
  "Capacitación en riesgo publico",
  "Refuerzo manejo seguro de escopeta",
  "Realizar consignas de puesto",
  "Divulgación al personal en técnicas seguras para el conteo en camiones",
  "Verificaciòn de consignas particulares (mos)",
  "Inpecciòn de epp de acuerdo al riesgo",
  "Definir uso de casco obligatorio en zona de cargue y descargue",
  "Divulgación sobre el uso seguro de persianas",
  "Capacitacion en actos y condiciones inseguras",
  "Charla en uso adecuado de escaleras",
  "Socializacion riesgo locativo",
  "Cambio de zapatos de dotación",
  "Levantamiento y divulgación de la lección aprendida",
  "Instalación de qr a puertas del cliente",
  "Capacitar al oficial de riesgo público",
  "Ronda segura y sensibilización a riesgos publicos",
  "Sensibilizacion en identificacion de peligros y riesgo",
  "Se baja inmediatamente y se le indica la importancia de trabajar adecuada con las escaleras",
  "Se coordina con el personal proteger con plastico los escritorios",
  "Suminitro de epp respiratorio",
  "Sensibilizacion prevencion de picadura de avispas en moto",
  "Implementar pausas activas y calentamiento",
  "Sensibilizacion en estilos de vida saludable y autocuidado",
  "Divulgacion de reglas de oro e identificacion de peligros y riesgos",
  "Capacitacion en como actuar en una emergencia",
  "Divulgación de lección aprendida enfocada en autocuidado (puertas vehiculos)",
  "Actividad ludica de prevención de accidentes",
  "Cultura de comportamiento seguro - capacitación psicosocial",
  "Retroalimentar y reforzar en la percepción del riesgo",
  "Socializar al trabajador las campañas establecidas",
  "Reforzar sobre procedimiento de reportes de condiciones y actos inseguros",
  "Capacitacion en servicio al cliente (inteligencia emocional)",
  "Recorrido por las instalaciones del cliente (identificar condiciones)",
  "Socialización de reporte de condiciones de salud",
  "Capacitación prevención y seguridad en parqueaderos",
  "Retroalimentación en identificación de condiciones inseguras",
  "Capacitación sobre uso de escopetas",
  "Socialización con el cliente sobre posibles medidas de intervención",
  "Capacitación de medidas de autocuidado en terrenos irregulares",
  "Capacitación en riesgo locativo",
  "Capacitación en prevención vial, enfocada al entorno vial",
  "Capacitación refuerzo normatividad y señalización",
  "Documentar y divulgar lección aprendida - enfoque riesgo público",
  "Divulgación de lección aprendida enfocada en riesgo biológico",
  "Capacitación en prevención de incidentes y accidentes de trabajo",
  "Sensibilizacion en tecnicas de levantamiento y manipulacion de cargas",
  "Capácitar a los nuevos escoltas (escuela de conductores)",
  "Capacitación prevención de accidentes - riesgo psicosocial",
  "Se le indica la importancia de mantener el área señalizada",
  "Trabajador no hace uso del casco de seguridad",
  "Reinduccion operativa",
  "Charla conduccion segura",
  "Capacitar a los ods lider (plan de inducción)",
  "Actualización de auditorias viales",
  "Asegurar preoperacional de motocicletas",
  "Capacitación de prevención de accidentes y normas de seguridad vial",
];

const LISTA_MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const ReporteAccidente = () => {
  const [mode, setMode] = useState("list");
  const [currentId, setCurrentId] = useState(null);
  const [records, setRecords] = useState(dataAT);

  // --- Estado para paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [listFilters, setListFilters] = useState({
    id: "",
    anio: "",
    mes: "",
    regional: "",
    esHpi: "",
    estado: "",
  });

  // Refrescar datos al cambiar de modo
  useEffect(() => {
    setRecords([...dataAT]);
  }, [mode]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [listFilters]);

  const initialForm = {
    lineaNegocio: "",
    ciudad: "",
    departamento: "",
    regional: "",
    sectorGes: "",
    puestoArmado: "NO",
    cliente: "",
    unidadNegocio: "",
    cc: "",
    apellidosNombres: "",
    cargo: "",
    escolaridad: "",
    rangoEdad: "",
    genero: "",
    fechaAccidente: "",
    horaAT: "",
    diaSemana: "",
    mes: "",
    descripcion: "",
    diasIncapacidad: 0,
    prorroga1: 0,
    prorroga2: 0,
    totalDias: 0,
    esHpi: "NO",
    detalleHpi: [],
    // Campos de Tránsito
    esTransito: "NO",
    vehiculoInvolucrado: "",
    causanteAT: "",
    actorVial: "",
    tareaVia: "",
    lugarEventoVial: "",
    // Fin campos tránsito
    tipoAccidente: "",
    clasificacionNivel: "",
    sitioAccidente: "",
    tipoLesion: "",
    parteCuerpo: "",
    agenteAccidente: "",
    mecanismoForma: "",
    clasificacionPeligro: "",
    estadoInvestigacion: "",
    fechaPrevistaInv: "",
    fechaInvestigacion: "",
    factoresPersonales: "",
    factoresTrabajo: "",
    fechaCierre: "",
    estandaresSeguros: "", // CAMBIO: Inicializado como string para Select
    causasRiesgosas: "", // CAMBIO: Inicializado como string para Select
    condicionesAmbientales: "", // CAMBIO: Inicializado como string para Select
    planFuente: "",
    planMedio: "",
    planIndividuo: "",
    estado: "Pendiente",
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const total =
      Number(formData.diasIncapacidad) +
      Number(formData.prorroga1) +
      Number(formData.prorroga2);
    setFormData((prev) => ({ ...prev, totalDias: total }));
  }, [formData.diasIncapacidad, formData.prorroga1, formData.prorroga2]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "departamento") {
      setFormData({ ...formData, departamento: value, ciudad: "" });
    } else if (name === "tipoAccidente") {
      const isTransit = value === "Tránsito";
      const esTransito = isTransit ? "SI" : "NO";
      setFormData({
        ...formData,
        [name]: value,
        esTransito: esTransito,
        // Limpiamos campos si deja de ser tránsito
        vehiculoInvolucrado: isTransit ? formData.vehiculoInvolucrado : "",
        causanteAT: isTransit ? formData.causanteAT : "",
        actorVial: isTransit ? formData.actorVial : "",
        tareaVia: isTransit ? formData.tareaVia : "",
        lugarEventoVial: isTransit ? formData.lugarEventoVial : "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleListFilterChange = (e) => {
    const { name, value } = e.target;
    setListFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleHpiSelection = (categoria, opcion) => {
    setFormData((prev) => {
      // Asegurarnos que sea array
      const currentSelections = Array.isArray(prev.detalleHpi)
        ? prev.detalleHpi
        : [];
      let newSelections = [...currentSelections];

      // Si la categoría es "Ataque", permitimos múltiples
      if (categoria === "Ataque") {
        if (newSelections.includes(opcion)) {
          newSelections = newSelections.filter((item) => item !== opcion);
        } else {
          newSelections.push(opcion);
        }
      } else {
        // Para las demás categorías, son excluyentes (comportamiento Radio button dentro del grupo)
        const opcionesDeEstaCategoria = CATEGORIAS_HPI[categoria];
        newSelections = newSelections.filter(
          (item) => !opcionesDeEstaCategoria.includes(item)
        );

        const estabaSeleccionada = currentSelections.includes(opcion);
        if (!estabaSeleccionada) {
          newSelections.push(opcion);
        }
      }

      return { ...prev, detalleHpi: newSelections };
    });
  };

  const handleMultiCheck = (field, value) => {
    setFormData((prev) => {
      const currentArray = prev[field] || [];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [field]: currentArray.filter((item) => item !== value),
        };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  const handleExport = (format) => {
    const idFile = formData.id || "temp";
    const fileName = `Reporte_AT_${idFile}_${new Date()
      .toISOString()
      .slice(0, 10)}`;
    const ext = format === "Excel" ? "xlsx" : "pdf";
    alert(
      `⏳ Iniciando exportación a ${format}...\nPreparando datos del registro #${idFile}.`
    );
    setTimeout(() => {
      alert(
        `✅ ¡Exportación Exitosa!\n\nEl archivo se ha descargado correctamente en:\nC:/Usuarios/Descargas/${fileName}.${ext}`
      );
    }, 1500);
  };

  const handleSave = () => {
    if (
      !formData.fechaAccidente ||
      !formData.regional ||
      !formData.tipoAccidente
    ) {
      alert("Por favor complete al menos Fecha, Regional y Tipo de Accidente");
      return;
    }
    const dateObj = new Date(formData.fechaAccidente);
    const newRecord = {
      ...formData,
      id: mode === "edit" ? currentId : Date.now().toString(),
      anio: dateObj.getFullYear(),
      mes: LISTA_MESES[dateObj.getMonth()] || formData.mes,
    };

    if (
      formData.clasificacionNivel === "Fatal" ||
      formData.esHpi === "SI" ||
      formData.clasificacionNivel === "AT Grave"
    ) {
      alert(
        `⚠️ ALERTA DE SEGURIDAD GENERADA ⚠️\n\nEl evento ha sido clasificado como CRÍTICO.`
      );
    }

    if (mode === "edit") {
      updateRecord(newRecord);
      alert("Registro actualizado exitosamente.");
    } else {
      addNewRecord(newRecord);
      alert("Registro guardado exitosamente.");
    }
    setRecords([...dataAT]);
    setMode("list");
    setFormData(initialForm);
  };




  const handleDeleteLocal = (id) => {
    if (
      window.confirm(
        "¿Está seguro que desea eliminar este registro de accidentalidad?\nEsta acción no se puede deshacer."
      )
    ) {
      deleteRecord(id);
      setRecords([...dataAT]);
      alert("Registro eliminado correctamente.");
    }
  };

  const populateForm = (item) => {
    setFormData({
      ...initialForm,
      ...item,
      // CAMBIO: Manejo seguro si la data antigua viene como array
      estandaresSeguros: Array.isArray(item.estandaresSeguros)
        ? item.estandaresSeguros[0] || ""
        : item.estandaresSeguros || "",
      causasRiesgosas: Array.isArray(item.causasRiesgosas)
        ? item.causasRiesgosas[0] || ""
        : item.causasRiesgosas || "",
      condicionesAmbientales: Array.isArray(item.condicionesAmbientales)
        ? item.condicionesAmbientales[0] || ""
        : item.condicionesAmbientales || "",
      detalleHpi: Array.isArray(item.detalleHpi)
        ? item.detalleHpi
        : item.detalleHpi
          ? [item.detalleHpi]
          : [],
      esHpi: item.esHpi || "NO",
      esTransito: item.esTransito || "NO",
    });
  };

  // --- FILTRADO ---
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const itemAnio = item.anio ? item.anio.toString() : "";
      const matchId =
        listFilters.id === "" ||
        (item.id && item.id.toString().includes(listFilters.id));
      const matchAnio =
        listFilters.anio === "" || itemAnio === listFilters.anio;
      const matchMes = listFilters.mes === "" || item.mes === listFilters.mes;
      const matchRegional =
        listFilters.regional === "" || item.regional === listFilters.regional;
      const matchHpi =
        listFilters.esHpi === "" || item.esHpi === listFilters.esHpi;
      const matchEstado =
        listFilters.estado === "" || item.estado === listFilters.estado;
      return (
        matchId &&
        matchAnio &&
        matchMes &&
        matchRegional &&
        matchHpi &&
        matchEstado
      );
    });
  }, [records, listFilters]);

  // --- LÓGICA DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // --- ESTILOS ---
  const formContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px 20px",
    alignItems: "end",
  };
  const inputStyle = {
    width: "100%",
    height: "38px",
    padding: "6px 10px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  };
  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontWeight: "500",
    fontSize: "0.9em",
    color: "#333",
  };
  const sectionHeaderStyle = {
    gridColumn: "1 / -1",
    background: "#f0f0f0",
    padding: "8px",
    borderLeft: "5px solid #CD1920",
    marginTop: "20px",
    fontWeight: "bold",
    color: "#CD1920",
  };

  // --- RENDER FORM ---
  const renderForm = () => {
    const isViewMode = mode === "view";
    const fieldsDisabled = isViewMode;

    return (
      <div
        className="card"
        style={{ maxWidth: "100%", margin: "0 auto", padding: "20px" }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
            borderBottom: "4px solid #CD1920",
            paddingBottom: "15px",
          }}
        >
          <h2
            style={{
              margin: "8px 0 0 0",
              color: "#CD1920",
              fontSize: "1.4em",
              textTransform: "uppercase",
            }}
          >
            INFORME DE ACCIDENTE DE TRABAJO
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, color: "#666" }}>
            {mode === "create"
              ? "» Nuevo Registro"
              : mode === "edit"
                ? "» Editar Registro"
                : "» Detalle del Registro"}
          </h3>
          <button
            onClick={() => {
              setMode("list");
              setFormData(initialForm);
            }}
            className="btn-g4s"
            style={{ background: "#666" }}
          >
            Volver a la Lista
          </button>
        </div>

        <form style={formContainerStyle}>
          {(mode === "edit" || mode === "view") && (
            <div
              style={{
                gridColumn: "1 / -1",
                background: "#ffebee",
                padding: "10px",
                border: "1px solid #CD1920",
                marginBottom: "10px",
              }}
            >
              <label
                style={{
                  fontWeight: "bold",
                  color: "#CD1920",
                  marginRight: "10px",
                }}
              >
                ESTADO DEL REGISTRO:
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={isViewMode}
                style={{ ...inputStyle, width: "200px" }}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Objetado ARL">Objetado ARL</option>
                <option value="Rechazado G4S">Rechazado G4S</option>
              </select>
            </div>
          )}

          <div style={{ ...sectionHeaderStyle, marginTop: "0" }}>
            1. Generalidades
          </div>

          <div>
            <label style={labelStyle}>ID Registro</label>
            <input
              name="id"
              value={formData.id || ""}
              readOnly
              disabled={fieldsDisabled}
              style={{ ...inputStyle, background: "#f0f0f0" }}
            />
          </div>

          <div>
            <label style={labelStyle}>Línea de Negocio</label>
            <select
              name="lineaNegocio"
              value={formData.lineaNegocio}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {["SECURE", "RISK", "TECHNOLOGY", "INFOTEC"].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Regional</label>
            <select
              name="regional"
              value={formData.regional}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Seleccione...</option>
              {OPCIONES_REGIONAL.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Departamento</label>
            <select
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {Object.keys(DEPARTAMENTOS_COLOMBIA)
                .sort()
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <select
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              disabled={fieldsDisabled || !formData.departamento}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {(DEPARTAMENTOS_COLOMBIA[formData.departamento] || []).map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sector (GES)</label>
            <input
              name="sectorGes"
              value={formData.sectorGes}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Puesto Armado</label>
            <select
              name="puestoArmado"
              value={formData.puestoArmado}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="NO">NO</option>
              <option value="SI">SI</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Cliente</label>
            <input
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Unidad de Negocio</label>
            <input
              name="unidadNegocio"
              value={formData.unidadNegocio}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>

          <div style={sectionHeaderStyle}>2. Datos del Colaborador</div>
          <div>
            <label style={labelStyle}>Cédula (CC)</label>
            <input
              name="cc"
              value={formData.cc}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Apellidos y Nombres</label>
            <input
              name="apellidosNombres"
              value={formData.apellidosNombres}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Cargo</label>
            <input
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Escolaridad</label>
            <input
              name="escolaridad"
              value={formData.escolaridad}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Edad</label>
            <input
              name="rangoEdad"
              value={formData.rangoEdad}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Género</label>
            <input
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>

          <div style={sectionHeaderStyle}>3. Tiempo e Incapacidad</div>
          <div>
            <label style={labelStyle}>Fecha Accidente</label>
            <input
              type="date"
              name="fechaAccidente"
              value={formData.fechaAccidente}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hora</label>
            <input
              type="time"
              name="horaAT"
              value={formData.horaAT}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Día Semana</label>
            <input
              name="diaSemana"
              value={formData.diaSemana}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Mes</label>
            <input
              name="mes"
              value={formData.mes}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Días Incap.</label>
            <input
              type="number"
              name="diasIncapacidad"
              value={formData.diasIncapacidad}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Prórroga 1</label>
            <input
              type="number"
              name="prorroga1"
              value={formData.prorroga1}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Prórroga 2</label>
            <input
              type="number"
              name="prorroga2"
              value={formData.prorroga2}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Total Días</label>
            <input
              value={formData.totalDias}
              readOnly
              style={{
                ...inputStyle,
                fontWeight: "bold",
                background: "#f9f9f9",
              }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Descripción del Evento</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              disabled={fieldsDisabled}
              rows="2"
              style={{ ...inputStyle, height: "auto", minHeight: "60px" }}
            />
          </div>

          <div
            style={{
              gridColumn: "1 / -1",
              background: "#fff3cd",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ffcc00",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <label style={{ fontWeight: "bold", fontSize: "0.9em" }}>
                ¿APLICA HPI?
              </label>
              <select
                name="esHpi"
                value={formData.esHpi}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value === "NO")
                    setFormData((prev) => ({
                      ...prev,
                      esHpi: "NO",
                      detalleHpi: [],
                    }));
                }}
                disabled={fieldsDisabled}
                style={{ padding: "2px" }}
              >
                <option value="NO">NO</option>
                <option value="SI">SI</option>
              </select>
            </div>
            {formData.esHpi === "SI" && (
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                {Object.entries(CATEGORIAS_HPI).map(([categoria, opciones]) => (
                  <div
                    key={categoria}
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      padding: "10px",
                      background: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 10px 0",
                        color: "#CD1920",
                        fontSize: "0.95em",
                        borderBottom: "1px solid #ccc",
                        paddingBottom: "4px",
                      }}
                    >
                      {categoria}{" "}
                      {categoria === "Ataque"
                        ? "(Selección Múltiple)"
                        : "(Selección Única)"}
                    </h4>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "6px",
                      }}
                    >
                      {opciones.map((op) => (
                        <label
                          key={op}
                          style={{
                            display: "flex",
                            gap: "5px",
                            cursor: "pointer",
                            fontSize: "0.85em",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              Array.isArray(formData.detalleHpi) &&
                              formData.detalleHpi.includes(op)
                            }
                            onChange={() => handleHpiSelection(categoria, op)}
                            disabled={fieldsDisabled}
                          />
                          {op}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={sectionHeaderStyle}>4. Clasificación del accidente</div>
          <div>
            <label style={labelStyle}>Tipo Accidente</label>
            <select
              name="tipoAccidente"
              value={formData.tipoAccidente}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {OPCIONES_TIPO_ACCIDENTE.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Nivel AT</label>
            <select
              name="clasificacionNivel"
              value={formData.clasificacionNivel}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {OPCIONES_NIVEL_AT.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sitio</label>
            <select
              name="sitioAccidente"
              value={formData.sitioAccidente}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {OPCIONES_SITIO.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tipo Lesión</label>
            <select
              name="tipoLesion"
              value={formData.tipoLesion}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {OPCIONES_TIPO_LESION.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Parte Cuerpo</label>
            <select
              name="parteCuerpo"
              value={formData.parteCuerpo}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {OPCIONES_PARTE_CUERPO.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Agente</label>
            <select
              name="agenteAccidente"
              value={formData.agenteAccidente}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {OPCIONES_AGENTE.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Mecanismo</label>
            <select
              name="mecanismoForma"
              value={formData.mecanismoForma}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {OPCIONES_MECANISMO.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Peligro</label>
            <select
              name="clasificacionPeligro"
              value={formData.clasificacionPeligro}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {OPCIONES_PELIGRO.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Estado Inv.</label>
            <select
              name="estadoInvestigacion"
              value={formData.estadoInvestigacion}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Sel...</option>
              {OPCIONES_ESTADO_INV.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Fecha Prevista</label>
            <input
              type="date"
              name="fechaPrevistaInv"
              value={formData.fechaPrevistaInv}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Fecha Investigó</label>
            <input
              type="date"
              name="fechaInvestigacion"
              value={formData.fechaInvestigacion}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Fecha Cierre</label>
            <input
              type="date"
              name="fechaCierre"
              value={formData.fechaCierre}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "1 / 3" }}>
            <label style={labelStyle}>Factores Personales</label>
            <input
              name="factoresPersonales"
              value={formData.factoresPersonales}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: "3 / 5" }}>
            <label style={labelStyle}>Factores de Trabajo</label>
            <input
              name="factoresTrabajo"
              value={formData.factoresTrabajo}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            />
          </div>

          {formData.tipoAccidente === "Tránsito" && (
            <div
              style={{
                gridColumn: "1 / -1",
                background: "#e3f2fd",
                padding: "15px",
                borderRadius: "5px",
                border: "1px solid #2196f3",
                marginTop: "10px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  color: "#0d47a1",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  borderBottom: "1px solid #90caf9",
                  paddingBottom: "5px",
                }}
              >
                DETALLES DEL EVENTO VIAL
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div>
                  <label style={labelStyle}>Vehículo involucrado</label>
                  <select
                    name="vehiculoInvolucrado"
                    value={formData.vehiculoInvolucrado}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    style={inputStyle}
                  >
                    <option value="">Seleccione...</option>
                    {OPCIONES_VEHICULO.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Causante del AT</label>
                  <select
                    name="causanteAT"
                    value={formData.causanteAT}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    style={inputStyle}
                  >
                    <option value="">Seleccione...</option>
                    {OPCIONES_CAUSANTE_AT.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Actor accidentado en la vía</label>
                  <select
                    name="actorVial"
                    value={formData.actorVial}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    style={inputStyle}
                  >
                    <option value="">Seleccione...</option>
                    {OPCIONES_ACTOR_VIAL.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Tarea en la vía</label>
                  <select
                    name="tareaVia"
                    value={formData.tareaVia}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    style={inputStyle}
                  >
                    <option value="">Seleccione...</option>
                    {OPCIONES_TAREA_VIA.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Lugar de Evento vial</label>
                  <select
                    name="lugarEventoVial"
                    value={formData.lugarEventoVial}
                    onChange={handleChange}
                    disabled={fieldsDisabled}
                    style={inputStyle}
                  >
                    <option value="">Seleccione...</option>
                    {OPCIONES_LUGAR_VIAL.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* --- SECCIÓN 5 --- */}
          <div style={sectionHeaderStyle}>5. Causas inmediatas</div>
          <div style={{ gridColumn: "1 / 3" }}>
            <label style={labelStyle}>
              Estándares de comportamiento seguro
            </label>
            <select
              name="estandaresSeguros"
              value={formData.estandaresSeguros}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Seleccione...</option>
              {OPCIONES_ESTANDARES.map((op, idx) => (
                <option key={idx} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "3 / 5" }}>
            <label style={labelStyle}>
              Causas de comportamiento riesgoso (Actos)
            </label>
            <select
              name="causasRiesgosas"
              value={formData.causasRiesgosas}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Seleccione...</option>
              {OPCIONES_CAUSAS_RIESGOSAS.map((op, idx) => (
                <option key={idx} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          {/* --- SECCIÓN 6 MODIFICADA: DROPDOWN --- */}
          <div style={sectionHeaderStyle}>6. Condiciones Subestandar</div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>
              Condiciones Ambientales Subestandar
            </label>
            <select
              name="condicionesAmbientales"
              value={formData.condicionesAmbientales}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Seleccione...</option>
              {OPCIONES_CONDICIONES_SUBESTANDAR.map((op, idx) => (
                <option key={idx} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          <div style={sectionHeaderStyle}>7. Plan de Acción</div>
          <div style={{ gridColumn: "1 / 2" }}>
            <label style={labelStyle}>Fuente</label>
            <select
              name="planFuente"
              value={formData.planFuente}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Seleccione...</option>
              {OPCIONES_PLAN_FUENTE.map((op, idx) => (
                <option key={idx} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "2 / 4" }}>
            <label style={labelStyle}>Medio</label>
            <select
              name="planMedio"
              value={formData.planMedio}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Seleccione...</option>
              {OPCIONES_PLAN_MEDIO.map((op, idx) => (
                <option key={idx} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: "4 / 5" }}>
            <label style={labelStyle}>Individuo</label>
            <select
              name="planIndividuo"
              value={formData.planIndividuo}
              onChange={handleChange}
              disabled={fieldsDisabled}
              style={inputStyle}
            >
              <option value="">Seleccione...</option>
              {OPCIONES_PLAN_INDIVIDUO.map((op, idx) => (
                <option key={idx} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "right",
              marginTop: "20px",
              borderTop: "1px solid #ddd",
              paddingTop: "20px",
            }}
          >
            {(mode === "view" || mode === "edit") && (
              <div style={{ display: "inline-block", marginRight: "15px" }}>
                <button
                  type="button"
                  onClick={() => handleExport("PDF")}
                  className="btn-g4s"
                  style={{
                    background: "#d32f2f",
                    color: "white",
                    marginRight: "10px",
                  }}
                >
                  📄 Exportar PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("Excel")}
                  className="btn-g4s"
                  style={{ background: "#2e7d32", color: "white" }}
                >
                  📊 Exportar Excel
                </button>
              </div>
            )}
            {mode === "create" && (
              <button type="button" onClick={handleSave} className="btn-g4s">
                GUARDAR REPORTE
              </button>
            )}
            {mode === "edit" && (
              <button type="button" onClick={handleSave} className="btn-g4s">
                ACTUALIZAR DATOS
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

  // --- RENDER LIST ---
  const renderList = () => (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h3>Gestión de Registros de AT</h3>
        <button
          onClick={() => {
            setMode("create");
            setFormData(initialForm);
          }}
          className="btn-g4s"
        >
          + Crear Nuevo
        </button>
      </div>

      {/* --- FILTROS --- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "10px",
          marginBottom: "15px",
          background: "#eee",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <input
          name="id"
          placeholder="Filtrar por ID"
          value={listFilters.id}
          onChange={handleListFilterChange}
          className="input-g4s"
          style={{ height: "35px" }}
        />
        <select
          name="anio"
          value={listFilters.anio}
          onChange={handleListFilterChange}
          className="input-g4s"
          style={{ height: "35px" }}
        >
          <option value="">Año: Todos</option>
          {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          name="mes"
          value={listFilters.mes}
          onChange={handleListFilterChange}
          className="input-g4s"
          style={{ height: "35px" }}
        >
          <option value="">Mes: Todos</option>
          {LISTA_MESES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          name="regional"
          value={listFilters.regional}
          onChange={handleListFilterChange}
          className="input-g4s"
          style={{ height: "35px" }}
        >
          <option value="">Regional: Todas</option>
          {OPCIONES_REGIONAL.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
        <select
          name="esHpi"
          value={listFilters.esHpi}
          onChange={handleListFilterChange}
          className="input-g4s"
          style={{ height: "35px" }}
        >
          <option value="">HPI: Todos</option>
          <option value="SI">SI</option>
          <option value="NO">NO</option>
        </select>
        <select
          name="estado"
          value={listFilters.estado}
          onChange={handleListFilterChange}
          className="input-g4s"
          style={{ height: "35px" }}
        >
          <option value="">Estado: Todos</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Objetado ARL">Objetado ARL</option>
          <option value="Rechazado G4S">Rechazado G4S</option>
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#333", color: "white" }}>
            <th style={{ padding: "12px" }}>ID</th>
            <th style={{ padding: "12px" }}>Fecha</th>
            <th style={{ padding: "12px" }}>Regional</th>
            <th style={{ padding: "12px" }}>HPI</th>
            <th style={{ padding: "12px" }}>Estado</th>
            <th style={{ padding: "12px" }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.length > 0 ? (
            currentRecords.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "12px" }}>{item.id}</td>
                <td style={{ padding: "12px" }}>{item.fechaAccidente}</td>
                <td style={{ padding: "12px" }}>{item.regional}</td>
                <td style={{ padding: "12px" }}>
                  {item.esHpi === "SI" ? "SI" : "NO"}
                </td>
                <td style={{ padding: "12px" }}>
                  <strong>{item.estado || "-"}</strong>
                </td>
                <td style={{ padding: "12px", display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      setMode("view");
                      setCurrentId(item.id);
                      populateForm(item);
                    }}
                    className="btn-g4s"
                    style={{ background: "#1976D2", padding: "5px 10px" }}
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => {
                      setMode("edit");
                      setCurrentId(item.id);
                      populateForm(item);
                    }}
                    className="btn-g4s"
                    style={{
                      background: "#FFA000",
                      color: "#000",
                      padding: "5px 10px",
                    }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No se encontraron registros.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* --- CONTROLES DE PAGINACIÓN --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
          gap: "15px",
        }}
      >
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          style={{
            padding: "8px 15px",
            backgroundColor: currentPage === 1 ? "#ccc" : "#CD1920",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          ⬅ Anterior
        </button>

        <span style={{ fontWeight: "bold", color: "#333" }}>
          Página {currentPage} de {totalPages || 1}
        </span>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages || totalPages === 0}
          style={{
            padding: "8px 15px",
            backgroundColor:
              currentPage === totalPages || totalPages === 0
                ? "#ccc"
                : "#CD1920",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor:
              currentPage === totalPages || totalPages === 0
                ? "not-allowed"
                : "pointer",
          }}
        >
          Siguiente ➡
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "20px", background: "#f4f4f4", minHeight: "100vh" }}>
      {mode === "list" ? renderList() : renderForm()}
      <style>{`
        .btn-g4s { background: #CD1920; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .input-g4s { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; }
      `}</style>
    </div>
  );
};

export default ReporteAccidente;
