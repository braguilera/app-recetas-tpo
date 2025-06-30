import { API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

//Header sin autorización
const getHeaders = async () => {
    return {
        'Content-Type': 'application/json',
    };
};

//Header con autorización
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

// Manejo de respuestas
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

// --- FUNCIONES SIN AUTORIZACIÓN  ---

// GET 
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

// GET recipes paninated
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

// GET con Query Params
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

// POST
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

// --- FUNCIONES CON AUTORIZACIÓN ---

// GET
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

// GET recipes paginated
export const getRecipesPaginatedWithAuth = async (params = {}, errorMessage = 'Error al obtener recetas') => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        if (params.sortBy !== undefined) queryParams.append('sortBy', params.sortBy);
        if (params.direction !== undefined) queryParams.append('direction', params.direction);
        if (params.name) queryParams.append('name', params.name);
        if (params.userName) queryParams.append('userName', params.userName);
        if (params.minAverageRating !== undefined) queryParams.append('minAverageRating', params.minAverageRating);
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

// GET courses paginated
export const getCoursesPaginatedWithAuth = async (params = {}, errorMessage = 'Error al obtener cursos') => {
    try {
        const queryParams = new URLSearchParams();

        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        if (params.sort !== undefined) queryParams.append('sort', params.sort); // 'sort' para cursos
        if (params.direction !== undefined) queryParams.append('direction', params.direction); // Agregamos direction
        if (params.nombreCurso) queryParams.append('nombreCurso', params.nombreCurso); // Nuevo filtro
        if (params.idSede !== undefined) queryParams.append('idSede', params.idSede); // Nuevo filtro
        if (params.modalidad) queryParams.append('modalidad', params.modalidad);

        const url = `${API_CONFIG.BASE_URL}course/page/student${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const response = await fetch(url, {
            headers: await getHeadersWithAuth()
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// GET Query Params
export const getDatosConQueryParamsWithAuth = async (endpoint, params = {}, errorMessage = 'Error al obtener datos (auth)') => {
    try {
        const queryParams = new URLSearchParams(params);
        const url = `${API_CONFIG.BASE_URL}${endpoint}?${queryParams.toString()}`;
        
        const response = await fetch(url, {
            headers: await getHeadersWithAuth() 
        });
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};

// POST
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

// PUT 
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



// DELETE con body o sin body
export const deleteDatosWithAuth = async (endpoint, errorMessage = 'Error deleting data (auth)', body = null, token = null) => {
    try {
        const headers = await getHeadersWithAuth(token);
        const options = {
            method: 'DELETE',
            headers: headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);
        return handleResponse(response, errorMessage);
    } catch (error) {
        throw new Error(`${errorMessage}: ${error.message}`);
    }
};