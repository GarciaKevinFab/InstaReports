import { useAuthContext } from '../contexts/AuthContext';
import styles from '../styles/components/Navbar.module.css';
import { motion } from 'framer-motion';
import { RiLogoutBoxLine, RiMenuLine } from 'react-icons/ri';
import Image from 'next/image';
import LogoIcon from '../assets/logo-icon.png';

const Navbar = ({ onMenuToggle }) => {
    const { user, handleLogout } = useAuthContext();

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <motion.nav
            className={styles.navbar}
            initial={{ y: -64 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
            <div className={styles.navLeft}>
                <button className={styles.menuButton} onClick={onMenuToggle}>
                    <RiMenuLine size={22} />
                </button>
                <div className={styles.logoBrand}>
                    <Image src={LogoIcon} alt="InstaReports" width={38} height={38} priority style={{ objectFit: 'contain' }} />
                    <span className={styles.brandName}>InstaReports</span>
                </div>
            </div>

            <div className={styles.navRight}>
                {user && (
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {getInitials(user.name)}
                        </div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{user.name}</span>
                            <span className={styles.userRole}>
                                {user.role === 'admin' ? 'Administrador' : 'Técnico'}
                            </span>
                        </div>
                        <motion.button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <RiLogoutBoxLine size={16} />
                            <span>Salir</span>
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;
