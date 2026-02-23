import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const config = {
    dotEnv: {
        SERVICE_NAME: process.env.SERVICE_NAME || 'school-management-api',
        USER_PORT: process.env.USER_PORT || 3000,
        MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/school_management',
        JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey',
        CACHE_PREFIX: process.env.CACHE_PREFIX || 'sma',
    }
};

export default config;
