import Property from '../../models/property.model';
import catchAsync from '../../utils/common/error/catchAsync';
import AppError from '../../utils/common/error/AppError';
import { Request, Response, NextFunction } from 'express';
import User from '../../models/user.model';
interface User {
    _id:string,
}

interface RequestWithUser extends Request {
    user?: User;
}



export const getOne = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return next(new AppError('Property not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                property
            },
        });
    }
);

export const getAll = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const property = await Property.find({});
        res.status(200).json({
            status: 'success',
            data: {
                property,
            },
        });
    }
);

export const getAllOfSeller = catchAsync(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
         const userId = req.user._id;
        const property = await Property.find({ createdBy: userId });
        res.status(200).json({
            status: 'success',
            data: {
                property,
            },
        });
    }
);

export const getAllProperty = catchAsync(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        const property = await Property.find();
        res.status(200).json({
            status: 'success',
            data: {
                property,
            },
        });
    }
);

export const create = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const property = await Property.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                property,
            },
        });
    }
);

export const update = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        console.log(req.user);
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
        );
        if (!property) {
            return next(new AppError('Property not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                property
            },
        });
    }
);
export const verifySellerOfRealtor = catchAsync(
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        const userId = req.user._id;
        const property = await Property.findOne(
            {
                _id:req.params.id,
                createdBy:userId
            }
        );
        if (!property) {
            return next(new AppError('Property not found', 404));
        }
        next();
    }
);

export const remove = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await Property.findByIdAndDelete(req.params.id);
        if (!result) {
            return next(new AppError('Property not found', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
);

export const getSellerDetails = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const {id}=req.body;
        const result = await Property.findById(id).populate('createdBy');
        console.log(result);
        if (!result) {
            return next(new AppError('Property not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: result,
        });
    }
);


