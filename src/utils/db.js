// src/utils/db.js — Versión FINAL con nombre estable

const DB_NAME = "ColsanitasDB_Final";
const DB_VERSION = 1;

let dbInstance = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) { resolve(dbInstance); return; }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("accidentes")) {
                db.createObjectStore("accidentes", { autoIncrement: true });
            }
            if (!db.objectStoreNames.contains("enfermedades")) {
                db.createObjectStore("enfermedades", { autoIncrement: true });
            }
            console.log("✅ DB: Stores creados en", DB_NAME);
        };
        req.onsuccess = () => {
            dbInstance = req.result;
            dbInstance.onversionchange = () => { dbInstance.close(); dbInstance = null; };
            console.log("✅ DB: Conectado a", DB_NAME, "v" + DB_VERSION);
            resolve(dbInstance);
        };
        req.onerror = () => {
            console.error("❌ DB: Error abriendo", req.error);
            reject(req.error);
        };
        req.onblocked = () => console.warn("⚠️ DB: Bloqueada por otra pestaña");
    });
}

export async function saveToDB(storeName, records) {
    if (!records || records.length === 0) return true;
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        const store = tx.objectStore(storeName);
        store.clear();
        for (let i = 0; i < records.length; i++) {
            store.add(records[i]);
        }
        tx.oncomplete = () => {
            console.log(`✅ DB: ${records.length} → [${storeName}]`);
            resolve(true);
        };
        tx.onerror = () => {
            console.error(`❌ DB: Error en [${storeName}]`, tx.error);
            reject(tx.error);
        };
        tx.onabort = () => {
            console.error(`❌ DB: Abort en [${storeName}]`, tx.error);
            reject(tx.error);
        };
    });
}

export async function getAllFromDB(storeName) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => {
            const data = req.result || [];
            console.log(`📥 DB: ${data.length} ← [${storeName}]`);
            resolve(data);
        };
        req.onerror = () => {
            console.error(`❌ DB: Error leyendo [${storeName}]`);
            resolve([]);
        };
    });
}

// Limpiar bases de datos antiguas para evitar confusión
(async function cleanupOldDBs() {
    const oldNames = ["ColsanitasRegistrosDB", "ColsanitasDB_v2", "ColsanitasDB_v3"];
    for (const name of oldNames) {
        try { indexedDB.deleteDatabase(name); } catch (e) { /* ignorar */ }
    }
})();
