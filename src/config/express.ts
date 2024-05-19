import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import mongoSanitize from 'express-mongo-sanitize';
import bodyParser from 'body-parser';
import { logger } from '../utils/logger/logger';

const configureExpressApp = (
    app: Express,
    enableRateLimit?: boolean,
    windowMs?: number,
    maxRequestsPerWindow?: number
): void => {
    let limiter: rateLimit.RateLimit;

    app.set('port', process.env.PORT || 3000);
    app.use(
        cors({
            origin: 'http://localhost:5173',
            credentials: true,
        })
    );
    app.use(cookieParser());
    app.use(morgan('combined'));
    app.use(helmet());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ limit: '10mb' }));
 
    app.use(mongoSanitize());
    app.use(passport.initialize());

    if (enableRateLimit) {
        limiter = rateLimit({
            windowMs: windowMs,
            max: maxRequestsPerWindow,
        });

        app.use(limiter);
        logger.info('App has rate limit enabled');
    }

    app.use(
        express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
    );

    // app.use('/api-docs', serve);
    // app.get('/api-docs', setup(swaggerDoc));
};

export { configureExpressApp };
