import { Request, Response, NextFunction } from 'express';

export default function authMiddleware(managers: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return managers.responseDispatcher.dispatch(res, { ok: false, message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = managers.token.verifyToken(token);

        if (!decoded) {
            return managers.responseDispatcher.dispatch(res, { ok: false, message: 'Unauthorized: Invalid token' });
        }

        (req as any).user = decoded;
        next();
    };
}
