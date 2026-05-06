import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const getUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error en getUsers:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener los usuarios');
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}/users/${userId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error en deleteUser:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al eliminar el usuario');
    }
};

export const createUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/users`, userData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error en createUser:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al crear el usuario');
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error en updateUser:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al actualizar el usuario');
    }
};

export const getMyProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/users/me`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
};

export const updateMyProfile = async (formData) => {
    try {
        const response = await axios.put(`${API_URL}/users/me`, formData, {
            headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
};

export const removeMySignature = async () => {
    try {
        const response = await axios.delete(`${API_URL}/users/me/signature`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al eliminar firma');
    }
};
