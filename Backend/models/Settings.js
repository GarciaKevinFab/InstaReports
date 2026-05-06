import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
    {
        key: { type: String, default: 'company', unique: true, index: true },
        companyName: { type: String, default: 'Soluciones Informaticas' },
        tagline: { type: String, default: 'InstaReports' },
        ruc: { type: String, default: '' },
        address: { type: String, default: '' },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        website: { type: String, default: '' },
        logoUrl: { type: String, default: '' },
        primaryColor: { type: String, default: '#003087' },
        accentColor: { type: String, default: '#E30613' },
        footerNote: { type: String, default: '' },
    },
    { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
