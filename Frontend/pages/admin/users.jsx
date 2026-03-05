import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsers, deleteUser, createUser, updateUser } from '../../services/userService';
import AdminLayout from '../../components/AdminLayout';
import styles from '../../styles/pages/Users.module.css';
import { RiAddCircleLine, RiEditLine, RiDeleteBin6Line, RiSaveLine, RiCloseLine, RiUserAddLine, RiUserSettingsLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'technician', password: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (err) {
                setError('Error al obtener los usuarios');
                toast.error('Error al obtener los usuarios');
            }
        };
        fetchUsers();
    }, []);

    // Delete user
    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            setUsers(users.filter((user) => user._id !== id));
            toast.success('Usuario eliminado correctamente');
        } catch (err) {
            setError('Error al eliminar el usuario');
            toast.error('Error al eliminar el usuario');
        }
    };

    // Create user
    const handleCreate = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast.error('Por favor, completa todos los campos');
            return;
        }
        try {
            const user = await createUser(newUser);
            setUsers([...users, user]);
            setNewUser({ name: '', email: '', role: 'technician', password: '' });
            setIsCreateModalOpen(false);
            toast.success('Usuario creado correctamente');
        } catch (err) {
            setError('Error al crear el usuario');
            toast.error('Error al crear el usuario');
        }
    };

    // Update user
    const handleUpdate = async () => {
        if (!editingUser.name || !editingUser.email) {
            toast.error('Por favor, completa todos los campos');
            return;
        }
        try {
            const updatedUser = await updateUser(editingUser._id, editingUser);
            setUsers(users.map((user) => (user._id === updatedUser._id ? updatedUser : user)));
            setEditingUser(null);
            setIsEditModalOpen(false);
            toast.success('Usuario actualizado correctamente');
        } catch (err) {
            setError('Error al actualizar el usuario');
            toast.error('Error al actualizar el usuario');
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
        <AdminLayout>
            <div className={styles.usersContainer}>
                <h2 className={styles.header}>
                    <RiUserSettingsLine size={28} style={{ marginRight: '8px' }} /> Usuarios
                </h2>
                <p className={styles.description}>
                    Gestiona los usuarios del sistema, incluyendo creación, edición y eliminación de cuentas.
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

                {/* Button to open create user modal */}
                <motion.button
                    onClick={() => setIsCreateModalOpen(true)}
                    className={styles.createButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <RiAddCircleLine size={20} style={{ marginRight: '8px' }} /> Crear Usuario
                </motion.button>

                {/* Users table */}
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {users.map((user) => (
                                <motion.tr
                                    key={user._id}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={rowVariants}
                                    transition={{ duration: 0.3 }}
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role === 'technician' ? 'Técnico' : 'Administrador'}</td>
                                    <td>
                                        <motion.button
                                            onClick={() => {
                                                setEditingUser(user);
                                                setIsEditModalOpen(true);
                                            }}
                                            className={styles.actionButton}
                                            whileHover={{ scale: 1.1 }}
                                            title="Editar usuario"
                                        >
                                            <RiEditLine size={20} />
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleDelete(user._id)}
                                            className={styles.actionButton}
                                            whileHover={{ scale: 1.1 }}
                                            title="Eliminar usuario"
                                        >
                                            <RiDeleteBin6Line size={20} />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>

                {/* Modal for creating a user */}
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
                        <h3 className={styles.modalHeader}>
                            <RiUserAddLine size={24} style={{ marginRight: '8px' }} /> Crear Usuario
                        </h3>
                        <div className={styles.formGroup}>
                            <label>Nombre</label>
                            <input
                                type="text"
                                placeholder="Ingresa el nombre"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Ingresa el email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Contraseña</label>
                            <input
                                type="password"
                                placeholder="Ingresa la contraseña"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Rol</label>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            >
                                <option value="technician">Técnico</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div className={styles.modalActions}>
                            <motion.button
                                onClick={handleCreate}
                                className={styles.saveButton}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RiSaveLine size={20} style={{ marginRight: '8px' }} /> Guardar
                            </motion.button>
                            <motion.button
                                onClick={() => setIsCreateModalOpen(false)}
                                className={styles.closeButton}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RiCloseLine size={20} style={{ marginRight: '8px' }} /> Cerrar
                            </motion.button>
                        </div>
                    </motion.div>
                </Modal>

                {/* Modal for editing a user */}
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
                        <h3 className={styles.modalHeader}>
                            <RiUserSettingsLine size={24} style={{ marginRight: '8px' }} /> Editar Usuario
                        </h3>
                        {editingUser && (
                            <>
                                <div className={styles.formGroup}>
                                    <label>Nombre</label>
                                    <input
                                        type="text"
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Rol</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    >
                                        <option value="technician">Técnico</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                <div className={styles.modalActions}>
                                    <motion.button
                                        onClick={handleUpdate}
                                        className={styles.saveButton}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <RiSaveLine size={20} style={{ marginRight: '8px' }} /> Guardar
                                    </motion.button>
                                    <motion.button
                                        onClick={() => setIsEditModalOpen(false)}
                                        className={styles.closeButton}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <RiCloseLine size={20} style={{ marginRight: '8px' }} /> Cerrar
                                    </motion.button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default Users;