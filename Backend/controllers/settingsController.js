import Settings from '../models/Settings.js';
import fs from 'fs';
import path from 'path';

const SETTINGS_KEY = 'company';

const getOrCreateSettings = async () => {
    let settings = await Settings.findOne({ key: SETTINGS_KEY });
    if (!settings) {
        settings = await Settings.create({ key: SETTINGS_KEY });
    }
    return settings;
};

export const getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error al obtener settings:', error);
        res.status(500).json({ message: 'Error al obtener configuración', error: error.message });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        const allowedFields = ['companyName', 'tagline', 'ruc', 'address', 'phone', 'email', 'website', 'primaryColor', 'accentColor', 'footerNote'];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        if (req.file) {
            if (settings.logoUrl) {
                const oldPath = path.join(process.cwd(), settings.logoUrl);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch {}
                }
            }
            settings.logoUrl = req.file.path.replace(/\\/g, '/');
        }

        const updated = await settings.save();
        res.json(updated);
    } catch (error) {
        console.error('Error al actualizar settings:', error);
        res.status(500).json({ message: 'Error al actualizar configuración', error: error.message });
    }
};

export const removeLogo = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        if (settings.logoUrl) {
            const oldPath = path.join(process.cwd(), settings.logoUrl);
            if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); } catch {}
            }
            settings.logoUrl = '';
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        console.error('Error al eliminar logo:', error);
        res.status(500).json({ message: 'Error al eliminar logo', error: error.message });
    }
};
