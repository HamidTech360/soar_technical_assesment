import UserServer from '../managers/http/UserServer.manager';
import ResponseDispatcher from '../managers/response_dispatcher/ResponseDispatcher.manager';
import ApiHandler from '../managers/api/Api.manager';
import TokenManager from '../managers/token/Token.manager';
import AuthManager from '../managers/Auth.manager';
import SchoolManager from '../managers/School.manager';
import ClassroomManager from '../managers/Classroom.manager';
import StudentManager from '../managers/Student.manager';
import ValidationManager from '../managers/validation/Validation.manager';

export default class ManagersLoader {
    private config: any;
    private managers: any = {};
    private injectable: any;

    constructor({ config }: { config: any }) {
        this.config = config;
        this.injectable = {
            config: this.config,
            managers: this.managers,
        };
    }

    load() {
        this.managers.responseDispatcher = new ResponseDispatcher();
        this.managers.validation = new ValidationManager(this.injectable);
        this.managers.token = new TokenManager(this.injectable);
        this.managers.auth = new AuthManager(this.injectable);
        this.managers.school = new SchoolManager(this.injectable);
        this.managers.classroom = new ClassroomManager(this.injectable);
        this.managers.student = new StudentManager(this.injectable);
        this.managers.userApi = new ApiHandler({ ...this.injectable, prop: 'httpExposed' });
        this.managers.userServer = new UserServer({ config: this.config, managers: this.managers });

        // Seed SuperAdmin if not exists
        this.managers.auth.seedSuperAdmin();

        return this.managers;
    }
}
