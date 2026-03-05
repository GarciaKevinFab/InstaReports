// components/ReportForm.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { createReport, updateReport } from '../services/reportService';
import styles from '../styles/components/ReportForm.module.css';

const ReportForm = ({ refreshReports, initialData = {}, isEditMode = false, closeModal }) => {
    const { isTechnician } = useAuthContext();
    const [isLoading, setIsLoading] = useState(false); // Estado de carga para el botón de enviar

    // Inicializar formData con valores por defecto y combinar con initialData si está en modo edición
    const [formData, setFormData] = useState({
        clientName: '',
        clientAddress: '',
        clientPhone: '',
        clientDNI: '',
        equipment: { type: '', brand: '', model: '', serial: '', patrimonialCode: '' },
        faultDescription: '',
        observations: '',
        maintenanceType: 'Corrective',
        status: 'Operative',
        agreedPrice: '',
        comments: '',
        receptionDate: '',
        deliveryDate: '',
        files: null,
        partsRequested: false,
        partsDetails: '',
        partsOrdered: false,
        readyForPickup: false,
    });

    // Rellenar formData con initialData cuando está en modo edición
    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                ...formData,
                clientName: initialData.clientName || '',
                clientAddress: initialData.clientAddress || '',
                clientPhone: initialData.clientPhone || '',
                clientDNI: initialData.clientDNI || '',
                equipment: {
                    type: initialData.equipment?.type || '',
                    brand: initialData.equipment?.brand || '',
                    model: initialData.equipment?.model || '',
                    serial: initialData.equipment?.serial || '',
                    patrimonialCode: initialData.equipment?.patrimonialCode || '',
                },
                faultDescription: initialData.faultDescription || '',
                observations: initialData.observations || '',
                maintenanceType: initialData.maintenanceType || 'Corrective',
                status: initialData.status || 'Operative',
                agreedPrice: initialData.agreedPrice || '',
                comments: initialData.comments || '',
                receptionDate: initialData.receptionDate ? initialData.receptionDate.split('T')[0] : '',
                deliveryDate: initialData.deliveryDate ? initialData.deliveryDate.split('T')[0] : '',
                partsRequested: initialData.partsRequested || false,
                partsDetails: initialData.partsDetails || '',
                partsOrdered: initialData.partsOrdered || false,
                readyForPickup: initialData.readyForPickup || false,
            });
        }
    }, [initialData, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleEquipmentChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            equipment: { ...prev.equipment, [name]: value },
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, files: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Activar estado de carga
        const dataToSubmit = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'equipment') {
                Object.entries(value).forEach(([eqKey, eqValue]) =>
                    dataToSubmit.append(`equipment[${eqKey}]`, eqValue)
                );
            } else if (key !== 'files') {
                dataToSubmit.append(key, value);
            } else if (value) {
                dataToSubmit.append('file', value);
            }
        });

        try {
            isEditMode
                ? await updateReport(initialData._id, dataToSubmit)
                : await createReport(dataToSubmit);
            toast.success(`Reporte ${isEditMode ? 'actualizado' : 'creado'} correctamente.`);
            refreshReports();
            closeModal();
        } catch (error) {
            toast.error('Error al guardar el reporte.');
        } finally {
            setIsLoading(false); // Desactivar estado de carga
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, type: 'spring', stiffness: 100 }
        })
    };

    const inputVariants = {
        hover: { scale: 1.02, transition: { type: 'spring', stiffness: 300 } },
        focus: { borderColor: '#E30613', boxShadow: '0 0 8px rgba(227, 6, 19, 0.3)' }
    };

    const buttonVariants = {
        hover: { scale: 1.05, backgroundColor: '#C20511' },
        tap: { scale: 0.95 }
    };

    return (
        <div className={styles.formWrapper}>
            {/* Botón de Cerrar */}
            <motion.button
                className={styles.closeButton}
                onClick={closeModal}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Cerrar modal"
            >
                ✕
            </motion.button>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.columns}>
                    {/* Columna 1: Información del Cliente e Información del Equipo */}
                    <div className={styles.column}>
                        {/* Información del Cliente */}
                        <motion.section
                            className={styles.section}
                            custom={0}
                            variants={sectionVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3>Información del Cliente</h3>
                            <div className={styles.grid}>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Nombre del Cliente *</label>
                                    <input
                                        name="clientName"
                                        value={formData.clientName}
                                        placeholder="Nombre del Cliente"
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Dirección *</label>
                                    <input
                                        name="clientAddress"
                                        value={formData.clientAddress}
                                        placeholder="Dirección"
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Teléfono *</label>
                                    <input
                                        name="clientPhone"
                                        value={formData.clientPhone}
                                        placeholder="Teléfono"
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>DNI *</label>
                                    <input
                                        name="clientDNI"
                                        value={formData.clientDNI}
                                        placeholder="DNI"
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                            </div>
                        </motion.section>

                        {/* Información del Equipo */}
                        <motion.section
                            className={styles.section}
                            custom={1}
                            variants={sectionVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3>Información del Equipo</h3>
                            <div className={styles.grid}>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Tipo de Equipo *</label>
                                    <input
                                        name="type"
                                        value={formData.equipment.type}
                                        placeholder="Tipo de Equipo"
                                        onChange={handleEquipmentChange}
                                        required
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Marca *</label>
                                    <input
                                        name="brand"
                                        value={formData.equipment.brand}
                                        placeholder="Marca"
                                        onChange={handleEquipmentChange}
                                        required
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Modelo *</label>
                                    <input
                                        name="model"
                                        value={formData.equipment.model}
                                        placeholder="Modelo"
                                        onChange={handleEquipmentChange}
                                        required
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Número de Serie</label>
                                    <input
                                        name="serial"
                                        value={formData.equipment.serial}
                                        placeholder="Número de Serie"
                                        onChange={handleEquipmentChange}
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Código Patrimonial</label>
                                    <input
                                        name="patrimonialCode"
                                        value={formData.equipment.patrimonialCode}
                                        placeholder="Código Patrimonial"
                                        onChange={handleEquipmentChange}
                                    />
                                </motion.div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Columna 2: Detalles del Servicio */}
                    <div className={styles.column}>
                        <motion.section
                            className={styles.section}
                            custom={2}
                            variants={sectionVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3>Detalles del Servicio</h3>
                            <div className={styles.grid}>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Descripción de la Falla *</label>
                                    <textarea
                                        name="faultDescription"
                                        value={formData.faultDescription}
                                        placeholder="Descripción de la Falla"
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Observaciones</label>
                                    <textarea
                                        name="observations"
                                        value={formData.observations}
                                        placeholder="Observaciones"
                                        onChange={handleChange}
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Tipo de Mantenimiento</label>
                                    <select
                                        name="maintenanceType"
                                        value={formData.maintenanceType}
                                        onChange={handleChange}
                                    >
                                        <option value="Corrective">Correctivo</option>
                                        <option value="Preventive">Preventivo</option>
                                    </select>
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Estado</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="Operative">Operativo</option>
                                        <option value="Inoperative">Inoperativo</option>
                                    </select>
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Precio Acordado *</label>
                                    <input
                                        type="number"
                                        name="agreedPrice"
                                        value={formData.agreedPrice}
                                        placeholder="Precio Acordado"
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Fecha de Recepción *</label>
                                    <input
                                        type="date"
                                        name="receptionDate"
                                        value={formData.receptionDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Fecha de Entrega *</label>
                                    <input
                                        type="date"
                                        name="deliveryDate"
                                        value={formData.deliveryDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </motion.div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Columna 3: Solicitud de Partes e Información Adicional */}
                    <div className={styles.column}>
                        {/* Solicitud de Partes (solo visible en modo edición) */}
                        {isEditMode && (
                            <motion.section
                                className={styles.section}
                                custom={3}
                                variants={sectionVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <h3>Solicitud de Partes</h3>
                                <div className={styles.checkboxGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="partsRequested"
                                            checked={formData.partsRequested}
                                            onChange={handleChange}
                                            disabled={isTechnician} // Los técnicos no pueden cambiar esto
                                        />
                                        Necesita Partes
                                    </label>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            name="partsOrdered"
                                            checked={formData.partsOrdered}
                                            onChange={handleChange}
                                            disabled={isTechnician} // Los técnicos no pueden cambiar esto
                                        />
                                        Partes Solicitadas
                                    </label>
                                </div>
                                <AnimatePresence>
                                    {formData.partsRequested && (
                                        <motion.div
                                            className={styles.inputWrapper}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <label>Detalles de las Partes</label>
                                            <textarea
                                                name="partsDetails"
                                                value={formData.partsDetails}
                                                placeholder="Detalles de las Partes"
                                                onChange={handleChange}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.section>
                        )}

                        {/* Información Adicional */}
                        <motion.section
                            className={styles.section}
                            custom={isEditMode ? 4 : 3}
                            variants={sectionVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h3>Información Adicional</h3>
                            <div className={styles.grid}>
                                <motion.div className={styles.inputWrapper} whileHover="hover" whileFocus="focus" variants={inputVariants}>
                                    <label>Adjuntar Archivo</label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                    />
                                    {formData.files && <span className={styles.fileName}>{formData.files.name}</span>}
                                </motion.div>
                            </div>
                        </motion.section>
                    </div>
                </div>

                {/* Botones */}
                <div className={styles.buttonGroup}>
                    <motion.button
                        type="submit"
                        className={styles.submitButton}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default ReportForm;