import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { RiDashboardLine, RiUserLine, RiFileList2Line, RiBarChartLine, RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';
import styles from '../styles/components/Sidebar.module.css';
import LogoIcon from '../assets/logo-icon.png';

const Sidebar = ({ onCollapse, mobileOpen, onMobileClose }) => {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();

    const menuItems = [
        { icon: <RiDashboardLine size={20} />, text: 'Dashboard', path: '/admin' },
        { icon: <RiBarChartLine size={20} />, text: 'Estadisticas', path: '/admin/statistics' },
        { icon: <RiUserLine size={20} />, text: 'Usuarios', path: '/admin/users' },
        { icon: <RiFileList2Line size={20} />, text: 'Reportes', path: '/admin/reports' },
    ];

    const handleNavigation = (item) => {
        if (item.path) {
            router.push(item.path);
            if (onMobileClose) onMobileClose();
        }
    };

    const handleToggle = () => {
        const next = !collapsed;
        setCollapsed(next);
        if (onCollapse) onCollapse(next);
    };

    const sidebarClass = [
        styles.sidebar,
        collapsed ? styles.sidebarCollapsed : '',
        mobileOpen ? styles.sidebarMobileOpen : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={styles.sidebarContainer}>
            {mobileOpen && <div className={`${styles.overlay} ${styles.overlayVisible}`} onClick={onMobileClose} />}

            <div className={sidebarClass}>
                <div className={styles.logoArea}>
                    <div className={styles.logoImg}>
                        <Image src={LogoIcon} alt="Logo" width={collapsed ? 32 : 40} height={collapsed ? 32 : 40} style={{ objectFit: 'contain' }} />
                    </div>
                    {!collapsed && <span className={styles.logoText}>Admin Panel</span>}
                </div>

                <ul className={styles.menu}>
                    {menuItems.map((item) => (
                        <motion.li
                            key={item.text}
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.98 }}
                            className={`${styles.menuItem} ${router.pathname === item.path ? styles.active : ''}`}
                            onClick={() => handleNavigation(item)}
                            title={collapsed ? item.text : ''}
                        >
                            <span className={styles.menuItemIcon}>{item.icon}</span>
                            {!collapsed && <span className={styles.menuItemText}>{item.text}</span>}
                        </motion.li>
                    ))}
                </ul>

                <div className={styles.sidebarBottom}>
                    <button className={styles.toggleBtn} onClick={handleToggle}>
                        {collapsed ? <RiMenuUnfoldLine size={20} /> : <RiMenuFoldLine size={20} />}
                        {!collapsed && <span>Colapsar</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
