import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

export default class UserServer {
    private config: any;
    private userApi: any;
    private app: express.Application;

    constructor({ config, managers }: { config: any, managers: any }) {
        this.config = config;
        this.userApi = managers.userApi;
        this.app = express();
    }

    run() {
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
                    imgSrc: ["'self'", "data:", "https://validator.swagger.io", "https://cdnjs.cloudflare.com"],
                    connectSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://validator.swagger.io"]
                }
            }
        }));
        this.app.use(cors({ origin: '*' }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));


        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100
        });
        this.app.use(limiter);

        // Swagger documentation
        try {
            const possiblePaths = [
                path.join(__dirname, '../../docs/swagger.yaml'),
                path.join(process.cwd(), 'src/docs/swagger.yaml'),
                path.join(process.cwd(), 'docs/swagger.yaml'),
            ];

            let swaggerDocument: any;
            for (const p of possiblePaths) {
                try {
                    swaggerDocument = YAML.load(p);
                    if (swaggerDocument) {
                        console.log(`✅ Loaded Swagger from: ${p}`);
                        break;
                    }
                } catch (e) {
                    // Continue to next path
                }
            }

            if (swaggerDocument) {
                this.app.get('/api-docs', (req, res) => {
                    res.send(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <title>School Management API Docs</title>
                            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css">
                            <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/favicon-32x32.png" sizes="32x32" />
                            <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/favicon-16x16.png" sizes="16x16" />
                            <style>
                                html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
                                *, *:before, *:after { box-sizing: inherit; }
                                body { margin: 0; background: #fafafa; }
                            </style>
                        </head>
                        <body>
                            <div id="swagger-ui"></div>
                            <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js"></script>
                            <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js"></script>
                            <script>
                            window.onload = function() {
                                const ui = SwaggerUIBundle({
                                    spec: ${JSON.stringify(swaggerDocument)},
                                    dom_id: '#swagger-ui',
                                    deepLinking: true,
                                    presets: [
                                        SwaggerUIBundle.presets.api,
                                        SwaggerUIStandalonePreset
                                    ],
                                    plugins: [
                                        SwaggerUIBundle.plugins.DownloadUrl
                                    ],
                                    layout: "StandaloneLayout"
                                })
                                window.ui = ui
                            }
                            </script>
                        </body>
                        </html>
                    `);
                });
            } else {
                throw new Error('No valid swagger.yaml found in search paths');
            }
        } catch (err) {
            console.error('Failed to load Swagger documentation:', err);
        }

        // Error handler
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });

        // Main API route
        this.app.all('/api/:moduleName/:fnName', (req: Request, res: Response, next: NextFunction) => {
            this.userApi.mw(req, res, next);
        });

        const server = http.createServer(this.app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`🚀 ${this.config.dotEnv.SERVICE_NAME.toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
            console.log(`📄 API Documentation is enabled at /api-docs`);
        });
    }
}
