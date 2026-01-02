import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mundi';

export async function GET() {
    let client;
    try {
        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        let firmUpdates = 0;
        let kisaanUpdates = 0;

        // Migrate Firms
        const firms = await db.collection('firms').find({}).toArray();
        for (const firm of firms) {
            if (!firm.transactions || firm.transactions.length === 0) continue;

            let modified = false;
            const newTransactions = firm.transactions.map((t: any) => {
                if (!t._id) {
                    modified = true;
                    return { ...t, _id: new ObjectId() };
                }
                return t;
            });

            if (modified) {
                await db.collection('firms').updateOne(
                    { _id: firm._id },
                    { $set: { transactions: newTransactions } }
                );
                firmUpdates++;
            }
        }

        // Migrate Kisaans
        const kisaans = await db.collection('kisaans').find({}).toArray();
        for (const kisaan of kisaans) {
            if (!kisaan.transactions || kisaan.transactions.length === 0) continue;

            let modified = false;
            const newTransactions = kisaan.transactions.map((t: any) => {
                if (!t._id) {
                    modified = true;
                    return { ...t, _id: new ObjectId() };
                }
                return t;
            });

            if (modified) {
                await db.collection('kisaans').updateOne(
                    { _id: kisaan._id },
                    { $set: { transactions: newTransactions } }
                );
                kisaanUpdates++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migration verified. Updated ${firmUpdates} firms and ${kisaanUpdates} kisaans.`
        });

    } catch (error: any) {
        console.error('Migration Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        if (client) await client.close();
    }
}
