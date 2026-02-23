import React from "react";

const ActaPreview = ({
  form,
  showWatermark = true,
  clientSignature,
  providerSignature,
}) => {
  if (!form) return null;

  const renderRow = (label, value) => (
    <div className="py-3 border-b border-gray-100 last:border-0 px-4">
      <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-base font-medium text-gray-900 mt-1 break-words">
        {value || <span className="text-gray-400 italic">N/A</span>}
      </dd>
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div className="bg-[#00b288] py-2 px-4 rounded-t-lg mt-4 first:mt-0 relative z-10">
      <h3 className="text-base font-bold text-white uppercase tracking-wide">
        {title}
      </h3>
    </div>
  );

  const SignatureBlock = ({ title, data, color }) => {
    if (!data) return null;
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-row items-center gap-4">
        <div className="flex-shrink-0">
          <img
            src={data.qrUrl || "https://placehold.co/100x100?text=QR"}
            alt="QR Firma"
            className="w-24 h-24 object-contain border border-gray-100 rounded"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-bold uppercase mb-1 border-b pb-1 ${
              color === "blue"
                ? "text-blue-600 border-blue-100"
                : "text-green-600 border-green-100"
            }`}
          >
            {title}
          </p>
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 uppercase">
              <span className="font-bold">Método:</span>{" "}
              {data.signMethod || "Digital"}
            </p>
            {data.signatureName && (
              <p className="text-[10px] text-gray-900 font-bold uppercase truncate">
                {data.signatureName}
              </p>
            )}
            <p className="text-[10px] text-gray-500">📅 {data.timestamp}</p>
            <p className="text-[10px] text-gray-500 truncate">
              📍 {data.geolocation}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 relative min-h-[600px]">
      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none overflow-hidden mix-blend-multiply opacity-15">
          <div className="transform -rotate-45">
            <p className="text-6xl font-black text-gray-800 whitespace-nowrap mb-32">
              SEGUROS COLSANITAS
            </p>
            <p className="text-6xl font-black text-gray-800 whitespace-nowrap mb-32">
              BORRADOR - NO VÁLIDO
            </p>
            <p className="text-6xl font-black text-gray-800 whitespace-nowrap">
              SEGUROS COLSANITAS
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="p-5 text-center border-b border-gray-100 bg-white">
          <h4 className="font-bold text-xl text-blue-900">ACTA DE VISITA</h4>
          <p className="text-sm text-gray-500">SDS #{form.sdsNumber}</p>
        </div>

        <div className="p-4 pt-0">
          <SectionHeader title="1. Información General" />
          <div className="bg-white border-x border-b border-gray-100 rounded-b-lg mb-2">
            {renderRow("Cliente", form.cliente)}
            {renderRow("Póliza", form.poliza)}
            {renderRow(
              "Tipo de Actividad",
              form.tipoActividad === "especifica"
                ? "Específica"
                : "Por Proyecto"
            )}
          </div>

          <SectionHeader title="2. Tiempo y Lugar" />
          <div className="bg-white border-x border-b border-gray-100 rounded-b-lg mb-2">
            {form.tipoActividad === "especifica" ? (
              <>
                {renderRow("Fecha Actividad", form.fechaActividad)}
                <div className="grid grid-cols-2">
                  {renderRow("Inicio", form.horaInicio)}
                  {renderRow("Fin", form.horaFin)}
                </div>
                {renderRow("Horas Totales", form.horasTotales)}
              </>
            ) : (
              <>
                {renderRow("Mes Reportado", form.mes)}
                {renderRow("Año", form.ano)}
              </>
            )}
            {renderRow(
              "Modalidad",
              form.ubicacionTipo === "presencial" ? "Presencial" : "Virtual"
            )}
            {renderRow("Municipio", form.municipio)}
            {renderRow("Dirección", form.direccion)}
          </div>

          <SectionHeader title="3. Ejecución y Evidencias" />
          <div className="bg-white border-x border-b border-gray-100 rounded-b-lg mb-2">
            {renderRow("Actividad Planeada", form.actividadPlaneada)}
            <div className="grid grid-cols-2">
              {renderRow("Planeado", form.cantidadPlaneada)}
              {renderRow("Ejecutado", form.cantidadEjecutada)}
            </div>
            {renderRow("Personas Cubiertas", form.personasCubiertas)}
            {renderRow("Evaluación", form.evaluacion?.replace(/_/g, " "))}

            {/* PUNTO 3: CAPTURA Y MUESTRA DE EVIDENCIAS */}
            {form.evidencias && form.evidencias.length > 0 ? (
              <div className="py-3 border-b border-gray-100 px-4">
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex justify-between items-center">
                  <span>Archivos Adjuntos</span>
                  <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    {form.evidencias.length}
                  </span>
                </dt>
                <dd className="text-sm">
                  <ul className="space-y-2 mt-2">
                    {form.evidencias.map((e, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-gray-700 text-xs bg-gray-50 p-2 rounded"
                      >
                        <span className="text-lg">📎</span>
                        <div className="flex flex-col">
                          <span className="font-bold break-all">{e.name}</span>
                          <span className="text-[10px] text-gray-500 uppercase font-semibold">
                            {e.tipificacion || "Sin tipificar"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : (
              <div className="py-3 border-b border-gray-100 px-4">
                <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  Archivos Adjuntos
                </dt>
                <dd className="text-sm italic text-gray-400 mt-1">
                  Sin evidencias cargadas.
                </dd>
              </div>
            )}

            <div className="py-3 border-b border-gray-100 px-4">
              <dt className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Observaciones
              </dt>
              <dd className="text-sm font-medium text-gray-900 mt-1 p-3 bg-gray-50 rounded border border-gray-100 italic">
                {form.observaciones || "Sin observaciones registradas."}
              </dd>
            </div>
          </div>

          <SectionHeader title="4. Responsables" />
          <div className="bg-white border-x border-b border-gray-100 rounded-b-lg mb-2">
            {/* GRUPO CLIENTE */}
            <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-blue-900 uppercase border-y border-gray-100">
              Cliente
            </div>
            {renderRow("Nombre", form.nombreResponsable)}
            {renderRow("Identificación", form.idResponsable)}
            {renderRow("Teléfono", form.telResponsable)}
            {renderRow("Cargo", form.cargoResponsable)}
            {renderRow("Email", form.emailResponsable)}

            {/* GRUPO ASESOR */}
            <div className="bg-gray-50 px-4 py-2 text-xs font-bold text-blue-900 uppercase border-y border-gray-100 mt-2">
              Asesor de Prevención
            </div>
            {renderRow("Nombre", form.nombreProveedor)}
            {renderRow("Identificación", form.idProveedor)}
            {renderRow("Teléfono", form.telProveedor)}
            {renderRow("Cargo", form.cargoProveedor)}
            {renderRow("Email", form.emailProveedor)}
            {renderRow("Licencia SST", form.licenciaSST)}
          </div>
        </div>

        {(clientSignature || providerSignature) && (
          <div className="mt-4 p-4 bg-gray-50 border-t border-gray-200 relative z-20">
            <h5 className="font-bold text-center mb-6 text-blue-900 uppercase tracking-widest text-sm">
              Firmas Digitales Verificadas (QR)
            </h5>
            <div className="flex flex-col gap-4">
              {providerSignature && (
                <SignatureBlock
                  title="Firma Asesor"
                  data={providerSignature}
                  color="green"
                />
              )}
              {clientSignature && (
                <SignatureBlock
                  title="Firma Cliente"
                  data={clientSignature}
                  color="blue"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActaPreview;
