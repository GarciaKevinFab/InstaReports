import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB conectado');

        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Ya existe un administrador:', adminExists.email);
            process.exit(0);
        }

        const admin = await User.create({
            name: 'Administrador',
            email: 'admin@instareports.com',
            password: 'admin123',
            role: 'admin',
        });

        console.log('Administrador creado exitosamente:');
        console.log('  Email:', admin.email);
        console.log('  Password: admin123');
        console.log('  IMPORTANTE: Cambia la contraseña despues del primer inicio de sesion');
        process.exit(0);
    } catch (error) {
        console.error('Error al crear administrador:', error.message);
        process.exit(1);
    }
};

seedAdmin();
