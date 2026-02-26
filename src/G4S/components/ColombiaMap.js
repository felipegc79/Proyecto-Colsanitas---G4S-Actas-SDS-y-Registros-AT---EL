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
  if (d > 100) return '#CD1920'; // ROJO (Alta) - G4S Red
  if (d >= 51) return '#FFC107'; // AMARILLO (Media)
  if (d > 0) return '#4CAF50';   // VERDE (Baja)
  return '#F2F2F2';              // Gris (Sin datos)
};

const ColombiaMap = ({ data = {}, highlightedDepts = [] }) => {
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
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []);

  // Actualización de colores y visibilidad
  useEffect(() => {
    if (!mapInstance.current || !colombiaGeo) return;
    if (geoJsonLayer.current) mapInstance.current.removeLayer(geoJsonLayer.current);

    const style = (feature) => {
      let nombreDpt = feature.properties.NOMBRE_DPT || feature.properties.NAME_1;
      if (nombreDpt) nombreDpt = nombreDpt.toUpperCase();

      const count = data[nombreDpt] || 0;

      // Lógica de Transparencia
      // Si hay una lista de departamentos resaltados (filtro activo) y este dpto NO está en ella -> Transparente
      let opacity = 0.7;
      let fillOpacity = 0.7;
      let colorBorder = 'white';

      if (highlightedDepts.length > 0 && !highlightedDepts.includes(nombreDpt)) {
        opacity = 0.1;
        fillOpacity = 0; // Totalmente transparente el relleno
        colorBorder = 'transparent';
      }

      return {
        fillColor: getColor(count),
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
        const count = data[nombreDpt] || 0;
        layer.bindPopup(`<strong>${nombreDpt}</strong><br/>Accidentes: ${count}`);
      }
    }).addTo(mapInstance.current);

  }, [data, highlightedDepts]);

  return (
    <div className="card" style={{ height: "450px", padding: "10px", position: "relative" }}>
      <h3>Mapa de Calor (Accidentes por Dpto)</h3>
      <div ref={mapRef} style={{ width: "100%", height: "90%" }} />

      {/* Leyenda */}
      <div style={{ position: "absolute", bottom: "30px", right: "20px", background: "white", padding: "10px 15px", borderRadius: "8px", fontSize: "13px", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", zIndex: 1000 }}>
        <strong style={{ display: "block", marginBottom: "8px", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "4px" }}>Nivel Accidentalidad</strong>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <span style={{ background: "#CD1920", width: "14px", height: "14px", display: "inline-block", borderRadius: "3px" }}></span> Alta (101+)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <span style={{ background: "#FFC107", width: "14px", height: "14px", display: "inline-block", borderRadius: "3px" }}></span> Media (51-100)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ background: "#4CAF50", width: "14px", height: "14px", display: "inline-block", borderRadius: "3px" }}></span> Baja (0-50)
        </div>
      </div>
    </div>
  );
};

export default ColombiaMap;