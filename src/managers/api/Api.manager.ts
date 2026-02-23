import { Request, Response, NextFunction } from 'express';
import authMiddleware from '../../mws/__token.mw';
import rbacMiddleware from '../../mws/__rbac.mw';

export default class ApiHandler {
    private config: any;
    private managers: any;
    private mwsExec: any;
    private prop: string;
    private methodMatrix: any = {};

    constructor({ config, managers, prop }: { config: any, managers: any, prop: string }) {
        this.config = config;
        this.managers = managers;
        this.prop = prop;

        this.init();
    }

    private init() {
        Object.keys(this.managers).forEach(mk => {
            const manager = this.managers[mk];
            if (manager[this.prop]) {
                this.methodMatrix[mk] = {};
                manager[this.prop].forEach((i: string) => {
                    let method = 'post';
                    let fnName = i;
                    if (i.includes('=')) {
                        const frags = i.split('=');
                        method = frags[0];
                        fnName = frags[1];
                    }
                    if (!this.methodMatrix[mk][method]) {
                        this.methodMatrix[mk][method] = [];
                    }
                    this.methodMatrix[mk][method].push(fnName);
                });
            }
        });
    }

    async mw(req: Request, res: Response, next: NextFunction) {
        const method = req.method.toLowerCase();
        const moduleName = req.params.moduleName as string;
        const fnName = req.params.fnName as string;
        const moduleMatrix = this.methodMatrix[moduleName];

        if (!moduleMatrix) {
            return this.managers.responseDispatcher.dispatch(res, { ok: false, message: `Module ${moduleName} not found` });
        }

        if (!moduleMatrix[method] || !moduleMatrix[method].includes(fnName)) {
            return this.managers.responseDispatcher.dispatch(res, { ok: false, message: `Unsupported method ${method} for ${moduleName}.${fnName}` });
        }

        const targetModule = this.managers[moduleName];

        // Middleware logic
        // For School, Classroom, Student, and protected Auth methods, we need authentication
        if (['school', 'classroom', 'student', 'auth'].includes(moduleName)) {
            // Special case for auth.login - it must be public
            if (moduleName === 'auth' && fnName === 'login') {
                return this.execute(targetModule, fnName, req, res);
            }

            const auth = authMiddleware(this.managers);
            return auth(req, res, async () => {
                const user = (req as any).user;

                // RBAC checks
                if (moduleName === 'school' || (moduleName === 'auth' && fnName === 'createUser')) {
                    const rbac = rbacMiddleware(['SUPERADMIN']);
                    return rbac(req, res, () => this.execute(targetModule, fnName, req, res));
                } else if (moduleName === 'classroom' || moduleName === 'student') {
                    const rbac = rbacMiddleware(['SUPERADMIN', 'SCHOOL_ADMIN']);
                    return rbac(req, res, () => this.execute(targetModule, fnName, req, res));
                }

                return this.execute(targetModule, fnName, req, res);
            });
        }

        return this.execute(targetModule, fnName, req, res);
    }

    private async execute(targetModule: any, fnName: string, req: Request, res: Response) {
        try {
            const moduleName = req.params.moduleName as string;
            const payload = {
                ...req.body,
                ...req.query,
                ...req.params,
                __user: (req as any).user
            };

            const validationResult = this.managers.validation.validate(moduleName, fnName, payload);
            if (validationResult.error) {
                return this.managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    error: validationResult.error,
                    details: validationResult.details
                });
            }

            const result = await targetModule[fnName](payload);

            if (result && result.selfHandleResponse) {
                
            } else {
                if (result && (result.error || result.errors)) {
                    return this.managers.responseDispatcher.dispatch(res, { ok: false, ...result });
                } else {
                    return this.managers.responseDispatcher.dispatch(res, { ok: true, data: result });
                }
            }
        } catch (err) {
            console.error(err);
            return this.managers.responseDispatcher.dispatch(res, { ok: false, message: 'Internal Server Error' });
        }
    }
}
