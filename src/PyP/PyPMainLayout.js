import React, { useState, useEffect } from "react";
import { INITIAL_DATA } from "./data";
import Modal from "./components/Modal";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import MainScreen from "./screens/MainScreen";
import DirectorDashboard from "./screens/DirectorDashboard";
import CoordinatorDashboard from "./screens/CoordinatorDashboard";
import LeaderDashboard from "./screens/LeaderDashboard";
import ActaFormScreen from "./screens/ActaFormScreen";
import ActaDetailsScreen from "./screens/ActaDetailsScreen";
import SignatureView from "./screens/SignatureView";
import NotificationScreen from "./screens/NotificationScreen";
import PinEntryScreen from "./screens/PinEntryScreen";
import SignaturePadScreen from "./components/SignaturePadScreen";

export default function PyPMainLayout() {
  const [tailwindReady, setTailwindReady] = useState(false);

  // --- EFECTO PARA CARGAR TAILWIND SOLO EN ESTE MÓDULO ---
  useEffect(() => {
    const scriptId = "tailwind-script";

    // Si ya está cargado (por navegación previa), marcar como listo
    if (window.tailwind || document.getElementById(scriptId)) {
      setTailwindReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://cdn.tailwindcss.com";
    script.onload = () => {
      console.log("Tailwind CSS loaded for PyP");
      setTailwindReady(true);
    };
    script.onerror = () => {
      console.error("Failed to load Tailwind CSS");
      // Fallback: mostrar contenido aunque falle los estilos
      setTailwindReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const mainAppUserName = localStorage.getItem("userName") || "Carlos Director";

  const defaultUser = {
    username: "director",
    password: "123",
    name: mainAppUserName,
    role: "Director de Prevención",
    email: "director@colsanitas.com",
    identificacion: "80111222",
    telefono: "3001112222",
  };

  const [currentScreen, setCurrentScreen] = useState("directorDashboard"); // Saltar Login
  const [user, setUser] = useState(defaultUser); // Usuario por defecto
  const [sdsData, setSdsData] = useState(INITIAL_DATA);
  const [selectedSds, setSelectedSds] = useState(null);
  const [directorView, setDirectorView] = useState("tableros");

  // --- BASE DE DATOS DE USUARIOS ---
  const [users, setUsers] = useState([
    {
      username: "director",
      password: "123",
      name: mainAppUserName,
      role: "Director de Prevención",
      email: "director@colsanitas.com",
      identificacion: "80111222",
      telefono: "3001112222",
    },
    {
      username: "asesor",
      password: "123",
      name: "Ana Asesora",
      role: "Asesor Integral de Prevención",
      email: "asesor@proveedor.com",
      identificacion: "10203040",
      telefono: "3105556677",
    },
    {
      username: "coord_arl",
      password: "123",
      name: "Maria ARL",
      role: "Coordinador de Administración del Riesgo ARL",
      email: "arl@colsanitas.com",
      identificacion: "52333444",
      telefono: "3159998877",
    },
    {
      username: "coord_pyp",
      password: "123",
      name: "Juan PyP",
      role: "Coordinador de Promoción y Prevención",
      email: "pyp@colsanitas.com",
      identificacion: "79888777",
      telefono: "3204445566",
    },
    {
      username: "lider",
      password: "123",
      name: "Luis Líder",
      role: "Líder de Prevención",
      email: "lider@colsanitas.com",
      identificacion: "1010222333",
      telefono: "3007771111",
    },
  ]);

  const [asesores, setAsesores] = useState([
    {
      id: 1,
      nombre: "Ana Asesora",
      identificacion: "12345",
      telefono: "3001234567",
      email: "asesor@proveedor.com",
      empresa: "Estrategicos 360",
      cargo: "Asesor de Prevención",
    },
    {
      id: 2,
      nombre: "Pedro Pérez",
      identificacion: "67890",
      telefono: "3109876543",
      email: "pedro@proveedor.com",
      empresa: "Zona Medica",
      cargo: "Asesor de Prevención",
    },
  ]);

  const [actaForm, setActaForm] = useState(null);
  const [currentPin, setCurrentPin] = useState(null);
  const [pinVerified, setPinVerified] = useState(false);
  const [clientSignatureData, setClientSignatureData] = useState(null);
  const [providerSignatureData, setProviderSignatureData] = useState(null);
  const [modal, setModal] = useState({ show: false, title: "", message: "" });

  const showModal = (title, message) =>
    setModal({ show: true, title, message });
  const closeModal = () => setModal({ show: false, title: "", message: "" });

  const handleRegisterUser = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    showModal(
      "Registro Exitoso",
      `Usuario ${newUser.username} creado. Inicie sesión.`
    );
    setCurrentScreen("login");
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === "Director de Prevención") {
      setDirectorView("tableros");
      setCurrentScreen("directorDashboard");
    } else if (
      userData.role === "Coordinador de Administración del Riesgo ARL" ||
      userData.role === "Coordinador de Promoción y Prevención"
    ) {
      setCurrentScreen("coordinatorDashboard");
    } else if (userData.role === "Líder de Prevención") {
      setCurrentScreen("leaderDashboard");
    } else {
      setCurrentScreen("main");
    }
  };

  const handleLogout = () => {
    setUser(null);
    resetFlow();
    setCurrentScreen("login");
  };

  const resetFlow = () => {
    setSelectedSds(null);
    setActaForm(null);
    setCurrentPin(null);
    setPinVerified(false);
    setClientSignatureData(null);
    setProviderSignatureData(null);
  };

  const handleSaveAssignments = (assignments) => {
    const updatedData = sdsData.map((item) => {
      if (assignments[item.SDS]) {
        const asesorId = assignments[item.SDS];
        const asesor = asesores.find((a) => String(a.id) === String(asesorId));
        if (asesor) {
          return {
            ...item,
            Proveedor: asesor.nombre,
            NitProveedor: asesor.identificacion,
          };
        }
      }
      return item;
    });
    setSdsData(updatedData);
    showModal(
      "Éxito",
      "Las asignaciones se han guardado y sincronizado correctamente."
    );
  };

  // --- DENTRO DE App.js ---

  const handleFinalizeActa = (sdsId, finalFormData) => {
    const executedHoursInThisAct = Number(finalFormData.horasTotales) || 0;
    let newData = [...sdsData];
    const originalIndex = newData.findIndex((item) => item.SDS === sdsId);

    if (originalIndex !== -1) {
      const originalItem = newData[originalIndex];
      const prevExecuted = Number(originalItem.HorasEjecutadas) || 0;
      const newTotalExecuted = prevExecuted + executedHoursInThisAct;
      const totalPlanned = Number(originalItem.HorasPlaneadas) || 0;

      // 1. GENERACIÓN DE ID SECUENCIAL (-01, -02...)
      // Contamos cuántas actas hijas ya existen para este PADRE
      const existingChildrenCount = newData.filter(
        (item) => item.ParentSDS === originalItem.SDS
      ).length;

      // El siguiente número es la cantidad actual + 1, con relleno de ceros (pad)
      const nextSequence = String(existingChildrenCount + 1).padStart(2, "0");
      const newChildSdsId = `${originalItem.SDS}-${nextSequence}`;

      // 2. CREAMOS EL ACTA HIJA
      const newActItem = {
        ...originalItem,
        SDS: newChildSdsId, // Ej: 16817-01
        IsChildAct: true, // Bandera para identificarla como hija
        ParentSDS: originalItem.SDS, // Referencia al padre #16817
        Estado: "Acta Diligenciada",
        HorasEjecutadas: executedHoursInThisAct,
        Calificacion: finalFormData.evaluacion.replace(/_/g, " "),
        DetallesActa: finalFormData,
        // Guardamos la hora explícitamente para mostrarla en la tarjeta
        HoraInicio: finalFormData.horaInicio,
        HoraFin: finalFormData.horaFin,
        Firmas: {
          Cliente: clientSignatureData,
          Proveedor: providerSignatureData,
        },
        FechaEjecucion: new Date().toISOString().split("T")[0],
      };

      // 3. ACTUALIZAMOS EL PADRE (Acumulador)
      const isCompleted = newTotalExecuted >= totalPlanned;
      const updatedParentItem = {
        ...originalItem,
        IsChildAct: false, // El padre nunca es hijo
        HorasEjecutadas: newTotalExecuted,
        Estado: isCompleted ? "Concluida" : "Programada",
      };

      // Reemplazamos el padre y agregamos la hija al inicio de la lista
      newData[originalIndex] = updatedParentItem;
      newData.unshift(newActItem);
      setSdsData(newData);
    }
    resetFlow();

    if (user?.role === "Director de Prevención") {
      setDirectorView("gestion");
      setCurrentScreen("directorDashboard");
    } else {
      setCurrentScreen("main");
    }
  };

  const navigateTo = (screen, data = null) => {
    if (data) setSelectedSds(data);
    if (screen === "main" && user?.role === "Director de Prevención") {
      setDirectorView("gestion");
      setCurrentScreen("directorDashboard");
      resetFlow();
      return;
    }
    if (screen === "main" && user?.role === "Líder de Prevención") {
      setCurrentScreen("leaderDashboard");
      resetFlow();
      return;
    }
    if (screen === "main" || screen === "directorDashboard") resetFlow();
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return (
          <LoginScreen
            users={users}
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setCurrentScreen("register")}
          />
        );
      case "register":
        return (
          <RegisterScreen
            onRegisterSuccess={handleRegisterUser}
            onCancel={() => setCurrentScreen("login")}
            showModal={showModal}
          />
        );

      case "directorDashboard":
        return (
          <DirectorDashboard
            onLogout={handleLogout}
            user={user}
            sdsData={sdsData}
            onNavigate={navigateTo}
            initialModule={directorView}
            asesores={asesores}
            setAsesores={setAsesores}
            showModal={showModal}
            onSaveAssignments={handleSaveAssignments}
            setSdsData={setSdsData}
          />
        );
      case "coordinatorDashboard":
        return (
          <CoordinatorDashboard
            onLogout={handleLogout}
            user={user}
            sdsData={sdsData}
          />
        );
      case "leaderDashboard":
        return (
          <LeaderDashboard
            onLogout={handleLogout}
            user={user}
            sdsData={sdsData}
            asesores={asesores}
            setAsesores={setAsesores}
            showModal={showModal}
            onSaveAssignments={handleSaveAssignments}
            onNavigate={navigateTo}
          />
        );

      case "main":
        return (
          <MainScreen
            onNavigate={navigateTo}
            onLogout={handleLogout}
            user={user?.name}
            userRole={user?.role}
            sdsData={sdsData}
          />
        );

      case "actaForm":
        return (
          <ActaFormScreen
            onNavigate={navigateTo}
            user={user}
            showModal={showModal}
            selectedSds={selectedSds}
            setActaForm={setActaForm}
            sdsData={sdsData} // Pasar sdsData para validación
          />
        );

      case "actaDetails":
        return (
          <ActaDetailsScreen
            onNavigate={navigateTo}
            sdsItem={selectedSds}
            user={user}
          />
        );
      case "signature":
        return (
          <SignatureView
            form={actaForm}
            onNavigate={navigateTo}
            showModal={showModal}
            clientSigned={!!clientSignatureData}
            providerSigned={!!providerSignatureData}
            pinVerified={pinVerified}
            clientSignatureData={clientSignatureData}
            providerSignatureData={providerSignatureData}
            setCurrentPin={setCurrentPin}
            setActaForm={setActaForm}
            onFinalize={handleFinalizeActa}
          />
        );
      case "notification":
        return (
          <NotificationScreen onNavigate={navigateTo} currentPin={currentPin} />
        );
      case "pinEntry":
        return (
          <PinEntryScreen
            onNavigate={navigateTo}
            showModal={showModal}
            currentPin={currentPin}
            setPinVerified={setPinVerified}
          />
        );
      case "signClient":
        return (
          <SignaturePadScreen
            onNavigate={navigateTo}
            showModal={showModal}
            signatureType="client"
            onSaveSignature={setClientSignatureData}
          />
        );
      case "signProvider":
        return (
          <SignaturePadScreen
            onNavigate={navigateTo}
            showModal={showModal}
            signatureType="provider"
            onSaveSignature={setProviderSignatureData}
          />
        );
      default:
        return (
          <LoginScreen
            users={users}
            onLoginSuccess={handleLoginSuccess}
            onGoToRegister={() => setCurrentScreen("register")}
          />
        );
    }
  };

  if (!tailwindReady) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f9f9f9", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", color: "#333", marginBottom: "15px" }}>Cargando estilos P&P...</div>
          <div style={{ width: "40px", height: "40px", border: "4px solid #ddd", borderTop: "4px solid #3498db", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased text-gray-900 bg-gray-50 min-h-screen font-sans">
      <Modal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
      />
      {renderScreen()}
    </div>
  );
}
