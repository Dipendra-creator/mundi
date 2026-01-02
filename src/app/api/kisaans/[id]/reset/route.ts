import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mundi';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    let client;
    try {
        const { id } = await params;

        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const kisaan = await db.collection('kisaans').findOne({ _id: new ObjectId(id) });

        if (!kisaan) {
            return NextResponse.json(
                { success: false, error: 'Kisaan not found' },
                { status: 404 }
            );
        }

        // Reset all transaction data
        await db.collection('kisaans').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    totalCredit: 0,
                    totalDebit: 0,
                    balance: 0,
                    transactions: [],
                    updatedAt: new Date()
                }
            }
        );

        const updatedKisaan = await db.collection('kisaans').findOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            success: true,
            data: updatedKisaan,
            message: 'All transactions reset successfully'
        });
    } catch (error: any) {
        console.error('Reset Kisaan Transactions Error:', error);
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
