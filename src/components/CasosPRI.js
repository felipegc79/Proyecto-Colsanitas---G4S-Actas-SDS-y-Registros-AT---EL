import React, { useState, useMemo, useEffect } from "react";
import { FileText, Upload, Download, Search, Filter } from "lucide-react";
import { dataAT, loadFromStorage, syncFromDB } from "../data";

const CasosPRI = () => {
    // Cargar datos desde IndexedDB (async)
    const [rawData, setRawData] = useState([]);

    useEffect(() => {
        const load = async () => {
            const data = await syncFromDB("AT");
            if (data) setRawData(data);
        };
        load();
    }, []);

    // Filter cases marked as PRI = "SI"
    const priCases = useMemo(() => rawData.filter(c => {
        const val = (c.casoPRI || "").toString().trim().toUpperCase();
        return val === "SI" || val === "SÍ";
    }), [rawData]);

    const [filters, setFilters] = useState({
        radicado: "",
        trabajador: "",
        identificacion: "",
        empresa: "",
        diagnostico: ""
    });

    const filteredCases = useMemo(() => {
        return priCases.filter(c => {
            const radicadoVal = c.radicado ? c.radicado.toLowerCase() : "";
            const trabajadorVal = c.apellidosNombres ? c.apellidosNombres.toLowerCase() : "";
            const idVal = c.cedula ? c.cedula.toLowerCase() : "";
            const empresaVal = c.empresa ? c.empresa.toLowerCase() : "";
            const diagVal = c.diagnostico ? c.diagnostico.toLowerCase() : "";

            const matchRadicado = !filters.radicado || radicadoVal.includes(filters.radicado.toLowerCase());
            const matchTrabajador = !filters.trabajador || trabajadorVal.includes(filters.trabajador.toLowerCase());
            const matchId = !filters.identificacion || idVal.includes(filters.identificacion.toLowerCase());
            const matchEmpresa = !filters.empresa || empresaVal.includes(filters.empresa.toLowerCase());
            const matchDiag = !filters.diagnostico || diagVal.includes(filters.diagnostico.toLowerCase());

            return matchRadicado && matchTrabajador && matchId && matchEmpresa && matchDiag;
        });
    }, [priCases, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const paginatedCases = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredCases.slice(start, start + rowsPerPage);
    }, [filteredCases, currentPage]);

    const totalPages = Math.ceil(filteredCases.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleUploadRecomendaciones = (id) => {
        alert(`Funcionalidad simulada: Subir recomendaciones para caso ${id}`);
    };

    const handleDownloadRecomendaciones = (id) => {
        alert(`Funcionalidad simulada: Descargando PDF de recomendaciones para caso ${id}`);
    };

    return (
        <div style={{ padding: "30px" }}>
            <h2 style={{ color: "var(--colsanitas-blue)", marginBottom: "10px" }}>Módulo de Casos PRI</h2>
            <p style={{ color: "var(--colsanitas-grey)", marginBottom: "30px" }}>
                Gestión de casos en Programa de Rehabilitación Integral (PRI). Cargue y descargue recomendaciones laborales.
            </p>

            <div className="card" style={{ marginBottom: "20px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                    <Filter size={18} color="var(--colsanitas-green)" />
                    <h3 style={{ margin: 0, fontSize: "16px" }}>Filtros de Búsqueda</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096" }}>Radicado</label>
                        <input name="radicado" value={filters.radicado} onChange={handleFilterChange} className="input-colsanitas" placeholder="Buscar radicado..." />
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096" }}>Trabajador</label>
                        <input name="trabajador" value={filters.trabajador} onChange={handleFilterChange} className="input-colsanitas" placeholder="Nombre..." />
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096" }}>Identificación</label>
                        <input name="identificacion" value={filters.identificacion} onChange={handleFilterChange} className="input-colsanitas" placeholder="Documento..." />
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096" }}>Empresa</label>
                        <input name="empresa" value={filters.empresa} onChange={handleFilterChange} className="input-colsanitas" placeholder="Empresa..." />
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096" }}>Diagnóstico</label>
                        <input name="diagnostico" value={filters.diagnostico} onChange={handleFilterChange} className="input-colsanitas" placeholder="Diagnóstico..." />
                    </div>
                </div>
            </div>

            <div className="card">
                <table className="table-colsanitas">
                    <thead>
                        <tr>
                            <th>Radicado</th>
                            <th>Trabajador</th>
                            <th>Empresa</th>
                            <th>Diagnóstico</th>
                            <th>Caso PRI</th>
                            <th>Fecha Ingreso PRI</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCases.length > 0 ? (
                            paginatedCases.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.radicado}</td>
                                    <td>
                                        <div style={{ fontWeight: "bold" }}>{item.apellidosNombres}</div>
                                        <div style={{ fontSize: "11px", color: "#718096" }}>CC: {item.cedula}</div>
                                    </td>
                                    <td>{item.empresa}</td>
                                    <td>{item.diagnostico}</td>
                                    <td><span className="status-badge success">SI</span></td>
                                    <td>{item.fechaIngresoPRI || "N/A"}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button
                                                className="btn-colsanitas-outline"
                                                style={{ padding: "5px 10px", fontSize: "12px" }}
                                                onClick={() => handleUploadRecomendaciones(item.id)}
                                                title="Cargar Recomendaciones (Área Rehabilitación)"
                                            >
                                                <Upload size={14} /> Cargar Rec.
                                            </button>
                                            <button
                                                className="btn-colsanitas"
                                                style={{ padding: "5px 10px", fontSize: "12px" }}
                                                onClick={() => handleDownloadRecomendaciones(item.id)}
                                                title="Descargar Recomendaciones (Empresa)"
                                            >
                                                <Download size={14} /> Descargar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#A0AEC0" }}>
                                    No se encontraron casos PRI activos con los filtros seleccionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
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
            )}
        </div>
    );
};

export default CasosPRI;
