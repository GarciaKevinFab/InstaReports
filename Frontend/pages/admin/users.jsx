import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers, deleteUser, createUser, updateUser } from '../../services/userService';
import AdminLayout from '../../components/AdminLayout';
import { RiAddCircleLine, RiEditLine, RiDeleteBin6Line, RiSaveLine, RiCloseLine, RiUserAddLine, RiUserSettingsLine, RiShieldUserLine, RiToolsLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

const modalStyles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    content: { position: 'relative', inset: 'auto', border: 'none', background: 'white', borderRadius: 16, padding: 0, maxWidth: 480, width: '92%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'technician', password: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try { setUsers(await getUsers()); } catch (err) { toast.error('Error al obtener los usuarios'); }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id, name) => {
        if (!confirm(`¿Eliminar al usuario "${name}"?`)) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
            toast.success('Usuario eliminado');
        } catch (err) { toast.error('Error al eliminar'); }
    };

    const handleCreate = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) { toast.error('Completa todos los campos'); return; }
        try {
            const user = await createUser(newUser);
            setUsers([...users, user]);
            setNewUser({ name: '', email: '', role: 'technician', password: '' });
            setIsCreateModalOpen(false);
            toast.success('Usuario creado');
        } catch (err) { toast.error('Error al crear usuario'); }
    };

    const handleUpdate = async () => {
        if (!editingUser.name || !editingUser.email) { toast.error('Completa todos los campos'); return; }
        try {
            const updated = await updateUser(editingUser._id, editingUser);
            setUsers(users.map(u => u._id === updated._id ? updated : u));
            setEditingUser(null);
            setIsEditModalOpen(false);
            toast.success('Usuario actualizado');
        } catch (err) { toast.error('Error al actualizar'); }
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

    return (
        <AdminLayout>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Usuarios</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>Gestiona las cuentas del sistema</p>
                </motion.div>

                <motion.button
                    onClick={() => setIsCreateModalOpen(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}
                >
                    <RiAddCircleLine size={18} /> Nuevo Usuario
                </motion.button>

                {/* User Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    <AnimatePresence>
                        {users.map((user, i) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -3, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                                style={{
                                    background: 'white', borderRadius: 14, padding: 20,
                                    border: '1px solid var(--border-light)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                    display: 'flex', flexDirection: 'column', gap: 16,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 12,
                                        background: user.role === 'admin' ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                                    }}>
                                        {getInitials(user.name)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 5,
                                        padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                                        background: user.role === 'admin' ? '#fef2f2' : '#eff6ff',
                                        color: user.role === 'admin' ? '#dc2626' : '#2563eb',
                                    }}>
                                        {user.role === 'admin' ? <RiShieldUserLine size={14} /> : <RiToolsLine size={14} />}
                                        {user.role === 'admin' ? 'Administrador' : 'Técnico'}
                                    </span>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button onClick={() => { setEditingUser({ ...user }); setIsEditModalOpen(true); }}
                                            style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, padding: 7, cursor: 'pointer', color: 'var(--primary)', display: 'flex', transition: 'all 0.2s' }}
                                            title="Editar"
                                        >
                                            <RiEditLine size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(user._id, user.name)}
                                            style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#dc2626', display: 'flex', transition: 'all 0.2s' }}
                                            title="Eliminar"
                                        >
                                            <RiDeleteBin6Line size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Create Modal */}
                <Modal isOpen={isCreateModalOpen} onRequestClose={() => setIsCreateModalOpen(false)} style={modalStyles} ariaHideApp={false}>
                    <div style={{ padding: 28 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <RiUserAddLine size={22} /> Nuevo Usuario
                        </h3>
                        {[
                            { label: 'Nombre', key: 'name', type: 'text', placeholder: 'Nombre completo' },
                            { label: 'Email', key: 'email', type: 'email', placeholder: 'correo@ejemplo.com' },
                            { label: 'Contraseña', key: 'password', type: 'password', placeholder: 'Mínimo 6 caracteres' },
                        ].map(f => (
                            <div key={f.key} style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>{f.label}</label>
                                <input type={f.type} placeholder={f.placeholder} value={newUser[f.key]} onChange={(e) => setNewUser({ ...newUser, [f.key]: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                                />
                            </div>
                        ))}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Rol</label>
                            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                                <option value="technician">Técnico</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsCreateModalOpen(false)} style={{ padding: '10px 20px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                            <button onClick={handleCreate} style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: 'var(--accent)', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Crear Usuario</button>
                        </div>
                    </div>
                </Modal>

                {/* Edit Modal */}
                <Modal isOpen={isEditModalOpen} onRequestClose={() => setIsEditModalOpen(false)} style={modalStyles} ariaHideApp={false}>
                    <div style={{ padding: 28 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <RiUserSettingsLine size={22} /> Editar Usuario
                        </h3>
                        {editingUser && (
                            <>
                                {[
                                    { label: 'Nombre', key: 'name', type: 'text' },
                                    { label: 'Email', key: 'email', type: 'email' },
                                ].map(f => (
                                    <div key={f.key} style={{ marginBottom: 14 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>{f.label}</label>
                                        <input type={f.type} value={editingUser[f.key]} onChange={(e) => setEditingUser({ ...editingUser, [f.key]: e.target.value })}
                                            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                ))}
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 4 }}>Rol</label>
                                    <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                                        <option value="technician">Técnico</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                    <button onClick={() => setIsEditModalOpen(false)} style={{ padding: '10px 20px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
                                    <button onClick={handleUpdate} style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: 'var(--accent)', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Guardar</button>
                                </div>
                            </>
                        )}
                    </div>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default Users;
