/**
 * Servicio de Gestión de Parámetros
 * Maneja parámetros dinámicos del sistema (categorías, métodos de pago, tipos de documentos)
 * Los datos se persisten en localStorage y emiten eventos para sincronización global
 */

const STORAGE_KEY = "syspharma_parameters";

// Valores por defecto
const DEFAULT_PARAMETERS = {
  serviceCategories: [
    { id: 1, value: "Enfermería" },
    { id: 2, value: "Medicina" },
    { id: 3, value: "Laboratorio" },
    { id: 4, value: "Terapia" },
  ],
  paymentMethods: [
    { id: 1, value: "Efectivo" },
    { id: 2, value: "Tarjeta Débito" },
    { id: 3, value: "Tarjeta Crédito" },
    { id: 4, value: "Transferencia" },
    { id: 5, value: "Cheque" },
  ],
  documentTypes: [
    { id: 1, value: "CC" },
    { id: 2, value: "TI" },
    { id: 3, value: "CE" },
  ],
};

/**
 * Emite un evento personalizado para notificar cambios
 */
const emitParameterUpdate = (parameterType) => {
  window.dispatchEvent(
    new CustomEvent("syspharma_parameters_updated", {
      detail: { parameterType },
    }),
  );
};

/**
 * Obtiene los parámetros almacenados o retorna los valores por defecto
 */
const getStoredParameters = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Inicializa con valores por defecto si no existe
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PARAMETERS));
  return DEFAULT_PARAMETERS;
};

/**
 * Obtiene todas las categorías de servicio
 */
export const getServiceCategories = () => {
  const params = getStoredParameters();
  return params.serviceCategories || DEFAULT_PARAMETERS.serviceCategories;
};

/**
 * Obtiene todos los métodos de pago
 */
export const getPaymentMethods = () => {
  const params = getStoredParameters();
  return params.paymentMethods || DEFAULT_PARAMETERS.paymentMethods;
};

/**
 * Obtiene todos los tipos de documento
 */
export const getDocumentTypes = () => {
  const params = getStoredParameters();
  return params.documentTypes || DEFAULT_PARAMETERS.documentTypes;
};

/**
 * Agrega un nuevo parámetro
 */
export const addParameter = (parameterType, value) => {
  const params = getStoredParameters();

  if (!params[parameterType]) {
    params[parameterType] = [];
  }

  // Genera un ID único (timestamp + random)
  const id = Date.now() + Math.random();

  const newParam = { id, value };
  params[parameterType].push(newParam);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  emitParameterUpdate(parameterType);

  return newParam;
};

/**
 * Actualiza un parámetro existente
 */
export const updateParameter = (parameterType, id, value) => {
  const params = getStoredParameters();

  if (!params[parameterType]) {
    return null;
  }

  const paramIndex = params[parameterType].findIndex((p) => p.id === id);
  if (paramIndex === -1) {
    return null;
  }

  params[parameterType][paramIndex].value = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  emitParameterUpdate(parameterType);

  return params[parameterType][paramIndex];
};

/**
 * Elimina un parámetro
 */
export const deleteParameter = (parameterType, id) => {
  const params = getStoredParameters();

  if (!params[parameterType]) {
    return false;
  }

  const paramIndex = params[parameterType].findIndex((p) => p.id === id);
  if (paramIndex === -1) {
    return false;
  }

  params[parameterType].splice(paramIndex, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  emitParameterUpdate(parameterType);

  return true;
};

/**
 * Reinicia los parámetros a los valores por defecto
 */
export const resetParameters = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PARAMETERS));
  window.dispatchEvent(
    new CustomEvent("syspharma_parameters_updated", {
      detail: { parameterType: "all" },
    }),
  );
};

/**
 * Obtiene todos los parámetros
 */
export const getAllParameters = () => {
  return getStoredParameters();
};
