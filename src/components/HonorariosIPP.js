import React, { useState, useMemo, useEffect } from "react";
import { DollarSign, Bell } from "lucide-react";

const HonorariosIPP = () => {
    // Mock
    const pagos = [
        { id: 1, trabajador: "JUAN PEREZ", concepto: "Indemnización PCL", valor: 5400000, fechaVencimiento: "2024-03-01", estado: "Pendiente" },
        { id: 2, trabajador: "MARIA LOPEZ", concepto: "Honorarios Junta Regional", valor: 1200000, fechaVencimiento: "2024-02-15", estado: "Pagado" },
        { id: 3, trabajador: "PEDRO GOMEZ", concepto: "Indemnización PCL", valor: 3500000, fechaVencimiento: "2024-03-10", estado: "Pendiente" },
        { id: 4, trabajador: "LUISA FERNANDEZ", concepto: "Honorarios Junta Nacional", valor: 1500000, fechaVencimiento: "2024-02-28", estado: "Pagado" },
        { id: 5, trabajador: "MARIO LOPEZ", concepto: "Indemnización PCL", valor: 8200000, fechaVencimiento: "2024-04-01", estado: "Pendiente" },
        { id: 6, trabajador: "CARMEN PEREZ", concepto: "Honorarios Junta Regional", valor: 1100000, fechaVencimiento: "2024-01-15", estado: "Pagado" },
        { id: 7, trabajador: "JORGE RAMIREZ", concepto: "Indemnización PCL", valor: 2500000, fechaVencimiento: "2024-03-05", estado: "Pendiente" },
        { id: 8, trabajador: "ANDREA TORRES", concepto: "Honorarios Junta Nacional", valor: 1600000, fechaVencimiento: "2024-02-20", estado: "Pagado" },
    ];

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const filteredPagos = useMemo(() => {
        return pagos.filter(p =>
            p.trabajador.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.estado.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pagos, searchTerm]);

    const paginatedPagos = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredPagos.slice(start, start + rowsPerPage);
    }, [filteredPagos, currentPage]);

    const totalPages = Math.ceil(filteredPagos.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div style={{ padding: "30px" }}>
            <h2 style={{ color: "var(--colsanitas-blue)", marginBottom: "20px" }}>Gestión de Honorarios e IPP</h2>

            <div className="card" style={{ padding: "20px", marginBottom: "30px", background: "#FFF5F5", border: "1px solid #FEB2B2" }}>
                <h3 style={{ fontSize: "16px", color: "#C53030", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                    <Bell size={20} /> Alertas de Vencimiento de Pagos
                </h3>
                <div style={{ marginTop: "15px" }}>
                    {pagos.filter(p => p.estado === 'Pendiente').map(p => (
                        <div key={p.id} style={{ background: "white", padding: "10px", borderRadius: "8px", marginBottom: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between" }}>
                            <span><strong>{p.trabajador}</strong> - {p.concepto}</span>
                            <span style={{ color: "#E53E3E", fontWeight: "bold" }}>Vence: {p.fechaVencimiento}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ fontSize: "16px", margin: 0 }}>Historial de Pagos</h3>
                    <input
                        type="text"
                        placeholder="Buscar por trabajador, concepto o estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-colsanitas"
                        style={{ width: "300px" }}
                    />
                </div>
                <table className="table-colsanitas">
                    <thead>
                        <tr>
                            <th>Trabajador</th>
                            <th>Concepto</th>
                            <th>Valor</th>
                            <th>Fecha Vencimiento</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPagos.map(p => (
                            <tr key={p.id}>
                                <td>{p.trabajador}</td>
                                <td>{p.concepto}</td>
                                <td>${p.valor.toLocaleString()}</td>
                                <td>{p.fechaVencimiento}</td>
                                <td>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "12px",
                                        background: p.estado === 'Pagado' ? '#C6F6D5' : '#FED7D7',
                                        color: p.estado === 'Pagado' ? '#2F855A' : '#C53030',
                                        fontSize: "11px",
                                        fontWeight: "bold"
                                    }}>
                                        {p.estado}
                                    </span>
                                </td>
                                <td>
                                    <button className="icon-btn"><DollarSign size={16} /></button>
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

export default HonorariosIPP;
