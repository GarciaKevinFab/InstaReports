import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                if (token && storedUser) {
                    const userData = JSON.parse(storedUser);
                    if (userData && userData.name && userData.role) {
                        setUser(userData);
                    } else {
                        throw new Error('Invalid user data');
                    }
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogin = async (email, password) => {
        const userData = await login(email, password);
        setUser(userData);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    // Determinar si el usuario es técnico
    const isTechnician = user?.role === 'technician';

    return (
        <AuthContext.Provider value={{ user, isTechnician, handleLogin, handleLogout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};