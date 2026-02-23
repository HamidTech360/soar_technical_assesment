import mongoose, { Schema } from 'mongoose';

const SchoolSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    email: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.model('School', SchoolSchema);
