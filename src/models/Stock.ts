import mongoose, { Schema, model, models } from 'mongoose';

export interface IStockMovement {
    date: Date;
    quantity: number;
    type: 'increase' | 'decrease';
    description?: string;
    reportId?: string;
}

export interface IStock {
    _id: string;
    cropType: string;  // गेंहू, बड्डा, बाजरा, उरद, O9, R1
    totalQuantity: number;
    unit: string;  // kg, quintal, etc.
    extraQuantity?: number;
    movements: IStockMovement[];
    createdAt: Date;
    updatedAt: Date;
}

const StockMovementSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    quantity: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['increase', 'decrease'],
        required: true,
    },
    description: String,
    reportId: String,
});

const StockSchema = new Schema<IStock>(
    {
        cropType: {
            type: String,
            required: [true, 'Please provide crop type'],
            unique: true,
            trim: true,
        },
        totalQuantity: {
            type: Number,
            default: 0,
        },
        unit: {
            type: String,
            default: 'kg',
        },
        extraQuantity: {
            type: Number,
            default: 0,
        },
        movements: [StockMovementSchema],
    },
    {
        timestamps: true,
    }
);

export default models.Stock || model<IStock>('Stock', StockSchema);
