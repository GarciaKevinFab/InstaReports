// components/TechLayout.jsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from './Navbar';
import TechSidebar from './TechSidebar';
import Footer from './Footer';
import styles from '../styles/components/AdminDashboard.module.css';

const TechLayout = ({ children }) => {
    const router = useRouter();
    const { user, loading } = useAuthContext();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    useEffect(() => {
        if (loading) return;

        if (user === null) {
            router.push('/login');
        } else if (user.role !== 'technician') {
            router.push('/admin');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#999' }}>Cargando...</div>;
    }

    if (!user || user.role !== 'technician') {
        return null;
    }

    return (
        <div className={styles.layout}>
            <Navbar />
            <div className={styles.mainContainer}>
                <TechSidebar onToggle={setIsSidebarVisible} />
                <div
                    className={`${styles.content} ${isSidebarVisible ? styles.contentWithSidebar : styles.contentFull}`}
                >
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TechLayout;