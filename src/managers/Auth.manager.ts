import User from '../models/User';
import bcrypt from 'bcrypt';

export default class AuthManager {
    private managers: any;

    constructor({ managers }: { managers: any }) {
        this.managers = managers;
    }

    /**
     * Seeds the SuperAdmin user if it doesn't already exist.
     * This is called on system startup.
     */
    async seedSuperAdmin() {
        const email = 'owolabihammed3600@gmail.com';
        const exists = await User.findOne({ email });

        if (!exists) {
            console.log('🌱 Seeding SuperAdmin user...');
            const hashedPassword = await bcrypt.hash('Password@442', 10);
            const superAdmin = new User({
                email,
                password: hashedPassword,
                role: 'SUPERADMIN',
                firstName: 'Super',
                lastName: 'Admin'
            });
            await superAdmin.save();
            console.log('✅ SuperAdmin seeded successfully');
        }
    }

    /**
     * Internal method to create a user with an automated password.
     * Used by SuperAdmin to create School Admins and by the system during student enrollment.
     */
    async createUser({ email, firstName, lastName, role, schoolId }: any) {
        // Check if email already exists
        const exists = await User.findOne({ email });
        if (exists) return { error: 'Email already in use' };

        // Generate password: (firstName + lastName).toLowerCase()
        const rawPassword = (firstName + lastName).toLowerCase();
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const user = new User({
            email,
            password: hashedPassword,
            role,
            schoolId,
            firstName,
            lastName
        });

        await user.save();
        return {
            message: 'User created successfully',
            credentials: { email, password: rawPassword }
        };
    }

    async login({ email, password }: any) {
        const user: any = await User.findOne({ email });
        if (!user) return { error: 'Invalid credentials' };

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return { error: 'Invalid credentials' };

        const token = this.managers.token.signToken({
            payload: {
                userId: user._id,
                role: user.role,
                schoolId: user.schoolId
            },
            expiresIn: '1h'
        });


        return {
            token,
            user: {
                email: user.email,
                role: user.role,
                schoolId: user.schoolId,
                firstName: user.firstName,
                lastName: user.lastName
            }
        };
    }

   
    get httpExposed() {
        return ['post=login', 'post=createUser'];
    }
}
