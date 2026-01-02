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

        if (!amount || !type || (type !== 'credit' && type !== 'debit')) {
            return NextResponse.json(
                { success: false, error: 'Invalid transaction data' },
                { status: 400 }
            );
        }

        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const firm = await db.collection('firms').findOne({ _id: new ObjectId(id) });

        if (!firm) {
            return NextResponse.json(
                { success: false, error: 'Firm not found' },
                { status: 404 }
            );
        }

        const transaction = {
            date: new Date(),
            amount: parseFloat(amount),
            type,
            description: description || '',
        };

        // Update firm with new transaction and recalculate totals
        const updateData: any = {
            $push: { transactions: transaction },
            $set: { updatedAt: new Date() },
        };

        if (type === 'credit') {
            updateData.$inc = { totalCredit: parseFloat(amount) };
        } else {
            updateData.$inc = { totalDebit: parseFloat(amount) };
        }

        await db.collection('firms').updateOne(
            { _id: new ObjectId(id) },
            updateData
        );

        // Recalculate balance
        const updatedFirm = await db.collection('firms').findOne({ _id: new ObjectId(id) });
        const balance = (updatedFirm?.totalCredit || 0) - (updatedFirm?.totalDebit || 0);

        await db.collection('firms').updateOne(
            { _id: new ObjectId(id) },
            { $set: { balance } }
        );

        const finalFirm = await db.collection('firms').findOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            success: true,
            data: finalFirm,
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
