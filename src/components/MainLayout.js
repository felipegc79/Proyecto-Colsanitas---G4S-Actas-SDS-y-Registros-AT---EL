import React, { useState, useEffect } from "react";
import Certificados from "./Certificados";
import CasosPRI from "./CasosPRI";
import AsignacionGestores from "./AsignacionGestores";
import {
  LayoutDashboard,
  FileText,
  Activity,
  Stethoscope,
  Settings,
  Upload,
  AlertCircle,
  Menu,
  ChevronRight,
  Award,
  Briefcase,
  Users,
  Building
} from "lucide-react";
import Dashboard from "./Dashboard";
import DashboardEL from "./DashboardEL";
import ReporteAccidente from "./ReporteAccidente";
import GestionRechazados from "./GestionRechazados";
import RegistrosEL from "./RegistrosEL";
import CargaMasiva from "./CargaMasiva";
import CargaMasivaPoblacion from "./CargaMasivaPoblacion";
import GestionHoras from "./GestionHoras";
import AuditoriaMedica from "./AuditoriaMedica";
import EstadoCitas from "./EstadoCitas";
import Calificacion from "./Calificacion";
import HonorariosIPP from "./HonorariosIPP";
import GestionEmpresas from "./GestionEmpresas";
import "../styles.css";

const NavLink = ({ id, label, icon: Icon, active, onClick }) => (
  <a
    href="#"
    className={`nav-link ${active ? "active" : ""}`}
    onClick={(e) => {
      e.preventDefault();
      onClick(id);
    }}
  >
    <Icon size={20} />
    <span style={{ flex: 1 }}>{label}</span>
    {active && <ChevronRight size={16} />}
  </a>
);

const MainLayout = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role || "");
  }, []);

  // Estado inicial de trabajadores (Cargado desde Storage o Default)
  const [dataWorkers, setDataWorkers] = useState(() => {
    try {
      const stored = localStorage.getItem("COLSANITAS_DATA_WORKERS");
      return stored ? JSON.parse(stored) : {
        "COLLECTIVE SAS": { trabajadores: 1200, horas: 230400 },
        "CENTRO MÉDICO": { trabajadores: 500, horas: 96000 },
        "EPS COLSANITAS": { trabajadores: 800, horas: 153600 },
        "ESTRATÉGICOS 360 SAS": { trabajadores: 450, horas: 86400 },
        "CLÍNICA DENTAL KERALTY": { trabajadores: 300, horas: 57600 },
        "COMPAÑÍA DE MEDICINA PREPAGADA COLSANITAS": { trabajadores: 1500, horas: 288000 },
        "CLÍNICA COLSANITAS": { trabajadores: 2000, horas: 384000 },
        "CENTROS MÉDICOS COLSANITAS SAS": { trabajadores: 700, horas: 134400 },
        "SEGUROS COLSANITAS": { trabajadores: 350, horas: 67200 },
        "YAZAKI CIEMEL SA": { trabajadores: 1100, horas: 211200 },
        "INDUSTRIAL GOYA INCOL SAS": { trabajadores: 250, horas: 48000 },
      };
    } catch (error) {
      console.error("Error loading workers data", error);
      return {
        "COLLECTIVE SAS": { trabajadores: 1200, horas: 230400 },
        "CENTRO MÉDICO": { trabajadores: 500, horas: 96000 },
        "EPS COLSANITAS": { trabajadores: 800, horas: 153600 },
        "ESTRATÉGICOS 360 SAS": { trabajadores: 450, horas: 86400 },
        "CLÍNICA DENTAL KERALTY": { trabajadores: 300, horas: 57600 },
        "COMPAÑÍA DE MEDICINA PREPAGADA COLSANITAS": { trabajadores: 1500, horas: 288000 },
        "CLÍNICA COLSANITAS": { trabajadores: 2000, horas: 384000 },
        "CENTROS MÉDICOS COLSANITAS SAS": { trabajadores: 700, horas: 134400 },
        "SEGUROS COLSANITAS": { trabajadores: 350, horas: 67200 },
        "YAZAKI CIEMEL SA": { trabajadores: 1100, horas: 211200 },
        "INDUSTRIAL GOYA INCOL SAS": { trabajadores: 250, horas: 48000 },
      };
    }
  });

  // Persistir cambios en dataWorkers
  useEffect(() => {
    try {
      localStorage.setItem("COLSANITAS_DATA_WORKERS", JSON.stringify(dataWorkers));
    } catch (e) {
      console.error("Error saving workers data", e);
    }
  }, [dataWorkers]);

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard dataWorkers={dataWorkers} />;
      case "dashboard_el":
        return <DashboardEL dataWorkers={dataWorkers} />;
      case "gestion_horas":
        return (
          <GestionHoras
            dataWorkers={dataWorkers}
            setDataWorkers={setDataWorkers}
          />
        );
      case "at":
        return <ReporteAccidente />;
      case "rechazados":
        return <GestionRechazados />;
      case "el":
        return <RegistrosEL />;
      case "carga_furat":
        return <CargaMasiva type="FURAT" />;
      case "carga_furel":
        return <CargaMasiva type="FUREL" />;
      case "certificados":
        return <Certificados />;
      case "casos_pri":
        return <CasosPRI />;
      case "asignacion_gestores":
        return <AsignacionGestores />;
      case "auditoria_medica":
        return <AuditoriaMedica />;
      case "estado_citas":
        return <EstadoCitas />;
      case "calificacion":
        return <Calificacion />;
      case "honorarios_ipp":
        return <HonorariosIPP />;
      case "gestion_empresas":
        return <GestionEmpresas />;
      case "carga_poblacion":
        return <CargaMasivaPoblacion />;
      default:
        return <Dashboard dataWorkers={dataWorkers} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--colsanitas-light-grey)" }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "30px 24px", textAlign: "center", background: "white", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
          <img
            src={`/Seguros-Colsanitas-ARL.png?v=${Date.now()}`}
            alt="Colsanitas"
            style={{ width: "100%", maxWidth: "180px", margin: "0 auto", display: "block" }}
          />
        </div>
        <div style={{ padding: "15px 24px 5px", textAlign: "center" }}>
          <p style={{ color: "white", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700" }}>
            Módulo de Registros AT y EL
          </p>
        </div>

        <nav style={{ flex: 1, overflowY: "auto" }}>
          <NavLink id="dashboard" label="Tablero AT" icon={LayoutDashboard} active={activeModule === "dashboard"} onClick={setActiveModule} />
          <NavLink id="dashboard_el" label="Tablero EL" icon={LayoutDashboard} active={activeModule === "dashboard_el"} onClick={setActiveModule} />

          <a href="/pyp" target="_blank" className="nav-link" rel="noopener noreferrer">
            <LayoutDashboard size={20} />
            <span style={{ flex: 1 }}>P&P Colsanitas</span>
            <ChevronRight size={16} />
          </a>

          <a href="/g4s" target="_blank" className="nav-link" rel="noopener noreferrer">
            <LayoutDashboard size={20} />
            <span style={{ flex: 1 }}>Indicadores G4S</span>
            <ChevronRight size={16} />
          </a>

          <div style={{ padding: "20px 24px 10px", fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
            Módulos de Gestión
          </div>

          <NavLink id="at" label="Accidentes (AT)" icon={Activity} active={activeModule === "at"} onClick={setActiveModule} />
          <NavLink id="el" label="Enf. Laboral (EL)" icon={Stethoscope} active={activeModule === "el"} onClick={setActiveModule} />
          <NavLink id="auditoria_medica" label="Auditoría Médica" icon={Stethoscope} active={activeModule === "auditoria_medica"} onClick={setActiveModule} />
          <NavLink id="calificacion" label="Calificación y juntas" icon={Award} active={activeModule === "calificacion"} onClick={setActiveModule} />
          <NavLink id="honorarios_ipp" label="Honorarios e IPP" icon={Briefcase} active={activeModule === "honorarios_ipp"} onClick={setActiveModule} />
          <NavLink id="estado_citas" label="Estado Citas (Drive)" icon={ChevronRight} active={activeModule === "estado_citas"} onClick={setActiveModule} />
          <NavLink id="casos_pri" label="Casos PRI" icon={Briefcase} active={activeModule === "casos_pri"} onClick={setActiveModule} />
          <NavLink id="certificados" label="Certificados" icon={Award} active={activeModule === "certificados"} onClick={setActiveModule} />
          <NavLink id="rechazados" label="Casos Rechazados" icon={AlertCircle} active={activeModule === "rechazados"} onClick={setActiveModule} />

          <div style={{ padding: "20px 24px 10px", fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
            Administración
          </div>

          <NavLink id="gestion_horas" label="Gestión Trabajadores" icon={Settings} active={activeModule === "gestion_horas"} onClick={setActiveModule} />
          <NavLink id="gestion_empresas" label="Gestión Empresas" icon={Building} active={activeModule === "gestion_empresas"} onClick={setActiveModule} />
          <NavLink id="asignacion_gestores" label="Asignación Gestores" icon={Users} active={activeModule === "asignacion_gestores"} onClick={setActiveModule} />
          <NavLink id="carga_poblacion" label="Carga Población" icon={Upload} active={activeModule === "carga_poblacion"} onClick={setActiveModule} />
          <NavLink id="carga_furat" label="Carga Masiva AT" icon={Upload} active={activeModule === "carga_furat"} onClick={setActiveModule} />
          <NavLink id="carga_furel" label="Carga Masiva EL" icon={Upload} active={activeModule === "carga_furel"} onClick={setActiveModule} />
        </nav>

        <div style={{ padding: "20px", background: "rgba(0,0,0,0.1)", textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
          Sistema de Registro v3.0
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: "260px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {renderModule()}
      </div>
    </div>
  );
};

export default MainLayout;
