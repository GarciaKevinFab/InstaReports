import jsPDF from 'jspdf';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/api\/?$/, '');

const fetchAsDataURL = async (relativePath) => {
    if (!relativePath) return null;
    const url = relativePath.startsWith('http')
        ? relativePath
        : `${API_BASE}/${relativePath.replace(/^\/+/, '')}`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

const getImageDims = (dataUrl) => new Promise((resolve) => {
    if (!dataUrl) return resolve(null);
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = dataUrl;
});

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-PE') : 'N/A';
const safe = (v, fallback = 'N/A') => (v === null || v === undefined || v === '' ? fallback : String(v));

const generateReportPDF = async (report, settings = {}) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;

    const PRIMARY = settings.primaryColor || '#003087';
    const ACCENT = settings.accentColor || '#E30613';

    const hexToRgb = (hex) => {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 48, 135];
    };
    const [pr, pg, pb] = hexToRgb(PRIMARY);
    const [ar, ag, ab] = hexToRgb(ACCENT);

    const logoDataUrl = settings.logoUrl ? await fetchAsDataURL(settings.logoUrl) : null;
    const logoDims = await getImageDims(logoDataUrl);

    const technician = report.user || {};
    const sigDataUrl = technician.signatureUrl ? await fetchAsDataURL(technician.signatureUrl) : null;
    const sigDims = await getImageDims(sigDataUrl);

    let y = margin;

    // ============ HEADER BANNER ============
    doc.setFillColor(pr, pg, pb);
    doc.rect(0, 0, pageWidth, 32, 'F');

    if (logoDataUrl && logoDims) {
        const targetH = 18;
        const ratio = logoDims.w / logoDims.h;
        const targetW = targetH * ratio;
        try { doc.addImage(logoDataUrl, 'PNG', margin, 7, targetW, targetH); } catch {}
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(settings.companyName || 'Soluciones Informaticas', pageWidth - margin, 14, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const headerLines = [];
    if (settings.tagline) headerLines.push(settings.tagline);
    if (settings.ruc) headerLines.push(`RUC: ${settings.ruc}`);
    if (settings.phone) headerLines.push(`Tel: ${settings.phone}`);
    if (settings.email) headerLines.push(settings.email);
    let hy = 20;
    headerLines.forEach((line) => {
        doc.text(line, pageWidth - margin, hy, { align: 'right' });
        hy += 4;
    });

    y = 40;

    // ============ TITLE BAR ============
    doc.setFillColor(ar, ag, ab);
    doc.rect(margin, y, pageWidth - margin * 2, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('REPORTE DE SERVICIO TECNICO', pageWidth / 2, y + 6, { align: 'center' });

    const reportNumber = report._id ? report._id.slice(-8).toUpperCase() : '--------';
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`N° ${reportNumber}`, pageWidth - margin - 2, y + 6, { align: 'right' });

    y += 14;

    // ============ SECTION HELPER ============
    const drawSection = (title, rows) => {
        doc.setFillColor(245, 247, 250);
        doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
        doc.setDrawColor(pr, pg, pb);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin, y + 7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(pr, pg, pb);
        doc.text(title.toUpperCase(), margin + 3, y + 4.8);
        y += 9;

        doc.setDrawColor(220, 225, 232);
        doc.setLineWidth(0.2);

        const colWidth = (pageWidth - margin * 2) / 2;
        rows.forEach((pair, i) => {
            const [label, value] = pair;
            const isFull = pair[2] === true;
            const x = isFull ? margin : (i % 2 === 0 ? margin : margin + colWidth);
            const w = isFull ? pageWidth - margin * 2 : colWidth - 2;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(120, 130, 145);
            doc.text(label.toUpperCase(), x + 1, y + 3);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(30, 41, 59);
            const text = doc.splitTextToSize(safe(value), w - 2);
            doc.text(text, x + 1, y + 7);

            const rowH = Math.max(9, 4 + text.length * 4);

            if (isFull) {
                y += rowH;
            } else if (i % 2 === 1 || i === rows.length - 1) {
                y += rowH;
            }
        });

        y += 4;
        if (y > pageHeight - 60) {
            doc.addPage();
            y = margin;
        }
    };

    // ============ CLIENTE ============
    drawSection('Información del Cliente', [
        ['Nombre / Razón Social', report.clientName],
        ['DNI / RUC', report.clientDNI],
        ['Teléfono', report.clientPhone],
        ['Dirección', report.clientAddress, true],
    ]);

    // ============ EQUIPO ============
    drawSection('Información del Equipo', [
        ['Tipo', report.equipment?.type],
        ['Marca', report.equipment?.brand],
        ['Modelo', report.equipment?.model],
        ['N° Serie', report.equipment?.serial || 'N/A'],
        ['Código Patrimonial', report.equipment?.patrimonialCode || 'N/A'],
    ]);

    // ============ SERVICIO ============
    drawSection('Detalles del Servicio', [
        ['Tipo de Mantenimiento', report.maintenanceType === 'Corrective' ? 'Correctivo' : 'Preventivo'],
        ['Estado', report.status === 'Operative' ? 'Operativo' : 'Inoperativo'],
        ['Fecha de Recepción', formatDate(report.receptionDate)],
        ['Fecha de Entrega', formatDate(report.deliveryDate)],
        ['Precio Acordado', report.agreedPrice ? `S/ ${Number(report.agreedPrice).toFixed(2)}` : 'N/A'],
        ['Listo para Recoger', report.readyForPickup ? 'Sí' : 'No'],
        ['Descripción de la Falla', report.faultDescription, true],
        ['Observaciones', report.observations || 'Sin observaciones', true],
        ['Comentarios', report.comments || 'Sin comentarios', true],
    ]);

    // ============ PARTES (si aplica) ============
    if (report.partsRequested) {
        drawSection('Partes y Repuestos', [
            ['Necesita Partes', 'Sí'],
            ['Partes Solicitadas', report.partsOrdered ? 'Sí' : 'No'],
            ['Detalle de Partes', report.partsDetails || 'N/A', true],
        ]);
    }

    // ============ FIRMAS ============
    if (y > pageHeight - 70) {
        doc.addPage();
        y = margin;
    }

    y = Math.max(y + 6, pageHeight - 70);

    const signatureBoxW = (pageWidth - margin * 2 - 10) / 2;
    const signatureBoxH = 38;

    // Firma técnico
    doc.setDrawColor(220, 225, 232);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, signatureBoxW, signatureBoxH, 2, 2);

    if (sigDataUrl && sigDims) {
        const maxH = signatureBoxH - 14;
        const maxW = signatureBoxW - 10;
        const ratio = sigDims.w / sigDims.h;
        let h = maxH;
        let w = h * ratio;
        if (w > maxW) { w = maxW; h = w / ratio; }
        const cx = margin + (signatureBoxW - w) / 2;
        const cy = y + 4 + (maxH - h) / 2;
        try { doc.addImage(sigDataUrl, 'PNG', cx, cy, w, h); } catch {}
    }

    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(0.4);
    doc.line(margin + 8, y + signatureBoxH - 12, margin + signatureBoxW - 8, y + signatureBoxH - 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(pr, pg, pb);
    doc.text(safe(technician.name, 'Técnico'), margin + signatureBoxW / 2, y + signatureBoxH - 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 130, 145);
    doc.text(technician.position || 'Técnico de Servicio', margin + signatureBoxW / 2, y + signatureBoxH - 3, { align: 'center' });

    // Firma cliente
    const clientBoxX = margin + signatureBoxW + 10;
    doc.setDrawColor(220, 225, 232);
    doc.setLineWidth(0.3);
    doc.roundedRect(clientBoxX, y, signatureBoxW, signatureBoxH, 2, 2);

    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(0.4);
    doc.line(clientBoxX + 8, y + signatureBoxH - 12, clientBoxX + signatureBoxW - 8, y + signatureBoxH - 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(pr, pg, pb);
    doc.text(safe(report.clientName, 'Cliente'), clientBoxX + signatureBoxW / 2, y + signatureBoxH - 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 130, 145);
    doc.text(`DNI/RUC: ${safe(report.clientDNI, '---')}`, clientBoxX + signatureBoxW / 2, y + signatureBoxH - 3, { align: 'center' });

    // ============ FOOTER ============
    doc.setDrawColor(pr, pg, pb);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 150, 165);
    doc.setFont('helvetica', 'normal');
    const footerLeft = settings.footerNote || `${settings.companyName || 'Soluciones Informaticas'} · Reporte generado el ${new Date().toLocaleDateString('es-PE')}`;
    doc.text(footerLeft, margin, pageHeight - 7);
    doc.text(`Pág. ${doc.internal.getNumberOfPages()}`, pageWidth - margin, pageHeight - 7, { align: 'right' });

    doc.save(`reporte_${(report.clientName || 'cliente').replace(/\s+/g, '_')}_${reportNumber}.pdf`);
};

export default generateReportPDF;
