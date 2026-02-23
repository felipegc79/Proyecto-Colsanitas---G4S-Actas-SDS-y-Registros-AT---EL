// test-final.mjs — Test rápido con nombre final
import "fake-indexeddb/auto";

const DB_NAME = "ColsanitasDB_Final";
let dbInstance = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) { resolve(dbInstance); return; }
        const req = indexedDB.open(DB_NAME, 1);
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
        for (const r of records) store.add(r);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
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

async function test() {
    // Guardar 100 AT
    const at = Array.from({ length: 100 }, (_, i) => ({
        id: Date.now() + i, departamento: "DEPTO-" + i, parteCuerpo: "PARTE-" + i, empresa: "EMP-" + i
    }));
    await saveToDB("accidentes", at);

    // Guardar 50 EL
    const el = Array.from({ length: 50 }, (_, i) => ({
        id: Date.now() + 5000 + i, empresa: "EMP-EL-" + i
    }));
    await saveToDB("enfermedades", el);

    // Leer AT (debe seguir intacto)
    const atRead = await getAllFromDB("accidentes");
    const elRead = await getAllFromDB("enfermedades");

    console.log(`AT: ${atRead.length}/100, EL: ${elRead.length}/50`);
    console.log(`AT[0]: depto=${atRead[0]?.departamento}, parte=${atRead[0]?.parteCuerpo}`);

    // Simular refresh
    dbInstance.close(); dbInstance = null;
    const atRead2 = await getAllFromDB("accidentes");
    const elRead2 = await getAllFromDB("enfermedades");
    console.log(`Post-refresh AT: ${atRead2.length}/100, EL: ${elRead2.length}/50`);

    if (atRead2.length === 100 && elRead2.length === 50) {
        console.log("✅ TODO OK — IndexedDB funciona correctamente");
    } else {
        console.log("❌ FALLO");
    }
}

test().catch(e => console.error(e));
