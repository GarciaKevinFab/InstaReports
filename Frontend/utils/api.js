import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Interceptor global para manejar errores de autenticacion
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o invalido - limpiar sesion y redirigir
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Solo redirigir si no estamos ya en login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);
