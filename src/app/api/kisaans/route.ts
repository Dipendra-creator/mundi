import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mundi';

export async function GET() {
    let client;
    try {
        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const kisaans = await db.collection('kisaans').find({}).sort({ name: 1 }).toArray();

        return NextResponse.json({
            success: true,
            data: kisaans,
            count: kisaans.length
        });
    } catch (error: any) {
        console.error('Kisaans API Error:', error);
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
        const { name, village } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Name is required' },
                { status: 400 }
            );
        }

        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const newKisaan = {
            name,
            village: village || '',
            totalCredit: 0,
            totalDebit: 0,
            totalReceived: 0,
            totalPaid: 0,
            balance: 0,
            transactions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('kisaans').insertOne(newKisaan);

        return NextResponse.json({
            success: true,
            data: { ...newKisaan, _id: result.insertedId },
            message: 'Kisaan created successfully'
        });
    } catch (error: any) {
        console.error('Create Kisaan Error:', error);
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
