// test-fix-verification.mjs — Verifica que el fix de endsWith funciona
import "fake-indexeddb/auto";

// Simular la lógica corregida
function getStoreName(key) {
    return key.endsWith("_AT") ? "accidentes" : "enfermedades";
}

// Test del bug original
const bugResult_AT = "COLSANITAS_DATA_AT".includes("AT"); // true ✅
const bugResult_EL = "COLSANITAS_DATA_EL".includes("AT"); // true ❌ ← BUG!

// Test del fix
const fixResult_AT = "COLSANITAS_DATA_AT".endsWith("_AT"); // true ✅
const fixResult_EL = "COLSANITAS_DATA_EL".endsWith("_AT"); // false ✅

console.log("=== VERIFICACIÓN DEL BUG ===");
console.log(`BUG: "COLSANITAS_DATA_AT".includes("AT") = ${bugResult_AT} ${bugResult_AT ? "✅" : "❌"}`);
console.log(`BUG: "COLSANITAS_DATA_EL".includes("AT") = ${bugResult_EL} ${bugResult_EL ? "❌ ESTO CAUSABA EL PROBLEMA" : "✅"}`);
console.log("");
console.log(`FIX: "COLSANITAS_DATA_AT".endsWith("_AT") = ${fixResult_AT} ${fixResult_AT ? "✅" : "❌"}`);
console.log(`FIX: "COLSANITAS_DATA_EL".endsWith("_AT") = ${fixResult_EL} ${!fixResult_EL ? "✅ CORRECTO" : "❌"}`);
console.log("");
console.log(`AT → store: "${getStoreName("COLSANITAS_DATA_AT")}" ${getStoreName("COLSANITAS_DATA_AT") === "accidentes" ? "✅" : "❌"}`);
console.log(`EL → store: "${getStoreName("COLSANITAS_DATA_EL")}" ${getStoreName("COLSANITAS_DATA_EL") === "enfermedades" ? "✅" : "❌"}`);
