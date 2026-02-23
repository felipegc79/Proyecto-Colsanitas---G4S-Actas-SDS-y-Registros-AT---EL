import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import {
  FormSection,
  FormInput,
  FormSelect,
  FormTextarea,
} from "../components/FormComponents";

// --- PANTALLA FORMULARIO ACTA ---
const ActaFormScreen = ({
  onNavigate,
  user,
  showModal,
  selectedSds,
  setActaForm,
  sdsData = [],
}) => {
  const [formData, setFormData] = useState(null);

  // Opciones de ubicación
  const [departamentos] = useState([
    "Antioquia",
    "Bogota",
    "Caldas",
    "Risaralda",
    "Valle del Cauca",
  ]);
  const [municipios] = useState({
    Antioquia: ["Medellín", "Bello", "Envigado", "Itagüí", "Sabaneta"],
    Bogota: ["Bogotá D.C."],
    Caldas: ["Manizales", "Chinchina", "Villamaría"],
    Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
    "Valle del Cauca": ["Cali", "Palmira", "Yumbo"],
  });

  const [listaResponsables] = useState([
    "Juan Pérez (Gerente)",
    "Maria López (RRHH)",
    "Carlos Gómez (Jefe SST)",
    "N/A",
  ]);

  // Opciones para tipificación de evidencia
  const tiposEvidencia = [
    "Registro Fotográfico",
    "Listado de Asistencia",
    "Presentación / Material",
    "Video de la actividad",
    "Documento de Identidad",
    "Otro",
  ];

  useEffect(() => {
    if (selectedSds) {
      const today = new Date().toISOString().split("T")[0];

      setFormData({
        sdsNumber: selectedSds.SDS,
        cliente: selectedSds.Cliente,
        poliza: selectedSds.Poliza,
        actividadPlaneada: selectedSds.Actividad,
        cantidadPlaneada: selectedSds.HorasPlaneadas,
        unidadMedida: "Horas",
        tipoActividad: "especifica",
        fechaActividad: today,
        horaInicio: "08:00",
        horaFin: "10:00",
        horasTotales: 2,
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        ubicacionTipo: "presencial",
        departamento: "",
        municipio: "",
        direccion: "",
        coordenadas: "",
        cantidadEjecutada: 2,
        personasCubiertas: 1,
        observaciones: "",
        evaluacion: "N/A",
        // Datos Responsable Empresa
        nombreResponsable: "N/A",
        cargoResponsable: "",
        emailResponsable: "",
        idResponsable: "",
        telResponsable: "",
        // Datos Responsable Proveedor
        nombreProveedor: user?.name || "",
        cargoProveedor: user?.role || "",
        emailProveedor: user?.email || "",
        idProveedor: user?.identificacion || "",
        telProveedor: user?.telefono || "",
        licenciaSST: "Res. 4502 de 2021 | Exp: 12/05/2021",
        evidencias: [], // Array para almacenar evidencias
      });
    }
  }, [selectedSds, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "departamento") {
        newState.municipio = "";
      }
      return newState;
    });
  };

  // --- LÓGICA DE EVIDENCIAS ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((file) => ({
        fileObject: file,
        name: file.name,
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        tipificacion: "",
      }));

      setFormData((prev) => ({
        ...prev,
        evidencias: [...(prev.evidencias || []), ...newFiles],
      }));
    }
  };

  const handleEvidenciaTypeChange = (index, value) => {
    const newEvidencias = [...formData.evidencias];
    newEvidencias[index].tipificacion = value;
    setFormData((prev) => ({ ...prev, evidencias: newEvidencias }));
  };

  const handleRemoveEvidence = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      evidencias: prev.evidencias.filter((_, index) => index !== indexToRemove),
    }));
  };
  // ------------------------------------------------------------------

  const handleSelectResponsable = (e) => {
    const { value } = e.target;
    const details = {
      "Juan Pérez (Gerente)": {
        cargo: "Gerente",
        email: "juan.perez@cliente.com",
        id: "79.123.456",
        tel: "310 111 2233",
      },
      "Maria López (RRHH)": {
        cargo: "Analista RRHH",
        email: "maria.lopez@cliente.com",
        id: "52.987.654",
        tel: "311 444 5566",
      },
      "Carlos Gómez (Jefe SST)": {
        cargo: "Jefe SST",
        email: "carlos.gomez@cliente.com",
        id: "1.010.222.333",
        tel: "312 777 8899",
      },
      "N/A": { cargo: "", email: "", id: "", tel: "" },
    };
    const selected = details[value] || details["N/A"];
    setFormData((prev) => ({
      ...prev,
      nombreResponsable: value,
      cargoResponsable: selected.cargo,
      emailResponsable: selected.email,
      idResponsable: selected.id,
      telResponsable: selected.tel,
    }));
  };

  const handleGetLocation = () => {
    showModal("Geolocalización", "Obteniendo coordenadas...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const coordsString = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const address = data.address || {};
            setFormData((prev) => ({
              ...prev,
              departamento: address.state || "Desconocido",
              municipio: address.city || address.town || "Desconocido",
              direccion: data.display_name || "Dirección no encontrada",
              coordenadas: coordsString,
            }));
          } catch (error) {
            setFormData((prev) => ({ ...prev, coordenadas: coordsString }));
          }
        },
        (error) => showModal("Error GPS", "No se pudo obtener la ubicación."),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  };

  const getMunicipiosForDepto = (depto) => {
    return municipios[depto] || [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validaciones básicas de campos numéricos
    if (formData.horasTotales > 10) {
      showModal("Error", "Las horas totales no puede ser superior a 10.");
      return;
    }

    if (formData.cantidadEjecutada > 10) {
      showModal("Error", "La cantidad de horas debe ser igual o menor a 10.");
      return;
    }

    if (formData.personasCubiertas < 1) {
      showModal(
        "Error",
        "Las personas cubiertas debe ser igual o superior a 1."
      );
      return;
    }

    // 2. VALIDACIÓN DE CRUCE DE HORARIOS Y FECHA (REGLA DE NEGOCIO CRÍTICA)
    // Buscamos conflictos SOLO en actas hijas (históricas) de la misma SDS padre
    const conflictoHorario = sdsData.find((item) => {
      // a. Debe ser un acta hija (IsChildAct: true)
      // b. Debe pertenecer a la misma SDS Padre (ParentSDS === formData.sdsNumber)
      // c. Debe tener la misma fecha de ejecución
      if (
        item.IsChildAct && 
        String(item.ParentSDS) === String(formData.sdsNumber) &&
        item.FechaEjecucion === formData.fechaActividad
      ) {
        // d. Lógica de superposición de intervalos de tiempo (Overlap)
        // Se considera conflicto si: (InicioNuevo < FinViejo) Y (FinNuevo > InicioViejo)
        // Comparación lexicográfica de strings "HH:mm" funciona correctamente en formato 24h
        const cruce =
          formData.horaInicio < item.HoraFin && 
          formData.horaFin > item.HoraInicio;
        
        return cruce;
      }
      return false;
    });

    if (conflictoHorario) {
      showModal(
        "Conflicto de Horario",
        `Ya existe un acta registrada (Acta #${conflictoHorario.SDS}) en esta fecha con un rango horario que se cruza (${conflictoHorario.HoraInicio} - ${conflictoHorario.HoraFin}). Por favor verifique.`
      );
      return;
    }

    // 3. Validación de evidencias
    const evidenciasSinTipo = formData.evidencias.some((e) => !e.tipificacion);
    if (evidenciasSinTipo) {
      showModal(
        "Evidencias Incompletas",
        "Por favor seleccione el tipo para todos los archivos adjuntos."
      );
      return;
    }

    // 4. Preparar datos y avanzar
    const cleanFormData = {
      ...formData,
      coordenadas: formData.coordenadas || "0,0",
      timestamp: new Date().getTime(),
    };

    setActaForm(cleanFormData);
    onNavigate("signature");
  };

  if (!formData) return <AppLayout title="Cargando...">Cargando...</AppLayout>;

  return (
    <AppLayout onNavigate={onNavigate} title="Diligenciar Acta de Visita">
      <form onSubmit={handleSubmit}>
        <div className="space-y-8 pb-10">
          <FormSection title="1. Tiempos de Actividad">
            <select
              name="tipoActividad"
              value={formData.tipoActividad}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl bg-white mb-4"
            >
              <option value="especifica">Actividad Específica</option>
              <option value="proyecto">Actividad por Proyecto</option>
            </select>

            {formData.tipoActividad === "especifica" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <FormInput
                    label="Fecha Actividad"
                    type="date"
                    name="fechaActividad"
                    value={formData.fechaActividad}
                    onChange={handleChange}
                  />
                </div>
                <FormInput
                  label="Hora Inicio"
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleChange}
                />
                <FormInput
                  label="Hora Fin"
                  type="time"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleChange}
                />
                <div>
                  <FormInput
                    label="Horas Totales"
                    type="number"
                    name="horasTotales"
                    value={formData.horasTotales}
                    onChange={handleChange}
                  />
                  {Number(formData.horasTotales) > 10 && (
                    <p className="text-red-600 text-[10px] mt-1 font-bold animate-pulse">
                      ⚠ Máx. 10 horas.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormInput
                  label="Mes"
                  type="number"
                  name="mes"
                  value={formData.mes}
                  onChange={handleChange}
                />
                <FormInput
                  label="Año"
                  type="number"
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                />
              </div>
            )}
          </FormSection>

          <FormSection title="2. Información General">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                label="No. SDS"
                name="sdsNumber"
                value={formData.sdsNumber}
                readOnly
              />
              <FormInput
                label="Cliente"
                name="cliente"
                value={formData.cliente}
                readOnly
              />
              <FormInput
                label="Póliza"
                name="poliza"
                value={formData.poliza}
                readOnly
              />
            </div>
          </FormSection>

          <FormSection title="3. Ubicación">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Modalidad
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 p-3 border rounded-lg flex-1 bg-white">
                  <input
                    type="radio"
                    name="ubicacionTipo"
                    value="presencial"
                    checked={formData.ubicacionTipo === "presencial"}
                    onChange={handleChange}
                  />{" "}
                  Presencial
                </label>
                <label className="flex items-center gap-2 p-3 border rounded-lg flex-1 bg-white">
                  <input
                    type="radio"
                    name="ubicacionTipo"
                    value="virtual"
                    checked={formData.ubicacionTipo === "virtual"}
                    onChange={handleChange}
                  />{" "}
                  Virtual
                </label>
              </div>
            </div>

            {formData.ubicacionTipo === "presencial" ? (
              <>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full mb-4 px-4 py-3 bg-blue-100 text-blue-800 rounded-lg font-bold flex items-center justify-center gap-2 border border-blue-200"
                >
                  📍 Obtener Ubicación GPS
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Departamento"
                    name="departamento"
                    value={formData.departamento}
                    readOnly
                  />
                  <FormInput
                    label="Municipio"
                    name="municipio"
                    value={formData.municipio}
                    readOnly
                  />
                  <FormInput
                    label="Dirección / Lugar"
                    name="direccion"
                    value={formData.direccion}
                    readOnly
                  />
                  <FormInput
                    label="Coordenadas GPS"
                    name="coordenadas"
                    value={formData.coordenadas}
                    readOnly
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  options={departamentos}
                />
                <FormSelect
                  label="Municipio"
                  name="municipio"
                  value={formData.municipio}
                  onChange={handleChange}
                  options={getMunicipiosForDepto(formData.departamento)}
                />
                <div className="md:col-span-2">
                  <FormInput
                    label="Dirección / Lugar"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ej. Calle / Conjunto / Edificio"
                  />
                </div>
              </div>
            )}
          </FormSection>

          <FormSection title="4. Detalles de Actividad y Evidencias">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <FormTextarea
                  label="Actividad Planeada"
                  value={formData.actividadPlaneada}
                  readOnly
                  rows="2"
                />
              </div>

              <FormInput label="Unidad de Medida" value="Horas" readOnly />

              <FormInput
                label="Cant. Planeada"
                value={formData.cantidadPlaneada}
                readOnly
              />

              <div>
                <FormInput
                  label="Cantidad Ejecutada"
                  type="number"
                  name="cantidadEjecutada"
                  value={formData.cantidadEjecutada}
                  onChange={handleChange}
                />
                {Number(formData.cantidadEjecutada) > 10 && (
                  <p className="text-red-600 text-[10px] mt-1 font-bold animate-pulse">
                    ⚠ La cantidad de horas debe ser igual o menor a 10
                  </p>
                )}
              </div>

              <div>
                <FormInput
                  label="Personas Cubiertas"
                  type="number"
                  name="personasCubiertas"
                  value={formData.personasCubiertas}
                  onChange={handleChange}
                />
                {(formData.personasCubiertas === "" ||
                  Number(formData.personasCubiertas) === 0) && (
                  <p className="text-red-600 text-[10px] mt-1 font-bold animate-pulse">
                    ⚠ Las personas cubiertas debe ser igual o superior a 1
                  </p>
                )}
              </div>
            </div>

            <FormTextarea
              label="Observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
            />

            <div className="mt-6 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                📎 Adjuntar Evidencias (Ilimitado)
              </label>
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.jpg,.jpeg,.png,.mp4,.mkv"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="text-gray-500">
                  <p className="text-3xl mb-2">📂</p>
                  <p className="text-sm font-bold">
                    Toque aquí para subir archivos
                  </p>
                  <p className="text-xs mt-1">Soporta: PDF, DOCX, IMG, VIDEO</p>
                </div>
              </div>

              {formData.evidencias && formData.evidencias.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-bold text-gray-500">
                    {formData.evidencias.length} Archivos adjuntos -{" "}
                    <span className="text-red-500">
                      Tipificación requerida *
                    </span>
                  </p>
                  {formData.evidencias.map((file, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-3 animate-fade-in"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg font-bold text-xs uppercase w-12 text-center truncate">
                          {file.name.split(".").pop()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-bold text-gray-800 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <select
                          value={file.tipificacion}
                          onChange={(e) =>
                            handleEvidenciaTypeChange(index, e.target.value)
                          }
                          className={`w-full p-2 text-sm border rounded-lg outline-none focus:ring-1 focus:ring-blue-500 ${
                            !file.tipificacion
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">-- Seleccionar Tipo --</option>
                          {tiposEvidencia.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Eliminar archivo"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="5. Responsable Empresa">
            <FormSelect
              label="Nombre Responsable"
              name="nombreResponsable"
              value={formData.nombreResponsable}
              onChange={handleSelectResponsable}
              options={listaResponsables}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="No. Identificación"
                name="idResponsable"
                value={formData.idResponsable}
                readOnly
              />
              <FormInput
                label="Cargo"
                name="cargoResponsable"
                value={formData.cargoResponsable}
                readOnly
              />
              <FormInput
                label="Teléfono Contacto"
                name="telResponsable"
                value={formData.telResponsable}
                readOnly
              />
              <FormInput
                label="Email"
                name="emailResponsable"
                value={formData.emailResponsable}
                readOnly
              />
            </div>
          </FormSection>

          <FormSection title="6. Responsable Proveedor">
            <FormInput
              label="Nombre Proveedor"
              value={formData.nombreProveedor}
              readOnly
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormInput
                label="No. Identificación"
                value={formData.idProveedor}
                readOnly
              />
              <FormInput
                label="Cargo"
                value={formData.cargoProveedor}
                readOnly
              />
              <FormInput
                label="Teléfono Contacto"
                name="telProveedor"
                value={formData.telProveedor}
                readOnly
              />
              <FormInput
                label="Email"
                name="emailProveedor"
                value={formData.emailProveedor}
                readOnly
              />
              <div className="md:col-span-2">
                <FormInput
                  label="NÚMERO LICENCIA SST Y FECHA DE EXPEDICIÓN"
                  name="licenciaSST"
                  value={formData.licenciaSST}
                  readOnly
                />
              </div>
            </div>
          </FormSection>

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => onNavigate("main")}
              type="button"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-900 text-white rounded-lg font-bold shadow-lg"
            >
              Guardar e Ir a Firmar
            </button>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};

export default ActaFormScreen;