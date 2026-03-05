import Modal from 'react-modal';
import { motion } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';
import styles from '../styles/components/ConfirmDeleteModal.module.css';

const ConfirmDeleteModal = ({ isOpen, onRequestClose, onConfirm, reportId }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className={styles.modal}
            overlayClassName={styles.overlay}
            ariaHideApp={false}
        >
            <motion.div
                className={styles.modalContent}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
            >
                <h2>Confirmar Eliminación</h2>
                <p>¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.</p>
                <div className={styles.buttonContainer}>
                    <motion.button
                        onClick={onRequestClose}
                        className={styles.cancelButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Cancelar
                    </motion.button>
                    <motion.button
                        onClick={() => onConfirm(reportId)}
                        className={styles.confirmButton}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Eliminar
                    </motion.button>
                </div>
                <motion.button
                    onClick={onRequestClose}
                    className={styles.closeButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <RiCloseLine size={20} style={{ marginRight: '5px' }} />
                    Cerrar
                </motion.button>
            </motion.div>
        </Modal>
    );
};

export default ConfirmDeleteModal;