import mongoose, { Schema, model, models } from 'mongoose';

export interface IReportEntry {
    entityType: 'firm' | 'kisaan' | 'stock';
    entityId: string;
    entityName: string;
    transactionType?: 'credit' | 'debit';
    stockMovementType?: 'increase' | 'decrease';
    amount?: number;
    quantity?: number;
    description?: string;
}

export interface IDailyReport {
    _id: string;
    date: Date;
    entries: IReportEntry[];
    totalCreditAmount: number;
    totalDebitAmount: number;
    netAmount: number;
    uploadedBy?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReportEntrySchema = new Schema({
    entityType: {
        type: String,
        enum: ['firm', 'kisaan', 'stock'],
        required: true,
    },
    entityId: {
        type: String,
        required: true,
    },
    entityName: {
        type: String,
        required: true,
    },
    transactionType: {
        type: String,
        enum: ['credit', 'debit'],
    },
    stockMovementType: {
        type: String,
        enum: ['increase', 'decrease'],
    },
    amount: Number,
    quantity: Number,
    description: String,
});

const DailyReportSchema = new Schema<IDailyReport>(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        entries: [ReportEntrySchema],
        totalCreditAmount: {
            type: Number,
            default: 0,
        },
        totalDebitAmount: {
            type: Number,
            default: 0,
        },
        netAmount: {
            type: Number,
            default: 0,
        },
        uploadedBy: String,
        notes: String,
    },
    {
        timestamps: true,
    }
);

// Calculate totals before saving
DailyReportSchema.pre('save', function (next) {
    this.totalCreditAmount = this.entries
        .filter(e => e.transactionType === 'credit')
        .reduce((sum, e) => sum + (e.amount || 0), 0);

    this.totalDebitAmount = this.entries
        .filter(e => e.transactionType === 'debit')
        .reduce((sum, e) => sum + (e.amount || 0), 0);

    this.netAmount = this.totalCreditAmount - this.totalDebitAmount;
    next();
});

export default models.DailyReport || model<IDailyReport>('DailyReport', DailyReportSchema);
