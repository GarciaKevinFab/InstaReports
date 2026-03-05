export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};
