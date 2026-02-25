import React from "react";

const AppLayout = ({ children, onNavigate, title }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    {/* 1. HEADER (Fijo arriba) */}
    <header className="sticky top-0 z-30 bg-blue-900 text-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Botón Volver (Condicional) */}
        {onNavigate ? (
          <button
            onClick={() => onNavigate("main")}
            className="p-2 -ml-2 text-white hover:bg-blue-800 rounded-full focus:outline-none active:scale-95 transition-transform"
            aria-label="Volver"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        ) : (
          /* Espaciador si no hay botón para mantener centro */
          <div className="w-8"></div>
        )}
        <h1 className="text-lg font-semibold truncate max-w-[70%] text-center flex-1">
          {title}
        </h1>
        <div className="w-8"></div> {/* Espaciador derecho */}
      </div>
    </header>

    {/* Se removió el logo central para ubicarlo en el sidebar izquierdo como se solicitó */}

    {/* 3. CONTENIDO PRINCIPAL */}
    <main className="flex-1 p-4 pb-20 overflow-x-hidden">{children}</main>
  </div>
);

export default AppLayout;
