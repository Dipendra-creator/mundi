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

        const stock = await db.collection('stocks').findOne({ _id: new ObjectId(id) });

        if (!stock) {
            return NextResponse.json(
                { success: false, error: 'Stock not found' },
                { status: 404 }
            );
        }

        // Reset stock movements and quantity (but keep initial quantity if needed? For now let's reset to 0)
        await db.collection('stocks').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    totalQuantity: 0,
                    quantityBags: 0,
                    quantityKg: 0,
                    movements: [],
                    updatedAt: new Date()
                }
            }
        );

        const updatedStock = await db.collection('stocks').findOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            success: true,
            data: updatedStock,
            message: 'All stock movements reset successfully'
        });
    } catch (error: any) {
        console.error('Reset Stock Movements Error:', error);
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
