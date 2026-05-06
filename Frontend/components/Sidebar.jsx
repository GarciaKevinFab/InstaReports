import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { RiDashboardLine, RiUserLine, RiFileList2Line, RiArrowLeftSLine, RiBarChartLine } from 'react-icons/ri';
import styles from '../styles/components/Sidebar.module.css';

const Sidebar = ({ onToggle, isCollapsed, onCollapse, mobileOpen, onMobileClose }) => {
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);

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
            {mobileOpen && (
                <div className={`${styles.overlay} ${styles.overlayVisible}`} onClick={onMobileClose} />
            )}

            <div className={sidebarClass}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>SI</div>
                    <span className={`${styles.logoText} ${collapsed ? styles.logoTextHidden : ''}`}>
                        Admin Panel
                    </span>
                </div>

                <ul className={styles.menu}>
                    {menuItems.map((item) => (
                        <motion.li
                            key={item.text}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`${styles.menuItem} ${router.pathname === item.path ? styles.active : ''}`}
                            onClick={() => handleNavigation(item)}
                            title={collapsed ? item.text : ''}
                        >
                            <span className={styles.menuItemIcon}>{item.icon}</span>
                            <span className={`${styles.menuItemText} ${collapsed ? styles.menuItemTextHidden : ''}`}>
                                {item.text}
                            </span>
                        </motion.li>
                    ))}
                </ul>

                <div className={styles.sidebarFooter}>
                    <p className={styles.versionText}>
                        {collapsed ? 'v1' : 'InstaReports v1.0'}
                    </p>
                </div>

                <button className={styles.toggleButton} onClick={handleToggle}>
                    <RiArrowLeftSLine size={16} className={collapsed ? styles.rotatedIcon : ''} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
