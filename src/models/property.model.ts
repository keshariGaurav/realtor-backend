import mongoose, { Schema, Document } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

export interface IProperty extends Document {
    place: string;
    area: string;
    numberOfBedrooms: number;
    numberOfBathrooms: number;
    nearbyPlace: string;
    createdBy: mongoose.Types.ObjectId;
}

const propertySchema: Schema<IProperty> = new Schema<IProperty>({
    place: { type: String, required: true },
    area: { type: String, required: true },
    numberOfBedrooms: { type: Number, required: true },
    numberOfBathrooms: { type: Number, required: true },
    nearbyPlace: { type: String, required: false },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});



const Property = mongoose.model<IProperty>('Property', propertySchema);
export default Property;
