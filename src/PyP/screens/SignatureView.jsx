import React from "react";
import AppLayout from "../components/AppLayout";
import ActaPreview from "../components/ActaPreview";
import { FormSelect } from "../components/FormComponents";

const SignatureView = ({
  form,
  onNavigate,
  showModal,
  clientSigned,
  providerSigned,
  pinVerified,
  clientSignatureData,
  providerSignatureData,
  setCurrentPin,
  setActaForm,
  onFinalize,
}) => {
  const handleEvaluationChange = (e) => {
    const { name, value } = e.target;
    setActaForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSendPin = () => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setCurrentPin(newPin);
    onNavigate("notification");
  };

  const handleFinalize = () => {
    showModal("Éxito", "Acta cerrada, sincronizada y enviada por correo.");
    onFinalize(form.sdsNumber, form);
  };

  // LÓGICA DE MARCA DE AGUA:
  // Debe mostrarse SIEMPRE, EXCEPTO cuando ya firmaron ambos (Cliente y Proveedor)
  const shouldShowWatermark = !(clientSigned && providerSigned);

  return (
    <AppLayout
      onNavigate={onNavigate}
      title={pinVerified ? "Validación Cliente" : "Firma Proveedor"}
    >
      <div className="flex flex-col pb-32">
        <div className="mb-4 px-1">
          {!providerSigned && (
            <p className="text-sm text-orange-600 font-bold">
              Paso 1: Como proveedor, revise y firme el acta.
            </p>
          )}
          {providerSigned && !pinVerified && (
            <p className="text-sm text-blue-600 font-bold">
              Paso 2: Envíe el PIN al cliente para validación.
            </p>
          )}
          {pinVerified && !clientSigned && (
            <p className="text-sm text-green-600 font-bold">
              Paso 3: Cliente validado. Evalúe y firme.
            </p>
          )}
        </div>

        {/* A. VISTA PREVIA DEL ACTA */}
        <ActaPreview
          form={form}
          // Aquí pasamos la condición lógica
          showWatermark={shouldShowWatermark}
          clientSignature={clientSignatureData}
          providerSignature={providerSignatureData}
        />

        {/* B. SECCIÓN DE EVALUACIÓN (Solo visible tras PIN Correcto) */}
        {pinVerified && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 animate-fade-in-up">
            <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 uppercase text-center">
                Evaluación del Servicio
              </h3>
              <p className="text-xs text-blue-600 text-center mt-1">
                (Habilitado tras validar PIN)
              </p>
            </div>

            <FormSelect
              label="¿Cómo califica la actividad?"
              name="evaluacion"
              value={form?.evaluacion || "N/A"}
              onChange={handleEvaluationChange}
              disabled={clientSigned}
              options={[
                { value: "N/A", label: "Seleccione una opción..." },
                { value: "Cumple", label: "Cumple Totalmente" },
                { value: "Cumple_Parcialmente", label: "Cumple Parcialmente" },
                { value: "No_Cumple", label: "No Cumple" },
              ]}
              isObject={false}
            />
          </div>
        )}

        {/* C. BOTONES DE ACCIÓN SECUENCIALES */}
        <div className="space-y-3">
          {/* PASO 1: FIRMAR PROVEEDOR */}
          {!pinVerified && (
            <button
              onClick={() => onNavigate("signProvider")}
              disabled={providerSigned}
              className={`w-full py-3 rounded-xl font-bold text-base shadow-sm border transition-all ${
                providerSigned
                  ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                  : "bg-white text-blue-900 border-blue-200"
              }`}
            >
              {providerSigned
                ? "1. Proveedor Firmado ✓"
                : "1. Firmar Proveedor"}
            </button>
          )}

          {/* PASO 2: ENVIAR PIN */}
          {!pinVerified && (
            <button
              onClick={handleSendPin}
              disabled={!providerSigned}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all ${
                !providerSigned
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white active:scale-95"
              }`}
            >
              2. Enviar PIN y Validar
            </button>
          )}

          {/* PASO 3: FIRMAR CLIENTE */}
          {pinVerified && (
            <button
              onClick={() => onNavigate("signClient")}
              disabled={form?.evaluacion === "N/A" || clientSigned}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 transition-all ${
                clientSigned
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : form?.evaluacion === "N/A"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white active:scale-95"
              }`}
            >
              {clientSigned ? "3. Cliente Firmado ✓" : "3. Firmar Cliente"}
            </button>
          )}

          {/* PASO 4: FINALIZAR */}
          {clientSigned && providerSigned && pinVerified && (
            <button
              onClick={handleFinalize}
              className="w-full py-4 mt-4 bg-gray-900 text-white rounded-xl font-bold text-lg shadow-lg animate-bounce"
            >
              4. Finalizar y Sincronizar
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SignatureView;
