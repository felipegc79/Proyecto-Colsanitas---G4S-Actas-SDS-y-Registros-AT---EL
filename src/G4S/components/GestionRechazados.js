// src/components/GestionRechazados.js
import React, { useState, useMemo, useEffect } from "react";
import { dataAT, updateRecord } from "../data";

// --- CONSTANTES ---
// Agregamos las regionales para el filtro
const OPCIONES_REGIONAL = [
  "Bogotá-Girardot",
  "Noroccidente",
  "Sabana",
  "Santanderes-Costa",
  "Sur Occidente",
  "Eje Cafetero",
];

const OPCIONES_ESTANDARES = [
  "Cumple cabalmente las Políticas, Procedimiento e Instrucciones Operativas",
  "Usa de manera correcta los equipos y/o herramientas para desarrollar adecuadamente su labor",
  "Razona y Toma de decisiones acertadas frente a la ejecución de su labor",
  "Usa de manera correcta los medios de transporte asignados para realizar su labor",
];
const OPCIONES_CAUSAS_RIESGOSAS = [
  "Incumplimiento Individual",
  "Incumplimiento Grupal",
  "Incumplimiento de Procedimientos y/o Reglamentos",
  "Se toman decisiones equivocadas o no se usa el sentido común",
  "Actividad rutinaria sin atención",
  "No se sigue la advertencia de Peligro",
  "No se observa alrededor cuando se pisa",
  "No hacer verificación previa de Medio de Transporte",
];
const OPCIONES_CONDICIONES_SUBESTANDAR = [
  "Elaborado, construido, ensamblado inapropiadamente",
  "Aspero, tosco",
  "Espacio inadecuado de los pasillos, vías de salida, etc",
  "Agudo, cortante",
  "Iluminación inadecuada",
  "Desgastado, cuarteado, raído, roto, etc",
];

const GestionRechazados = () => {
  const [mode, setMode] = useState("list"); // 'list' | 'manage'
  const [records, setRecords] = useState(
    dataAT.filter(
      (r) => r.estado === "Rechazado G4S" || r.estado === "Objetado ARL"
    )
  );

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filtros (CAMBIO: fecha -> regional)
  const [filters, setFilters] = useState({
    id: "",
    regional: "",
    estado: "",
  });

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
    detalleHpi: "",
    esTransito: "NO",
    detalleTransito: "",
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
    estandaresSeguros: [],
    causasRiesgosas: [],
    condicionesAmbientales: [],
    planFuente: "",
    planMedio: "",
    planIndividuo: "",
    estado: "",
  };

  const [formData, setFormData] = useState(initialForm);

  // Reiniciar a la página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // --- LÓGICA DE FILTRADO ---
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchId =
        filters.id === "" ||
        (item.id && item.id.toString().includes(filters.id));

      // CAMBIO: Lógica de filtrado por Regional
      const matchRegional =
        filters.regional === "" || item.regional === filters.regional;

      const matchEstado =
        filters.estado === "" || item.estado === filters.estado;

      return matchId && matchRegional && matchEstado;
    });
  }, [records, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "estado") {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdateStatus = () => {
    if (formData.estado === "") {
      alert(
        "⚠️ Por favor seleccione un estado válido (Aprobado, Objetado o Rechazado)."
      );
      return;
    }
    updateRecord(formData);
    alert(`✅ Estado actualizado correctamente a: ${formData.estado}`);
    setRecords(
      dataAT.filter(
        (r) => r.estado === "Rechazado G4S" || r.estado === "Objetado ARL"
      )
    );
    setMode("list");
  };

  const populateForm = (item) => {
    const validStates = ["Aprobado", "Objetado ARL", "Rechazado G4S"];
    const cleanState = validStates.includes(item.estado) ? item.estado : "";

    setFormData({
      ...initialForm,
      ...item,
      estado: cleanState,
      estandaresSeguros: item.estandaresSeguros || [],
      causasRiesgosas: item.causasRiesgosas || [],
      condicionesAmbientales: item.condicionesAmbientales || [],
      esHpi: item.esHpi || "NO",
      esTransito: item.esTransito || "NO",
    });
  };

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
    backgroundColor: "#f9f9f9",
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

  // --- RENDER FORMULARIO ---
  const renderForm = () => {
    const allDisabled = true;

    return (
      <div
        className="card"
        style={{ maxWidth: "100%", margin: "0 auto", padding: "20px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h3>Gestionar Registro #{formData.id}</h3>
          <button
            onClick={() => setMode("list")}
            className="btn-g4s"
            style={{ background: "#666" }}
          >
            Volver a la Lista
          </button>
        </div>

        <form style={formContainerStyle}>
          {/* SECCIÓN GESTIÓN */}
          <div
            style={{
              gridColumn: "1 / -1",
              background: "#ffebee",
              padding: "15px",
              border: "2px solid #CD1920",
              marginBottom: "20px",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <label
              style={{
                fontWeight: "bold",
                color: "#CD1920",
                fontSize: "1.1em",
              }}
            >
              GESTIONAR ESTADO:
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              disabled={false}
              style={{
                ...inputStyle,
                width: "300px",
                background: "white",
                border: "1px solid #CD1920",
                fontWeight: "bold",
              }}
            >
              <option value="">Seleccione</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Objetado ARL">Objetado ARL</option>
              <option value="Rechazado G4S">Rechazado G4S</option>
            </select>
            <button
              type="button"
              onClick={handleUpdateStatus}
              className="btn-g4s"
              style={{ background: "#2e7d32" }}
            >
              💾 Guardar Cambio de Estado
            </button>
          </div>

          {/* CAMPOS SOLO LECTURA */}
          <div style={{ ...sectionHeaderStyle, marginTop: "0" }}>
            1. Generalidades
          </div>
          <div>
            <label style={labelStyle}>Línea de Negocio</label>
            <input
              value={formData.lineaNegocio}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Regional</label>
            <input
              value={formData.regional}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Departamento</label>
            <input
              value={formData.departamento}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Ciudad</label>
            <input
              value={formData.ciudad}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Sector (GES)</label>
            <input
              value={formData.sectorGes}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Puesto Armado</label>
            <input
              value={formData.puestoArmado}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Cliente</label>
            <input
              value={formData.cliente}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Unidad de Negocio</label>
            <input
              value={formData.unidadNegocio}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>

          <div style={sectionHeaderStyle}>2. Datos del Colaborador</div>
          <div>
            <label style={labelStyle}>Cédula (CC)</label>
            <input
              value={formData.cc}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Apellidos y Nombres</label>
            <input
              value={formData.apellidosNombres}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Cargo</label>
            <input
              value={formData.cargo}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Escolaridad</label>
            <input
              value={formData.escolaridad}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Edad</label>
            <input
              value={formData.rangoEdad}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Género</label>
            <input
              value={formData.genero}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>

          <div style={sectionHeaderStyle}>3. Tiempo e Incapacidad</div>
          <div>
            <label style={labelStyle}>Fecha Accidente</label>
            <input
              value={formData.fechaAccidente}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Hora</label>
            <input
              value={formData.horaAT}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Día Semana</label>
            <input
              value={formData.diaSemana}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Mes</label>
            <input
              value={formData.mes}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Días Incap.</label>
            <input
              value={formData.diasIncapacidad}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Prórroga 1</label>
            <input
              value={formData.prorroga1}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Prórroga 2</label>
            <input
              value={formData.prorroga2}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Total Días</label>
            <input
              value={formData.totalDias}
              disabled={allDisabled}
              style={{ ...inputStyle, fontWeight: "bold" }}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Descripción</label>
            <textarea
              value={formData.descripcion}
              disabled={allDisabled}
              rows="2"
              style={{ ...inputStyle, height: "auto" }}
            />
          </div>

          <div
            style={{
              gridColumn: "1 / 3",
              background: "#fff3cd",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ffcc00",
              marginTop: "10px",
            }}
          >
            <label style={{ fontWeight: "bold", fontSize: "0.9em" }}>
              HPI: {formData.esHpi}
            </label>
            {formData.esHpi === "SI" && (
              <div style={{ fontSize: "0.8em", marginTop: "5px" }}>
                <strong>Detalle:</strong> {formData.detalleHpi}
              </div>
            )}
          </div>

          <div
            style={{
              gridColumn: "3 / 5",
              background: "#e3f2fd",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #2196f3",
              marginTop: "10px",
            }}
          >
            <label style={{ fontWeight: "bold", fontSize: "0.9em" }}>
              Tránsito: {formData.esTransito}
            </label>
            {formData.esTransito === "SI" && (
              <div style={{ fontSize: "0.8em", marginTop: "5px" }}>
                <strong>Detalle:</strong> {formData.detalleTransito}
              </div>
            )}
          </div>

          <div style={sectionHeaderStyle}>4. Clasificación del accidente</div>
          <div>
            <label style={labelStyle}>Tipo Accidente</label>
            <input
              value={formData.tipoAccidente}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Nivel AT</label>
            <input
              value={formData.clasificacionNivel}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Sitio</label>
            <input
              value={formData.sitioAccidente}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Tipo Lesión</label>
            <input
              value={formData.tipoLesion}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Parte Cuerpo</label>
            <input
              value={formData.parteCuerpo}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Agente</label>
            <input
              value={formData.agenteAccidente}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Mecanismo</label>
            <input
              value={formData.mecanismoForma}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Peligro</label>
            <input
              value={formData.clasificacionPeligro}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Estado Inv.</label>
            <input
              value={formData.estadoInvestigacion}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>

          <div
            style={{
              gridColumn: "1 / -1",
              border: "1px solid #eee",
              padding: "10px",
            }}
          >
            <label style={{ fontWeight: "bold" }}>Estándares Seguros:</label>
            <div style={{ fontSize: "0.85em", color: "#555" }}>
              {formData.estandaresSeguros.join(", ") || "Ninguno"}
            </div>
          </div>
          <div
            style={{
              gridColumn: "1 / -1",
              border: "1px solid #eee",
              padding: "10px",
            }}
          >
            <label style={{ fontWeight: "bold" }}>Causas Riesgosas:</label>
            <div style={{ fontSize: "0.85em", color: "#555" }}>
              {formData.causasRiesgosas.join(", ") || "Ninguno"}
            </div>
          </div>
          <div
            style={{
              gridColumn: "1 / -1",
              border: "1px solid #eee",
              padding: "10px",
            }}
          >
            <label style={{ fontWeight: "bold" }}>
              Condiciones Subestándar:
            </label>
            <div style={{ fontSize: "0.85em", color: "#555" }}>
              {formData.condicionesAmbientales.join(", ") || "Ninguno"}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Fuente</label>
            <input
              value={formData.planFuente}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Medio</label>
            <input
              value={formData.planMedio}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Individuo</label>
            <input
              value={formData.planIndividuo}
              disabled={allDisabled}
              style={inputStyle}
            />
          </div>
        </form>
      </div>
    );
  };

  // --- RENDER LISTA ---
  const renderList = () => (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h3>Gestión de Rechazados / Objetados AT</h3>
      </div>

      {/* --- FILTROS --- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          marginBottom: "20px",
          background: "#eee",
          padding: "15px",
          borderRadius: "5px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.8em",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Filtrar por ID:
          </label>
          <input
            name="id"
            value={filters.id}
            onChange={handleFilterChange}
            placeholder="Escriba ID..."
            className="input-g4s"
            style={{ height: "35px", width: "100%" }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.8em",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Filtrar por Regional:
          </label>
          {/* CAMBIO: Input date reemplazado por Select regional */}
          <select
            name="regional"
            value={filters.regional}
            onChange={handleFilterChange}
            className="input-g4s"
            style={{ height: "35px", width: "100%" }}
          >
            <option value="">Todas</option>
            {OPCIONES_REGIONAL.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: "0.8em",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Filtrar por Estado:
          </label>
          <select
            name="estado"
            value={filters.estado}
            onChange={handleFilterChange}
            className="input-g4s"
            style={{ height: "35px", width: "100%" }}
          >
            <option value="">Todos</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Objetado ARL">Objetado ARL</option>
            <option value="Rechazado G4S">Rechazado G4S</option>
          </select>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#333", color: "white" }}>
            <th style={{ padding: "12px" }}>ID</th>
            <th style={{ padding: "12px" }}>Fecha</th>
            <th style={{ padding: "12px" }}>Regional</th>
            <th style={{ padding: "12px" }}>Colaborador</th>
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
                <td style={{ padding: "12px" }}>{item.apellidosNombres}</td>
                <td style={{ padding: "12px" }}>
                  {item.estado &&
                    ["Aprobado", "Objetado ARL", "Rechazado G4S"].includes(
                      item.estado
                    ) ? (
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "0.85em",
                        backgroundColor:
                          item.estado === "Aprobado" ? "#2e7d32" : "#d32f2f",
                      }}
                    >
                      {item.estado}
                    </span>
                  ) : null}
                </td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() => {
                      setMode("manage");
                      populateForm(item);
                    }}
                    style={{
                      background: "#CD1920",
                      color: "white",
                      border: "none",
                      padding: "8px 15px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Gestionar
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

      {/* --- PAGINACIÓN --- */}
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
        .input-g4s { padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; }
      `}</style>
    </div>
  );
};

export default GestionRechazados;
