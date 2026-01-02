import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            maxlength: [60, 'Name cannot be more than 60 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'user'],
            default: 'user',
        },
    },
    {
        timestamps: true,
    }
);

export default models.User || model<IUser>('User', UserSchema);
