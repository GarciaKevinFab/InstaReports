import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RiFileList2Line, RiUserLine, RiBarChartLine, RiCheckboxCircleLine } from 'react-icons/ri';
import AdminLayout from '../../components/AdminLayout';
import { getReports } from '../../services/reportService';
import { getUsers } from '../../services/userService';

const AdminIndex = () => {
    const [stats, setStats] = useState({ reports: 0, users: 0, ready: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [reports, users] = await Promise.all([getReports(), getUsers()]);
                setStats({
                    reports: reports.length,
                    users: users.length,
                    ready: reports.filter(r => r.readyForPickup).length,
                });
            } catch (err) {
                console.error('Error al cargar estadisticas:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.15, type: 'spring', stiffness: 100 }
        })
    };

    return (
        <AdminLayout>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ padding: '20px' }}
            >
                <h2>Panel de Administracion</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>
                    Bienvenido al panel de administracion. Usa la barra lateral para navegar.
                </p>
                {loading ? (
                    <p style={{ color: '#999' }}>Cargando estadisticas...</p>
                ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <motion.div
                        custom={0}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                        style={{
                            background: 'linear-gradient(135deg, #E30613, #ff4444)',
                            color: 'white',
                            padding: '25px',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <RiFileList2Line size={32} />
                        <h3 style={{ margin: '10px 0 5px' }}>{stats.reports}</h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>Reportes</p>
                    </motion.div>
                    <motion.div
                        custom={1}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                        style={{
                            background: 'linear-gradient(135deg, #0066cc, #3399ff)',
                            color: 'white',
                            padding: '25px',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <RiUserLine size={32} />
                        <h3 style={{ margin: '10px 0 5px' }}>{stats.users}</h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>Usuarios</p>
                    </motion.div>
                    <motion.div
                        custom={2}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                        style={{
                            background: 'linear-gradient(135deg, #28a745, #5cb85c)',
                            color: 'white',
                            padding: '25px',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}
                    >
                        <RiCheckboxCircleLine size={32} />
                        <h3 style={{ margin: '10px 0 5px' }}>{stats.ready}</h3>
                        <p style={{ margin: 0, opacity: 0.9 }}>Listos para Recoger</p>
                    </motion.div>
                </div>
                )}
            </motion.div>
        </AdminLayout>
    );
};

export default AdminIndex;
