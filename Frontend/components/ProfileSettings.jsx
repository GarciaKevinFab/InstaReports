import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { RiUser3Line, RiUploadCloud2Line, RiDeleteBin6Line, RiSaveLine, RiPenNibLine } from 'react-icons/ri';
import { getMyProfile, updateMyProfile, removeMySignature } from '../services/userService';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '');

const buildUrl = (relative) => {
    if (!relative) return '';
    if (relative.startsWith('http')) return relative;
    return `${API_BASE}/${relative.replace(/^\/+/, '')}`;
};

const ProfileSettings = () => {
    const [profile, setProfile] = useState({ name: '', email: '', position: '', signatureUrl: '' });
    const [signaturePreview, setSignaturePreview] = useState(null);
    const [signatureFile, setSignatureFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        getMyProfile()
            .then(setProfile)
            .catch((err) => toast.error(err.message));
    }, []);

    const handleSignatureSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen no debe superar los 5MB');
            return;
        }
        setSignatureFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setSignaturePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemoveSignature = async () => {
        if (signaturePreview) {
            setSignaturePreview(null);
            setSignatureFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        try {
            const updated = await removeMySignature();
            setProfile(updated);
            toast.success('Firma eliminada');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', profile.name || '');
            formData.append('position', profile.position || '');
            if (signatureFile) formData.append('signature', signatureFile);
            const updated = await updateMyProfile(formData);
            setProfile(updated);
            setSignatureFile(null);
            setSignaturePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            toast.success('Perfil actualizado');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const sigToShow = signaturePreview || (profile.signatureUrl ? buildUrl(profile.signatureUrl) : null);

    return (
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <RiUser3Line size={24} color="#E30613" /> Mi Perfil
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginBottom: 0 }}>
                    Actualiza tus datos y la firma que aparecerá en los reportes PDF.
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Datos básicos */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: '#fff', borderRadius: 14, border: '1px solid #eef0f4',
                        padding: 22, boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                    }}
                >
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E30613', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Información Personal
                    </h3>

                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Nombre completo</label>
                        <input
                            value={profile.name || ''}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Email</label>
                        <input value={profile.email || ''} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8' }} />
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Cargo / Posición</label>
                        <input
                            value={profile.position || ''}
                            placeholder="Ej. Técnico de Soporte Senior"
                            onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: 4 }}>
                        <label style={labelStyle}>Rol</label>
                        <div style={{
                            padding: '7px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                            background: profile.role === 'admin' ? '#fef2f2' : '#eff6ff',
                            color: profile.role === 'admin' ? '#dc2626' : '#2563eb', display: 'inline-block',
                        }}>
                            {profile.role === 'admin' ? 'Administrador' : 'Técnico'}
                        </div>
                    </div>
                </motion.div>

                {/* Firma */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: '#fff', borderRadius: 14, border: '1px solid #eef0f4',
                        padding: 22, boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                    }}
                >
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E30613', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RiPenNibLine size={14} /> Firma Digital
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 14px' }}>
                        Sube un PNG con fondo transparente. Aparecerá en los PDFs de tus reportes.
                    </p>

                    <div style={{
                        background: '#f8fafc',
                        border: '2px dashed #cbd5e1',
                        borderRadius: 12,
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        backgroundImage: 'linear-gradient(45deg, #f1f5f9 25%, transparent 25%, transparent 75%, #f1f5f9 75%), linear-gradient(45deg, #f1f5f9 25%, transparent 25%, transparent 75%, #f1f5f9 75%)',
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 8px 8px',
                    }}>
                        {sigToShow ? (
                            <img src={sigToShow} alt="firma" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin firma cargada</span>
                        )}
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleSignatureSelect} style={{ display: 'none' }} />

                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <button onClick={() => fileInputRef.current?.click()} style={uploadBtnStyle}>
                            <RiUploadCloud2Line size={16} /> {sigToShow ? 'Cambiar' : 'Subir firma'}
                        </button>
                        {sigToShow && (
                            <button onClick={handleRemoveSignature} style={dangerBtnStyle}>
                                <RiDeleteBin6Line size={16} /> Quitar
                            </button>
                        )}
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

const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'block',
    marginBottom: 5,
};

const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: '0.88rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    color: '#1e293b',
};

const uploadBtnStyle = {
    flex: 1,
    padding: '9px 14px',
    background: '#003087',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontFamily: 'inherit',
};

const dangerBtnStyle = {
    padding: '9px 14px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1.5px solid #fecaca',
    borderRadius: 8,
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'inherit',
};

const saveBtnStyle = {
    padding: '11px 24px',
    background: 'linear-gradient(135deg, #E30613 0%, #C20511 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'inherit',
    boxShadow: '0 4px 12px rgba(227,6,19,0.3)',
};

export default ProfileSettings;
