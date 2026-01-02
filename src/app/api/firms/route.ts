import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mundi';

export async function GET() {
    let client;
    try {
        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        const firms = await db.collection('firms').find({}).sort({ name: 1 }).toArray();

        return NextResponse.json({
            success: true,
            data: firms,
            count: firms.length
        });
    } catch (error: any) {
        console.error('Firms API Error:', error);
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
