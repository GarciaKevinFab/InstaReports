import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    RiFileList2Line, RiToolsLine, RiCheckboxCircleLine, RiAlertLine, RiTimeLine
} from 'react-icons/ri';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts';
import TechLayout from '../../components/TechLayout';
import { getReports } from '../../services/reportService';

const StatCard = ({ icon: Icon, value, label, gradient, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 100 }}
        whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
        style={{
            background: gradient,
            color: 'white',
            padding: '24px',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'default',
        }}
    >
        <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
            <Icon size={100} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
            <Icon size={24} style={{ marginBottom: 8, opacity: 0.9 }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0' }}>{value}</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.85, fontWeight: 500 }}>{label}</p>
        </div>
    </motion.div>
);

const ChartCard = ({ title, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: 'spring', stiffness: 80 }}
        style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid var(--border-light)',
        }}
    >
        <h3 style={{ marginBottom: 20, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
            {title}
        </h3>
        {children}
    </motion.div>
);

const TechDashboard = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getReports();
                setReports(data);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const ready = reports.filter(r => r.readyForPickup).length;
    const needsParts = reports.filter(r => r.partsRequested && !r.partsOrdered).length;
    const inoperative = reports.filter(r => r.status === 'Inoperative').length;
    const operative = reports.filter(r => r.status === 'Operative').length;

    const statusData = [
        { name: 'Operativo', value: operative, color: '#28a745' },
        { name: 'Inoperativo', value: inoperative, color: '#E30613' },
    ].filter(d => d.value > 0);

    const monthlyData = (() => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const now = new Date();
        const data = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthReports = reports.filter(r => {
                const rd = new Date(r.createdAt);
                return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
            });
            data.push({ name: months[d.getMonth()], reportes: monthReports.length });
        }
        return data;
    })();

    const recentReports = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    if (loading) {
        return (
            <TechLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }}
                    />
                </div>
            </TechLayout>
        );
    }

    return (
        <TechLayout>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mi Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                        Resumen de tus reportes y actividad
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
                    <StatCard icon={RiFileList2Line} value={reports.length} label="Mis Reportes" gradient="linear-gradient(135deg, #E30613, #ff4444)" delay={0.1} />
                    <StatCard icon={RiCheckboxCircleLine} value={ready} label="Listos para Recoger" gradient="linear-gradient(135deg, #28a745, #34d058)" delay={0.15} />
                    <StatCard icon={RiToolsLine} value={needsParts} label="Partes Pendientes" gradient="linear-gradient(135deg, #f0ad4e, #ff8800)" delay={0.2} />
                    <StatCard icon={RiAlertLine} value={inoperative} label="Inoperativos" gradient="linear-gradient(135deg, #dc3545, #c82333)" delay={0.25} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                    <ChartCard title="Mis Reportes por Mes" delay={0.3}>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={monthlyData} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="reportes" fill="#E30613" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Estado de Equipos" delay={0.35}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie data={statusData.length > 0 ? statusData : [{ name: 'Sin datos', value: 1, color: '#e2e8f0' }]} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value">
                                        {(statusData.length > 0 ? statusData : [{ color: '#e2e8f0' }]).map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {statusData.map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                                        <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }} />
                                        <span style={{ color: 'var(--text-secondary)' }}>{item.name}: <strong>{item.value}</strong></span>
                                    </div>
                                ))}
                                {statusData.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sin reportes aún</span>}
                            </div>
                        </div>
                    </ChartCard>

                    <ChartCard title="Reportes Recientes" delay={0.4}>
                        {recentReports.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {recentReports.map((r, i) => (
                                    <motion.div
                                        key={r._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.45 + i * 0.05 }}
                                        style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '10px 14px', borderRadius: 10, background: 'var(--bg-main)',
                                            border: '1px solid var(--border-light)',
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>{r.clientName}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <RiTimeLine size={12} /> {new Date(r.createdAt).toLocaleDateString('es-PE')}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600,
                                            background: r.readyForPickup ? '#dcfce7' : '#fef9c3',
                                            color: r.readyForPickup ? '#16a34a' : '#ca8a04',
                                        }}>
                                            {r.readyForPickup ? 'Listo' : 'En proceso'}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No hay reportes aún</p>
                        )}
                    </ChartCard>
                </div>
            </div>
        </TechLayout>
    );
};

export default TechDashboard;
