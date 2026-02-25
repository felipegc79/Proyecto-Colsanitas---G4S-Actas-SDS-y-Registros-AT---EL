import React, { useState, useMemo, useEffect } from "react";
import { Gavel, AlertTriangle, FileText, Filter, Eye, Edit, Save, PlusCircle, Trash2, X } from "lucide-react";
import { dataAT, dataEL, syncFromDB, updateRecord, updateRecordEL } from "../data";

const OP_TIPO_EVENTO = ["AT", "EL"];
const OP_TIPO_CALIF = ["Origen", "PCL", "Origen y PCL"];
const OP_ORIGEN = ["Laboral", "Común", "Mixto", "Sin pronunciamiento"];
const OP_ESTADO_DICTAMEN = ["En firme", "En Controversia", "Sin información"];
const OP_RECURSO = ["En acuerdo", "En desacuerdo", "Sin información"];
const OP_SINO = ["Si", "No", "Sin información"];
const OP_SINO_BOOL = ["Si", "No"];
const OP_JUNTAS = [
    "Junta Regional de Antioquia", "Junta Regional de Arauca", "Junta Regional de Atlántico", "Junta Regional de Bogotá",
    "Junta Regional de Bolívar", "Junta Regional de Boyacá", "Junta Regional de Caldas", "Junta Regional de Cauca",
    "Junta Regional de Cesar", "Junta Regional de Córdoba", "Junta Regional de Cundinamarca", "Junta Regional de Huila",
    "Junta Regional de La Guajira", "Junta Regional de Magdalena", "Junta Regional de Meta", "Junta Regional de Nariño",
    "Junta Regional de Norte de Santander", "Junta Regional de Quindío", "Junta Regional de Risaralda",
    "Junta Regional de Santander", "Junta Regional de Sucre", "Junta Regional de Tolima", "Junta Regional de Valle del Cauca"
];
const OP_MANUAL = ["Resolución 917 de 1999", "Resolución 1507 de 2014"];
const OP_ENTIDAD = ["ARL", "EPS", "AFP", "Junta Regional", "Junta Nacional", "Otra"];

const Calificacion = () => {
    // --- STATE ---
    const [rawAT, setRawAT] = useState([]);
    const [rawEL, setRawEL] = useState([]);
    const [mode, setMode] = useState("list"); // list, edit, view
    const [currentId, setCurrentId] = useState(null);
    const [currentTipo, setCurrentTipo] = useState(null);

    const [formData, setFormData] = useState({});

    useEffect(() => {
        const load = async () => {
            const at = await syncFromDB("AT");
            if (at && at.length > 0) setRawAT([...at]);
            else if (dataAT && dataAT.length > 0) setRawAT([...dataAT]);

            const el = await syncFromDB("EL");
            if (el && el.length > 0) setRawEL([...el]);
            else if (dataEL && dataEL.length > 0) setRawEL([...dataEL]);
        };
        load();
    }, []);

    const records = useMemo(() => {
        const atCases = rawAT
            .filter(c => c.estadoCaso === "En Calificación" || c.estadoCaso === "Abierto" || c.estadoCaso === "En Controversia" || c.estadoCalificacion === "En Controversia")
            .map(c => ({
                id: c.id, radicado: c.radicado, fechaSolicitud: c.fechaAT,
                trabajador: c.apellidosNombres, cedula: c.cedula, empresa: c.empresa,
                tipoSiniestro: "AT", calificacionCurso: c.tipoCalificacion || c.calificacionCurso || "Origen",
                estadoActual: c.coPO_estado || c.estadoCalificacion || "En Calificación", origenActual: c.coPO_estado || c.estadoCaso || "En Calificación", originalRecord: c
            }));

        const elCases = rawEL
            .map(c => ({
                id: c.id, radicado: c.radicado, fechaSolicitud: c.mes + " " + c.anio,
                trabajador: c.nombreCompleto || c.apellidosNombres || "Trabajador EL", cedula: c.cedula, empresa: c.empresa,
                tipoSiniestro: "EL", calificacionCurso: c.tipoCalificacion || c.calificacionCurso || "Origen",
                estadoActual: c.coPO_estado || c.estadoCalificacion || "En Controversia", origenActual: c.coPO_estado || c.origenActual || c.estadoCaso || "En Controversia", originalRecord: c
            }))
            .filter(c =>
                c.origenActual === "En Controversia" ||
                c.originalRecord?.estadoCaso === "En Calificación" ||
                c.originalRecord?.estadoCaso === "En Controversia" ||
                c.estadoActual === "En Controversia" ||
                c.estadoActual === "En Calificación" ||
                c.originalRecord?.origenActual === "En Controversia"
            );

        return [...atCases, ...elCases];
    }, [rawAT, rawEL]);

    // --- ALERTS ---
    const calculateAlerts = () => {
        const alerts = [];
        const now = new Date();
        const diffDays = (d) => {
            if (!d) return null;
            const diffTime = Math.abs(now - new Date(d));
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        };

        records.forEach(rc => {
            const d = rc.originalRecord;
            const pd = diffDays(d.fechaSolCalif);
            if (pd && pd >= 22 && pd < 30) {
                alerts.push({ msg: "Vencimiento próximos de Primera Oportunidad (a punto de 30 días)", radicado: rc.radicado, time: 30 - pd });
            }
            const np = diffDays(d.coPO_fechNot || d.cpPO_fechNotif);
            if (np && np >= 7 && np < 10) {
                alerts.push({ msg: "Vencimiento para pronunciamiento (EPS/Juntas)", radicado: rc.radicado, time: 10 - np });
            }
            if (d.coPO_recurso === "En acuerdo" || d.coJRCI_recurso === "En acuerdo") {
                const ap = diffDays(d.coPO_fechRecurso || d.coJRCI_fechRecurso);
                if (ap && ap >= 11) alerts.push({ msg: "Firmeza formal pendiente por registrar", radicado: rc.radicado, time: 0 });
            }
        });
        return alerts;
    };
    const activeAlerts = useMemo(calculateAlerts, [records]);

    // --- FILTRADO ---
    const [filters, setFilters] = useState({ radicado: "", fecha: "", cedula: "", tipoSiniestro: "", calificacionCurso: "", origenActual: "" });
    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    };

    const filteredRecords = useMemo(() => {
        return records.filter(item => {
            const m1 = !filters.radicado || (item.radicado && String(item.radicado).toLowerCase().includes(filters.radicado.toLowerCase()));
            const m2 = !filters.fecha || (item.fechaSolicitud && String(item.fechaSolicitud).includes(filters.fecha));
            const m3 = !filters.cedula || (item.cedula && String(item.cedula).includes(filters.cedula));
            const m4 = !filters.tipoSiniestro || String(item.tipoSiniestro).toLowerCase() === String(filters.tipoSiniestro).toLowerCase();

            const itemCalif = item.calificacionCurso || "";
            const m5 = !filters.calificacionCurso || String(itemCalif).toLowerCase() === String(filters.calificacionCurso).toLowerCase();

            let itemOrigenActual = item.origenActual || item.estadoActual || "";
            if (itemOrigenActual.toLowerCase().includes("calificaci") || itemOrigenActual.toLowerCase() === "abierto" || itemOrigenActual === "n/a") {
                itemOrigenActual = "En Calificación";
            } else if (itemOrigenActual.toLowerCase().includes("controversia")) {
                itemOrigenActual = "En Controversia";
            } else if (itemOrigenActual.toLowerCase().includes("firme")) {
                itemOrigenActual = "En Firme";
            }
            const m6 = !filters.origenActual || String(itemOrigenActual).toLowerCase() === String(filters.origenActual).toLowerCase();

            return m1 && m2 && m3 && m4 && m5 && m6;
        });
    }, [records, filters]);

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const paginatedRecords = useMemo(() => filteredRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [filteredRecords, currentPage]);
    const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    // --- EXPORT VIEWS ---
    const handleEdit = (item) => {
        const r = item.originalRecord || {};
        const isAT = item.tipoSiniestro === "AT";

        let initialFechaEvento = "";
        let initialFechaSolCalif = "";

        if (isAT) {
            initialFechaEvento = r.fechaAT || "";
            initialFechaSolCalif = r.fechaSolicitudCalificacion || "";
        } else {
            initialFechaEvento = r.fechaAviso || r.fechaDiagnostico || "";
            initialFechaSolCalif = r.fechaNotificacionCalificacion || r.fechaSolicitudPCL || "";
        }

        setFormData({
            ...r,
            tipoSiniestro: item.tipoSiniestro,
            nombresYapellidos: r.nombreCompleto || r.apellidosNombres || "",
            fechaEvento: r.fechaEvento || initialFechaEvento,
            fechaSolCalif: r.fechaSolCalif || initialFechaSolCalif,
            diagnosticosCobertura: r.diagnosticosCobertura || [],
            recalifDiagnosticos: r.recalifDiagnosticos || []
        });
        setCurrentId(item.id);
        setCurrentTipo(item.tipoSiniestro);
        setMode("edit");
    };

    const handleView = (item) => {
        handleEdit(item);
        setMode("view");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const payload = { ...formData, id: currentId };
        if (currentTipo === "AT") {
            updateRecord(payload);
            setRawAT(prev => prev.map(o => o.id === currentId ? payload : o));
        } else {
            updateRecordEL(payload);
            setRawEL(prev => prev.map(o => o.id === currentId ? payload : o));
        }
        setMode("list");
        alert("Registro de Calificación Guardado");
    };

    // Rendering Helpers
    const labelStyle = { fontSize: "12px", color: "#4A5568", fontWeight: "600", display: "flex", flexDirection: "column", gap: "5px" };
    const inputStyle = { padding: "8px", border: "1px solid #CBD5E0", borderRadius: "5px", fontSize: "13px", backgroundColor: mode === "view" ? "#F7FAFC" : "#FFF" };

    const Field = ({ label, name, type = "text", options, colSpan = 1 }) => (
        <label style={{ ...labelStyle, gridColumn: `span ${colSpan}` }}>
            {label}
            {options ? (
                <select name={name} value={formData[name] || ""} onChange={handleChange} style={inputStyle} disabled={mode === "view"}>
                    <option value="">Sel...</option>
                    {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : (
                <input type={type} name={name} value={formData[name] || ""} onChange={handleChange} style={inputStyle} disabled={mode === "view"} />
            )}
        </label>
    );

    const SectionHeader = ({ title }) => (
        <h3 style={{ borderBottom: "2px solid #E2E8F0", paddingBottom: "10px", color: "#2B6CB0", marginTop: "30px", fontSize: "16px" }}>{title}</h3>
    );

    return (
        <div style={{ padding: "30px", backgroundColor: "#F7FAFC", minHeight: "100vh" }}>
            {mode === "list" ? (
                <>
                    <h2 style={{ color: "var(--colsanitas-blue)", marginBottom: "20px" }}>Módulo de Calificación y Juntas</h2>

                    {/* Alertas */}
                    {activeAlerts.length > 0 && (
                        <div style={{ padding: "15px", backgroundColor: "#FFF5F5", border: "1px solid #FC8181", borderRadius: "8px", marginBottom: "20px" }}>
                            <h4 style={{ margin: "0 0 10px 0", color: "#C53030", display: "flex", alignItems: "center", gap: "5px" }}><AlertTriangle size={18} /> Alertas de Vencimiento</h4>
                            <ul style={{ margin: 0, paddingLeft: "20px", color: "#9B2C2C", fontSize: "14px" }}>
                                {activeAlerts.map((al, idx) => (
                                    <li key={idx}><strong>Radicado {al.radicado}:</strong> {al.msg} {al.time > 0 ? `- Faltan ${al.time} días` : ''}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                            <Filter size={18} color="var(--colsanitas-green)" />
                            <h3 style={{ margin: 0, fontSize: "16px" }}>Filtros</h3>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                            <div className="filter-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "12px", color: "#718096" }}>Radicado</label>
                                <input name="radicado" value={filters.radicado} onChange={handleFilterChange} placeholder="Radicado..." style={inputStyle} title="Radicado" />
                            </div>
                            <div className="filter-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "12px", color: "#718096" }}>Fecha</label>
                                <input type="date" name="fecha" value={filters.fecha} onChange={handleFilterChange} style={inputStyle} title="Fecha" />
                            </div>
                            <div className="filter-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "12px", color: "#718096" }}>Cédula</label>
                                <input name="cedula" value={filters.cedula} onChange={handleFilterChange} placeholder="Cédula..." style={inputStyle} title="Cédula" />
                            </div>
                            <div className="filter-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "12px", color: "#718096" }}>Tipo Siniestro</label>
                                <select name="tipoSiniestro" value={filters.tipoSiniestro} onChange={handleFilterChange} style={inputStyle} title="Tipo Siniestro">
                                    <option value="">Todos</option>
                                    <option value="AT">AT</option>
                                    <option value="EL">EL</option>
                                </select>
                            </div>
                            <div className="filter-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "12px", color: "#718096" }}>Calificación</label>
                                <select name="calificacionCurso" value={filters.calificacionCurso} onChange={handleFilterChange} style={inputStyle} title="Calificación">
                                    <option value="">Todos</option>
                                    <option value="Origen">Origen</option>
                                    <option value="PCL">PCL</option>
                                    <option value="Origen y PCL">Origen y PCL</option>
                                </select>
                            </div>
                            <div className="filter-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "12px", color: "#718096" }}>Origen Actual</label>
                                <select name="origenActual" value={filters.origenActual} onChange={handleFilterChange} style={inputStyle} title="Origen Actual">
                                    <option value="">Todos</option>
                                    <option value="En Calificación">En Calificacion</option>
                                    <option value="En Controversia">En Controversia</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", alignItems: "flex-end" }}>
                                <button className="btn-colsanitas-outline" onClick={() => { setFilters({ radicado: "", fecha: "", cedula: "", tipoSiniestro: "", calificacionCurso: "", origenActual: "" }); setCurrentPage(1); }}>Limpiar</button>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <table className="table-colsanitas" style={{ width: "100%", textAlign: "left" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#EDF2F7", color: "#4A5568" }}>
                                    <th>Radicado</th>
                                    <th>Tipo de Siniestro</th>
                                    <th>Fecha Sol. Calif</th>
                                    <th>Nombre trabajador</th>
                                    <th>Empresa</th>
                                    <th>Calificación Curso</th>
                                    <th>Estado Actual</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRecords.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ padding: "12px" }}>{item.radicado}</td>
                                        <td>{item.tipoSiniestro}</td>
                                        <td>{item.fechaSolicitud}</td>
                                        <td>{item.trabajador}</td>
                                        <td>{item.empresa}</td>
                                        <td>{item.calificacionCurso}</td>
                                        <td>
                                            <span style={{ backgroundColor: "#EBF8FF", color: "#3182CE", padding: "4px 8px", borderRadius: "12px", fontSize: "11px" }}>{item.estadoActual}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "5px" }}>
                                                <button onClick={() => handleView(item)} title="Ver" style={{ cursor: "pointer", padding: "5px", border: "none", background: "none" }}><Eye size={18} color="#3182CE" /></button>
                                                <button onClick={() => handleEdit(item)} title="Editar" style={{ cursor: "pointer", padding: "5px", border: "none", background: "none" }}><Edit size={18} color="#48BB78" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                </>
            ) : (
                <div className="card" style={{ padding: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                        <h2 style={{ margin: 0, color: "#2B6CB0" }}>Gestión de Caso ({formData.radicado})</h2>
                        <button onClick={() => setMode("list")} className="btn-colsanitas-outline"><X size={16} /> Cerrar</button>
                    </div>

                    <fieldset disabled={mode === "view"} style={{ border: "none", padding: 0 }}>
                        <SectionHeader title="1. Información general del Caso" />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                            <Field label="Tipo de evento" name="tipoSiniestro" options={OP_TIPO_EVENTO} />
                            <Field label="Fecha del evento (AT/EL)" name="fechaEvento" type="date" />
                            <Field label="Fecha de solicitud de calificación" name="fechaSolCalif" type="date" />
                            <Field label="Tipo de calificación" name="tipoCalificacion" options={OP_TIPO_CALIF} />
                            <Field label="EPS" name="eps" />
                            <Field label="AFP" name="afp" />
                        </div>

                        <SectionHeader title="2. Información del Trabajador" />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
                            <Field label="Nombres y Apellidos" name="nombresYapellidos" colSpan={2} />
                            <Field label="Documento" name="cedula" />
                            <Field label="Siniestro" name="siniestro" />
                            <Field label="Radicado" name="radicado" />
                            <Field label="Fecha de Nacimiento" name="fechaNacimiento" type="date" />
                            <Field label="Genero" name="genero" />
                            <Field label="Cargo" name="cargo" />
                            <Field label="Departamento" name="departamento" />
                            <Field label="Ciudad" name="ciudad" />
                            <Field label="Dirección" name="direccion" colSpan={2} />
                            <Field label="Teléfono" name="telefono" type="number" />
                            <Field label="Correo electrónico" name="correoElectronico" colSpan={2} />
                        </div>

                        <SectionHeader title="3. Información de la Empresa" />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
                            <Field label="Grupo Empresarial" name="grupoEmpresarial" />
                            <Field label="Empresa" name="empresa" />
                            <Field label="NIT" name="nit" />
                            <Field label="Póliza" name="poliza" />
                            <Field label="Estado de la póliza" name="statusPoliza" />
                        </div>

                        <SectionHeader title="4. Diagnósticos en Cobertura" />
                        <div style={{ border: "1px solid #E2E8F0", padding: "10px", borderRadius: "8px", backgroundColor: "#F7FAFC" }}>
                            {formData.diagnosticosCobertura?.map((d, i) => (
                                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr auto", gap: "10px", marginBottom: "10px", alignItems: "end" }}>
                                    <label style={labelStyle}>Código CIE10<input value={d.cie10} onChange={e => { const nd = [...formData.diagnosticosCobertura]; nd[i].cie10 = e.target.value; setFormData({ ...formData, diagnosticosCobertura: nd }) }} style={inputStyle} /></label>
                                    <label style={labelStyle}>Descripción<input value={d.desc} onChange={e => { const nd = [...formData.diagnosticosCobertura]; nd[i].desc = e.target.value; setFormData({ ...formData, diagnosticosCobertura: nd }) }} style={inputStyle} /></label>
                                    <label style={labelStyle}>Relación/Estado<select value={d.tipo} onChange={e => { const nd = [...formData.diagnosticosCobertura]; nd[i].tipo = e.target.value; setFormData({ ...formData, diagnosticosCobertura: nd }) }} style={inputStyle}>
                                        <option value="">Sel...</option>
                                        {["Derivado del AT", "Adición Diagnóstica", "En Controversia", "Sin pronunciamiento", "Hallazgo Incidental NO AT"].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select></label>
                                    {mode !== "view" && <button onClick={() => {
                                        setFormData(p => ({ ...p, diagnosticosCobertura: p.diagnosticosCobertura.filter((_, idx) => idx !== i) }))
                                    }} style={{ padding: "8px", color: "red", border: "none", cursor: "pointer" }}><Trash2 size={16} /></button>}
                                </div>
                            ))}
                            {mode !== "view" && (
                                <button onClick={() => setFormData(p => ({ ...p, diagnosticosCobertura: [...(p.diagnosticosCobertura || []), { cie10: '', desc: '', tipo: '' }] }))} style={{ display: "flex", gap: "5px", padding: "5px 10px", fontSize: "12px", cursor: "pointer", border: "1px solid #48BB78", color: "#48BB78", background: "transparent", borderRadius: "5px" }}>
                                    <PlusCircle size={14} /> Agrega Diagnóstico
                                </button>
                            )}
                        </div>

                        <SectionHeader title="5. Proceso de Calificación de Origen" />

                        <h4 style={{ color: "#4A5568" }}>5.1. Calificación de Origen en Primera Oportunidad</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", backgroundColor: "#EDF2F7", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                            <Field label="Notificación Calificación" name="coPO_fechNot" type="date" />
                            <Field label="Fecha origen 1ra" name="coPO_fechOrig" type="date" />
                            <Field label="Entidad calificadora" name="coPO_entidad" options={OP_ENTIDAD} />
                            <Field label="Número de dictamen" name="coPO_dict" />
                            <Field label="Origen calificado" name="coPO_origen" options={OP_ORIGEN} />
                            <Field label="Estado origen en PO" name="coPO_estado" options={OP_ESTADO_DICTAMEN} />
                            <Field label="Recurso presentado" name="coPO_recurso" options={OP_RECURSO} />
                            <Field label="Fecha del recurso" name="coPO_fechRecurso" type="date" />
                            <Field label="Pago honorarios" name="coPO_pagoHonor" options={OP_SINO} />
                            <Field label="Fecha sol. pago honorarios" name="coPO_fechPagoHonor" type="date" />
                            <Field label="Honorarios a JRCI" name="coPO_honosJRCI" options={OP_JUNTAS} />
                            <Field label="Dictamen en firme" name="coPO_dictFirme" options={OP_SINO_BOOL} />
                            <Field label="Fecha de firmeza" name="coPO_fechFirme" type="date" />
                        </div>

                        <h4 style={{ color: "#4A5568" }}>5.2. Calificación de Origen en JRCI</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", backgroundColor: "#EDF2F7", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                            <Field label="Junta Regional que califica" name="coJRCI_junta" options={OP_JUNTAS} />
                            <Field label="Fecha Notificación" name="coJRCI_fechNot" type="date" />
                            <Field label="Fecha Origen JRCI" name="coJRCI_fechOrig" type="date" />
                            <Field label="Número dictamen" name="coJRCI_dict" />
                            <Field label="Origen calificado" name="coJRCI_origen" options={OP_ORIGEN} />
                            <Field label="Estado origen JRCI" name="coJRCI_estado" options={OP_ESTADO_DICTAMEN} />
                            <Field label="Recurso presentado" name="coJRCI_recurso" options={OP_RECURSO} />
                            <Field label="Fecha recurso" name="coJRCI_fechRecurso" type="date" />
                            <Field label="Pago honorarios" name="coJRCI_pagoHonor" options={OP_SINO} />
                            <Field label="Fecha sol. honorarios" name="coJRCI_fechPagoHonor" type="date" />
                            <Field label="Dictamen en firme" name="coJRCI_dictFirme" options={OP_SINO_BOOL} />
                            <Field label="Fecha de firmeza" name="coJRCI_fechFirme" type="date" />
                        </div>

                        <h4 style={{ color: "#4A5568" }}>5.3. Calificación de Origen en JNCI</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", backgroundColor: "#EDF2F7", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                            <Field label="Fecha Notificación" name="coJNCI_fechNot" type="date" />
                            <Field label="Fecha Origen JNCI" name="coJNCI_fechOrig" type="date" />
                            <Field label="Número dictamen" name="coJNCI_dict" />
                            <Field label="Origen calificado" name="coJNCI_origen" options={OP_ORIGEN} />
                            <Field label="Fecha de firmeza" name="coJNCI_fechFirme" type="date" />
                        </div>

                        <SectionHeader title="6. Proceso de Calificación de PCL" />

                        <h4 style={{ color: "#4A5568" }}>6.1. Calificación PCL primera vez</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", backgroundColor: "#EBF8FF", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                            <Field label="Fecha solicitud PCL" name="cpPO_fechSol" type="date" />
                            <Field label="Entidad calificadora" name="cpPO_entidad" options={OP_ENTIDAD} />
                            <Field label="Manual califica" name="cpPO_manual" options={OP_MANUAL} />
                            <Field label="Fecha dictamen" name="cpPO_fechDict" type="date" />
                            <Field label="Número dictamen" name="cpPO_dict" />
                            <div style={{ gridColumn: "span 5", display: "flex", justifyContent: "center", gap: "20px" }}>
                                <Field label="TITULO I" name="cpPO_tit1" />
                                <Field label="TITULO II" name="cpPO_tit2" />
                                <Field label="PCL TOTAL" name="cpPO_totalPcl" />
                            </div>
                            <Field label="Fecha estructuración" name="cpPO_fechEstruct" type="date" />
                            <Field label="Fecha notificación" name="cpPO_fechNotif" type="date" />
                            <Field label="Estado del dictamen" name="cpPO_estado" options={OP_ESTADO_DICTAMEN} />
                            <Field label="Recurso interpuesto" name="cpPO_recurso" options={OP_RECURSO} />
                            <Field label="Fecha del recurso" name="cpPO_fechRecurso" type="date" />
                            <Field label="Pago Honorarios" name="cpPO_pagoHonor" options={OP_SINO} />
                            <Field label="Fecha sol. honorarios" name="cpPO_fechPagoHonor" type="date" />
                            <Field label="Honorarios a JRCI" name="cpPO_honosJRCI" options={OP_JUNTAS} />
                            <Field label="Dictamen firme" name="cpPO_dictFirme" options={OP_SINO_BOOL} />
                            <Field label="Fecha de firmeza" name="cpPO_fechFirme" type="date" />
                            <Field label="Aplica pago IPP" name="cpPO_pagoIpp" options={OP_SINO_BOOL} />
                            <Field label="Fecha envío a pago" name="cpPO_fechEnvioPago" type="date" />
                        </div>

                        <h4 style={{ color: "#4A5568" }}>6.2. Calificación PCL JRCI</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", backgroundColor: "#EBF8FF", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                            <Field label="Fecha notificación" name="cpJRCI_fechNot" type="date" />
                            <Field label="JRCI que califica" name="cpJRCI_junta" options={OP_JUNTAS} />
                            <Field label="Fecha dictamen" name="cpJRCI_fechDict" type="date" />
                            <Field label="Número dictamen" name="cpJRCI_dict" />
                            <div style={{ gridColumn: "span 5", display: "flex", justifyContent: "center", gap: "20px" }}>
                                <Field label="TITULO I" name="cpJRCI_tit1" />
                                <Field label="TITULO II" name="cpJRCI_tit2" />
                                <Field label="PCL TOTAL" name="cpJRCI_totalPcl" />
                            </div>
                            <Field label="Fecha estructuración" name="cpJRCI_fechEstruct" type="date" />
                            <Field label="Estado dictamen" name="cpJRCI_estado" options={OP_ESTADO_DICTAMEN} />
                            <Field label="Recurso presentado" name="cpJRCI_recurso" options={OP_RECURSO} />
                            <Field label="Fecha recurso" name="cpJRCI_fechRecurso" type="date" />
                            <Field label="Pago honorarios" name="cpJRCI_pagoHonor" options={OP_SINO} />
                            <Field label="Fecha sol. honorarios" name="cpJRCI_fechPagoHonor" type="date" />
                            <Field label="Dictamen firme" name="cpJRCI_dictFirme" options={OP_SINO_BOOL} />
                            <Field label="Fecha firmeza" name="cpJRCI_fechFirme" type="date" />
                            <Field label="Aplica pago IPP" name="cpJRCI_pagoIpp" options={OP_SINO_BOOL} />
                            <Field label="Fecha envío a pago" name="cpJRCI_fechEnvioPago" type="date" />
                        </div>

                        <h4 style={{ color: "#4A5568" }}>6.3. Calificación PCL JNCI</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", backgroundColor: "#EBF8FF", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                            <Field label="Fecha notificación" name="cpJNCI_fechNot" type="date" />
                            <Field label="Fecha dictamen" name="cpJNCI_fechDict" type="date" />
                            <Field label="Número dictamen" name="cpJNCI_dict" />
                            <div style={{ gridColumn: "span 4", display: "flex", justifyContent: "center", gap: "20px" }}>
                                <Field label="TITULO I" name="cpJNCI_tit1" />
                                <Field label="TITULO II" name="cpJNCI_tit2" />
                                <Field label="PCL TOTAL" name="cpJNCI_totalPcl" />
                            </div>
                            <Field label="Fecha estructuración" name="cpJNCI_fechEstruct" type="date" />
                            <Field label="Fecha firmeza" name="cpJNCI_fechFirme" type="date" />
                            <Field label="Aplica pago IPP" name="cpJNCI_pagoIpp" options={OP_SINO_BOOL} />
                            <Field label="Fecha envío pago" name="cpJNCI_fechEnvioPago" type="date" />
                        </div>

                        <SectionHeader title="7. Firmeza de Calificación" />
                        <h4 style={{ color: "#4A5568" }}>7.1 Firmeza de Origen</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px" }}>
                            <Field label="Fecha firmeza" name="fmo_fechFirme" type="date" />
                            <Field label="Entidad emite firmeza" name="fmo_entidad" options={["Junta Regional", "Junta Nacional", "ARL", "EPS", "AFP"]} />
                            <Field label="Origen en firme" name="fmo_origen" options={OP_ORIGEN} />
                            <Field label="Gestión de Caso" name="fmo_gestion" options={["Caso REHAB+", "Cierre de Caso", "Continuar"]} />
                        </div>

                        <h4 style={{ color: "#4A5568", marginTop: "15px" }}>7.2 Firmeza de PCL</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", marginBottom: "30px" }}>
                            <Field label="Fecha firmeza" name="fmp_fechFirme" type="date" />
                            <Field label="Entidad emite firmeza" name="fmp_entidad" options={["Junta Regional", "Junta Nacional", "ARL", "EPS", "AFP"]} />
                            <Field label="PCL en firme" name="fmp_pcl" />
                            <Field label="Fecha estructuración" name="fmp_fechEstruct" type="date" />
                            <Field label="Gestión de Caso" name="fmp_gestion" options={["Reconocimiento IPP", "Cierre de Caso", "Continuar"]} />
                        </div>

                        <SectionHeader title="8. Recalificación de PCL" />
                        <Field label="Fecha sol. recalificación" name="recalif_fechaSol" type="date" />

                        <h4 style={{ color: "#4A5568", marginTop: "15px" }}>8.1. Diagnósticos a Recalificar</h4>
                        <div style={{ border: "1px solid #E2E8F0", padding: "10px", borderRadius: "8px", backgroundColor: "#F7FAFC", marginTop: "10px" }}>
                            {formData.recalifDiagnosticos?.map((d, i) => (
                                <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr) auto", gap: "10px", marginBottom: "10px", alignItems: "end" }}>
                                    <label style={labelStyle}>CIE10<input value={d.cie10} onChange={e => { const nd = [...formData.recalifDiagnosticos]; nd[i].cie10 = e.target.value; setFormData({ ...formData, recalifDiagnosticos: nd }) }} style={inputStyle} /></label>
                                    <label style={labelStyle}>Descripción<input value={d.desc} onChange={e => { const nd = [...formData.recalifDiagnosticos]; nd[i].desc = e.target.value; setFormData({ ...formData, recalifDiagnosticos: nd }) }} style={inputStyle} /></label>
                                    <label style={labelStyle}>Lateralidad<select value={d.lat} onChange={e => { const nd = [...formData.recalifDiagnosticos]; nd[i].lat = e.target.value; setFormData({ ...formData, recalifDiagnosticos: nd }) }} style={inputStyle}>
                                        <option value="">Sel...</option>
                                        {["Derecha", "Izquierda", "Bilateral", "N/A"].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select></label>
                                    <label style={labelStyle}>Fecha PCL<input type="date" value={d.fech} onChange={e => { const nd = [...formData.recalifDiagnosticos]; nd[i].fech = e.target.value; setFormData({ ...formData, recalifDiagnosticos: nd }) }} style={inputStyle} /></label>
                                    <label style={labelStyle}>PCL Ant<input value={d.pclant} onChange={e => { const nd = [...formData.recalifDiagnosticos]; nd[i].pclant = e.target.value; setFormData({ ...formData, recalifDiagnosticos: nd }) }} style={inputStyle} /></label>
                                    <label style={labelStyle}>Entidad<select value={d.entidad} onChange={e => { const nd = [...formData.recalifDiagnosticos]; nd[i].entidad = e.target.value; setFormData({ ...formData, recalifDiagnosticos: nd }) }} style={inputStyle}>
                                        <option value="">Sel...</option>
                                        {["ARL", "EPS", "AFP", "Junta Regional", "Junta Nacional"].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select></label>
                                    {mode !== "view" && <button onClick={() => {
                                        setFormData(p => ({ ...p, recalifDiagnosticos: p.recalifDiagnosticos.filter((_, idx) => idx !== i) }))
                                    }} style={{ padding: "8px", color: "red", border: "none", cursor: "pointer" }}><Trash2 size={16} /></button>}
                                </div>
                            ))}
                            {mode !== "view" && (
                                <button onClick={() => setFormData(p => ({ ...p, recalifDiagnosticos: [...(p.recalifDiagnosticos || []), { cie10: '', desc: '', lat: '', fech: '', pclant: '', entidad: '' }] }))} style={{ display: "flex", gap: "5px", padding: "5px 10px", fontSize: "12px", cursor: "pointer", border: "1px solid #48BB78", color: "#48BB78", background: "transparent", borderRadius: "5px" }}>
                                    <PlusCircle size={14} /> Añadir diagnóstico
                                </button>
                            )}
                        </div>

                        <h4 style={{ color: "#4A5568", marginTop: "15px" }}>8.2. Recalificación ARL</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", backgroundColor: "#FFF5F5", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                            <Field label="Fecha dictamen" name="rAL_dictamen" type="date" />
                            <Field label="% PCL" name="rAL_pcl" />
                            <Field label="Fecha estructuración" name="rAL_fechEstruct" type="date" />
                            <Field label="Fecha notificación" name="rAL_fechNot" type="date" />
                            <Field label="Pronunciamiento" name="rAL_pronuncia" options={["En Acuerdo", "En Desacuerdo", "Sin información"]} />

                            {formData.rAL_pronuncia === "En Acuerdo" && <>
                                <Field label="Aplica Reconocimiento IPP" name="rAL_aplicaIPP" options={OP_SINO_BOOL} />
                                {formData.rAL_aplicaIPP === "Si" && <Field label="Fecha de envío a pago" name="rAL_fechEnvioPago" type="date" />}
                                <Field label="Fecha de Firmeza" name="rAL_fechFirme" type="date" />
                            </>}

                            {formData.rAL_pronuncia === "En Desacuerdo" && <>
                                <Field label="Fecha del desacuerdo" name="rAL_fechDesacuerdo" type="date" />
                                <Field label="Junta a enviar" name="rAL_juntaEnvio" options={OP_JUNTAS} />
                                <Field label="Fecha sol. pago honorarios" name="rAL_fechSolHonor" type="date" />
                            </>}
                        </div>

                        <h4 style={{ color: "#4A5568", marginTop: "15px" }}>8.3. Recalificación JRCI</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", backgroundColor: "#FFF5F5", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                            <Field label="Fecha dictamen" name="rJRCI_dictamen" type="date" />
                            <Field label="% PCL" name="rJRCI_pcl" />
                            <Field label="Fecha estructuración" name="rJRCI_fechEstruct" type="date" />
                            <Field label="JRCI califica" name="rJRCI_junta" options={OP_JUNTAS} />
                            <Field label="Pronunciamiento" name="rJRCI_pronuncia" options={["En Acuerdo", "En Desacuerdo", "Sin información"]} />

                            {formData.rJRCI_pronuncia === "En Acuerdo" && <>
                                <Field label="Aplica Reconocimiento IPP" name="rJRCI_aplicaIPP" options={OP_SINO_BOOL} />
                                {formData.rJRCI_aplicaIPP === "Si" && <Field label="Fecha envío pago" name="rJRCI_fechEnvioPago" type="date" />}
                                <Field label="Fecha de Firmeza" name="rJRCI_fechFirme" type="date" />
                            </>}

                            {formData.rJRCI_pronuncia === "En Desacuerdo" && <>
                                <Field label="Fecha del desacuerdo" name="rJRCI_fechDesacuerdo" type="date" />
                                <Field label="Fecha sol. pago honorarios" name="rJRCI_fechSolHonor" type="date" />
                            </>}
                        </div>

                        <h4 style={{ color: "#4A5568", marginTop: "15px" }}>8.4. Recalificación JNCI</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "15px", backgroundColor: "#FFF5F5", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
                            <Field label="Fecha dictamen" name="rJNCI_dictamen" type="date" />
                            <Field label="% PCL" name="rJNCI_pcl" />
                            <Field label="Fecha estructuración" name="rJNCI_fechEstruct" type="date" />
                            <Field label="Aplica recon. IPP" name="rJNCI_aplicaIPP" options={OP_SINO_BOOL} />
                            {formData.rJNCI_aplicaIPP === "Si" && <Field label="Fecha envío pago" name="rJNCI_fechEnvioPago" type="date" />}
                        </div>

                        <SectionHeader title="9. Junta de Salud Mental" />
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "30px" }}>
                            <Field label="Aplica Junta Esfera Mental" name="jsm_aplica" options={OP_SINO_BOOL} />
                            {formData.jsm_aplica === "Si" && <>
                                <Field label="Fecha solicitud Junta" name="jsm_fechSol" type="date" />
                                <Field label="Fecha realización de Junta" name="jsm_fechRealiza" type="date" />
                                <Field label="Fecha entrega de informe" name="jsm_fechEntrega" type="date" />
                            </>}
                            <Field label="Conclusión junta mental" name="jsm_conclusion" colSpan={4} />
                        </div>
                    </fieldset>

                    {mode !== "view" && (
                        <div style={{ marginTop: "30px", display: "flex", justifyContent: "flex-end", gap: "15px" }}>
                            <button onClick={handleSave} className="btn-colsanitas"><Save size={18} style={{ marginRight: "5px" }} /> Guardar Cambios</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default Calificacion;
