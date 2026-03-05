import { useEffect, useState } from 'react';
import { getUsers } from '../../services/userService';
import { getReports } from '../../services/reportService';
import { motion } from 'framer-motion';
import { RiUserLine, RiFileList2Line, RiToolsLine, RiCheckboxCircleLine, RiAlertLine } from 'react-icons/ri';
import AdminLayout from '../../components/AdminLayout';
import styles from '../../styles/pages/Statistics.module.css';

const Statistics = () => {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersData = await getUsers();
                const reportsData = await getReports();
                setUsers(usersData);
                setReports(reportsData);
            } catch (err) {
                setError('Error al obtener los datos');
            }
        };
        fetchData();
    }, []);

    const pendingParts = reports.filter(r => r.partsRequested && !r.partsOrdered).length;
    const readyForPickup = reports.filter(r => r.readyForPickup).length;
    const inoperative = reports.filter(r => r.status === 'Inoperative').length;

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, type: 'spring', stiffness: 100 }
        })
    };

    return (
        <AdminLayout>
            <motion.div
                className={styles.statistics}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1>Estadisticas</h1>
                {error && (
                    <motion.p
                        className={styles.error}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {error}
                    </motion.p>
                )}
                <div className={styles.statCards}>
                    <motion.div
                        className={styles.statCard}
                        custom={0}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h3>
                            <RiUserLine size={24} style={{ marginRight: '8px' }} />
                            Total Usuarios
                        </h3>
                        <p>{users.length}</p>
                    </motion.div>
                    <motion.div
                        className={styles.statCard}
                        custom={1}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h3>
                            <RiFileList2Line size={24} style={{ marginRight: '8px' }} />
                            Total Reportes
                        </h3>
                        <p>{reports.length}</p>
                    </motion.div>
                    <motion.div
                        className={styles.statCard}
                        custom={2}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h3>
                            <RiToolsLine size={24} style={{ marginRight: '8px' }} />
                            Partes Pendientes
                        </h3>
                        <p>{pendingParts}</p>
                    </motion.div>
                    <motion.div
                        className={styles.statCard}
                        custom={3}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h3>
                            <RiCheckboxCircleLine size={24} style={{ marginRight: '8px' }} />
                            Listos para Recoger
                        </h3>
                        <p>{readyForPickup}</p>
                    </motion.div>
                    <motion.div
                        className={styles.statCard}
                        custom={4}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                    >
                        <h3>
                            <RiAlertLine size={24} style={{ marginRight: '8px' }} />
                            Inoperativos
                        </h3>
                        <p>{inoperative}</p>
                    </motion.div>
                </div>
            </motion.div>
        </AdminLayout>
    );
};

export default Statistics;
