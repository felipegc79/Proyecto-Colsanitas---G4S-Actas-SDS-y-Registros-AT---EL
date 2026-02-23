import React, { useState } from "react";
import { FileText, Download, ShieldCheck, Award } from "lucide-react";
import jsPDF from "jspdf";

const Certificados = () => {
    const [tipoCertificado, setTipoCertificado] = useState("Normal");
    const [identificacion, setIdentificacion] = useState("");
    const [nombre, setNombre] = useState("");
    const [fechaAccidente, setFechaAccidente] = useState("");
    const [empresa, setEmpresa] = useState("");

    const handleGeneratePDF = () => {
        if (!identificacion || !nombre) {
            alert("Por favor ingrese los datos requeridos (Cédula y Nombre).");
            return;
        }

        const doc = new jsPDF();

        // Logo placeholder
        doc.setFontSize(22);
        doc.setTextColor(0, 75, 141); // Colsanitas Blue
        doc.text("Colsanitas Seguros", 105, 20, null, null, "center");

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`CERTIFICADO - ${tipoCertificado.toUpperCase()}`, 105, 40, null, null, "center");

        doc.setFontSize(12);
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 20, 60);

        const bodyText = `
      Por medio de la presente certificamos que el trabajador(a) ${nombre}, 
      identificado(a) con cédula de ciudadanía No. ${identificacion}, 
      laborando para la empresa ${empresa || "[EMPRESA]"},
      ${fechaAccidente ? `presentó un evento reportado con fecha ${fechaAccidente}.` : "se encuentra afiliado a nuestra ARL."}

      Este certificado se expide a solicitud del interesado para trámites pertinentes.
      
      Atentamente,
      
      Gerencia de Riesgos Laborales
      Colsanitas Seguros
    `;

        const splitText = doc.splitTextToSize(bodyText, 170);
        doc.text(splitText, 20, 80);

        // Footer for specific types
        if (tipoCertificado === "RUC") {
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Certificación válida para Registro Uniforme de Evaluación del Sistema de Gestión en Seguridad, Salud Ocupacional y Ambiente (RUC).", 105, 280, null, null, "center");
        } else if (tipoCertificado === "CCS") {
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Certificación avalada por el Consejo Colombiano de Seguridad.", 105, 280, null, null, "center");
        } else if (tipoCertificado === "Accidentalidad") {
            doc.text("Certificado específico de accidentalidad detallada para el trabajador.", 105, 280, null, null, "center");
        } else if (tipoCertificado === "Diagnosticos") {
            doc.text("Certificación de diagnósticos actualmente en proceso de calificación.", 105, 280, null, null, "center");
        } else if (tipoCertificado === "PagosIPP") {
            doc.text("Certificado tributario de pagos por concepto de Indemnizaciónes (IPP) / fines DIAN.", 105, 280, null, null, "center");
        }

        doc.save(`Certificado_${tipoCertificado}_${identificacion}.pdf`);
    };

    return (
        <div style={{ padding: "30px" }}>
            <h2 style={{ color: "var(--colsanitas-blue)", marginBottom: "20px" }}>Módulo de Certificados</h2>
            <p style={{ marginBottom: "30px", color: "var(--colsanitas-grey)" }}>
                Genere certificados automáticos para trabajadores y empresas.
            </p>

            <div className="card" style={{ maxWidth: "600px", margin: "0 auto", padding: "30px" }}>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Tipo de Certificado</label>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {["Normal", "RUC", "Consejo Colombiano de Seguridad", "Accidentalidad", "Diagnosticos", "PagosIPP"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setTipoCertificado(type === "Consejo Colombiano de Seguridad" ? "CCS" : type)}
                                className={`btn-colsanitas ${tipoCertificado === (type === "Consejo Colombiano de Seguridad" ? "CCS" : type) ? "" : "btn-colsanitas-outline"}`}
                                style={{ flex: "1 1 150px", fontSize: "12px", padding: "10px" }}
                            >
                                {type === "PagosIPP" ? "Pagos IPP/DIAN" : type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
                    <label>
                        Identificación del Trabajador *:
                        <input
                            className="input-colsanitas"
                            value={identificacion}
                            onChange={(e) => setIdentificacion(e.target.value)}
                            placeholder="Ej. 10101010"
                        />
                    </label>
                    <label>
                        Nombre Completo *:
                        <input
                            className="input-colsanitas"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej. Juan Perez"
                        />
                    </label>
                    <label>
                        Empresa (Opcional):
                        <input
                            className="input-colsanitas"
                            value={empresa}
                            onChange={(e) => setEmpresa(e.target.value)}
                            placeholder="Nombre de la empresa"
                        />
                    </label>
                    <label>
                        Fecha del Evento (Si aplica):
                        <input
                            type="date"
                            className="input-colsanitas"
                            value={fechaAccidente}
                            onChange={(e) => setFechaAccidente(e.target.value)}
                        />
                    </label>
                </div>

                <div style={{ marginTop: "30px", textAlign: "center" }}>
                    <button onClick={handleGeneratePDF} className="btn-colsanitas" style={{ width: "100%", justifyContent: "center" }}>
                        <Download size={18} /> Generar y Descargar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Certificados;
