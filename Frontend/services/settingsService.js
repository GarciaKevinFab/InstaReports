import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const getSettings = async () => {
    try {
        const response = await axios.get(`${API_URL}/settings`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al obtener configuración');
    }
};

export const updateSettings = async (formData) => {
    try {
        const response = await axios.put(`${API_URL}/settings`, formData, {
            headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al actualizar configuración');
    }
};

export const removeLogo = async () => {
    try {
        const response = await axios.delete(`${API_URL}/settings/logo`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error al eliminar logo');
    }
};
