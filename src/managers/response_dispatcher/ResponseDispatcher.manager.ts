import { Response } from 'express';

export default class ResponseDispatcher {
    dispatch(res: Response, { ok, data, message, error, errors, details }: { ok: boolean, data?: any, message?: string, error?: string, errors?: any, details?: any }) {
        let statusCode = ok ? 200 : 400;

        const errMsg = message || error;

        if (errMsg && errMsg.toLowerCase().includes('not found')) statusCode = 404;
        if (errMsg && errMsg.toLowerCase().includes('unauthorized')) statusCode = 401;
        if (errMsg && errMsg.toLowerCase().includes('forbidden')) statusCode = 403;

        return res.status(statusCode).json({
            ok,
            data,
            message: errMsg,
            errors,
            details
        });
    }
}
