// test-db-flow.mjs — Simula el flujo completo de la app

import "fake-indexeddb/auto";

// === Cargar el módulo db.js directamente ===
const DB_NAME = "ColsanitasDB_v3";
const DB_VERSION = 1;

let dbInstance = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) { resolve(dbInstance); return; }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("accidentes")) db.createObjectStore("accidentes", { autoIncrement: true });
            if (!db.objectStoreNames.contains("enfermedades")) db.createObjectStore("enfermedades", { autoIncrement: true });
        };
        req.onsuccess = () => { dbInstance = req.result; resolve(dbInstance); };
        req.onerror = () => reject(req.error);
    });
}

async function saveToDB(storeName, records) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        store.clear();
        for (const record of records) { store.add(record); }
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

async function getAllFromDB(storeName) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
    });
}

// === SIMULACIÓN DEL FLUJO ===

async function runTests() {
    console.log("=== TEST 1: Crear base de datos ===");
    const db = await openDB();
    console.log("✅ DB abierta. Stores:", Array.from(db.objectStoreNames));

    console.log("\n=== TEST 2: Guardar datos AT (simula CargaMasiva) ===");
    const fakeATRecords = [];
    for (let i = 0; i < 100; i++) {
        fakeATRecords.push({
            id: Date.now() + i,
            radicado: `RAD-${i}`,
            empresa: `EMPRESA-${i % 5}`,
            departamento: ["ANTIOQUIA", "CUNDINAMARCA", "VALLE DEL CAUCA", "BOGOTA", "SANTANDER"][i % 5],
            ciudad: ["MEDELLÍN", "BOGOTÁ D.C.", "CALI", "BOGOTA", "BUCARAMANGA"][i % 5],
            parteCuerpo: ["Mano", "Pie", "Espalda", "Cabeza", "Rodilla"][i % 5],
            mecanismo: ["Caída", "Golpe", "Atrapamiento"][i % 3],
            severidad: ["Leve", "Grave", "Fatal"][i % 3],
            genero: ["Masculino", "Femenino"][i % 2],
            anio: "2025",
            mes: "ENERO",
            cedula: `CC-${1000000 + i}`,
            apellidosNombres: `Trabajador ${i}`,
            estadoCaso: "Abierto",
            diasIncapacidad: i % 30,
        });
    }

    await saveToDB("accidentes", fakeATRecords);
    console.log(`✅ ${fakeATRecords.length} registros AT guardados`);

    console.log("\n=== TEST 3: Guardar datos EL (simula CargaMasiva EL) ===");
    const fakeELRecords = [];
    for (let i = 0; i < 50; i++) {
        fakeELRecords.push({
            id: Date.now() + 10000 + i,
            radicado: `EL-RAD-${i}`,
            empresa: `EMPRESA-${i % 3}`,
            departamento: ["ANTIOQUIA", "CUNDINAMARCA", "BOGOTA"][i % 3],
            nombreCompleto: `Paciente EL ${i}`,
            cie10: `M${50 + i}`,
            severidad: ["Leve", "Moderado", "Severo"][i % 3],
            estadoDisplay: "Abierto",
        });
    }

    await saveToDB("enfermedades", fakeELRecords);
    console.log(`✅ ${fakeELRecords.length} registros EL guardados`);

    console.log("\n=== TEST 4: Leer AT después de guardar EL (CRÍTICO) ===");
    const readAT = await getAllFromDB("accidentes");
    console.log(`📥 AT leídos: ${readAT.length} (esperado: ${fakeATRecords.length})`);

    if (readAT.length > 0) {
        const sample = readAT[0];
        console.log("  Campos:", Object.keys(sample).length);
        console.log("  departamento:", sample.departamento);
        console.log("  parteCuerpo:", sample.parteCuerpo);
        console.log("  empresa:", sample.empresa);
        console.log("  severidad:", sample.severidad);
    }

    console.log("\n=== TEST 5: Leer EL ===");
    const readEL = await getAllFromDB("enfermedades");
    console.log(`📥 EL leídos: ${readEL.length} (esperado: ${fakeELRecords.length})`);

    if (readEL.length > 0) {
        const sample = readEL[0];
        console.log("  Campos:", Object.keys(sample).length);
        console.log("  empresa:", sample.empresa);
        console.log("  nombreCompleto:", sample.nombreCompleto);
    }

    console.log("\n=== TEST 6: Simular REFRESH (nueva conexión) ===");
    // Cerrar conexión y resetear singleton
    dbInstance.close();
    dbInstance = null;

    // Volver a abrir y leer
    const readAT2 = await getAllFromDB("accidentes");
    const readEL2 = await getAllFromDB("enfermedades");

    console.log(`📥 Post-refresh AT: ${readAT2.length} (esperado: ${fakeATRecords.length})`);
    console.log(`📥 Post-refresh EL: ${readEL2.length} (esperado: ${fakeELRecords.length})`);

    if (readAT2.length > 0) {
        console.log("  AT[0] departamento:", readAT2[0].departamento);
        console.log("  AT[0] parteCuerpo:", readAT2[0].parteCuerpo);
    }

    console.log("\n=== RESULTADOS ===");
    const allPass = readAT.length === 100 && readEL.length === 50 && readAT2.length === 100 && readEL2.length === 50;

    if (allPass) {
        console.log("✅ TODOS LOS TESTS PASARON");
        console.log("   El código de db.js funciona correctamente.");
        console.log("   Si el problema persiste en el navegador, el bug está EN OTRO LUGAR.");
    } else {
        console.log("❌ TESTS FALLARON");
        console.log(`   AT: ${readAT.length}/100, EL: ${readEL.length}/50`);
        console.log(`   Post-refresh AT: ${readAT2.length}/100, EL: ${readEL2.length}/50`);
    }
}

runTests().catch(e => console.error("ERROR:", e));
