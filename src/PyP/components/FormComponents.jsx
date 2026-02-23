import React from "react";

// Sección con bordes más suaves
export const FormSection = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
    <div className="bg-[#00b288] py-2 px-4">
      <h3 className="text-base font-bold text-white uppercase tracking-wide">
        {title}
      </h3>
    </div>
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

// Input optimizado para toque
export const FormInput = ({ label, readOnly = false, ...props }) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-medium text-gray-600 mb-1 ml-1"
    >
      {label}
    </label>
    <input
      id={props.name}
      {...props}
      readOnly={readOnly}
      // text-base previene zoom en iOS. py-3 para mayor área táctil.
      className={`w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#00b288] focus:border-transparent outline-none transition-all ${
        readOnly ? "bg-gray-100 text-gray-500" : "bg-white text-gray-900"
      }`}
    />
  </div>
);

export const FormSelect = ({ label, options, isObject = true, ...props }) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-medium text-gray-600 mb-1 ml-1"
    >
      {label}
    </label>
    <div className="relative">
      <select
        id={props.name}
        {...props}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base bg-white appearance-none focus:ring-2 focus:ring-[#00b288] outline-none"
      >
        {isObject
          ? options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))
          : options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
      {/* Flecha personalizada para mejor UX visual */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);

export const FormTextarea = ({ label, ...props }) => (
  <div>
    <label
      htmlFor={props.name}
      className="block text-sm font-medium text-gray-600 mb-1 ml-1"
    >
      {label}
    </label>
    <textarea
      id={props.name}
      {...props}
      rows="4"
      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-[#00b288] outline-none"
    ></textarea>
  </div>
);
