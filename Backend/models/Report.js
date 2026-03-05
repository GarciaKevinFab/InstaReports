import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    clientName: { type: String, required: true },
    clientAddress: { type: String, required: true },
    clientPhone: { type: String, required: true },
    clientDNI: { type: String, required: true },
    equipment: {
        type: { type: String, required: true },
        brand: { type: String, required: true },
        model: { type: String, required: true },
        serial: { type: String },
        patrimonialCode: { type: String },
    },
    faultDescription: { type: String, required: true },
    observations: { type: String },
    maintenanceType: { type: String, enum: ['Corrective', 'Preventive'], default: 'Corrective' },
    status: { type: String, enum: ['Operative', 'Inoperative'], default: 'Operative' },
    agreedPrice: { type: Number, required: true },
    comments: { type: String },
    receptionDate: { type: Date, required: true },
    deliveryDate: { type: Date, required: true },
    partsRequested: { type: Boolean, default: false },
    partsDetails: { type: String },
    partsOrdered: { type: Boolean, default: false },
    readyForPickup: { type: Boolean, default: false },
    files: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);