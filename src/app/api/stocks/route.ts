import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mundi';

export async function GET() {
    let client;
    try {
        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const stocks = await db.collection('stocks').find({}).sort({ cropType: 1 }).toArray();

        return NextResponse.json({
            success: true,
            data: stocks,
            count: stocks.length
        });
    } catch (error: any) {
        console.error('Stocks API Error:', error);
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

export async function POST(request: Request) {
    let client;
    try {
        const body = await request.json();
        const { cropType, variety, quantityBags, quantityKg } = body;

        if (!cropType) {
            return NextResponse.json(
                { success: false, error: 'Crop Type (Name) is required' },
                { status: 400 }
            );
        }

        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const newStock = {
            cropType,
            variety: variety || '',
            quantityBags: parseInt(quantityBags) || 0,
            quantityKg: parseFloat(quantityKg) || 0,
            movements: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('stocks').insertOne(newStock);

        return NextResponse.json({
            success: true,
            data: { ...newStock, _id: result.insertedId },
            message: 'Stock created successfully'
        });
    } catch (error: any) {
        console.error('Create Stock Error:', error);
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
