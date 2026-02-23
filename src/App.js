// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MainLayout from "./components/MainLayout"; // Nueva estructura
import G4SMainLayout from "./G4S/components/MainLayout"; // Módulo G4S Integrado (Archivo MainLayout.js original)
import G4SLogin from "./G4S/components/Login";
import G4SRegister from "./G4S/components/Register";
import PyPMainLayout from "./PyP/PyPMainLayout"; // Módulo P&P Integrado
import "./styles.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<MainLayout />} />
        <Route path="/g4s" element={<G4SLogin />} />
        <Route path="/g4s/register" element={<G4SRegister />} />
        <Route path="/g4s/dashboard/*" element={<G4SMainLayout />} />
        <Route path="/pyp/*" element={<PyPMainLayout />} />
      </Routes>
    </Router>
  );
}
