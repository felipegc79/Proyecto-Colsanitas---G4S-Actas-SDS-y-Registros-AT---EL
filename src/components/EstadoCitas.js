import React, { useState, useMemo, useEffect } from "react";
import { ExternalLink, Database } from "lucide-react";

const EstadoCitas = () => {
    // Mock data meant to represent Google Drive Link content
    const driveData = [
        { id: 1, trabajador: "JUAN PEREZ", empresa: "COLLECTIVE SAS", cita: "2024-02-20 08:00 AM", estado: "Programada", especialista: "Dr. Smith" },
        { id: 2, trabajador: "MARIA LOPEZ", empresa: "EPS COLSANITAS", cita: "2024-02-21 10:30 AM", estado: "Cancelada", especialista: "Dra. Jones" },
        { id: 3, trabajador: "PEDRO RUIZ", empresa: "CENTRO MEDICO", cita: "2024-02-22 02:00 PM", estado: "Realizada", especialista: "Dr. Brown" },
        { id: 4, trabajador: "CARLOS GOMEZ", empresa: "ESTRATEGICOS 360", cita: "2024-02-23 09:00 AM", estado: "Programada", especialista: "Dr. Smith" },
        { id: 5, trabajador: "ANDREA TORRES", empresa: "CLINICA COLSANITAS", cita: "2024-02-24 11:00 AM", estado: "Cancelada", especialista: "Dr. White" },
        { id: 6, trabajador: "LUISA FERNANDEZ", empresa: "SEGUROS COLSANITAS", cita: "2024-02-25 03:00 PM", estado: "Realizada", especialista: "Dra. Jones" },
        { id: 7, trabajador: "MARIO LOPEZ", empresa: "YAZAKI CIEMEL", cita: "2024-02-26 08:30 AM", estado: "Programada", especialista: "Dr. Brown" },
        { id: 8, trabajador: "JORGE RAMIREZ", empresa: "INDUSTRIAL GOYA", cita: "2024-02-27 10:00 AM", estado: "Programada", especialista: "Dr. Smith" },
    ];

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const filteredData = useMemo(() => {
        return driveData.filter(d =>
            d.trabajador.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.especialista.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [driveData, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(start, start + rowsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div style={{ padding: "30px" }}>
            <h2 style={{ color: "var(--colsanitas-blue)", marginBottom: "20px" }}>Estado de Citas (Conexión Drive)</h2>

            <div className="card" style={{ padding: "30px", textAlign: "center", marginBottom: "30px" }}>
                <Database size={48} color="var(--colsanitas-green)" style={{ marginBottom: "15px" }} />
                <h3 style={{ margin: 0, color: "#2D3748" }}>Conexión Directa a Google Drive</h3>
                <p style={{ color: "#718096", maxWidth: "600px", margin: "10px auto" }}>
                    Este módulo visualiza en tiempo real el archivo de seguimiento de citas compartido por el canal.
                    Las empresas pueden consultar aquí el estado de su programación.
                </p>
                <div style={{ marginTop: "20px", padding: "10px", background: "#F0FFF4", borderRadius: "8px", border: "1px solid #9AE6B4", display: "inline-block" }}>
                    <span style={{ color: "#2F855A", fontWeight: "bold", fontSize: "13px" }}>Estado de Conexión: ACTIVO (Sincronizado hace 5 min)</span>
                </div>
            </div>

            <div className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ fontSize: "16px", margin: 0 }}>Agenda de Citas Recientes</h3>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <input
                            type="text"
                            placeholder="Buscar por trabajador, empresa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-colsanitas"
                            style={{ width: "250px" }}
                        />
                        <button className="btn-colsanitas-outline" style={{ fontSize: "12px" }}>
                            <ExternalLink size={14} /> Abrir en Google Sheets
                        </button>
                    </div>
                </div>
                <table className="table-colsanitas">
                    <thead>
                        <tr>
                            <th>Trabajador</th>
                            <th>Empresa</th>
                            <th>Fecha Cita</th>
                            <th>Especialista</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(d => (
                            <tr key={d.id}>
                                <td>{d.trabajador}</td>
                                <td>{d.empresa}</td>
                                <td>{d.cita}</td>
                                <td>{d.especialista}</td>
                                <td>
                                    <span className={`status-badge ${d.estado === 'Programada' ? 'success' : (d.estado === 'Cancelada' ? 'error' : 'warning')}`}>
                                        {d.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "20px" }}>
                    <button
                        className="btn-colsanitas-outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                        Anterior
                    </button>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#4A5568" }}>
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        className="btn-colsanitas-outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EstadoCitas;
