import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber:string;
    userType:string;
    createdAt: Date;
    password: string;
    correctPassword(
        candidatePassword: string,
        userPassword: string
    ): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
    firstName: {
        type: String,
        required: [true, 'A User must have a first name.'],
    },
    lastName: {
        type: String,
        required: [true, 'A User must have a last name.'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'A User must have a Phone Number.'],
    },
    email: {
        unique: true,
        type: String,
        required: [true, 'A User must have an email'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email'],
    },

    userType: {
        type: String,
        enum: ['buyer', 'seller'],
        default: 'buyer',
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false,
    },
});


userSchema.pre<IUser>('save', async function (next: NextFunction) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword: string,
    userPassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, userPassword);
};


const User = mongoose.model<IUser>('User', userSchema);
export default User;
