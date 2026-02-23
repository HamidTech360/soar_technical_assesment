import Classroom from '../models/Classroom';

export default class ClassroomManager {
    private managers: any;

    constructor({ managers }: { managers: any }) {
        this.managers = managers;
    }

    async createClassroom({ name, capacity, resources, __user }: any) {
        const schoolId = __user.schoolId;
        if (!schoolId) return { error: 'Admin must be associated with a school' };

        const classroom = new Classroom({ name, capacity, resources, schoolId });
        await classroom.save();
        return classroom;
    }

    async getClassrooms({ __user }: any) {
        const schoolId = __user.schoolId;
        return Classroom.find({ schoolId });
    }

    async updateClassroom({ id, name, capacity, resources, __user }: any) {
        const schoolId = __user.schoolId;
        const classroom = await Classroom.findOneAndUpdate({ _id: id, schoolId }, { name, capacity, resources }, { new: true });
        if (!classroom) return { error: 'Classroom not found or unauthorized' };
        return classroom;
    }

    async deleteClassroom({ id, __user }: any) {
        const schoolId = __user.schoolId;
        const classroom = await Classroom.findOneAndDelete({ _id: id, schoolId });
        if (!classroom) return { error: 'Classroom not found or unauthorized' };
        return { message: 'Classroom deleted successfully' };
    }

    get httpExposed() {
        return [
            'post=createClassroom',
            'get=getClassrooms',
            'put=updateClassroom',
            'delete=deleteClassroom'
        ];
    }
}
