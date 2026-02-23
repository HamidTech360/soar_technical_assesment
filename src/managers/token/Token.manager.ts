import jwt from 'jsonwebtoken';

export default class TokenManager {
    private config: any;

    constructor({ config }: { config: any }) {
        this.config = config;
    }

    signToken({ payload, expiresIn }: { payload: any, expiresIn: string }) {
        return jwt.sign(payload, this.config.dotEnv.JWT_SECRET, { expiresIn: expiresIn as any });
    }

    verifyToken(token: string) {
        try {
            return jwt.verify(token, this.config.dotEnv.JWT_SECRET);
        } catch (err) {
            return null;
        }
    }
}
