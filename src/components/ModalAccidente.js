// src/components/ModalAccidente.js
import React, { useState, useEffect } from "react";

const ModalAccidente = ({ isOpen, onClose, data, mode }) => {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  if (!isOpen) return null;

  // Lógica de solo lectura basada en el modo
  const isReadOnly = mode === "ver";
  // En modo editar, todo es readOnly EXCEPTO el campo de estado/objecion
  const isEditMode = mode === "editar";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Guardando datos...", formData);
    onClose();
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>{mode === "ver" ? "Detalle Accidente" : "Gestionar Estado"}</h2>

        <form>
          <div style={formGroupStyle}>
            <label>Trabajador:</label>
            <input
              type="text"
              value={formData.trabajador || ""}
              disabled // Siempre bloqueado en estos modos según requerimiento
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Tipo Accidente:</label>
            <input
              type="text"
              value={formData.tipoAccidente || ""}
              disabled
              style={inputStyle}
            />
          </div>

          {/* PUNTO 4: Campo Desplegable Estado (Objeción) */}
          <div style={formGroupStyle}>
            <label style={{ fontWeight: "bold", color: "red" }}>
              Estado (Objeción):
            </label>
            <select
              name="objecion"
              value={formData.objecion || ""}
              onChange={handleChange}
              disabled={isReadOnly} // Habilitado solo si NO es modo 'ver'
              style={inputStyle}
            >
              <option value="">Seleccione...</option>
              <option value="Objetado">Objetado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>
        </form>

        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <button onClick={onClose} style={btnCancelStyle}>
            Cerrar
          </button>
          {!isReadOnly && (
            <button onClick={handleSave} style={btnSaveStyle}>
              Guardar Cambios
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Estilos simples para el ejemplo
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};
const modalStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "90%",
};
const formGroupStyle = { marginBottom: "15px" };
const inputStyle = {
  width: "100%",
  padding: "8px",
  marginTop: "5px",
  boxSizing: "border-box",
};
const btnCancelStyle = {
  marginRight: "10px",
  padding: "8px 15px",
  cursor: "pointer",
};
const btnSaveStyle = {
  padding: "8px 15px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  cursor: "pointer",
};

export default ModalAccidente;
