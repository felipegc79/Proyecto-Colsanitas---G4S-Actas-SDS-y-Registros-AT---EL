import React, { useState, useMemo, useEffect } from "react";
import { PlusCircle, Building, Mail, Save } from "lucide-react";
import { EMPRESAS } from "../data";

const GestionEmpresas = () => {
    const [empresas, setEmpresas] = useState(
        EMPRESAS.map((e, index) => ({
            id: index + 1,
            nombre: e,
            nit: `900.${(100 + index).toString()}.000-1`,
            contacto: "contacto@colsanitas.com",
            inicioCobertura: "2020-01-01",
            poliza: `POL-${5000 + index}`
        }))
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const filteredEmpresas = useMemo(() => {
        return empresas.filter(e =>
            e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.nit.includes(searchTerm)
        );
    }, [empresas, searchTerm]);

    const paginatedEmpresas = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredEmpresas.slice(start, start + rowsPerPage);
    }, [filteredEmpresas, currentPage]);

    const totalPages = Math.ceil(filteredEmpresas.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const [isCreating, setIsCreating] = useState(false);
    const [newEmpresa, setNewEmpresa] = useState({ nombre: "", nit: "", contacto: "", inicioCobertura: "", poliza: "" });

    const handleSave = () => {
        setEmpresas([...empresas, { ...newEmpresa, id: Date.now() }]);
        setIsCreating(false);
        setNewEmpresa({ nombre: "", nit: "", contacto: "", inicioCobertura: "", poliza: "" });
    };

    return (
        <div style={{ padding: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2 style={{ color: "var(--colsanitas-blue)", margin: 0 }}>Gestión de Empresas (Credenciales)</h2>
                <button className="btn-colsanitas" onClick={() => setIsCreating(true)}>
                    <PlusCircle size={18} /> Nueva Empresa
                </button>
            </div>

            {isCreating && (
                <div className="card" style={{ padding: "20px", marginBottom: "30px", border: "1px solid #4299E1" }}>
                    <h3 style={{ fontSize: "16px", marginBottom: "15px" }}>Registro de Nueva Empresa</h3>
                    <div className="form-grid">
                        <label>Nombre Empresa: <input className="input-colsanitas" value={newEmpresa.nombre} onChange={e => setNewEmpresa({ ...newEmpresa, nombre: e.target.value })} /></label>
                        <label>NIT: <input className="input-colsanitas" value={newEmpresa.nit} onChange={e => setNewEmpresa({ ...newEmpresa, nit: e.target.value })} /></label>
                        <label>Correo Contacto: <input className="input-colsanitas" value={newEmpresa.contacto} onChange={e => setNewEmpresa({ ...newEmpresa, contacto: e.target.value })} /></label>
                        <label>No. Póliza: <input className="input-colsanitas" value={newEmpresa.poliza} onChange={e => setNewEmpresa({ ...newEmpresa, poliza: e.target.value })} /></label>
                        <label>Inicio Cobertura: <input type="date" className="input-colsanitas" value={newEmpresa.inicioCobertura} onChange={e => setNewEmpresa({ ...newEmpresa, inicioCobertura: e.target.value })} /></label>
                    </div>
                    <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button className="btn-colsanitas-outline" onClick={() => setIsCreating(false)}>Cancelar</button>
                        <button className="btn-colsanitas" onClick={handleSave}><Save size={18} /> Guardar</button>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h3 style={{ fontSize: "16px", margin: 0 }}>Listado de Empresas</h3>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o NIT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-colsanitas"
                        style={{ width: "250px" }}
                    />
                </div>
                <table className="table-colsanitas">
                    <thead>
                        <tr>
                            <th>Nombre Empresa</th>
                            <th>NIT</th>
                            <th>Póliza</th>
                            <th>Inicio Cobertura</th>
                            <th>Contacto</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedEmpresas.map(e => (
                            <tr key={e.id}>
                                <td style={{ fontWeight: "bold" }}>{e.nombre}</td>
                                <td>{e.nit}</td>
                                <td>{e.poliza}</td>
                                <td>{e.inicioCobertura}</td>
                                <td><div style={{ display: "flex", alignItems: "center", gap: "5px" }}><Mail size={12} /> {e.contacto}</div></td>
                                <td><span className="status-badge success">Activo</span></td>
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
        </div >
    );
};

export default GestionEmpresas;
