import Property from '../../models/property.model';
import catchAsync from '../../utils/common/error/catchAsync';
import AppError from '../../utils/common/error/AppError';
import sendEmail from '../../utils/email/email';
import { Request, Response, NextFunction } from 'express';
import User,{IUser} from '../../models/user.model';
interface User {
    _id:string,
    email:string,
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
         const {
             place,
             area,
             numberOfBedrooms,
             numberOfBathrooms,
             nearbyPlace,
             page = 1,
             limit = 10,
         } = req.query;

         const filter: any = {};
         if (place) filter.place = place;
         if (area) filter.area = area;
         if (numberOfBedrooms)
             filter.numberOfBedrooms = Number(numberOfBedrooms);
         if (numberOfBathrooms)
             filter.numberOfBathrooms = Number(numberOfBathrooms);
         if (nearbyPlace) filter.nearbyPlace = nearbyPlace;

          const pageNumber = Number(page);
          const limitNumber = Number(limit);
          const skip = (pageNumber - 1) * limitNumber;

          const property = await Property.find(filter)
              .skip(skip)
              .limit(limitNumber);
              const totalDocuments = await Property.countDocuments(filter);
        res.status(200).json({
            status: 'success',
            results: property.length,
            totalDocuments,
            totalPages: Math.ceil(totalDocuments / limitNumber),
            currentPage: pageNumber,
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
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        const { id } = req.body;
        const email = req.user.email;
        const result = await Property.findById(id).populate('createdBy');
        if (!result) {
            return next(new AppError('Property not found', 404));
        }
        const sellerDetails = result?.createdBy as any;
         if (!sellerDetails) {
             return next(
                 new AppError('Seller details not found for this property', 404)
             );
         }
        const sellerDetailsFormatted = `The seller name is ${sellerDetails.firstName} ${sellerDetails.lastName}. \n
        The email id is ${sellerDetails.email} and the contact number is ${sellerDetails.phoneNumber}.`;
        try {
            await sendEmail({
                email: email,
                subject: `The Seller Details for the Realtor project at place ${result.place}`,
                message: sellerDetailsFormatted,
            });
        } catch (err) {
            return next(
                new AppError(
                    'There was an error sending the email. Please try again later.',
                    500
                )
            );
        }
        res.status(200).json({
            status: 'success',
            data: result,
        });
    }
);


