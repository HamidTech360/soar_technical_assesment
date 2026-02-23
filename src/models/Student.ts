import mongoose, { Schema } from 'mongoose';

const StudentSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom' },
}, { timestamps: true });

export default mongoose.model('Student', StudentSchema);
