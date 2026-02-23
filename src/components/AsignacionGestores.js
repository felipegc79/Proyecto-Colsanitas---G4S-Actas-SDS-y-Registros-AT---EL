import React, { useState } from "react";
import { Users, Save, Building, Search, PlusCircle } from "lucide-react";

const AsignacionGestores = () => {
    const [filterEmpresa, setFilterEmpresa] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Data inicial de asignaciones
    const [assignments, setAssignments] = useState([
        { id: 1, empresa: "COLLECTIVE SAS", adminCaso: "Laura Martinez", gestorRehab: "Carlos Ruiz" },
        { id: 2, empresa: "CENTRO MÉDICO", adminCaso: "Ana Gomez", gestorRehab: "Pedro Sanchez" },
        { id: 3, empresa: "EPS COLSANITAS", adminCaso: "Maria Rodriguez", gestorRehab: "Juan Perez" },
        { id: 4, empresa: "ESTRATÉGICOS 360 SAS", adminCaso: "Sofia Lopez", gestorRehab: "Andres Gil" },
        { id: 5, empresa: "CLÍNICA DENTAL KERALTY", adminCaso: "", gestorRehab: "" },
        { id: 6, empresa: "COMPAÑÍA DE MEDICINA PREPAGADA COLSANITAS", adminCaso: "", gestorRehab: "" },
        { id: 7, empresa: "CLÍNICA COLSANITAS", adminCaso: "", gestorRehab: "" },
        { id: 8, empresa: "CENTROS MÉDICOS COLSANITAS SAS", adminCaso: "", gestorRehab: "" },
        { id: 9, empresa: "SEGUROS COLSANITAS", adminCaso: "", gestorRehab: "" },
        { id: 10, empresa: "YAZAKI CIEMEL SA", adminCaso: "", gestorRehab: "" },
        { id: 11, empresa: "INDUSTRIAL GOYA INCOL SAS", adminCaso: "", gestorRehab: "" },
    ]);

    // Gestores Disponibles (Simulados - pool dinámica)
    const [availableManagers, setAvailableManagers] = useState([
        { id: 101, nombre: "Laura Martinez", rol: "Administrador de Caso", empresa: "COLLECTIVE SAS" },
        { id: 102, nombre: "Carlos Ruiz", rol: "Gestor de Rehabilitación", empresa: "COLLECTIVE SAS" },
        { id: 103, nombre: "Diana Torres", rol: "Administrador de Caso", empresa: "COLLECTIVE SAS" },
        { id: 104, nombre: "Ana Gomez", rol: "Administrador de Caso", empresa: "CENTRO MÉDICO" },
        { id: 105, nombre: "Pedro Sanchez", rol: "Gestor de Rehabilitación", empresa: "CENTRO MÉDICO" },
        { id: 106, nombre: "Luisa Fernandez", rol: "Gestor de Rehabilitación", empresa: "CENTRO MÉDICO" },
        { id: 107, nombre: "Maria Rodriguez", rol: "Administrador de Caso", empresa: "EPS COLSANITAS" },
        { id: 108, nombre: "Juan Perez", rol: "Gestor de Rehabilitación", empresa: "EPS COLSANITAS" },
        { id: 109, nombre: "Camila Osorio", rol: "Administrador de Caso", empresa: "EPS COLSANITAS" },
        { id: 110, nombre: "Sofia Lopez", rol: "Administrador de Caso", empresa: "ESTRATÉGICOS 360 SAS" },
        { id: 111, nombre: "Andres Gil", rol: "Gestor de Rehabilitación", empresa: "ESTRATÉGICOS 360 SAS" },
        { id: 112, nombre: "Felipe Muños", rol: "Gestor de Rehabilitación", empresa: "ESTRATÉGICOS 360 SAS" },
        // Generic pool or unassigned
        { id: 113, nombre: "Gloria Estefan", rol: "Administrador de Caso", empresa: "Global" },
        { id: 114, nombre: "Hector Lavoe", rol: "Gestor de Rehabilitación", empresa: "Global" },
        { id: 115, nombre: "Celia Cruz", rol: "Administrador de Caso", empresa: "Global" }
    ]);

    const [newManagerForm, setNewManagerForm] = useState({
        nombre: "", identificacion: "", empresa: "", cargo: "", rol: "Administrador de Caso"
    });

    const handleAssignmentChange = (id, field, value) => {
        setAssignments(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const handleSaveAssignments = () => {
        alert("Asignaciones guardadas correctamente (Simulado)");
    };

    const handleAddManager = (e) => {
        e.preventDefault();
        if (!newManagerForm.nombre || !newManagerForm.empresa) return alert("Complete campos obligatorios");

        const newManager = {
            id: Date.now(),
            nombre: newManagerForm.nombre,
            rol: newManagerForm.rol,
            empresa: newManagerForm.empresa
        };

        setAvailableManagers(prev => [...prev, newManager]);
        setNewManagerForm({ nombre: "", identificacion: "", empresa: "", cargo: "", rol: "Administrador de Caso" });
        setShowModal(false);
        alert("Gestor agregado correctamente. Ahora está disponible en la lista.");
    };

    const filteredAssignments = assignments.filter(a => !filterEmpresa || a.empresa.toLowerCase().includes(filterEmpresa.toLowerCase()));

    // Helper to get options for a specific row/role
    // Shows managers specifically for that company, plus 'Global' ones
    const getOptions = (empresa, roleType) => {
        return availableManagers.filter(m => (m.empresa === empresa || m.empresa === "Global") && m.rol === roleType);
    };

    return (
        <div className="container-fluid" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, color: "var(--colsanitas-blue)" }}>Asignación de Gestores</h2>
                <button className="btn-colsanitas" onClick={() => setShowModal(true)}>
                    <PlusCircle size={18} style={{ marginRight: "5px" }} /> Agregar Nuevo Gestor
                </button>
            </div>

            <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
                <div className="filter-group">
                    <label style={{ fontSize: "12px", color: "#718096" }}>Buscar por Empresa</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Search size={18} color="#718096" />
                        <input
                            className="input-colsanitas"
                            placeholder="Nombre empresa..."
                            value={filterEmpresa}
                            onChange={(e) => setFilterEmpresa(e.target.value)}
                            style={{ width: "100%", maxWidth: "400px" }}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <table className="table-colsanitas">
                    <thead>
                        <tr>
                            <th>Empresa</th>
                            <th>Administrador de Caso</th>
                            <th>Gestor de Rehabilitación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignments.map((a) => (
                            <tr key={a.id}>
                                <td style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Building size={16} color="var(--colsanitas-blue)" /> {a.empresa}
                                </td>
                                <td>
                                    <select
                                        className="input-colsanitas"
                                        value={a.adminCaso}
                                        onChange={(e) => handleAssignmentChange(a.id, "adminCaso", e.target.value)}
                                    >
                                        <option value="">Seleccione...</option>
                                        {getOptions(a.empresa, "Administrador de Caso").map(m => (
                                            <option key={m.id} value={m.nombre}>{m.nombre}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <select
                                        className="input-colsanitas"
                                        value={a.gestorRehab}
                                        onChange={(e) => handleAssignmentChange(a.id, "gestorRehab", e.target.value)}
                                    >
                                        <option value="">Seleccione...</option>
                                        {getOptions(a.empresa, "Gestor de Rehabilitación").map(m => (
                                            <option key={m.id} value={m.nombre}>{m.nombre}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {filteredAssignments.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>No se encontraron empresas con el filtro actual.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div style={{ padding: "20px", textAlign: "right" }}>
                    <button className="btn-colsanitas" onClick={handleSaveAssignments}>
                        <Save size={18} style={{ marginRight: "5px" }} />
                        Guardar Asignaciones
                    </button>
                </div>
            </div>

            {/* Modal Agregar Gestor */}
            {showModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div className="card" style={{ width: "500px", padding: "30px", position: "relative" }}>
                        <h3 style={{ marginBottom: "20px", color: "var(--colsanitas-blue)" }}>Agregar Nuevo Gestor</h3>
                        <form onSubmit={handleAddManager}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
                                <label>Nombre Completo:
                                    <input required className="input-colsanitas" value={newManagerForm.nombre} onChange={e => setNewManagerForm({ ...newManagerForm, nombre: e.target.value })} />
                                </label>
                                <label>Identificación:
                                    <input required className="input-colsanitas" value={newManagerForm.identificacion} onChange={e => setNewManagerForm({ ...newManagerForm, identificacion: e.target.value })} />
                                </label>
                                <label>Empresa:
                                    <select className="input-colsanitas" value={newManagerForm.empresa} onChange={e => setNewManagerForm({ ...newManagerForm, empresa: e.target.value })}>
                                        <option value="">Seleccione...</option>
                                        {assignments.map(a => <option key={a.id} value={a.empresa}>{a.empresa}</option>)}
                                        <option value="Global">Global (Todas las empresas)</option>
                                    </select>
                                </label>
                                <label>Cargo:
                                    <input className="input-colsanitas" value={newManagerForm.cargo} onChange={e => setNewManagerForm({ ...newManagerForm, cargo: e.target.value })} />
                                </label>
                                <label>Rol:
                                    <select className="input-colsanitas" value={newManagerForm.rol} onChange={e => setNewManagerForm({ ...newManagerForm, rol: e.target.value })}>
                                        <option value="Administrador de Caso">Administrador de Caso</option>
                                        <option value="Gestor de Rehabilitación">Gestor de Rehabilitación</option>
                                    </select>
                                </label>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                                <button type="button" className="btn-colsanitas-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-colsanitas">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsignacionGestores;
