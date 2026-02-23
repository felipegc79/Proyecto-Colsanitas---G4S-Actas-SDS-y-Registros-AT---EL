import React, { useState } from "react";
import { PlusCircle, Upload, Save, Users } from "lucide-react";

const CargaMasivaPoblacion = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        // Mock parsing excel
        setPreview([
            { id: 1, empresa: "COLLECTIVE SAS", trabajadores: 1200, riesgo: "IV", actividad: "Servicios Temporales" },
            { id: 2, empresa: "EPS COLSANITAS", trabajadores: 850, riesgo: "I", actividad: "Salud" },
        ]);
    };

    const handleUpload = () => {
        alert("Archivo cargado y procesado. Base de datos de población actualizada.");
        setFile(null);
        setPreview([]);
    };

    return (
        <div style={{ padding: "30px" }}>
            <h2 style={{ color: "var(--colsanitas-blue)", marginBottom: "20px" }}>Carga Masiva de Población</h2>

            <div className="card" style={{ padding: "30px", marginBottom: "30px", textAlign: "center", border: "2px dashed #CBD5E0" }}>
                <Upload size={48} color="#A0AEC0" style={{ marginBottom: "15px" }} />
                <h3 style={{ fontSize: "18px", color: "#4A5568", marginBottom: "10px" }}>Cargar Archivo de Afiliaciones</h3>
                <p style={{ color: "#718096", marginBottom: "20px" }}>
                    Seleccione el archivo Excel (.xlsx) con la estructura: Empresa, Cantidad Trabajadores, Clase Riesgo, Actividad Económica.
                </p>
                <input type="file" onChange={handleFileChange} style={{ display: "none" }} id="file-upload" />
                <label htmlFor="file-upload" className="btn-colsanitas" style={{ display: "inline-flex", cursor: "pointer" }}>
                    Seleccionar Archivo
                </label>
                {file && <div style={{ marginTop: "10px", fontWeight: "bold" }}>Archivo: {file.name}</div>}
            </div>

            {preview.length > 0 && (
                <div className="card" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>Vista Previa de Carga</h3>
                    <table className="table-colsanitas">
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>Cantidad Trabajadores</th>
                                <th>Clase Riesgo</th>
                                <th>Actividad Económica</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preview.map(r => (
                                <tr key={r.id}>
                                    <td>{r.empresa}</td>
                                    <td>{r.trabajadores}</td>
                                    <td>{r.riesgo}</td>
                                    <td>{r.actividad}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: "20px", textAlign: "right" }}>
                        <button className="btn-colsanitas" onClick={handleUpload}>
                            <Save size={18} /> Confirmar Carga
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CargaMasivaPoblacion;
