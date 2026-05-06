import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB conectado');

        // Crear Admin
        const adminExists = await User.findOne({ email: 'admin@instareports.com' });
        if (adminExists) {
            console.log('Admin ya existe:', adminExists.email);
        } else {
            const admin = await User.create({
                name: 'Administrador',
                email: 'admin@instareports.com',
                password: 'Admin2025!',
                role: 'admin',
            });
            console.log('Admin creado:', admin.email, '/ Password: Admin2025!');
        }

        // Crear Tecnico
        const techExists = await User.findOne({ email: 'tecnico@instareports.com' });
        if (techExists) {
            console.log('Tecnico ya existe:', techExists.email);
        } else {
            const tech = await User.create({
                name: 'Tecnico',
                email: 'tecnico@instareports.com',
                password: 'Tech2025!',
                role: 'technician',
            });
            console.log('Tecnico creado:', tech.email, '/ Password: Tech2025!');
        }

        console.log('\n--- Modulos por Rol ---');
        console.log('ADMIN:');
        console.log('  - Dashboard (estadisticas generales)');
        console.log('  - Estadisticas (metricas detalladas)');
        console.log('  - Usuarios (CRUD completo de usuarios)');
        console.log('  - Reportes (CRUD completo, toggle partes solicitadas)');
        console.log('  - Gestion de PDF (descarga reportes)');
        console.log('');
        console.log('TECNICO:');
        console.log('  - Dashboard (estadisticas propias)');
        console.log('  - Reportes (crear, ver propios, toggle necesita partes/listo)');
        console.log('  - Gestion de PDF (descarga reportes)');
        console.log('  - NO tiene acceso a: Usuarios, Estadisticas globales');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

seedUsers();
