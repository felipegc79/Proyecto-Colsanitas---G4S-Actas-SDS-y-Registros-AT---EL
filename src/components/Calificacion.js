
import React, { useState, useMemo, useEffect } from "react";
import { Gavel, AlertTriangle, FileText, Filter, Eye, Edit } from "lucide-react";
import { dataAT, dataEL, loadFromStorage, syncFromDB } from "../data";

const Calificacion = () => {
    // Cargar datos desde IndexedDB (async)
    const [rawAT, setRawAT] = useState([]);
    const [rawEL, setRawEL] = useState([]);

    useEffect(() => {
        const load = async () => {
            const at = await syncFromDB("AT");
            if (at) setRawAT(at);
            const el = await syncFromDB("EL");
            if (el) setRawEL(el);
        };
        load();
    }, []);

    // 1. Unificar datos de AT y EL según criterios
    const records = useMemo(() => {
        const atCases = rawAT
            .filter(c => c.requiereCalificacion === "SI")
            .map(c => ({
                id: c.id,
                radicado: c.radicado,
                fechaSolicitud: c.fechaAT,
                trabajador: c.apellidosNombres,
                cedula: c.cedula,
                empresa: c.empresa,
                tipoSiniestro: "AT",
                calificacionCurso: c.calificacionCurso || "N/A",
                estadoActual: c.estadoCalificacion || "En calificación",
                origenActual: "N/A",
                originalRecord: c
            }));

        const elCases = rawEL
            .filter(c => c.origenActual === "En Controversia")
            .map(c => ({
                id: c.id,
                radicado: c.radicado,
                fechaSolicitud: c.mes + " " + c.anio,
                trabajador: c.nombreCompleto || c.apellidosNombres || "Trabajador EL",
                cedula: c.cedula,
                empresa: c.empresa,
                tipoSiniestro: "EL",
                calificacionCurso: c.calificacionCurso || "Origen",
                estadoActual: c.estadoCalificacion || "En Controversia",
                origenActual: c.origenActual,
                originalRecord: c
            }));

        return [...atCases, ...elCases];
    }, [rawAT, rawEL]);

    // 2. Filtros
    const [filters, setFilters] = useState({
        radicado: "",
        fecha: "",
        cedula: "",
        tipoSiniestro: "",
        calificacionCurso: "",
        origenActual: ""
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const filteredRecords = useMemo(() => {
        return records.filter(item => {
            const matchRadicado = !filters.radicado || item.radicado.toLowerCase().includes(filters.radicado.toLowerCase());
            // Fecha es string en este mock, simple includes
            const matchFecha = !filters.fecha || item.fechaSolicitud.includes(filters.fecha);
            const matchCedula = !filters.cedula || item.cedula.includes(filters.cedula);
            const matchTipo = !filters.tipoSiniestro || item.tipoSiniestro === filters.tipoSiniestro;
            const matchCalif = !filters.calificacionCurso || item.calificacionCurso === filters.calificacionCurso;
            // Origen Actual: Solo aplica si el registro tiene ese dato (EL), si no, ignoramos para AT
            const matchOrigen = !filters.origenActual || item.origenActual === filters.origenActual;

            return matchRadicado && matchFecha && matchCedula && matchTipo && matchCalif && matchOrigen;
        });
    }, [records, filters]);

    // 3. Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredRecords.slice(start, start + rowsPerPage);
    }, [filteredRecords, currentPage]);

    const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    // Acciones Mock
    const handleView = (item) => {
        alert(`Viendo detalle del caso: ${item.radicado} (${item.tipoSiniestro})`);
    };

    const handleEdit = (item) => {
        alert(`Editando calificación del caso: ${item.radicado} `);
    };

    return (
        <div style={{ padding: "30px" }}>
            <h2 style={{ color: "var(--colsanitas-blue)", marginBottom: "20px" }}>Módulo de Calificación</h2>

            {/* KPIs Resumen */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "30px" }}>
                <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", borderLeft: "4px solid #4299E1" }}>
                    <div style={{ background: "#EBF8FF", padding: "10px", borderRadius: "50%" }}><Gavel color="#4299E1" /></div>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#718096" }}>CASOS EN CALIFICACIÓN</div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#2D3748" }}>{records.length}</div>
                    </div>
                </div>
                <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", borderLeft: "4px solid #ECC94B" }}>
                    <div style={{ background: "#FFFFF0", padding: "10px", borderRadius: "50%" }}><AlertTriangle color="#ECC94B" /></div>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#718096" }}>EN CONTROVERSIA</div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#2D3748" }}>{records.filter(r => r.origenActual === "En Controversia" || r.estadoActual === "En Controversia").length}</div>
                    </div>
                </div>
                <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "15px", borderLeft: "4px solid #48BB78" }}>
                    <div style={{ background: "#F0FFF4", padding: "10px", borderRadius: "50%" }}><FileText color="#48BB78" /></div>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#718096" }}>EN FIRME</div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "#2D3748" }}>{records.filter(r => r.estadoActual === "En Firme" || r.origenActual === "En Firme").length}</div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                    <Filter size={18} color="var(--colsanitas-green)" />
                    <h3 style={{ margin: 0, fontSize: "16px" }}>Filtros de Búsqueda</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096", marginBottom: "5px", display: "block" }}>Radicado</label>
                        <input name="radicado" value={filters.radicado} onChange={handleFilterChange} className="input-colsanitas" />
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096", marginBottom: "5px", display: "block" }}>Fecha</label>
                        <input type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} className="input-colsanitas" />
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096", marginBottom: "5px", display: "block" }}>Cédula</label>
                        <input name="cedula" value={filters.cedula} onChange={handleFilterChange} className="input-colsanitas" />
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096", marginBottom: "5px", display: "block" }}>Tipo Siniestro</label>
                        <select name="tipoSiniestro" value={filters.tipoSiniestro} onChange={handleFilterChange} className="input-colsanitas">
                            <option value="">Todos</option>
                            <option value="AT">AT</option>
                            <option value="EL">EL</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096", marginBottom: "5px", display: "block" }}>Calificación (Curso)</label>
                        <select name="calificacionCurso" value={filters.calificacionCurso} onChange={handleFilterChange} className="input-colsanitas">
                            <option value="">Todas</option>
                            <option value="Origen">Origen</option>
                            <option value="PCL">PCL</option>
                            <option value="Origen y PCL">Origen y PCL</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label style={{ fontSize: "12px", color: "#718096", marginBottom: "5px", display: "block" }}>Origen Actual</label>
                        <select name="origenActual" value={filters.origenActual} onChange={handleFilterChange} className="input-colsanitas">
                            <option value="">Todos</option>
                            <option value="En Controversia">En Controversia</option>
                            <option value="En Firme">En Firme</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "15px" }}>
                    <button className="btn-colsanitas-outline" onClick={() => setFilters({ radicado: "", fecha: "", cedula: "", tipoSiniestro: "", calificacionCurso: "", origenActual: "" })}>Limpiar Filtros</button>
                </div>
            </div>

            {/* Tabla */}
            <div className="card">
                <table className="table-colsanitas">
                    <thead>
                        <tr>
                            <th>Radicado</th>
                            <th>Fecha Solicitud</th>
                            <th>Trabajador</th>
                            <th>Empresa</th>
                            <th>Calif. Curso</th>
                            <th>Estado Actual</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRecords.length > 0 ? (
                            paginatedRecords.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: "bold", color: "var(--colsanitas-blue)" }}>{item.radicado}</div>
                                        <div style={{ fontSize: "10px", color: "#718096" }}>{item.tipoSiniestro} - {item.cedula}</div>
                                    </td>
                                    <td>{item.fechaSolicitud}</td>
                                    <td>{item.trabajador}</td>
                                    <td>{item.empresa}</td>
                                    <td>
                                        <span className="status-badge" style={{ backgroundColor: "#EBF8FF", color: "#2B6CB0" }}>{item.calificacionCurso}</span>
                                    </td>
                                    <td>
                                        <span className={`status - badge ${item.estadoActual === 'En Firme' ? 'success' : (item.estadoActual.includes('Controversia') ? 'error' : 'warning')} `}
                                            style={{
                                                backgroundColor: item.estadoActual === 'En Firme' ? '#F0FFF4' : (item.estadoActual.includes('Controversia') ? '#FFF5F5' : '#FFFFF0'),
                                                color: item.estadoActual === 'En Firme' ? '#2F855A' : (item.estadoActual.includes('Controversia') ? '#C53030' : '#B7791F')
                                            }}
                                        >
                                            {item.estadoActual}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                className="btn-colsanitas"
                                                style={{ padding: "6px", backgroundColor: "#3182CE", border: "1px solid #2B6CB0" }}
                                                onClick={() => handleView(item)}
                                                title="Ver Reporte"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="btn-colsanitas"
                                                style={{ padding: "6px" }}
                                                onClick={() => handleEdit(item)}
                                                title="Editar Calificación"
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#A0AEC0" }}>
                                    No se encontraron casos de calificación pendientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Paginador */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "20px", padding: "10px" }}>
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
        </div>
    );
};

export default Calificacion;
