import mongoose, { Schema } from 'mongoose';

const ClassroomSchema = new Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    resources: { type: [String] },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
}, { timestamps: true });

export default mongoose.model('Classroom', ClassroomSchema);
