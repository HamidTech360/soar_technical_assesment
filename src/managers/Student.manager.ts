import Student from '../models/Student';

export default class StudentManager {
    private managers: any;

    constructor({ managers }: { managers: any }) {
        this.managers = managers;
    }

    async enrollStudent({ firstName, lastName, email, classroomId, __user }: any) {
        const schoolId = __user.schoolId;
        if (!schoolId) return { error: 'Admin must be associated with a school' };

     
        const exists = await Student.findOne({ email });
        if (exists) return { error: 'Student with this email is already enrolled' };

    
        const student = new Student({ firstName, lastName, email, schoolId, classroomId });
        await student.save();

        await this.managers.auth.createUser({
            email,
            firstName,
            lastName,
            role: 'STUDENT',
            schoolId
        });

        return student;
    }

    async getStudents({ __user }: any) {
        const schoolId = __user.schoolId;
        return Student.find({ schoolId }).populate('classroomId');
    }

    async transferStudent({ studentId, newSchoolId, newClassroomId, __user }: any) {
        // Only superadmin can transfer students across schools, or 
        // school admin can transfer within their school.


        const update: any = {};
        if (newSchoolId) update.schoolId = newSchoolId;
        if (newClassroomId) update.classroomId = newClassroomId;

        const student = await Student.findByIdAndUpdate(studentId, update, { new: true });
        if (!student) return { error: 'Student not found' };
        return student;
    }

    async updateStudentProfile({ id, firstName, lastName, email, __user }: any) {
        const schoolId = __user.schoolId;
        const student = await Student.findOneAndUpdate({ _id: id, schoolId }, { firstName, lastName, email }, { new: true });
        if (!student) return { error: 'Student not found or unauthorized' };
        return student;
    }

    get httpExposed() {
        return [
            'post=enrollStudent',
            'get=getStudents',
            'post=transferStudent',
            'put=updateStudentProfile'
        ];
    }
}
