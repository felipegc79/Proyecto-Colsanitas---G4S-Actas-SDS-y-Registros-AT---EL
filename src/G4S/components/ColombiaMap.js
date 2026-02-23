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
  if (d > 50) return '#CD1920'; // ROJO (Alta) - G4S Red
  if (d >= 30) return '#FFC107'; // AMARILLO (Media)
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
    return () => { if(mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []);

  // Actualización de colores y visibilidad
  useEffect(() => {
    if (!mapInstance.current || !colombiaGeo) return;
    if (geoJsonLayer.current) mapInstance.current.removeLayer(geoJsonLayer.current);

    const style = (feature) => {
      let nombreDpt = feature.properties.NOMBRE_DPT || feature.properties.NAME_1;
      if(nombreDpt) nombreDpt = nombreDpt.toUpperCase();
      
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
        if(nombreDpt) nombreDpt = nombreDpt.toUpperCase();
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
      <div style={{ position: "absolute", bottom: "20px", right: "20px", background: "white", padding: "10px", borderRadius: "5px", fontSize: "0.8em", boxShadow: "0 0 5px rgba(0,0,0,0.2)" }}>
        <strong>Nivel Accidentalidad</strong><br/>
        <span style={{background:"#CD1920", width:"10px", height:"10px", display:"inline-block"}}></span> Alta (&gt;50)<br/>
        <span style={{background:"#FFC107", width:"10px", height:"10px", display:"inline-block"}}></span> Media (30-50)<br/>
        <span style={{background:"#4CAF50", width:"10px", height:"10px", display:"inline-block"}}></span> Baja (&lt;30)<br/>
      </div>
    </div>
  );
};

export default ColombiaMap;