import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { getReports, deleteReport, createReport, updateReport } from '../services/reportService';
import ReportForm from './ReportForm';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import TextareaAutosize from 'react-textarea-autosize';
import {
    RiEditLine,
    RiDeleteBin6Line,
    RiCheckboxCircleLine,
    RiCloseCircleLine,
    RiCloseLine,
    RiAddCircleLine,
    RiDownloadLine,
    RiFileList3Line,
    RiSaveLine,
} from 'react-icons/ri';
import styles from '../styles/pages/Reports.module.css';
import generateReportPDF from '../utils/generateReportPDF';
import { useAuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

// Component for editing "Parts Details" with actions
function EditablePartsDetails({ initialValue, onSave, isTechnician }) {
    const [value, setValue] = useState(initialValue);

    const handleCancel = () => {
        setValue(initialValue);
    };

    const handleSave = () => {
        if (!value.trim()) {
            toast.error('Por favor, ingresa los detalles de las partes');
            return;
        }
        onSave(value);
    };

    return (
        <div className={styles.textareaWrapper}>
            <TextareaAutosize
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ingresa las partes necesarias"
                className={styles.partsInput}
                minRows={2}
                style={{ width: '100%' }}
            />
            <div className={styles.textareaActions}>
                <RiCheckboxCircleLine
                    size={20}
                    onClick={handleSave}
                    className={styles.saveIcon}
                    title="Guardar detalles"
                />
                <RiCloseLine
                    size={20}
                    onClick={handleCancel}
                    className={styles.cancelIcon}
                    title="Cancelar"
                />
            </div>
        </div>
    );
}

const Reports = () => {
    const { isTechnician } = useAuthContext();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingReport, setEditingReport] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);

    // Fetch reports on component mount
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getReports();
                setReports(data);
            } catch (err) {
                toast.error(err.message || 'Error al obtener los reportes');
                console.error('Error en fetchReports:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteReport(id);
            setReports(reports.filter((report) => report._id !== id));
            toast.success('Reporte eliminado correctamente.');
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error(err.message || 'Error al eliminar el reporte');
            console.error('Error en handleDelete:', err);
        }
    };

    const openDeleteModal = (id) => {
        setReportToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setReportToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const refreshReports = async () => {
        try {
            const data = await getReports();
            setReports(data);
            toast.success('Reportes actualizados correctamente');
        } catch (err) {
            toast.error(err.message || 'Error al refrescar los reportes');
            console.error('Error en refreshReports:', err);
        }
    };

    const toggleReadyForPickup = async (id, currentState) => {
        try {
            const updatedReport = await updateReport(id, { readyForPickup: !currentState });
            setReports(reports.map(report =>
                report._id === id ? { ...report, readyForPickup: updatedReport.readyForPickup } : report
            ));
            toast.success(`Reporte marcado como ${updatedReport.readyForPickup ? 'listo' : 'no listo'} para recoger.`);
        } catch (err) {
            toast.error(err.message || 'Error al actualizar el reporte');
            console.error('Error en toggleReadyForPickup:', err);
        }
    };

    const toggleNeedsParts = async (id, currentState) => {
        try {
            const updatedReport = await updateReport(id, { partsRequested: !currentState });
            setReports(reports.map(report =>
                report._id === id ? { ...report, partsRequested: updatedReport.partsRequested } : report
            ));
            toast.success(`Reporte ${updatedReport.partsRequested ? 'marcado como necesita partes' : 'desmarcado de necesitar partes'}.`);
        } catch (err) {
            toast.error(err.message || 'Error al actualizar el reporte');
            console.error('Error en toggleNeedsParts:', err);
        }
    };

    const savePartsDetails = async (id, details) => {
        try {
            const updatedReport = await updateReport(id, { partsDetails: details });
            setReports(reports.map(report =>
                report._id === id ? { ...report, partsDetails: updatedReport.partsDetails } : report
            ));
            toast.success('Detalles de las partes guardados correctamente.');
        } catch (err) {
            toast.error(err.message || 'Error al actualizar el reporte');
            console.error('Error en savePartsDetails:', err);
        }
    };

    const togglePartsOrdered = async (id, currentState) => {
        const report = reports.find(r => r._id === id);
        if (!report.partsRequested && !currentState) {
            toast.error('No puedes marcar "Partes Solicitadas" si no has marcado "Necesita Partes".');
            return;
        }
        try {
            const updatedReport = await updateReport(id, { partsOrdered: !currentState });
            setReports(reports.map(report =>
                report._id === id ? { ...report, partsOrdered: updatedReport.partsOrdered } : report
            ));
            toast.success(`Partes ${updatedReport.partsOrdered ? 'marcadas como solicitadas' : 'desmarcadas como solicitadas'}.`);
        } catch (err) {
            toast.error(err.message || 'Error al actualizar el reporte');
            console.error('Error en togglePartsOrdered:', err);
        }
    };

    // Animation variants for modals and table rows
    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <div className={styles.reportsContainer}>
            <h2 className={styles.header}>
                <RiFileList3Line size={28} style={{ marginRight: '8px' }} /> Reportes
            </h2>
            <p className={styles.description}>
                Gestiona y visualiza los reportes de equipos, incluyendo su estado, partes necesarias y disponibilidad.
            </p>
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

            {/* Allow all users (admins and technicians) to create reports */}
            <motion.button
                onClick={() => setIsCreateModalOpen(true)}
                className={styles.createButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <RiAddCircleLine size={20} style={{ marginRight: '8px' }} />
                Crear Reporte
            </motion.button>

            {loading ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '40px', color: '#999' }}
                >
                    <p>Cargando reportes...</p>
                </motion.div>
            ) : reports.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', padding: '40px', color: '#999' }}
                >
                    <RiFileList3Line size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <p>No hay reportes todavia. Crea el primero usando el boton de arriba.</p>
                </motion.div>
            ) : (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Nombre del Cliente</th>
                        <th>Equipo</th>
                        <th>Estado</th>
                        <th>Necesita Partes</th>
                        <th>Detalles de Partes</th>
                        <th>Partes Solicitadas</th>
                        <th>Listo para Recoger</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {reports.map((report) => (
                            <motion.tr
                                key={report._id}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={rowVariants}
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td>{report.clientName}</td>
                                <td>
                                    {report.equipment
                                        ? `${report.equipment.type} - ${report.equipment.brand} (${report.equipment.model})`
                                        : 'N/A'}
                                </td>
                                <td>{report.status === 'Operative' ? 'Operativo' : 'Inoperativo'}</td>

                                {/* Switch for "Needs Parts" - Technicians and admins can modify */}
                                <td>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={report.partsRequested}
                                            onChange={() => toggleNeedsParts(report._id, report.partsRequested)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </td>

                                {/* Editable Parts Details - Technicians and admins can edit */}
                                <td>
                                    {report.partsRequested ? (
                                        <EditablePartsDetails
                                            initialValue={report.partsDetails || ''}
                                            onSave={(newValue) => savePartsDetails(report._id, newValue)}
                                            isTechnician={isTechnician}
                                        />
                                    ) : (
                                        "N/A"
                                    )}
                                </td>

                                {/* Show "Parts Ordered" - Technicians can only view, admins can modify */}
                                <td>
                                    {isTechnician ? (
                                        report.partsOrdered ? 'Sí' : 'No'
                                    ) : (
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={report.partsOrdered}
                                                onChange={() => togglePartsOrdered(report._id, report.partsOrdered)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    )}
                                </td>

                                {/* Ready for Pickup */}
                                <td>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={report.readyForPickup}
                                            onChange={() => toggleReadyForPickup(report._id, report.readyForPickup)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </td>

                                <td>
                                    {/* Download button for all users (admins and technicians) */}
                                    <motion.button
                                        onClick={() => generateReportPDF(report)}
                                        className={`${styles.actionButton} ${styles.downloadButton}`}
                                        whileHover={{ scale: 1.1 }}
                                        title="Descargar PDF"
                                    >
                                        <RiDownloadLine size={20} />
                                    </motion.button>

                                    {/* Only admins can edit or delete */}
                                    {!isTechnician && (
                                        <>
                                            <motion.button
                                                onClick={() => {
                                                    setEditingReport(report);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className={styles.actionButton}
                                                whileHover={{ scale: 1.1 }}
                                                title="Editar reporte"
                                            >
                                                <RiEditLine size={20} />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => openDeleteModal(report._id)}
                                                className={styles.actionButton}
                                                whileHover={{ scale: 1.1 }}
                                                title="Eliminar reporte"
                                            >
                                                <RiDeleteBin6Line size={20} />
                                            </motion.button>
                                        </>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
            </div>
            )}

            {/* Modal for creating a report - Available to all */}
            <Modal
                isOpen={isCreateModalOpen}
                onRequestClose={() => setIsCreateModalOpen(false)}
                className={styles.modal}
                overlayClassName={styles.overlay}
                ariaHideApp={false}
            >
                <motion.div
                    className={styles.modalContent}
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    <ReportForm
                        refreshReports={refreshReports}
                        closeModal={() => setIsCreateModalOpen(false)}
                    />
                </motion.div>
            </Modal>

            {/* Modal for editing a report - Only admins */}
            {!isTechnician && (
                <Modal
                    isOpen={isEditModalOpen}
                    onRequestClose={() => setIsEditModalOpen(false)}
                    className={styles.modal}
                    overlayClassName={styles.overlay}
                    ariaHideApp={false}
                >
                    <motion.div
                        className={styles.modalContent}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                    >
                        {editingReport && (
                            <ReportForm
                                refreshReports={refreshReports}
                                initialData={editingReport}
                                isEditMode
                                closeModal={() => setIsEditModalOpen(false)}
                            />
                        )}
                    </motion.div>
                </Modal>
            )}

            {/* Modal for confirming deletion */}
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onRequestClose={closeDeleteModal}
                onConfirm={handleDelete}
                reportId={reportToDelete}
            />
        </div>
    );
};

export default Reports;