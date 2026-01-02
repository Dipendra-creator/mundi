import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mundi';

// Helper to recalculate totals
const calculateTotals = (transactions: any[]) => {
    return transactions.reduce((acc, t) => {
        const amount = parseFloat(t.amount) || 0;
        if (t.type === 'credit') acc.totalCredit += amount;
        else if (t.type === 'debit') acc.totalDebit += amount;
        else if (t.type === 'payment-received') acc.totalReceived += amount;
        else if (t.type === 'payment-made') acc.totalPaid += amount;
        return acc;
    }, { totalCredit: 0, totalDebit: 0, totalReceived: 0, totalPaid: 0 });
};

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
    let client;
    try {
        const { id, transactionId } = await params;
        const body = await request.json();
        const { amount, type, description, date } = body;

        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        // Find firm
        const firm = await db.collection('firms').findOne({ _id: new ObjectId(id) });
        if (!firm) {
            return NextResponse.json({ success: false, error: 'Firm not found' }, { status: 404 });
        }

        // Update specific transaction in the array
        const transactions = firm.transactions || [];
        const index = transactions.findIndex((t: any) =>
            (t._id && t._id.toString() === transactionId) ||
            (!t._id && t.date === transactionId) // Fallback for old transactions? No, better safe.
        );

        // If transaction not found by ID, we can't edit safely.
        // But for this MVP, if we added _id recently, old transactions might lack it.
        // We will assume _id exists.

        let txIndex = -1;
        // Search by ObjectId string comparison
        transactions.forEach((t: any, idx: number) => {
            if (t._id && t._id.toString() === transactionId) txIndex = idx;
        });

        if (txIndex === -1) {
            return NextResponse.json({ success: false, error: 'Transaction not found or cannot be edited' }, { status: 404 });
        }

        // Update fields
        transactions[txIndex] = {
            ...transactions[txIndex],
            amount: parseFloat(amount),
            type,
            description,
            date: date ? new Date(date) : transactions[txIndex].date,
            updatedAt: new Date()
        };

        // Recalculate totals
        const totals = calculateTotals(transactions);
        const balance = (totals.totalCredit + totals.totalPaid) - (totals.totalDebit + totals.totalReceived);

        // Update database
        await db.collection('firms').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    transactions: transactions,
                    ...totals,
                    balance,
                    updatedAt: new Date()
                }
            }
        );

        return NextResponse.json({ success: true, message: 'Transaction updated successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        if (client) await client.close();
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
    let client;
    try {
        const { id, transactionId } = await params;

        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const firm = await db.collection('firms').findOne({ _id: new ObjectId(id) });
        if (!firm) {
            return NextResponse.json({ success: false, error: 'Firm not found' }, { status: 404 });
        }

        // Filter out the transaction
        const transactions = (firm.transactions || []).filter((t: any) =>
            !t._id || t._id.toString() !== transactionId
        );

        // Recalculate totals
        const totals = calculateTotals(transactions);
        const balance = (totals.totalCredit + totals.totalPaid) - (totals.totalDebit + totals.totalReceived);

        // Update database
        await db.collection('firms').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    transactions: transactions,
                    ...totals,
                    balance,
                    updatedAt: new Date()
                }
            }
        );

        return NextResponse.json({ success: true, message: 'Transaction deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        if (client) await client.close();
    }
}
