import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware para verificar autenticacion
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Usuario no encontrado, token invalido' });
            }

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expirado, inicie sesion nuevamente' });
            }
            res.status(401).json({ message: 'No autorizado, token invalido' });
        }
    } else {
        res.status(401).json({ message: 'No autorizado, no se proporciono token' });
    }
};

// Middleware para verificar rol de administrador
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'No autorizado como administrador' });
    }
};
