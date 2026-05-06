import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import styles from '../styles/components/AdminDashboard.module.css';

const AdminLayout = ({ children }) => {
    const router = useRouter();
    const { user, loading } = useAuthContext();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (user === null) router.push('/login');
        else if (user.role !== 'admin') router.push('/dashboard/technician');
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    Cargando...
                </div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    const contentClass = [
        styles.content,
        sidebarCollapsed ? styles.contentCollapsed : styles.contentWithSidebar,
    ].join(' ');

    return (
        <div className={styles.layout}>
            <Navbar onMenuToggle={() => setMobileMenuOpen(prev => !prev)} />
            <div className={styles.mainContainer}>
                <Sidebar
                    onCollapse={setSidebarCollapsed}
                    mobileOpen={mobileMenuOpen}
                    onMobileClose={() => setMobileMenuOpen(false)}
                />
                <div className={contentClass}>
                    {children}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminLayout;
