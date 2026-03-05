export const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Manejar errores de validación de Mongoose
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: messages.join(', ') });
    }

    // Manejar errores de duplicado (MongoDB)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        return res.status(400).json({ message: `El valor de ${field} ya existe` });
    }

    // Manejar errores de cast (ID inválido)
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'ID inválido' });
    }

    // Manejar errores de Multer (subida de archivos)
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: `Error en subida de archivo: ${err.message}` });
    }

    res.status(statusCode).json({
        message: err.message || 'Error interno del servidor',
    });
};
