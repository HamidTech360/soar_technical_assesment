import AuthManager from '../managers/Auth.manager';

describe('AuthManager Smoke Test', () => {
    let authManager: any;
    const mockInjectable = {
        config: { dotEnv: { JWT_SECRET: 'test' } },
        managers: {}
    };

    beforeEach(() => {
        authManager = new AuthManager(mockInjectable);
    });

    it('should be defined', () => {
        expect(authManager).toBeDefined();
    });

    it('should have a login method', () => {
        expect(typeof authManager.login).toBe('function');
    });

    it('should have a signUp method', () => {
        expect(typeof authManager.signUp).toBe('function');
    });
});
