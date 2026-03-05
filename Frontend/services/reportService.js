import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export const createReport = async (reportData) => {
    try {
        const response = await axios.post(`${API_URL}/reports`, reportData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...getAuthHeaders(),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error en createReport:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al crear el reporte');
    }
};

export const getReports = async () => {
    try {
        const response = await axios.get(`${API_URL}/reports`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error en getReports:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener los reportes');
    }
};

export const deleteReport = async (reportId) => {
    try {
        const response = await axios.delete(`${API_URL}/reports/${reportId}`, {
            headers: getAuthHeaders(),
        });
        return response.data;
    } catch (error) {
        console.error('Error en deleteReport:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al eliminar el reporte');
    }
};

export const updateReport = async (reportId, reportData) => {
    try {
        let dataToSend;

        // Si ya es FormData (viene del formulario de edicion), usarlo directamente
        if (reportData instanceof FormData) {
            dataToSend = reportData;
        } else {
            // Si es un objeto plano (toggle switches), convertir a FormData
            dataToSend = new FormData();
            for (const key in reportData) {
                if (typeof reportData[key] === 'object' && reportData[key] !== null && key !== 'files') {
                    for (const subKey in reportData[key]) {
                        dataToSend.append(`${key}[${subKey}]`, reportData[key][subKey]);
                    }
                } else {
                    dataToSend.append(key, reportData[key]);
                }
            }
        }

        const response = await axios.put(`${API_URL}/reports/${reportId}`, dataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...getAuthHeaders(),
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error en updateReport:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al actualizar el reporte');
    }
};
