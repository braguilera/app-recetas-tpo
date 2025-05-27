import { API_CONFIG } from './config';

// Headers 
const getHeaders = () => ({
  'Content-Type': 'application/json'
});

// Manejador de respuestas
const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorMessage || errorData.message || 'Error desconocido');
  }
  const text = await response.text();
  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
};

// GET
export const getDatos = async (endpoint, errorMessage = 'Error al obtener datos') => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      headers: getHeaders()
    });
    return handleResponse(response, errorMessage);
  } catch (error) {
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

// POST
export const postDatos = async (endpoint, data, errorMessage = 'Error al crear recurso') => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response, errorMessage);
  } catch (error) {
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

// PUT
export const putDatos = async (endpoint, data, errorMessage = 'Error al actualizar recurso') => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response, errorMessage);
  } catch (error) {
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};

// DELETE
export const deleteDatos = async (endpoint, errorMessage = 'Error al eliminar recurso') => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response, errorMessage);
  } catch (error) {
    throw new Error(`${errorMessage}: ${error.message}`);
  }
};
