import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { createReport, updateReport } from '../services/reportService';
import styles from '../styles/components/ReportForm.module.css';
import { RiBuilding2Line, RiUserLine, RiUser3Line, RiComputerLine, RiSettings3Line, RiFileTextLine } from 'react-icons/ri';

const BRANDS = [
    'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Apple', 'Samsung', 'MSI', 'Toshiba', 'Sony',
    'LG', 'Huawei', 'Xiaomi', 'Microsoft', 'Razer', 'Alienware', 'Compaq',
    'IBM', 'Fujitsu', 'Panasonic', 'NEC', 'Vaio', 'Gigabyte', 'Intel', 'AMD',
    'Epson', 'Canon', 'Brother', 'Ricoh', 'Xerox', 'Kyocera', 'Lexmark',
    'Cisco', 'TP-Link', 'D-Link', 'Netgear', 'Linksys', 'Ubiquiti', 'MikroTik',
    'Western Digital', 'Seagate', 'Kingston', 'Corsair', 'SanDisk', 'Crucial',
    'Logitech', 'HyperX', 'SteelSeries', 'BenQ', 'ViewSonic', 'AOC',
    'APC', 'Tripp Lite', 'CyberPower', 'Forza',
    'Dahua', 'Hikvision', 'Honeywell', 'Bosch',
    'Zebra', 'Datalogic', 'Star Micronics',
];

const EQUIPMENT_TYPES = [
    'Laptop', 'Desktop', 'PC de Escritorio', 'All-in-One', 'Servidor',
    'Impresora', 'Impresora Multifuncional', 'Impresora Laser', 'Impresora Matricial',
    'Monitor', 'Proyector', 'Scanner',
    'Router', 'Switch', 'Access Point', 'Modem', 'Firewall',
    'UPS', 'Estabilizador', 'Regulador de Voltaje',
    'Disco Duro Externo', 'NAS',
    'Tablet', 'Celular', 'Smartphone',
    'Cámara de Seguridad', 'DVR', 'NVR',
    'Teclado', 'Mouse', 'Webcam', 'Audífonos',
    'POS', 'Lector de Código de Barras',
    'Otro',
];

function AutocompleteInput({ name, value, onChange, suggestions, placeholder, required, label }) {
    const [filtered, setFiltered] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const close = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDropdown(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        onChange(e);
        if (val.length > 0) {
            const f = suggestions.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 7);
            setFiltered(f);
            setShowDropdown(f.length > 0);
        } else setShowDropdown(false);
        setHighlightIndex(-1);
    };

    const handleSelect = (item) => { onChange({ target: { name, value: item } }); setShowDropdown(false); };

    const handleKeyDown = (e) => {
        if (!showDropdown) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex(p => Math.min(p + 1, filtered.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex(p => Math.max(p - 1, 0)); }
        else if (e.key === 'Enter' && highlightIndex >= 0) { e.preventDefault(); handleSelect(filtered[highlightIndex]); }
        else if (e.key === 'Escape') setShowDropdown(false);
    };

    return (
        <div className={styles.inputWrapper} ref={wrapperRef}>
            <label>{label}</label>
            <input name={name} value={value} placeholder={placeholder} onChange={handleInput}
                onFocus={() => { if (value) { const f = suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 7); setFiltered(f); setShowDropdown(f.length > 0); } }}
                onKeyDown={handleKeyDown} required={required} autoComplete="off" />
            <AnimatePresence>
                {showDropdown && (
                    <motion.ul className={styles.dropdown} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }}>
                        {filtered.map((item, i) => (
                            <li key={item} className={`${styles.dropdownItem} ${i === highlightIndex ? styles.dropdownItemActive : ''}`}
                                onClick={() => handleSelect(item)} onMouseEnter={() => setHighlightIndex(i)}>{item}</li>
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
        clientName: '', clientAddress: '', clientPhone: '', clientDNI: '',
        equipment: { type: '', brand: '', model: '', serial: '', patrimonialCode: '' },
        faultDescription: '', observations: '', maintenanceType: 'Corrective', status: 'Operative',
        agreedPrice: '', comments: '', receptionDate: '', deliveryDate: '',
        files: null, partsRequested: false, partsDetails: '', partsOrdered: false, readyForPickup: false,
    });

    useEffect(() => {
        if (isEditMode && initialData) {
            const dni = initialData.clientDNI || '';
            setClientType(dni.length === 11 ? 'empresa' : 'persona');
            setFormData(prev => ({
                ...prev, clientName: initialData.clientName || '', clientAddress: initialData.clientAddress || '',
                clientPhone: initialData.clientPhone || '', clientDNI: dni,
                equipment: { type: initialData.equipment?.type || '', brand: initialData.equipment?.brand || '', model: initialData.equipment?.model || '', serial: initialData.equipment?.serial || '', patrimonialCode: initialData.equipment?.patrimonialCode || '' },
                faultDescription: initialData.faultDescription || '', observations: initialData.observations || '',
                maintenanceType: initialData.maintenanceType || 'Corrective', status: initialData.status || 'Operative',
                agreedPrice: initialData.agreedPrice || '', comments: initialData.comments || '',
                receptionDate: initialData.receptionDate ? initialData.receptionDate.split('T')[0] : '',
                deliveryDate: initialData.deliveryDate ? initialData.deliveryDate.split('T')[0] : '',
                partsRequested: initialData.partsRequested || false, partsDetails: initialData.partsDetails || '',
                partsOrdered: initialData.partsOrdered || false, readyForPickup: initialData.readyForPickup || false,
            }));
        }
    }, [initialData, isEditMode]);

    const handleChange = (e) => { const { name, value, type, checked } = e.target; setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value })); };
    const handleEquipmentChange = (e) => { const { name, value } = e.target; setFormData(p => ({ ...p, equipment: { ...p.equipment, [name]: value } })); };
    const handleFileChange = (e) => { const file = e.target.files[0]; if (file && file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); e.target.value = ''; return; } setFormData(p => ({ ...p, files: file || null })); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const maxLen = clientType === 'empresa' ? 11 : 8;
        if (formData.clientDNI.length !== maxLen) { toast.error(`${clientType === 'empresa' ? 'RUC' : 'DNI'} debe tener ${maxLen} dígitos`); return; }
        setIsLoading(true);
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
            if (k === 'equipment') Object.entries(v).forEach(([ek, ev]) => fd.append(`equipment[${ek}]`, ev));
            else if (k !== 'files') fd.append(k, v);
            else if (v) fd.append('file', v);
        });
        try {
            isEditMode ? await updateReport(initialData._id, fd) : await createReport(fd);
            toast.success(`Reporte ${isEditMode ? 'actualizado' : 'creado'}`);
            refreshReports(); closeModal();
        } catch { toast.error('Error al guardar'); } finally { setIsLoading(false); }
    };

    return (
        <div className={styles.formWrapper}>
            <button className={styles.closeButton} onClick={closeModal}>✕</button>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formTitle}>
                    <RiFileTextLine size={20} />
                    {isEditMode ? 'Editar Reporte' : 'Nuevo Reporte'}
                </div>

                <div className={styles.columns}>
                    {/* LEFT COLUMN */}
                    <div className={styles.column}>
                        <div className={styles.section}>
                            <h3><RiUser3Line size={13} /> Cliente</h3>
                            <div className={styles.clientTypeToggle}>
                                <button type="button" className={`${styles.toggleBtn} ${clientType === 'persona' ? styles.toggleActive : ''}`}
                                    onClick={() => { setClientType('persona'); setFormData(p => ({ ...p, clientDNI: '' })); }}>
                                    <RiUserLine size={14} /> Persona
                                </button>
                                <button type="button" className={`${styles.toggleBtn} ${clientType === 'empresa' ? styles.toggleActive : ''}`}
                                    onClick={() => { setClientType('empresa'); setFormData(p => ({ ...p, clientDNI: '' })); }}>
                                    <RiBuilding2Line size={14} /> Empresa
                                </button>
                            </div>
                            <div className={styles.grid}>
                                <div className={styles.inputWrapper}>
                                    <label>{clientType === 'empresa' ? 'Razón Social *' : 'Nombre *'}</label>
                                    <input name="clientName" value={formData.clientName} placeholder={clientType === 'empresa' ? 'Razón Social de la empresa' : 'Nombre completo'} onChange={handleChange} required />
                                </div>
                                <div className={styles.gridRow}>
                                    <div className={styles.inputWrapper}>
                                        <label>{clientType === 'empresa' ? 'RUC *' : 'DNI *'}</label>
                                        <input name="clientDNI" value={formData.clientDNI}
                                            placeholder={clientType === 'empresa' ? '20XXXXXXXXX' : '12345678'}
                                            onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); const m = clientType === 'empresa' ? 11 : 8; if (v.length <= m) handleChange({ target: { name: 'clientDNI', value: v } }); }}
                                            required maxLength={clientType === 'empresa' ? 11 : 8} />
                                        <span className={styles.inputHint}>{formData.clientDNI.length}/{clientType === 'empresa' ? 11 : 8}</span>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Teléfono *</label>
                                        <input name="clientPhone" value={formData.clientPhone} placeholder="987 654 321" onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Dirección *</label>
                                    <input name="clientAddress" value={formData.clientAddress} placeholder="Dirección completa" onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3><RiComputerLine size={13} /> Equipo</h3>
                            <div className={styles.grid}>
                                <div className={styles.gridRow}>
                                    <AutocompleteInput name="type" value={formData.equipment.type} onChange={handleEquipmentChange} suggestions={EQUIPMENT_TYPES} placeholder="Buscar tipo..." required label="Tipo *" />
                                    <AutocompleteInput name="brand" value={formData.equipment.brand} onChange={handleEquipmentChange} suggestions={BRANDS} placeholder="Buscar marca..." required label="Marca *" />
                                </div>
                                <div className={styles.gridRow}>
                                    <div className={styles.inputWrapper}>
                                        <label>Modelo *</label>
                                        <input name="model" value={formData.equipment.model} placeholder="ProBook 450 G7" onChange={handleEquipmentChange} required />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>N° Serie</label>
                                        <input name="serial" value={formData.equipment.serial} placeholder="Opcional" onChange={handleEquipmentChange} />
                                    </div>
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Código Patrimonial</label>
                                    <input name="patrimonialCode" value={formData.equipment.patrimonialCode} placeholder="Opcional" onChange={handleEquipmentChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className={styles.column}>
                        <div className={styles.section}>
                            <h3><RiSettings3Line size={13} /> Servicio</h3>
                            <div className={styles.grid}>
                                <div className={styles.inputWrapper}>
                                    <label>Descripción de la Falla *</label>
                                    <textarea name="faultDescription" value={formData.faultDescription} placeholder="Describe el problema del equipo..." onChange={handleChange} required />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label>Observaciones</label>
                                    <textarea name="observations" value={formData.observations} placeholder="Notas adicionales..." onChange={handleChange} style={{ minHeight: 50 }} />
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
                                <div className={styles.gridRow}>
                                    <div className={styles.inputWrapper}>
                                        <label>Precio (S/) *</label>
                                        <input type="number" name="agreedPrice" value={formData.agreedPrice} placeholder="0.00" onChange={handleChange} required min="0" step="0.01" />
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <label>Comentarios</label>
                                        <input name="comments" value={formData.comments} placeholder="Opcional" onChange={handleChange} />
                                    </div>
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
                        </div>

                        {isEditMode && (
                            <div className={styles.section}>
                                <h3>Partes</h3>
                                <div className={styles.checkboxGroup}>
                                    <label className={styles.checkboxLabel}><input type="checkbox" name="partsRequested" checked={formData.partsRequested} onChange={handleChange} disabled={isTechnician} /> Necesita Partes</label>
                                    <label className={styles.checkboxLabel}><input type="checkbox" name="partsOrdered" checked={formData.partsOrdered} onChange={handleChange} disabled={isTechnician} /> Solicitadas</label>
                                </div>
                                <AnimatePresence>
                                    {formData.partsRequested && (
                                        <motion.div className={styles.inputWrapper} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                            <label>Detalle de Partes</label>
                                            <textarea name="partsDetails" value={formData.partsDetails} placeholder="Partes necesarias..." onChange={handleChange} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className={styles.section}>
                            <h3>Archivo</h3>
                            <div className={styles.inputWrapper}>
                                <label>Adjuntar (max 10MB)</label>
                                <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls" />
                                {formData.files && <span className={styles.fileName}>{formData.files.name}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button type="button" className={styles.cancelButton} onClick={closeModal}>Cancelar</button>
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Reporte'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReportForm;
