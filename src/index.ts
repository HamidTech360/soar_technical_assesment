import config from './config/index.config';
import mongoConnect from './connect/mongo';
import ManagersLoader from './loaders/ManagersLoader';

async function bootstrap() {
    process.on('uncaughtException', err => {
        console.error('Uncaught Exception:', err);
        process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
    });

    // Connect to MongoDB
    await mongoConnect({ uri: config.dotEnv.MONGO_URI });

    // Initialize Managers
    const managersLoader = new ManagersLoader({ config });
    const managers = managersLoader.load();

    // Start Server
    managers.userServer.run();
}

bootstrap();
