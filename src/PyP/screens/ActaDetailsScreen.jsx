import React from "react";
import AppLayout from "../components/AppLayout";
import ActaPreview from "../components/ActaPreview";

const ActaDetailsScreen = ({ onNavigate, sdsItem, user }) => {
  // 1. Intentamos obtener la data completa del formulario guardado en 'DetallesActa'
  const savedForm = sdsItem.DetallesActa || {};

  // 2. Construimos el objeto de visualización
  const viewOnlyForm = {
    // --- DATOS FIJOS ---
    sdsNumber: sdsItem.SDS,
    cliente: sdsItem.Cliente,
    poliza: sdsItem.Poliza,

    // --- SECCIÓN 1: ACTIVIDAD ---
    tipoActividad: savedForm.tipoActividad || "especifica",
    fechaActividad: savedForm.fechaActividad || sdsItem.FechaProgramada,
    horaInicio: savedForm.horaInicio || "08:00",
    horaFin: savedForm.horaFin || "10:00",
    horasTotales: savedForm.horasTotales || sdsItem.HorasEjecutadas || 0,
    mes: savedForm.mes || "",
    ano: savedForm.ano || "",

    // --- SECCIÓN 3: UBICACIÓN ---
    ubicacionTipo: savedForm.ubicacionTipo || "presencial",
    departamento: savedForm.departamento || "No registrado",
    municipio: savedForm.municipio || sdsItem.Municipio || "No registrado",
    direccion: savedForm.direccion || "No registrada",
    coordenadas: savedForm.coordenadas || "",

    // --- SECCIÓN 4: DETALLES DE EJECUCIÓN ---
    actividadPlaneada: sdsItem.Actividad,
    cantidadPlaneada: sdsItem.HorasPlaneadas,
    cantidadEjecutada:
      savedForm.cantidadEjecutada || sdsItem.HorasEjecutadas || 0,
    personasCubiertas: savedForm.personasCubiertas || 0,
    evaluacion: savedForm.evaluacion || sdsItem.Calificacion || "N/A",
    observaciones: savedForm.observaciones || "Sin observaciones registradas.",
    evidencias: savedForm.evidencias || [],

    // --- SECCIÓN 5: RESPONSABLE EMPRESA ---
    nombreResponsable: savedForm.nombreResponsable || "N/A",
    idResponsable: savedForm.idResponsable || "",
    telResponsable: savedForm.telResponsable || "",
    cargoResponsable: savedForm.cargoResponsable || "",
    emailResponsable: savedForm.emailResponsable || "",

    // --- SECCIÓN 6: RESPONSABLE PROVEEDOR ---
    nombreProveedor: savedForm.nombreProveedor || sdsItem.Proveedor || "N/A",
    idProveedor: savedForm.idProveedor || "",
    telProveedor: savedForm.telProveedor || "",
    cargoProveedor: savedForm.cargoProveedor || "",
    emailProveedor: savedForm.emailProveedor || "",
    // AJUSTE REALIZADO: Captura del campo Licencia SST
    licenciaSST: savedForm.licenciaSST || "Res. 4502 de 2021 | Exp: 12/05/2021",
  };

  const realClientSignature = sdsItem.Firmas?.Cliente || null;
  const realProviderSignature = sdsItem.Firmas?.Proveedor || null;

  const mockClientSig = {
    signMethod: "Digital",
    timestamp: "N/A",
    geolocation: "N/A",
    qrUrl: null,
  };

  // --- NUEVA FUNCIÓN: SIMULACIÓN DE EXPORTACIÓN ---
  const handleExportPDF = () => {
    // Aquí iría la lógica real (ej. usando html2pdf o jsPDF)
    alert(
      `⏳ Generando documento PDF para el Acta #${sdsItem.SDS}...\n\nEl archivo se descargará automáticamente en unos segundos.`
    );
  };

  return (
    <AppLayout onNavigate={onNavigate} title={`Detalle Acta #${sdsItem.SDS}`}>
      <div className="pb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-green-800">Acta Finalizada</p>
            <p className="text-xs text-green-600">
              {sdsItem.Firmas ? "Firmada Digitalmente" : "Histórico Excel"}
            </p>
          </div>
        </div>

        <ActaPreview
          form={viewOnlyForm}
          showWatermark={false}
          clientSignature={
            realClientSignature || (sdsItem.Firmas ? mockClientSig : null)
          }
          providerSignature={
            realProviderSignature || (sdsItem.Firmas ? mockClientSig : null)
          }
        />

        {/* --- BOTONES DE ACCIÓN --- */}
        <div className="flex flex-col gap-3 mt-6">
          {/* Botón Nuevo: Exportar PDF */}
          <button
            onClick={handleExportPDF}
            className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            Exportar Acta en PDF
          </button>

          <button
            onClick={() => onNavigate("main")}
            className="w-full py-4 bg-blue-900 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform hover:bg-blue-800"
          >
            Volver al Listado
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ActaDetailsScreen;
