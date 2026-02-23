import Joi from 'joi';

export default class ValidationManager {
    private managers: any;
    private schemas: any;

    constructor({ managers }: { managers: any }) {
        this.managers = managers;
        this.initSchemas();
    }

    private initSchemas() {
        this.schemas = {
            auth: {
                login: Joi.object({
                    email: Joi.string().email().required(),
                    password: Joi.string().required()
                }),
                createUser: Joi.object({
                    email: Joi.string().email().required(),
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required(),
                    role: Joi.string().valid('SCHOOL_ADMIN').required(),
                    schoolId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required() 
                })
            },
            school: {
                createSchool: Joi.object({
                    name: Joi.string().required(),
                    address: Joi.string().required(),
                    phone: Joi.string().required(),
                    email: Joi.string().email().required()
                }),
                getSchool: Joi.object({
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
                }),
                updateSchool: Joi.object({
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
                    name: Joi.string(),
                    address: Joi.string(),
                    phone: Joi.string(),
                    email: Joi.string().email()
                }),
                deleteSchool: Joi.object({
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
                })
            },
            classroom: {
                createClassroom: Joi.object({
                    name: Joi.string().required(),
                    capacity: Joi.number().integer().min(1).required(),
                    resources: Joi.array().items(Joi.string())
                }),
                updateClassroom: Joi.object({
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
                    name: Joi.string(),
                    capacity: Joi.number().integer().min(1),
                    resources: Joi.array().items(Joi.string())
                }),
                deleteClassroom: Joi.object({
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
                })
            },
            student: {
                enrollStudent: Joi.object({
                    firstName: Joi.string().required(),
                    lastName: Joi.string().required(),
                    email: Joi.string().email().required(),
                    classroomId: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }),
                transferStudent: Joi.object({
                    studentId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
                    newSchoolId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
                    newClassroomId: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
                }).or('newSchoolId', 'newClassroomId'),
                updateStudentProfile: Joi.object({
                    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
                    firstName: Joi.string(),
                    lastName: Joi.string(),
                    email: Joi.string().email()
                })
            }
        };
    }

    validate(moduleName: string, fnName: string, payload: any) {
        const schema = this.schemas[moduleName]?.[fnName];
        if (!schema) return { error: null };

        const { error, value } = schema.validate(payload, { abortEarly: false, allowUnknown: true });

        if (error) {
            return {
                error: 'Validation Failed',
                details: error.details.map((d: any) => d.message)
            };
        }

        return { error: null, value };
    }
}
