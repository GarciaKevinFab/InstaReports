import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
};

// Crear un usuario
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        const user = await User.create({ name, email, password, role });
        if (user) {
            const userResponse = user.toObject();
            delete userResponse.password;
            res.status(201).json(userResponse);
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos' });
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
};

// Actualizar un usuario
export const updateUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
            }
            user.password = password;
        }

        const updatedUser = await user.save();
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        res.json(userResponse);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
};

// Obtener perfil propio
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
    }
};

// Actualizar perfil propio (nombre, posición, firma)
export const updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (req.body.name !== undefined) user.name = req.body.name;
        if (req.body.position !== undefined) user.position = req.body.position;

        if (req.file) {
            if (user.signatureUrl) {
                const oldPath = path.join(process.cwd(), user.signatureUrl);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch {}
                }
            }
            user.signatureUrl = req.file.path.replace(/\\/g, '/');
        }

        const updated = await user.save();
        const response = updated.toObject();
        delete response.password;
        res.json(response);
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
    }
};

// Eliminar firma propia
export const removeMySignature = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        if (user.signatureUrl) {
            const oldPath = path.join(process.cwd(), user.signatureUrl);
            if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); } catch {}
            }
            user.signatureUrl = '';
            await user.save();
        }
        const response = user.toObject();
        delete response.password;
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar firma', error: error.message });
    }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (user) {
            res.json({ message: 'Usuario eliminado' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
};
