import { Request, Response, NextFunction } from 'express';

export default function rbacMiddleware(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ ok: false, message: 'Unauthorized' });

        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ ok: false, message: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
}
