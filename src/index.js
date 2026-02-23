// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { getAllFromDB } from "./utils/db";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// ═══ VERIFICACIÓN DE ARRANQUE ═══
console.log("🚀 COLSANITAS v4.0 — Build: " + new Date().toISOString());
console.log("🔧 DB Name: ColsanitasDB_Final");

// Test rápido de salud de IndexedDB al arrancar
(async () => {
    try {
        const at = await getAllFromDB("accidentes");
        const el = await getAllFromDB("enfermedades");
        console.log(`📊 Estado inicial → AT: ${at.length} registros, EL: ${el.length} registros`);
        if (at.length > 0) {
            console.log("🔑 AT muestra:", Object.keys(at[0]).slice(0, 8).join(", "));
        }
        if (el.length > 0) {
            console.log("🔑 EL muestra:", Object.keys(el[0]).slice(0, 8).join(", "));
        }
    } catch (e) {
        console.error("❌ IndexedDB NO funciona:", e);
    }
})();

// Eliminamos <StrictMode> para evitar conflictos con las librerías gráficas
root.render(<App />);
