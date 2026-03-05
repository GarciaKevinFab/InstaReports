import jsPDF from 'jspdf';

const generateReportPDF = (report) => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const labelWidth = 55;
    let yPosition = margin;

    const checkPageOverflow = () => {
        if (yPosition > pageHeight - margin * 2) {
            doc.addPage();
            yPosition = margin;
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('InstaReports - Soluciones Informaticas', margin, yPosition);
            yPosition += 8;
            doc.setLineWidth(0.3);
            doc.setDrawColor(0, 48, 135);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
        }
    };

    const addField = (label, value) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 48, 135);
        doc.text(`${label}:`, margin, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 51, 51);
        const text = String(value || 'N/A');
        const splitText = doc.splitTextToSize(text, pageWidth - margin - labelWidth - margin);
        doc.text(splitText, margin + labelWidth, yPosition);
        yPosition += splitText.length * 7;
        checkPageOverflow();
    };

    const addSectionTitle = (title) => {
        yPosition += 4;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(227, 6, 19);
        doc.text(title, margin, yPosition);
        yPosition += 2;
        doc.setLineWidth(0.3);
        doc.setDrawColor(227, 6, 19);
        doc.line(margin, yPosition, margin + 60, yPosition);
        yPosition += 8;
        checkPageOverflow();
    };

    // Encabezado
    doc.setFontSize(22);
    doc.setTextColor(227, 6, 19);
    doc.text('InstaReports', margin, yPosition);
    doc.setFontSize(11);
    doc.setTextColor(0, 48, 135);
    doc.text('Soluciones Informaticas', margin + 75, yPosition);
    yPosition += 5;
    doc.setLineWidth(0.8);
    doc.setDrawColor(0, 48, 135);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 12;

    // Seccion: Informacion del Cliente
    addSectionTitle('Informacion del Cliente');
    addField('Nombre', report.clientName);
    addField('Direccion', report.clientAddress);
    addField('Telefono', report.clientPhone);
    addField('DNI', report.clientDNI);

    // Seccion: Informacion del Equipo
    addSectionTitle('Informacion del Equipo');
    const equipmentText = report.equipment
        ? `${report.equipment.type} - ${report.equipment.brand} (${report.equipment.model})`
        : 'N/A';
    addField('Equipo', equipmentText);
    if (report.equipment?.serial) {
        addField('N. Serie', report.equipment.serial);
    }
    if (report.equipment?.patrimonialCode) {
        addField('Cod. Patrimonial', report.equipment.patrimonialCode);
    }

    // Seccion: Detalles del Servicio
    addSectionTitle('Detalles del Servicio');
    addField('Descripcion Falla', report.faultDescription);
    addField('Observaciones', report.observations || 'N/A');
    addField('Tipo Mantenimiento', report.maintenanceType === 'Corrective' ? 'Correctivo' : 'Preventivo');
    addField('Estado', report.status === 'Operative' ? 'Operativo' : 'Inoperativo');
    addField('Precio Acordado', report.agreedPrice ? `S/ ${report.agreedPrice.toFixed(2)}` : 'N/A');
    addField('Comentarios', report.comments || 'N/A');

    // Seccion: Fechas
    addSectionTitle('Fechas');
    addField('Fecha Recepcion', report.receptionDate ? new Date(report.receptionDate).toLocaleDateString('es-PE') : 'N/A');
    addField('Fecha Entrega', report.deliveryDate ? new Date(report.deliveryDate).toLocaleDateString('es-PE') : 'N/A');
    if (report.createdAt) {
        addField('Fecha Creacion', new Date(report.createdAt).toLocaleDateString('es-PE'));
    }

    // Seccion: Partes y Estado
    addSectionTitle('Partes y Estado');
    addField('Necesita Partes', report.partsRequested ? 'Si' : 'No');
    if (report.partsRequested) {
        addField('Detalle Partes', report.partsDetails || 'N/A');
        addField('Partes Solicitadas', report.partsOrdered ? 'Si' : 'No');
    }
    addField('Listo para Recoger', report.readyForPickup ? 'Si' : 'No');

    // Pie de pagina
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
        `Generado por InstaReports el ${new Date().toLocaleDateString('es-PE')}`,
        margin,
        pageHeight - 10
    );

    doc.save(`reporte_${report.clientName || 'desconocido'}_${report._id}.pdf`);
};

export default generateReportPDF;
