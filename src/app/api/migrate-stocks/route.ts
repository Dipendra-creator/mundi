import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mundi';

export async function GET() {
    let client;
    try {
        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        let updates = 0;
        const stocks = await db.collection('stocks').find({}).toArray();
        for (const s of stocks) {
            // If new fields are missing, migrate old quantity to Kg
            if (s.quantityBags === undefined || s.quantityKg === undefined) {
                await db.collection('stocks').updateOne(
                    { _id: s._id },
                    {
                        $set: {
                            quantityBags: 0,
                            quantityKg: s.totalQuantity || 0
                        }
                    }
                );
                updates++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migrated ${updates} stock items.`
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        if (client) await client.close();
    }
}
