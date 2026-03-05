import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RiFileList2Line, RiToolsLine, RiCheckboxCircleLine, RiAlertLine } from 'react-icons/ri';
import TechLayout from '../../components/TechLayout';
import { getReports } from '../../services/reportService';

const TechDashboard = () => {
    const [stats, setStats] = useState({ total: 0, ready: 0, needsParts: 0, inoperative: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const reports = await getReports();
                setStats({
                    total: reports.length,
                    ready: reports.filter(r => r.readyForPickup).length,
                    needsParts: reports.filter(r => r.partsRequested && !r.partsOrdered).length,
                    inoperative: reports.filter(r => r.status === 'Inoperative').length,
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

    const cards = [
        { icon: RiFileList2Line, value: stats.total, label: 'Total Reportes', gradient: 'linear-gradient(135deg, #E30613, #ff4444)' },
        { icon: RiCheckboxCircleLine, value: stats.ready, label: 'Listos para Recoger', gradient: 'linear-gradient(135deg, #28a745, #5cb85c)' },
        { icon: RiToolsLine, value: stats.needsParts, label: 'Partes Pendientes', gradient: 'linear-gradient(135deg, #f0ad4e, #ff8800)' },
        { icon: RiAlertLine, value: stats.inoperative, label: 'Inoperativos', gradient: 'linear-gradient(135deg, #dc3545, #c82333)' },
    ];

    return (
        <TechLayout>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ padding: '20px' }}
            >
                <h2>Panel de Tecnico</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>
                    Bienvenido al panel de tecnico. Usa la barra lateral para navegar a tus reportes.
                </p>
                {loading ? (
                    <p style={{ color: '#999' }}>Cargando estadisticas...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {cards.map((card, i) => (
                            <motion.div
                                key={card.label}
                                custom={i}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    background: card.gradient,
                                    color: 'white',
                                    padding: '25px',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                }}
                            >
                                <card.icon size={32} />
                                <h3 style={{ margin: '10px 0 5px' }}>{card.value}</h3>
                                <p style={{ margin: 0, opacity: 0.9 }}>{card.label}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </TechLayout>
    );
};

export default TechDashboard;
