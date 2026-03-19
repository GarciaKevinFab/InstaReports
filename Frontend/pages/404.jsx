import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const NotFound = () => {
    const router = useRouter();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#f5f5f5',
            fontFamily: 'Inter, sans-serif',
        }}>
            <motion.h1
                style={{ fontSize: '6rem', color: '#E30613', margin: 0 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
            >
                404
            </motion.h1>
            <motion.p
                style={{ fontSize: '1.2rem', color: '#555', marginBottom: '2rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                Pagina no encontrada
            </motion.p>
            <motion.button
                onClick={() => router.push('/login')}
                style={{
                    padding: '12px 24px',
                    background: '#E30613',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Volver al inicio
            </motion.button>
        </div>
    );
};

export default NotFound;
