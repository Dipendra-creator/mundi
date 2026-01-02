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
        const { quantityBags, quantityKg, type, description } = body;

        const bags = parseInt(quantityBags) || 0;
        const kg = parseFloat(quantityKg) || 0;

        if ((bags === 0 && kg === 0) || !type || (type !== 'increase' && type !== 'decrease')) {
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
            _id: new ObjectId(),
            date: new Date(),
            quantityBags: bags,
            quantityKg: kg,
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
            updateData.$inc = {
                quantityBags: bags,
                quantityKg: kg
            };
        } else {
            // Check if we have enough stock
            const currentBags = stock.quantityBags || 0;
            const currentKg = stock.quantityKg || 0;

            if (currentBags < bags) {
                return NextResponse.json({ success: false, error: 'Insufficient bags' }, { status: 400 });
            }
            if (currentKg < kg) {
                return NextResponse.json({ success: false, error: 'Insufficient loose kg' }, { status: 400 });
            }

            updateData.$inc = {
                quantityBags: -bags,
                quantityKg: -kg
            };
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
