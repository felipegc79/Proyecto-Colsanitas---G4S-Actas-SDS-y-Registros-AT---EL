// src/components/ColombiaMap.js
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import colombiaGeo from "./colombia.json";

// Fix iconos
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Función de color basada en el Excel (Umbrales)
const getColor = (d) => {
  if (d > 50) return '#CD1920'; // ROJO (Alta)
  if (d >= 30) return '#FFC107'; // AMARILLO (Media)
  if (d > 0) return '#4CAF50';   // VERDE (Baja)
  return '#F2F2F2';              // Gris (Sin datos)
};

// Quitar tildes / diacríticos para normalizar nombres
const stripAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

// Alias: nombre del GeoJSON (NOMBRE_DPT) → posibles nombres del Excel
const GEOJSON_TO_EXCEL_ALIASES = {
  "SANTAFE DE BOGOTA D.C": ["BOGOTA", "BOGOTÁ", "BOGOTA D.C", "BOGOTA D.C.", "SANTAFE DE BOGOTA", "SANTAFE DE BOGOTA D.C"],
  "ATLANTICO": ["ATLANTICO", "ATLÁNTICO"],
  "BOLIVAR": ["BOLIVAR", "BOLÍVAR"],
  "BOYACA": ["BOYACA", "BOYACÁ"],
  "CORDOBA": ["CORDOBA", "CÓRDOBA"],
  "NARINO": ["NARINO", "NARIÑO"],
  "QUINDIO": ["QUINDIO", "QUINDÍO"],
  "NORTE DE SANTANDER": ["NORTE DE SANTANDER", "N. DE SANTANDER", "NTE SANTANDER"],
  "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA": ["SAN ANDRES", "SAN ANDRÉS", "SAN ANDRES Y PROVIDENCIA"],
  "GUAINIA": ["GUAINÍA", "GUAINIA"],
  "VAUPES": ["VAUPÉS", "VAUPES"],
  "CAQUETA": ["CAQUETÁ", "CAQUETA"],
  "CHOCO": ["CHOCÓ", "CHOCO"],
};

/**
 * Dado un nombre de departamento del GeoJSON, busca el conteo
 * correspondiente en `data` (que viene del Excel) probando:
 *   1. El nombre exacto (ya en UPPER) del GeoJSON
 *   2. El nombre sin tildes
 *   3. Los alias definidos arriba
 *   4. Coincidencias parciales (el nombre del Excel CONTIENE el del GeoJSON o viceversa)
 */
const lookupCount = (geoName, data) => {
  if (!geoName) return 0;
  const upper = geoName.toUpperCase();
  // 1. Exacto
  if (data[upper] !== undefined) return data[upper];
  // 2. Sin tildes
  const stripped = stripAccents(upper);
  if (data[stripped] !== undefined) return data[stripped];
  // 3. Alias
  const aliases = GEOJSON_TO_EXCEL_ALIASES[stripped] || GEOJSON_TO_EXCEL_ALIASES[upper] || [];
  for (const alias of aliases) {
    const a = stripAccents(alias);
    if (data[alias] !== undefined) return data[alias];
    if (data[a] !== undefined) return data[a];
  }
  // 4. Busqueda parcial: recorrer las claves de data
  const dataKeys = Object.keys(data);
  for (const dk of dataKeys) {
    const dkUp = stripAccents(dk);
    if (dkUp === stripped) return data[dk];
    // "BOGOTA" está contenido en "SANTAFE DE BOGOTA D.C"
    if (stripped.includes(dkUp) || dkUp.includes(stripped)) return data[dk];
  }
  return 0;
};

const ColombiaMap = ({
  data = {},
  highlightedDepts = [],
  title = "Mapa de Calor",
  thresholds = { high: 50, medium: 30 }
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const geoJsonLayer = useRef(null);

  // Inicialización (Solo una vez)
  useEffect(() => {
    if (mapInstance.current) return;
    const map = L.map(mapRef.current).setView([4.5709, -74.2973], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    mapInstance.current = map;
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Actualización de colores y visibilidad
  useEffect(() => {
    if (!mapInstance.current || !colombiaGeo) return;
    if (geoJsonLayer.current) mapInstance.current.removeLayer(geoJsonLayer.current);

    const getColor = (d, statusExt) => {
      if (statusExt) {
        if (statusExt === "red") return "#E53E3E";
        if (statusExt === "yellow") return "#ECC94B";
        if (statusExt === "green") return "#48BB78";
      }
      if (d > thresholds.high) return '#CD1920'; // ROJO (Alta)
      if (d >= thresholds.medium) return '#FFC107'; // AMARILLO (Media)
      if (d > 0) return '#4CAF50';   // VERDE (Baja)
      return '#F2F2F2';              // Gris (Sin datos)
    };

    const style = (feature) => {
      let nombreDpt = feature.properties.NOMBRE_DPT || feature.properties.NAME_1;
      if (nombreDpt) nombreDpt = nombreDpt.toUpperCase();

      const countData = lookupCount(nombreDpt, data);
      let count = countData;
      let externalStatus = null;
      if (typeof countData === "object" && countData !== null) {
        count = countData.count || 0;
        externalStatus = countData.status;
      }

      // Lógica de Transparencia
      let opacity = 0.7;
      let fillOpacity = 0.7;
      let colorBorder = 'white';

      if (highlightedDepts.length > 0 && !highlightedDepts.includes(nombreDpt)) {
        opacity = 0.1;
        fillOpacity = 0;
        colorBorder = 'transparent';
      }

      return {
        fillColor: getColor(count, externalStatus),
        weight: 1,
        opacity: opacity,
        color: colorBorder,
        dashArray: '3',
        fillOpacity: fillOpacity
      };
    };

    geoJsonLayer.current = L.geoJSON(colombiaGeo, {
      style: style,
      onEachFeature: (feature, layer) => {
        let nombreDpt = feature.properties.NOMBRE_DPT || feature.properties.NAME_1;
        if (nombreDpt) nombreDpt = nombreDpt.toUpperCase();
        const countData = lookupCount(nombreDpt, data);
        const count = typeof countData === "object" && countData !== null ? (countData.count || 0) : countData;
        layer.bindPopup(`<strong>${nombreDpt}</strong><br/>Casos: ${count}`);
      }
    }).addTo(mapInstance.current);

  }, [data, highlightedDepts, thresholds]);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative", minHeight: "400px" }}>
      {/* Título opcional, si se pasa vacío no se muestra */}
      {title && <h3 style={{ fontSize: "16px", marginBottom: "10px", textAlign: "center", color: "#666" }}>{title}</h3>}

      <div ref={mapRef} style={{ width: "100%", height: "90%", borderRadius: "12px", overflow: "hidden" }} />

      {/* Leyenda Dinámica */}
      <div style={{ position: "absolute", bottom: "20px", right: "20px", background: "rgba(255,255,255,0.9)", padding: "10px", borderRadius: "8px", fontSize: "0.8em", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 1000 }}>
        <strong style={{ display: "block", marginBottom: "5px", color: "#333" }}>Nivel de Casos</strong>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "3px" }}>
          <span style={{ background: "#CD1920", width: "12px", height: "12px", borderRadius: "3px", marginRight: "5px" }}></span>
          <span>Alta (&gt;{thresholds.high})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "3px" }}>
          <span style={{ background: "#FFC107", width: "12px", height: "12px", borderRadius: "3px", marginRight: "5px" }}></span>
          <span>Media ({thresholds.medium}-{thresholds.high})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ background: "#4CAF50", width: "12px", height: "12px", borderRadius: "3px", marginRight: "5px" }}></span>
          <span>Baja (&lt;{thresholds.medium})</span>
        </div>
      </div>
    </div>
  );
};

export default ColombiaMap;