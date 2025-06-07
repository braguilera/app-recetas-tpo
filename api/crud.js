// crud.js
import { API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage

// Headers para peticiones que NO requieren token
const getHeaders = async () => {
    return {
        'Content-Type': 'application/json',
    };
};

// Headers para peticiones que SÍ requieren token (si está disponible)
const getHeadersWithAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Manejador de respuestas (sin cambios significativos)
const handleResponse = async (response, errorMessage) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const backendErrorMessage = errorData?.message || errorData?.detail || errorData?.error;
        throw new Error(errorMessage || backendErrorMessage || `Error desconocido: ${response.status}`);
    }
    const text = await response.text();
    if (!text) return {}; 
    try {
        return JSON.parse(text);
    } catch (error) {
        return text;
    }
};

// --- FUNCIONES SIN AUTORIZACIÓN (PÚBLICAS) ---

// GET (Pública)
export const getDatos = async (endpoint, errorMessage = 'Error al obtener datos') => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            headers: await getHeaders() 
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// GET con parámetros para recetas (Pública - si 'recipe/page' es pública)
export const getRecipesPaginated = async (params = {}, errorMessage = 'Error al obtener recetas') => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        if (params.sort && params.sort.length > 0) {
            params.sort.forEach(sortParam => queryParams.append('sort', sortParam));
        }
        if (params.name) queryParams.append('name', params.name);
        if (params.userName) queryParams.append('userName', params.userName);
        if (params.rating !== undefined) queryParams.append('rating', params.rating);
        if (params.includeIngredientId !== undefined) queryParams.append('includeIngredientId', params.includeIngredientId);
        if (params.excludeIngredientId !== undefined) queryParams.append('excludeIngredientId', params.excludeIngredientId);
        if (params.tipoRecetaId !== undefined) queryParams.append('tipoRecetaId', params.tipoRecetaId);

        const url = `${API_CONFIG.BASE_URL}recipe/page${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const response = await fetch(url, {
            headers: await getHeaders() 
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// GET con parámetros para recetas (Pública - si 'recipe/page' es pública)
export const getRecipesPaginatedWithAuth = async (params = {}, errorMessage = 'Error al obtener recetas') => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        if (params.sort && params.sort.length > 0) {
            params.sort.forEach(sortParam => queryParams.append('sort', sortParam));
        }
        if (params.name) queryParams.append('name', params.name);
        if (params.userName) queryParams.append('userName', params.userName);
        if (params.rating !== undefined) queryParams.append('rating', params.rating);
        if (params.includeIngredientId !== undefined) queryParams.append('includeIngredientId', params.includeIngredientId);
        if (params.excludeIngredientId !== undefined) queryParams.append('excludeIngredientId', params.excludeIngredientId);
        if (params.tipoRecetaId !== undefined) queryParams.append('tipoRecetaId', params.tipoRecetaId);

        const url = `${API_CONFIG.BASE_URL}recipe/page${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const response = await fetch(url, {
            headers: await getHeadersWithAuth() 
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};
// GET verificación del código (Pública)
export const getDatosConQueryParams = async (endpoint, params = {}, errorMessage = 'Error al obtener datos') => {
    try {
        const queryParams = new URLSearchParams(params);
        const url = `${API_CONFIG.BASE_URL}${endpoint}?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            headers: await getHeaders() 
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// POST (Pública - para login, registro, etc.)
export const postDatos = async (endpoint, data, errorMessage = 'Error al crear recurso') => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// --- FUNCIONES CON AUTORIZACIÓN (PRIVADAS) ---

// GET con Autorización
export const getDatosWithAuth = async (endpoint, errorMessage = 'Error al obtener datos (auth)') => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            headers: await getHeadersWithAuth() 
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// GET con Autorización y Query Params (la nueva función)
export const getDatosConQueryParamsWithAuth = async (endpoint, params = {}, errorMessage = 'Error al obtener datos (auth)') => {
    try {
        const queryParams = new URLSearchParams(params);
        const url = `${API_CONFIG.BASE_URL}${endpoint}?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            headers: await getHeadersWithAuth() // Usa el header CON token
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// POST con Autorización
export const postDatosWithAuth = async (endpoint, data, errorMessage = 'Error al crear recurso (auth)') => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: await getHeadersWithAuth(),
            body: JSON.stringify(data)
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// PUT con Autorización
export const putDatosWithAuth = async (endpoint, data, errorMessage = 'Error al actualizar recurso (auth)') => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: await getHeadersWithAuth(),
            body: JSON.stringify(data)
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// PUT 
export const putDatos = async (endpoint, errorMessage = 'Error al actualizar recurso (auth)') => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: await getHeaders() 
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// DELETE con Autorización
export const deleteDatosWithAuth = async (endpoint, errorMessage = 'Error al eliminar recurso (auth)') => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: await getHeadersWithAuth() 
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};