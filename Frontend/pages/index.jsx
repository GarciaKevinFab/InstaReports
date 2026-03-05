import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';

export default function Home() {
    const router = useRouter();
    const { user, loading } = useAuthContext();

    useEffect(() => {
        if (loading) return; // Esperamos a que la autenticación se resuelva

        if (user) {
            // Si el usuario está autenticado, redirige según el rol
            if (user.role === 'technician') {
                router.push('/dashboard/technician');
            } else if (user.role === 'admin') {
                router.push('/admin');
            }
        } else {
            // Si el usuario no está autenticado, redirige a /login
            router.push('/login');
        }
    }, [user, loading, router]);

    return null; // No renderiza nada en esta página
}