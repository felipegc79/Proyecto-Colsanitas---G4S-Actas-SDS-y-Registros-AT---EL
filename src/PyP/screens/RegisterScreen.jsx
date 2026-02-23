import React, { useState } from "react";

const RegisterScreen = ({ onRegisterSuccess, onCancel, showModal }) => {
  const [formData, setFormData] = useState({
    nombres: "",
    identificacion: "",
    telefono: "", // NUEVO CAMPO
    email: "",
    rol: "",
  });

  const roles = [
    "Director de Prevención",
    "Líder de Prevención",
    "Coordinador de Administración del Riesgo ARL",
    "Coordinador de Promoción y Prevención",
    "Asesor Integral de Prevención",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validamos todos los campos obligatorios
    if (
      !formData.nombres ||
      !formData.identificacion ||
      !formData.telefono ||
      !formData.email ||
      !formData.rol
    ) {
      showModal("Error", "Por favor diligencie todos los campos obligatorios.");
      return;
    }

    const autoUser = formData.email.split("@")[0];
    const autoPass = "123456";

    // Guardamos el objeto usuario COMPLETO
    const newUser = {
      username: autoUser,
      password: autoPass,
      name: formData.nombres,
      role: formData.rol,
      email: formData.email,
      identificacion: formData.identificacion, // Capturamos ID
      telefono: formData.telefono, // Capturamos Teléfono
    };

    showModal(
      "Usuario Registrado",
      `Se ha creado el usuario exitosamente.\n\nUsuario: ${autoUser}\nContraseña: ${autoPass}`
    );

    setTimeout(() => {
      onRegisterSuccess(newUser);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Registro de Usuario
          </h2>
          <p className="text-sm text-gray-500">
            Sistema de Gestión - Seguros Colsanitas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombres y Apellidos
            </label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#00b288] outline-none"
              placeholder="Ej. Pepito Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              No. Identificación
            </label>
            <input
              type="number"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#00b288] outline-none"
            />
          </div>

          {/* NUEVO CAMPO TELÉFONO */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono de contacto
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#00b288] outline-none"
              placeholder="Ej. 300 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#00b288] outline-none"
              placeholder="usuario@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rol
            </label>
            <select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#00b288] outline-none"
            >
              <option value="">Seleccione un rol...</option>
              {roles.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#00b288] text-white rounded-lg font-bold hover:bg-[#009670] shadow-md"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterScreen;
