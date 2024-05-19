import jwt, { TokenExpiredError } from 'jsonwebtoken';
import User, { IUser } from '../../models/user.model';
import catchAsync from '../../utils/common/error/catchAsync';
import AppError from '../../utils/common/error/AppError';
import { Request, Response, NextFunction } from 'express';

const signToken = (id: string, expiresIn?: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: expiresIn ? expiresIn : process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
    const token = signToken(user._id);
    const cookieOptions = {
        httpOnly: true,
        secure: false,
        path: '/',
        maxAge: 999999999,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};



export const signup = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const newUser = await User.create(req.body);
        createSendToken(newUser,200,res);
    }
);

export const login = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(
                new AppError('Please provide email and password!', 400)
            );
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(
                new AppError(
                    'Incorrect email or password. Please verify your credentials and try again.',
                    401
                )
            );
        }

        createSendToken(user, 200, res);
    }
);

export const protect = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        let token: string | undefined;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(
                new AppError(
                    'You are not logged in! Please login to get access.',
                    401
                )
            );
        }
        try {
            const decoded = await new Promise<{ id: string; iat: number }>(
                (resolve, reject) => {
                    jwt.verify(
                        token!,
                        process.env.JWT_SECRET,
                        (error, decoded) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(decoded as { id: string; iat: number });
                            }
                        }
                    );
                }
            );
            const user = await User.findById(decoded.id);
            if (!user) {
                return next(new AppError('The cafe no longer exists', 401));
            }

            req.user = user;
            next();
        } catch (error) {
            return next(new AppError('Invalid token', 401));
        }
    }
);

export const verifyLoggedIn = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {

        res.status(201).json({
            status: 'Success',
            message:
                'You are logged In.',
        });
    });

export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes((req.user as IUser).userType)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action',
                    403
                )
            );
        }
        next();
    };
};





