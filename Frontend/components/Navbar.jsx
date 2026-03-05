import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthContext } from '../contexts/AuthContext';
import styles from '../styles/components/Navbar.module.css';
import { motion } from 'framer-motion';
import { RiUserLine, RiLogoutBoxLine } from 'react-icons/ri';
import Logo from '../assets/logo.png';

const Navbar = () => {
    const { user, handleLogout } = useAuthContext();

    const navVariants = {
        hidden: { opacity: 0, y: -30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: 'spring', stiffness: 150, damping: 20 }
        }
    };

    const buttonVariants = {
        hover: { scale: 1.1, rotate: 5 },
        tap: { scale: 0.95 }
    };

    return (
        <motion.nav
            className={styles.navbar}
            variants={navVariants}
            initial="hidden"
            animate="visible"
        >
            <div className={styles.logoContainer}>
                <motion.div
                    className={styles.logo}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <Link href="/">
                        <Image
                            src={Logo}
                            alt="InstaReports Logo"
                            width={120}
                            height={80}
                            priority
                        />
                    </Link>
                </motion.div>
                <span className={styles.logoText}>SOLUCIONES INFORMÁTICAS</span>
            </div>

            <div className={styles.userSection}>
                {user && (
                    <motion.div
                        className={styles.userInfo}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <span className={styles.userName}>
                            <RiUserLine size={20} style={{ marginRight: '8px' }} /> {user.name}
                        </span>
                        <motion.button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <RiLogoutBoxLine size={20} style={{ marginRight: '8px' }} /> Cerrar Sesión
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;