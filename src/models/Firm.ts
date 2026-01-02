import mongoose, { Schema, model, models } from 'mongoose';

export interface ITransaction {
    date: Date;
    amount: number;
    type: 'credit' | 'debit';
    description?: string;
    reportId?: string;
}

export interface IFirm {
    _id: string;
    name: string;
    totalCredit: number;  // लेने (to receive from firm)
    totalDebit: number;   // देने (to give to firm)
    balance: number;      // net balance (credit - debit)
    transactions: ITransaction[];
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema({
    date: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true,
    },
    description: String,
    reportId: String,
});

const FirmSchema = new Schema<IFirm>(
    {
        name: {
            type: String,
            required: [true, 'Please provide firm name'],
            unique: true,
            trim: true,
        },
        totalCredit: {
            type: Number,
            default: 0,
        },
        totalDebit: {
            type: Number,
            default: 0,
        },
        balance: {
            type: Number,
            default: 0,
        },
        transactions: [TransactionSchema],
    },
    {
        timestamps: true,
    }
);

// Calculate balance before saving
FirmSchema.pre('save', function (next) {
    this.balance = this.totalCredit - this.totalDebit;
    next();
});

export default models.Firm || model<IFirm>('Firm', FirmSchema);
