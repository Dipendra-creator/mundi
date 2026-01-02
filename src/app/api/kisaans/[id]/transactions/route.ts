import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mundi';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let client;
    try {
        const { id } = await params;
        const body = await request.json();
        const { amount, type, description } = body;

        const validTypes = ['credit', 'debit', 'payment-received', 'payment-made'];
        if (!amount || !type || !validTypes.includes(type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid transaction data' },
                { status: 400 }
            );
        }

        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const kisaan = await db.collection('kisaans').findOne({ _id: new ObjectId(id) });

        if (!kisaan) {
            return NextResponse.json(
                { success: false, error: 'Kisaan not found' },
                { status: 404 }
            );
        }

        const transaction = {
            _id: new ObjectId(),
            date: new Date(),
            amount: parseFloat(amount),
            type,
            description: description || '',
        };

        // Ensure transactions array exists
        if (!kisaan.transactions) {
            await db.collection('kisaans').updateOne(
                { _id: new ObjectId(id) },
                { $set: { transactions: [] } }
            );
        }

        const updateData: any = {
            $push: { transactions: transaction },
            $set: { updatedAt: new Date() },
        };

        if (type === 'credit') {
            updateData.$inc = { totalCredit: parseFloat(amount) };
        } else if (type === 'debit') {
            updateData.$inc = { totalDebit: parseFloat(amount) };
        } else if (type === 'payment-received') {
            updateData.$inc = { totalReceived: parseFloat(amount) };
        } else if (type === 'payment-made') {
            updateData.$inc = { totalPaid: parseFloat(amount) };
        }

        await db.collection('kisaans').updateOne(
            { _id: new ObjectId(id) },
            updateData
        );

        // Recalculate balance
        const updatedKisaan = await db.collection('kisaans').findOne({ _id: new ObjectId(id) });
        const balance = (
            (updatedKisaan?.totalCredit || 0) + (updatedKisaan?.totalPaid || 0)
        ) - (
                (updatedKisaan?.totalDebit || 0) + (updatedKisaan?.totalReceived || 0)
            );

        await db.collection('kisaans').updateOne(
            { _id: new ObjectId(id) },
            { $set: { balance } }
        );

        const finalKisaan = await db.collection('kisaans').findOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            success: true,
            data: finalKisaan,
            message: 'Transaction added successfully'
        });
    } catch (error: any) {
        console.error('Add Transaction Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
