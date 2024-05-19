import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/common/error/AppError';

const handleCastErrorDB = (err: any): AppError => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFields = (err: any): AppError => {
    const value = err.message.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
    const message = `Duplicate field value: ${value}, Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationErrorDb = (err: any): AppError => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = (): AppError => {
    return new AppError('Invalid Token. Please log in again', 401);
};

const handleJWTExpiredError = (): AppError => {
    return new AppError('Your token has expired! Please log in', 401);
};

const sendErrorDev = (err: AppError, req: Request, res: Response): void => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name,
        });
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went very wrong',
            msg: err.message,
        });
    }
};

const sendErrorProd = (err: AppError, req: Request, res: Response): void => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    } else {
        if (err.isOperational) {
            console.log(err);
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: err.message,
            });
        } else {
            console.error('ERROR 💥', err);
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: 'Please try again later.',
            });
        }
    }
};

export default (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    const env = process.env.NODE_ENV;

    if (env === 'development') {
        console.log(err);
        sendErrorDev(err, req, res);
    }

    if (env.startsWith('prod')) {
        let error = { ...err };
        error.name = err.name;
        error.message = err.message;

        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }

        if (error.code === 11000) {
            error = handleDuplicateFields(error);
        }

        if (error.name === 'ValidationError') {
            error = handleValidationErrorDb(error);
        }

        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }

        if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }

        sendErrorProd(error, req, res);
    }
};
