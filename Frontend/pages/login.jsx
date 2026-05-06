import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/components/Login.module.css';
import LogoFull from '../assets/LOGO2_Mesa de trabajo 1.png';
import LogoIcon from '../assets/logo-icon.png';
import { RiMailLine, RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { handleLogin, user, loading } = useAuthContext();
    const router = useRouter();

    if (loading) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.spinner} />
            </div>
        );
    }

    if (user) {
        if (user.role === 'technician') router.push('/dashboard/technician');
        else if (user.role === 'admin') router.push('/admin');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const userData = await handleLogin(email, password);
            if (userData.role === 'technician') router.push('/dashboard/technician');
            else if (userData.role === 'admin') router.push('/admin');
        } catch (err) {
            setError('Correo o contraseña incorrectos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Left side - Branding */}
            <motion.div
                className={styles.brandSide}
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <div className={styles.brandContent}>
                    <motion.div
                        className={styles.logoWrapper}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <Image src={LogoFull} alt="Soluciones Informáticas" width={320} height={160} priority style={{ objectFit: 'contain' }} />
                    </motion.div>
                    <motion.p
                        className={styles.brandTagline}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        Sistema de Gestión de Reportes Técnicos
                    </motion.p>
                    <motion.div
                        className={styles.brandFeatures}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className={styles.feature}>
                            <div className={styles.featureDot} />
                            <span>Gestión de reportes en tiempo real</span>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureDot} />
                            <span>Control de partes y mantenimiento</span>
                        </div>
                        <div className={styles.feature}>
                            <div className={styles.featureDot} />
                            <span>Exportación de reportes en PDF</span>
                        </div>
                    </motion.div>
                </div>
                <div className={styles.brandDecor}>
                    <div className={styles.circle1} />
                    <div className={styles.circle2} />
                    <div className={styles.circle3} />
                </div>
            </motion.div>

            {/* Right side - Login Form */}
            <motion.div
                className={styles.formSide}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <div className={styles.formLogoMobile}>
                            <Image src={LogoIcon} alt="Logo" width={48} height={48} style={{ objectFit: 'contain' }} />
                        </div>
                        <h1 className={styles.formTitle}>Bienvenido</h1>
                        <p className={styles.formSubtitle}>Ingresa tus credenciales para continuar</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className={styles.errorBanner}
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Correo electrónico</label>
                            <div className={styles.inputWithIcon}>
                                <RiMailLine className={styles.inputIcon} />
                                <input
                                    type="email"
                                    placeholder="tucorreo@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Contraseña</label>
                            <div className={styles.inputWithIcon}>
                                <RiLockPasswordLine className={styles.inputIcon} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <span className={styles.btnLoading}>
                                    <span className={styles.btnSpinner} /> Ingresando...
                                </span>
                            ) : 'Iniciar Sesión'}
                        </motion.button>
                    </form>

                    <p className={styles.footer}>
                        &copy; {new Date().getFullYear()} Soluciones Informáticas
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
