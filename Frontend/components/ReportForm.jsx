import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { createReport, updateReport } from '../services/reportService';
import styles from '../styles/components/ReportForm.module.css';
import { RiBuilding2Line, RiUserLine } from 'react-icons/ri';

const BRANDS = [
    'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Apple', 'Samsung', 'MSI', 'Toshiba', 'Sony',
    'LG', 'Huawei', 'Xiaomi', 'Microsoft', 'Razer', 'Alienware', 'Gateway', 'Compaq',
    'IBM', 'Fujitsu', 'Panasonic', 'NEC', 'Vaio', 'Gigabyte', 'Intel', 'AMD',
    'Epson', 'Canon', 'Brother', 'Ricoh', 'Xerox', 'Kyocera', 'Lexmark',
    'Cisco', 'TP-Link', 'D-Link', 'Netgear', 'Linksys', 'Ubiquiti', 'MikroTik',
    'Western Digital', 'Seagate', 'Kingston', 'Corsair', 'SanDisk', 'Crucial',
    'Logitech', 'HyperX', 'Razer', 'SteelSeries', 'BenQ', 'ViewSonic', 'AOC',
    'APC', 'Tripp Lite', 'CyberPower', 'Forza',
    'Dahua', 'Hikvision', 'Honeywell', 'Bosch',
    'Zebra', 'Datalogic', 'Honeywell', 'Star Micronics',
];

const EQUIPMENT_TYPES = [
    'Laptop', 'Desktop', 'PC de Escritorio', 'All-in-One', 'Servidor',
    'Impresora', 'Impresora Multifuncional', 'Impresora Laser', 'Impresora Matricial',
    'Monitor', 'Proyector', 'Scanner',
    'Router', 'Switch', 'Access Point', 'Modem', 'Firewall',
    'UPS', 'Estabilizador', 'Regulador de Voltaje',
    'Disco Duro Externo', 'NAS', 'Unidad de Backup',
    'Tablet', 'Celular', 'Smartphone',
    'Cámara de Seguridad', 'DVR', 'NVR',
    'Teclado', 'Mouse', 'Webcam', 'Audífonos',
    'POS', 'Lector de Código de Barras', 'Cajón de Dinero',
    'Otro',
];

function AutocompleteInput({ name, value, onChange, suggestions, placeholder, required, label }) {
    const [filtered, setFiltered] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        onChange(e);
        if (val.length > 0) {
            const f = suggestions.filter(s => s.toLowerCase().includes(val.toLowerCase()));
            setFiltered(f.slice(0, 8));
            setShowDropdown(f.length > 0);
        } else {
            setShowDropdown(false);
        }
        setHighlightIndex(-1);
    };

    const handleSelect = (item) => {
        onChange({ target: { name, value: item } });
        setShowDropdown(false);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightIndex(prev => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && highlightIndex >= 0) {
            e.preventDefault();
            handleSelect(filtered[highlightIndex]);
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    return (
        <div className={styles.inputWrapper} ref={wrapperRef}>
            <label>{label}</label>
            <input
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={handleInputChange}
                onFocus={() => {
                    if (value.length > 0) {
                        const f = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()));
                        setFiltered(f.slice(0, 8));
                        setShowDropdown(f.length > 0);
                    }
                }}
                onKeyDown={handleKeyDown}
                required={required}
                autoComplete="off"
            />
            <AnimatePresence>
                {showDropdown && (
                    <motion.ul
                        className={styles.dropdown}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {filtered.map((item, i) => (
                            <li
                                key={item}
                                className={`${styles.dropdownItem} ${i === highlightIndex ? styles.dropdownItemActive : ''}`}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setHighlightIndex(i)}
                            >
                                {item}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}

const ReportForm = ({ refreshReports, initialData = {}, isEditMode = false, closeModal }) => {
    const { isTechnician } = useAuthContext();
    const [isLoading, setIsLoading] = useState(false);
    const [clientType, setClientType] = useState('persona');

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

    useEffect(() => {
        if (isEditMode && initialData) {
            const dni = initialData.clientDNI || '';
            setClientType(dni.length === 11 ? 'empresa' : 'persona');
            setFormData((prev) => ({
                ...prev,
                clientName: initialData.clientName || '',
                clientAddress: initialData.clientAddress || '',
                clientPhone: initialData.clientPhone || '',
                clientDNI: dni,
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
            }));
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
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('El archivo no puede superar los 10MB');
                e.target.value = '';
                return;
            }
        }
        setFormData((prev) => ({ ...prev, files: file || null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (clientType === 'persona' && formData.clientDNI.length !== 8) {
            toast.error('El DNI debe tener 8 dígitos');
            return;
        }
        if (clientType === 'empresa' && formData.clientDNI.length !== 11) {
            toast.error('El RUC debe tener 11 dígitos');
            return;
        }

        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.formWrapper}>
            <motion.button
                className={styles.closeButton}
                onClick={closeModal}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
            >
                ✕
            </motion.button>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.columns}>
                    {/* Col 1: Cliente + Equipo */}
                    <div className={styles.column}>
                        <motion.section className={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <h3>Información del Cliente</h3>

                            {/* Toggle Persona / Empresa */}
                            <div className={styles.clientTypeToggle}>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${clientType === 'persona' ? styles.toggleActive : ''}`}
                                    onClick={() => { setClientType('persona'); setFormData(p => ({ ...p, clientDNI: '' })); }}
                                >
                                    <RiUserLine size={16} /> Persona
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${clientType === 'empresa' ? styles.toggleActive : ''}`}
                                    onClick={() => { setClientType('empresa'); setFormData(p => ({ ...p, clientDNI: '' })); }}
                                >
                                    <RiBuilding2Line size={16} /> Empresa
                                </button>
                            </div>

                            <div className={styles.grid}>
                                <div className={styles.inputWrapper}>
                                    <label>{clientType === 'empresa' ? 'Razón Social *' : 'Nombre del Cliente *'}</label>
                                    <input name="clientName" value={formData.clientName} placeholder={clientType === 'empresa' ? 'Razón Social' : 'Nombre completo'} onChange={handleChange} required />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Dirección *</label>
                                    <input name="clientAddress" value={formData.clientAddress} placeholder="Dirección" onChange={handleChange} required />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Teléfono *</label>
                                    <input name="clientPhone" value={formData.clientPhone} placeholder="987 654 321" onChange={handleChange} required />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>{clientType === 'empresa' ? 'RUC *' : 'DNI *'}</label>
                                    <input
                                        name="clientDNI"
                                        value={formData.clientDNI}
                                        placeholder={clientType === 'empresa' ? '20XXXXXXXXX' : '12345678'}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            const max = clientType === 'empresa' ? 11 : 8;
                                            if (val.length <= max) handleChange({ target: { name: 'clientDNI', value: val } });
                                        }}
                                        required
                                        maxLength={clientType === 'empresa' ? 11 : 8}
                                    />
                                    <span className={styles.inputHint}>
                                        {formData.clientDNI.length}/{clientType === 'empresa' ? 11 : 8} dígitos
                                    </span>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section className={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <h3>Información del Equipo</h3>
                            <div className={styles.grid}>
                                <AutocompleteInput
                                    name="type"
                                    value={formData.equipment.type}
                                    onChange={handleEquipmentChange}
                                    suggestions={EQUIPMENT_TYPES}
                                    placeholder="Escribe para buscar..."
                                    required
                                    label="Tipo de Equipo *"
                                />
                                <AutocompleteInput
                                    name="brand"
                                    value={formData.equipment.brand}
                                    onChange={handleEquipmentChange}
                                    suggestions={BRANDS}
                                    placeholder="Escribe para buscar..."
                                    required
                                    label="Marca *"
                                />
                                <div className={styles.inputWrapper}>
                                    <label>Modelo *</label>
                                    <input name="model" value={formData.equipment.model} placeholder="Ej: ProBook 450 G7" onChange={handleEquipmentChange} required />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>N° de Serie</label>
                                    <input name="serial" value={formData.equipment.serial} placeholder="Número de Serie" onChange={handleEquipmentChange} />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Código Patrimonial</label>
                                    <input name="patrimonialCode" value={formData.equipment.patrimonialCode} placeholder="Código Patrimonial" onChange={handleEquipmentChange} />
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Col 2: Servicio */}
                    <div className={styles.column}>
                        <motion.section className={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <h3>Detalles del Servicio</h3>
                            <div className={styles.grid}>
                                <div className={styles.inputWrapper}>
                                    <label>Descripción de la Falla *</label>
                                    <textarea name="faultDescription" value={formData.faultDescription} placeholder="Describe el problema..." onChange={handleChange} required />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Observaciones</label>
                                    <textarea name="observations" value={formData.observations} placeholder="Observaciones adicionales" onChange={handleChange} />
                                </div>
                                <div className={styles.gridRow}>
                                    <div className={styles.inputWrapper}>
                                        <label>Mantenimiento</label>
                                        <select name="maintenanceType" value={formData.maintenanceType} onChange={handleChange}>
                                            <option value="Corrective">Correctivo</option>
                                            <option value="Preventive">Preventivo</option>
                                        </select>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Estado</label>
                                        <select name="status" value={formData.status} onChange={handleChange}>
                                            <option value="Operative">Operativo</option>
                                            <option value="Inoperative">Inoperativo</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Precio Acordado (S/) *</label>
                                    <input type="number" name="agreedPrice" value={formData.agreedPrice} placeholder="0.00" onChange={handleChange} required min="0" step="0.01" />
                                </div>
                                <div className={styles.gridRow}>
                                    <div className={styles.inputWrapper}>
                                        <label>Fecha Recepción *</label>
                                        <input type="date" name="receptionDate" value={formData.receptionDate} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Fecha Entrega *</label>
                                        <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Col 3: Partes + Adicional */}
                    <div className={styles.column}>
                        {isEditMode && (
                            <motion.section className={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <h3>Solicitud de Partes</h3>
                                <div className={styles.checkboxGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" name="partsRequested" checked={formData.partsRequested} onChange={handleChange} disabled={isTechnician} />
                                        Necesita Partes
                                    </label>
                                    <label className={styles.checkboxLabel}>
                                        <input type="checkbox" name="partsOrdered" checked={formData.partsOrdered} onChange={handleChange} disabled={isTechnician} />
                                        Partes Solicitadas
                                    </label>
                                </div>
                                <AnimatePresence>
                                    {formData.partsRequested && (
                                        <motion.div className={styles.inputWrapper} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <label>Detalles de las Partes</label>
                                            <textarea name="partsDetails" value={formData.partsDetails} placeholder="Detalle de partes necesarias..." onChange={handleChange} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.section>
                        )}

                        <motion.section className={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isEditMode ? 0.5 : 0.4 }}>
                            <h3>Información Adicional</h3>
                            <div className={styles.grid}>
                                <div className={styles.inputWrapper}>
                                    <label>Comentarios</label>
                                    <textarea name="comments" value={formData.comments} placeholder="Comentarios adicionales..." onChange={handleChange} />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Adjuntar Archivo (max 10MB)</label>
                                    <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls" />
                                    {formData.files && <span className={styles.fileName}>{formData.files.name}</span>}
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <motion.button type="button" className={styles.cancelButton} onClick={closeModal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        Cancelar
                    </motion.button>
                    <motion.button type="submit" className={styles.submitButton} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={isLoading}>
                        {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar Reporte' : 'Crear Reporte'}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default ReportForm;
