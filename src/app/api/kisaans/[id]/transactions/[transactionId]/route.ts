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

        const kisaan = await db.collection('kisaans').findOne({ _id: new ObjectId(id) });
        if (!kisaan) {
            return NextResponse.json({ success: false, error: 'Kisaan not found' }, { status: 404 });
        }

        const transactions = kisaan.transactions || [];

        let txIndex = -1;
        transactions.forEach((t: any, idx: number) => {
            if (t._id && t._id.toString() === transactionId) txIndex = idx;
        });

        if (txIndex === -1) {
            return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
        }

        transactions[txIndex] = {
            ...transactions[txIndex],
            amount: parseFloat(amount),
            type,
            description,
            date: date ? new Date(date) : transactions[txIndex].date,
            updatedAt: new Date()
        };

        const totals = calculateTotals(transactions);
        const balance = (totals.totalCredit + totals.totalPaid) - (totals.totalDebit + totals.totalReceived);

        await db.collection('kisaans').updateOne(
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

        const kisaan = await db.collection('kisaans').findOne({ _id: new ObjectId(id) });
        if (!kisaan) {
            return NextResponse.json({ success: false, error: 'Kisaan not found' }, { status: 404 });
        }

        const transactions = (kisaan.transactions || []).filter((t: any) =>
            !t._id || t._id.toString() !== transactionId
        );

        const totals = calculateTotals(transactions);
        const balance = (totals.totalCredit + totals.totalPaid) - (totals.totalDebit + totals.totalReceived);

        await db.collection('kisaans').updateOne(
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
