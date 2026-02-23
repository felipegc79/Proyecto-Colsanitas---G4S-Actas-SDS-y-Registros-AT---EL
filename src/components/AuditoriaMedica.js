
import React, { useState, useMemo, useEffect } from "react";
import { Calendar, Clipboard, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { dataAT, loadFromStorage, syncFromDB } from "../data";

const AuditoriaMedica = () => {
    // Mock additional audit data mixed with AT data from IndexedDB
    const [auditRecords, setAuditRecords] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    useEffect(() => {
        const load = async () => {
            const data = await syncFromDB("AT");
            if (data && data.length > 0) {
                setAuditRecords(data.slice(0, 50).map(r => ({
                    ...r,
                    fechaUltimaAuditoria: "2023-10-15",
                    notas: ""
                })));
            }
        };
        load();
    }, []);

    const filteredRecords = useMemo(() => {
        return auditRecords.filter(r =>
            r.apellidosNombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.cedula.includes(searchTerm)
        );
    }, [auditRecords, searchTerm]);

    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredRecords.slice(start, start + rowsPerPage);
    }, [filteredRecords, currentPage]);

    const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [noteContent, setNoteContent] = useState("");

    const calculateSemaforo = (fechaUltima) => {
        if (!fechaUltima) return { color: "grey", status: "Sin Auditoría" };

        const last = new Date(fechaUltima);
        const next = new Date(last);
        next.setMonth(next.getMonth() + 6);

        const now = new Date();
        // Difference in months
        const diffTime = Math.abs(now - last);
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

        if (diffMonths < 4) return { color: "#48BB78", status: "Vigente", icon: CheckCircle }; // Green
        if (diffMonths === 5) return { color: "#ECC94B", status: "Próximo a Vencer", icon: Clock }; // Yellow
        return { color: "#E53E3E", status: "Vencido", icon: AlertCircle }; // Red
    };

    const handleGenerateNote = (record) => {
        const template = `*** RESUMEN AUDITORÍA MÉDICA ***
    Fecha: ${new Date().toLocaleDateString()}
Paciente: ${record.apellidosNombres}
ID: ${record.cedula}
Empresa: ${record.empresa}
Diagnóstico: ${record.diagnostico}
Siniestro: ${record.siniestro}
-------------------------------------
    Hallazgos:
[Escribir aquí...]

Plan de Manejo:
[Escribir aquí...]

Próxima Revisión: ${new Date(new Date().setMonth(new Date().getMonth() + 6)).toLocaleDateString()}
`;
        setNoteContent(template);
        setSelectedRecord(record);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(noteContent);
        alert("Nota copiada al portapapeles para Visual Time");
    };

    return (
        <div className="container-fluid" style={{ padding: "30px" }}>
            <h2 style={{ color: "var(--colsanitas-blue)", marginBottom: "20px" }}>Seguimiento de Auditoría Médica</h2>

            <div style={{ display: "grid", gridTemplateColumns: selectedRecord ? "2fr 1fr" : "1fr", gap: "20px" }}>

                {/* Tabla de Casos */}
                <div className="card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <h3 style={{ fontSize: "16px", margin: 0 }}>Casos Asignados</h3>
                        <input
                            type="text"
                            placeholder="Buscar por paciente o cédula..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-colsanitas"
                            style={{ width: "250px" }}
                        />
                    </div>
                    <table className="table-colsanitas">
                        <thead>
                            <tr>
                                <th>Paciente</th>
                                <th>Última Auditoría</th>
                                <th>Próxima (Calc)</th>
                                <th>Semaforo</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRecords.map(r => {
                                const sem = calculateSemaforo(r.fechaUltimaAuditoria);
                                const nextDate = new Date(r.fechaUltimaAuditoria);
                                nextDate.setMonth(nextDate.getMonth() + 6);

                                return (
                                    <tr key={r.id}>
                                        <td>
                                            <div style={{ fontWeight: "bold" }}>{r.apellidosNombres}</div>
                                            <div style={{ fontSize: "11px", color: "#718096" }}>{r.cedula}</div>
                                        </td>
                                        <td>{r.fechaUltimaAuditoria}</td>
                                        <td>{nextDate.toISOString().split('T')[0]}</td>
                                        <td>
                                            <span style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                color: sem.color,
                                                fontWeight: "bold",
                                                background: `${sem.color} 20`,
                                                padding: "4px 8px",
                                                borderRadius: "12px",
                                                fontSize: "12px"
                                            }}>
                                                <sem.icon size={14} /> {sem.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-colsanitas-outline" style={{ padding: "5px 10px", fontSize: "12px" }} onClick={() => handleGenerateNote(r)}>
                                                <Clipboard size={14} /> Nota Visual Time
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
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

                {/* Generador de Notas */}
                {selectedRecord && (
                    <div className="card" style={{ padding: "20px", height: "fit-content", position: "sticky", top: "20px" }}>
                        <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "var(--colsanitas-blue)" }}>Generador de Notas (Visual Time)</h3>
                        <div style={{ marginBottom: "10px", fontSize: "13px", color: "#4A5568" }}>
                            Edite el resumen a continuación y cópielo para pegarlo en Visual Time.
                        </div>
                        <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            style={{
                                width: "100%",
                                height: "300px",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #E2E8F0",
                                fontFamily: "monospace",
                                fontSize: "12px",
                                resize: "vertical"
                            }}
                        />
                        <button className="btn-colsanitas" onClick={copyToClipboard} style={{ width: "100%", marginTop: "15px", justifyContent: "center" }}>
                            <Clipboard size={18} /> Copiar al Portapapeles
                        </button>
                        <button className="btn-colsanitas-outline" onClick={() => setSelectedRecord(null)} style={{ width: "100%", marginTop: "10px", justifyContent: "center" }}>
                            Cerrar
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AuditoriaMedica;
