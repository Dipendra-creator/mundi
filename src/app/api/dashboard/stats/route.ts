import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mundi';

export async function GET() {
    let client;
    try {
        client = await MongoClient.connect(uri);
        const db = client.db('mundi');

        // Get all firms
        const firms = await db.collection('firms').find({}).toArray();
        const firmStats = {
            total: firms.length,
            totalCredit: firms.reduce((sum: number, f: any) => sum + (f.totalCredit || 0), 0),
            totalDebit: firms.reduce((sum: number, f: any) => sum + (f.totalDebit || 0), 0),
            netBalance: firms.reduce((sum: number, f: any) => sum + (f.balance || 0), 0),
            topCreditors: firms
                .sort((a: any, b: any) => (b.totalCredit || 0) - (a.totalCredit || 0))
                .slice(0, 5)
                .map((f: any) => ({ name: f.name, amount: f.totalCredit || 0 })),
            topDebtors: firms
                .sort((a: any, b: any) => (b.totalDebit || 0) - (a.totalDebit || 0))
                .slice(0, 5)
                .map((f: any) => ({ name: f.name, amount: f.totalDebit || 0 })),
        };

        // Get all kisaans
        const kisaans = await db.collection('kisaans').find({}).toArray();
        const kisaanStats = {
            total: kisaans.length,
            totalCredit: kisaans.reduce((sum: number, k: any) => sum + (k.totalCredit || 0), 0),
            totalDebit: kisaans.reduce((sum: number, k: any) => sum + (k.totalDebit || 0), 0),
            netBalance: kisaans.reduce((sum: number, k: any) => sum + (k.balance || 0), 0),
            topCreditors: kisaans
                .sort((a: any, b: any) => (b.totalCredit || 0) - (a.totalCredit || 0))
                .slice(0, 5)
                .map((k: any) => ({ name: k.name, village: k.village, amount: k.totalCredit || 0 })),
            topDebtors: kisaans
                .sort((a: any, b: any) => (b.totalDebit || 0) - (a.totalDebit || 0))
                .slice(0, 5)
                .map((k: any) => ({ name: k.name, village: k.village, amount: k.totalDebit || 0 })),
        };

        // Get all stocks
        const stocks = await db.collection('stocks').find({}).toArray();
        const stockStats = {
            total: stocks.length,
            totalQuantity: stocks.reduce((sum: number, s: any) => sum + (s.totalQuantity || 0), 0),
            byType: stocks.map((s: any) => ({
                cropType: s.cropType,
                quantity: s.totalQuantity || 0,
                unit: s.unit,
                extraQuantity: s.extraQuantity || 0,
            })),
        };

        // Aggregate daily transactions from firms and kisaans
        const allTransactions = [
            ...firms.flatMap((f: any) => f.transactions || []),
            ...kisaans.flatMap((k: any) => k.transactions || [])
        ];

        // Group by date
        const groupedTransactions: { [key: string]: { credit: number; debit: number; date: Date } } = {};

        allTransactions.forEach((t: any) => {
            const dateStr = new Date(t.date).toISOString().split('T')[0];
            if (!groupedTransactions[dateStr]) {
                groupedTransactions[dateStr] = { credit: 0, debit: 0, date: new Date(t.date) };
            }
            if (t.type === 'credit') {
                groupedTransactions[dateStr].credit += t.amount || 0;
            } else if (t.type === 'debit') {
                groupedTransactions[dateStr].debit += t.amount || 0;
            }
        });

        // Convert to array and sort by date (descending)
        const recentActivity = Object.values(groupedTransactions)
            .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
            .slice(0, 7)
            .map((t: any) => ({
                date: t.date.toISOString(),
                credit: t.credit,
                debit: t.debit,
                net: t.credit - t.debit
            }));

        const reportStats = {
            total: recentActivity.length,
            totalCredit: recentActivity.reduce((sum, r) => sum + r.credit, 0),
            totalDebit: recentActivity.reduce((sum, r) => sum + r.debit, 0),
            netAmount: recentActivity.reduce((sum, r) => sum + r.net, 0),
            recent: recentActivity.reverse(), // Show oldest to newest in chart
        };

        // Overall statistics
        const overallStats = {
            totalPayable: firmStats.totalDebit + kisaanStats.totalDebit,
            totalReceivable: firmStats.totalCredit + kisaanStats.totalCredit,
            netBalance: (firmStats.totalCredit + kisaanStats.totalCredit) -
                (firmStats.totalDebit + kisaanStats.totalDebit),
        };

        return NextResponse.json({
            success: true,
            data: {
                overall: overallStats,
                firms: firmStats,
                kisaans: kisaanStats,
                stocks: stockStats,
                reports: reportStats,
            },
        });
    } catch (error: any) {
        console.error('Dashboard Stats API Error:', error);
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
