import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { RiBuilding2Line, RiUploadCloud2Line, RiDeleteBin6Line, RiSaveLine, RiImageLine } from 'react-icons/ri';
import { getSettings, updateSettings, removeLogo } from '../services/settingsService';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '');

const buildUrl = (relative) => {
    if (!relative) return '';
    if (relative.startsWith('http')) return relative;
    return `${API_BASE}/${relative.replace(/^\/+/, '')}`;
};

const CompanySettings = () => {
    const [settings, setSettings] = useState({
        companyName: '', tagline: '', ruc: '', address: '', phone: '', email: '',
        website: '', logoUrl: '', primaryColor: '#003087', accentColor: '#E30613', footerNote: '',
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        getSettings()
            .then((data) => setSettings({ ...data }))
            .catch((err) => toast.error(err.message));
    }, []);

    const handleLogoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no debe superar los 5MB'); return; }
        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = async () => {
        if (logoPreview) {
            setLogoPreview(null);
            setLogoFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        try {
            const updated = await removeLogo();
            setSettings({ ...updated });
            toast.success('Logo eliminado');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            ['companyName', 'tagline', 'ruc', 'address', 'phone', 'email', 'website', 'primaryColor', 'accentColor', 'footerNote'].forEach((k) => {
                formData.append(k, settings[k] || '');
            });
            if (logoFile) formData.append('logo', logoFile);
            const updated = await updateSettings(formData);
            setSettings({ ...updated });
            setLogoFile(null);
            setLogoPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            toast.success('Configuración guardada');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const logoToShow = logoPreview || (settings.logoUrl ? buildUrl(settings.logoUrl) : null);

    const onChange = (key, val) => setSettings((p) => ({ ...p, [key]: val }));

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <RiBuilding2Line size={24} color="#E30613" /> Configuración de Empresa
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginBottom: 0 }}>
                    Logo, información y colores que aparecerán en los PDFs y en toda la aplicación.
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
                {/* Logo */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={cardStyle}>
                    <h3 style={sectionTitleStyle}>
                        <RiImageLine size={14} /> Logo de la Empresa
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 14px' }}>
                        Recomendado: PNG con fondo transparente, 400x400 px o más.
                    </p>

                    <div style={{
                        background: '#f8fafc',
                        border: '2px dashed #cbd5e1',
                        borderRadius: 12,
                        height: 200,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundImage: 'linear-gradient(45deg, #f1f5f9 25%, transparent 25%, transparent 75%, #f1f5f9 75%), linear-gradient(45deg, #f1f5f9 25%, transparent 25%, transparent 75%, #f1f5f9 75%)',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 8px 8px',
                    }}>
                        {logoToShow ? (
                            <img src={logoToShow} alt="logo" style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin logo cargado</span>
                        )}
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleLogoSelect} style={{ display: 'none' }} />

                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <button onClick={() => fileInputRef.current?.click()} style={uploadBtnStyle}>
                            <RiUploadCloud2Line size={16} /> {logoToShow ? 'Cambiar' : 'Subir logo'}
                        </button>
                        {logoToShow && (
                            <button onClick={handleRemoveLogo} style={dangerBtnStyle}>
                                <RiDeleteBin6Line size={16} /> Quitar
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Datos */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={cardStyle}>
                    <h3 style={sectionTitleStyle}>Datos de la Empresa</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Nombre de la Empresa" value={settings.companyName} onChange={(v) => onChange('companyName', v)} placeholder="Soluciones Informaticas" full />
                        <Field label="Slogan / Tagline" value={settings.tagline} onChange={(v) => onChange('tagline', v)} placeholder="InstaReports" />
                        <Field label="RUC" value={settings.ruc} onChange={(v) => onChange('ruc', v)} placeholder="20XXXXXXXXX" />
                        <Field label="Teléfono" value={settings.phone} onChange={(v) => onChange('phone', v)} placeholder="+51 999 999 999" />
                        <Field label="Email" value={settings.email} onChange={(v) => onChange('email', v)} placeholder="contacto@empresa.com" />
                        <Field label="Dirección" value={settings.address} onChange={(v) => onChange('address', v)} placeholder="Av. ..." full />
                        <Field label="Sitio Web" value={settings.website} onChange={(v) => onChange('website', v)} placeholder="https://..." full />

                        <div>
                            <label style={labelStyle}>Color Primario</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="color" value={settings.primaryColor || '#003087'} onChange={(e) => onChange('primaryColor', e.target.value)} style={{ width: 44, height: 38, border: '1.5px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                                <input value={settings.primaryColor || ''} onChange={(e) => onChange('primaryColor', e.target.value)} style={inputStyle} />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Color de Acento</label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <input type="color" value={settings.accentColor || '#E30613'} onChange={(e) => onChange('accentColor', e.target.value)} style={{ width: 44, height: 38, border: '1.5px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                                <input value={settings.accentColor || ''} onChange={(e) => onChange('accentColor', e.target.value)} style={inputStyle} />
                            </div>
                        </div>

                        <Field label="Nota de Pie de Página (PDF)" value={settings.footerNote} onChange={(v) => onChange('footerNote', v)} placeholder="Texto opcional al pie de los reportes" full />
                    </div>
                </motion.div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button onClick={handleSave} disabled={saving} style={saveBtnStyle}>
                    <RiSaveLine size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </div>
    );
};

const Field = ({ label, value, onChange, placeholder, full }) => (
    <div style={{ gridColumn: full ? '1 / -1' : 'auto' }}>
        <label style={labelStyle}>{label}</label>
        <input value={value || ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
);

const cardStyle = {
    background: '#fff', borderRadius: 14, border: '1px solid #eef0f4',
    padding: 22, boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
};

const sectionTitleStyle = {
    fontSize: '0.75rem', fontWeight: 700, color: '#E30613',
    marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'flex', alignItems: 'center', gap: 6,
};

const labelStyle = {
    fontSize: '0.7rem', fontWeight: 600, color: '#475569',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: 5,
};

const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: '0.85rem', fontFamily: 'inherit',
    boxSizing: 'border-box', color: '#1e293b',
};

const uploadBtnStyle = {
    flex: 1, padding: '9px 14px', background: '#003087', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', gap: 6, fontFamily: 'inherit',
};

const dangerBtnStyle = {
    padding: '9px 14px', background: '#fef2f2', color: '#dc2626',
    border: '1.5px solid #fecaca', borderRadius: 8, fontSize: '0.82rem',
    fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: 6, fontFamily: 'inherit',
};

const saveBtnStyle = {
    padding: '11px 24px',
    background: 'linear-gradient(135deg, #E30613 0%, #C20511 100%)',
    color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.88rem',
    fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: 8, fontFamily: 'inherit',
    boxShadow: '0 4px 12px rgba(227,6,19,0.3)',
};

export default CompanySettings;
