// components/LoginPage.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/components/Login.module.css';
import Logo from '../assets/logo.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { handleLogin, user, loading } = useAuthContext();
    const router = useRouter();

    // Redirigir si el usuario ya está autenticado
    if (loading) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    if (user) {
        if (user.role === 'technician') {
            router.push('/dashboard/technician');
        } else if (user.role === 'admin') {
            router.push('/admin');
        }
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await handleLogin(email, password);
            if (user.role === 'technician') {
                router.push('/dashboard/technician');
            } else if (user.role === 'admin') {
                router.push('/admin');
            } else {
                setError('Rol no válido');
            }
        } catch (err) {
            setError('Correo o contraseña inválidos');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const sideVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    };

    const formVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', stiffness: 100, damping: 15 }
        }
    };

    const inputVariants = {
        hover: { scale: 1.02, transition: { type: 'spring', stiffness: 300 } },
        focus: { borderColor: '#E30613', boxShadow: '0 0 8px rgba(227, 6, 19, 0.3)' }
    };

    const buttonVariants = {
        hover: { scale: 1.05, backgroundColor: '#C20511' },
        tap: { scale: 0.95 }
    };

    return (
        <motion.div
            className={styles.container}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className={styles.logoSide} variants={sideVariants}>
                <motion.div className={styles.logoWrapper} whileHover={{ scale: 1.05 }}>
                    <Image
                        src={Logo}
                        alt="InstaReports Logo"
                        width={200}
                        height={200}
                        priority
                    />
                </motion.div>
                <h2 className={styles.sideTitle}>Soluciones Informáticas</h2>
                <p className={styles.sideText}>
                    Inicia sesión para acceder a tu panel de control y gestionar tus reportes.
                </p>
            </motion.div>
            <motion.div className={styles.formSide} variants={formVariants}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h1 className={styles.title}>Iniciar Sesión</h1>
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                className={styles.error}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>
                    <motion.input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                        whileHover="hover"
                        whileFocus="focus"
                        variants={inputVariants}
                    />
                    <motion.input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                        whileHover="hover"
                        whileFocus="focus"
                        variants={inputVariants}
                    />
                    <motion.button
                        type="submit"
                        className={styles.button}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Iniciar Sesión
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default LoginPage;