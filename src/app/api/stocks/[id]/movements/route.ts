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
        const { quantity, type, description } = body;

        if (!quantity || !type || (type !== 'increase' && type !== 'decrease')) {
            return NextResponse.json(
                { success: false, error: 'Invalid stock movement data' },
                { status: 400 }
            );
        }

        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const stock = await db.collection('stocks').findOne({ _id: new ObjectId(id) });

        if (!stock) {
            return NextResponse.json(
                { success: false, error: 'Stock not found' },
                { status: 404 }
            );
        }

        const movement = {
            date: new Date(),
            quantity: parseFloat(quantity),
            type,
            description: description || '',
        };

        // Ensure movements array exists
        if (!stock.movements) {
            await db.collection('stocks').updateOne(
                { _id: new ObjectId(id) },
                { $set: { movements: [] } }
            );
        }

        const updateData: any = {
            $push: { movements: movement },
            $set: { updatedAt: new Date() },
        };

        if (type === 'increase') {
            updateData.$inc = { totalQuantity: parseFloat(quantity) };
        } else {
            // Check if we have enough stock
            if ((stock.totalQuantity || 0) < parseFloat(quantity)) {
                return NextResponse.json(
                    { success: false, error: 'Insufficient stock quantity' },
                    { status: 400 }
                );
            }
            updateData.$inc = { totalQuantity: -parseFloat(quantity) };
        }

        await db.collection('stocks').updateOne(
            { _id: new ObjectId(id) },
            updateData
        );

        const updatedStock = await db.collection('stocks').findOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            success: true,
            data: updatedStock,
            message: 'Stock movement recorded successfully'
        });
    } catch (error: any) {
        console.error('Add Stock Movement Error:', error);
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
