import mongoose, { Schema, model, models } from 'mongoose';

export interface ITransaction {
    date: Date;
    amount: number;
    type: 'credit' | 'debit';
    description?: string;
    reportId?: string;
}

export interface IKisaan {
    _id: string;
    name: string;
    village?: string;
    totalCredit: number;  // लेने (to receive from kisaan)
    totalDebit: number;   // देने (to give to kisaan)
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

const KisaanSchema = new Schema<IKisaan>(
    {
        name: {
            type: String,
            required: [true, 'Please provide kisaan name'],
            trim: true,
        },
        village: {
            type: String,
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
KisaanSchema.pre('save', function (next) {
    this.balance = this.totalCredit - this.totalDebit;
    next();
});

export default models.Kisaan || model<IKisaan>('Kisaan', KisaanSchema);
