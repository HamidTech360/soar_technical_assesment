import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    role: { type: String, enum: ['SUPERADMIN', 'SCHOOL_ADMIN', 'STUDENT'], required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School' }, // Null for superadmin
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
