
import School from '../models/School';

export default class SchoolManager {
    private managers: any;

    constructor({ managers }: { managers: any }) {
        this.managers = managers;
    }

    async createSchool({ name, address, phone, email, __user }: any) {
        // Only superadmin can create schools
        const school = new School({ name, address, phone, email });
        
        await school.save();
        return school;
    }

    async getSchools({ __user }: any) {
        return School.find();
    }

    async getSchool({ id, __user }: any) {
        const school = await School.findById(id);
        if (!school) return { error: 'School not found' };
        return school;
    }

    async updateSchool({ id, name, address, phone, email, __user }: any) {
        const school = await School.findByIdAndUpdate(id, { name, address, phone, email }, { new: true });
        if (!school) return { error: 'School not found' };
        return school;
    }

    async deleteSchool({ id, __user }: any) {
        const school = await School.findByIdAndDelete(id);
        if (!school) return { error: 'School not found' };
        return { message: 'School deleted successfully' };
    }

    get httpExposed() {
        return [
            'post=createSchool',
            'get=getSchools',
            'get=getSchool',
            'put=updateSchool',
            'delete=deleteSchool'
        ];
    }
}
 