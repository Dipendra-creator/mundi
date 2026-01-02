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

        // Get daily reports (if any)
        const dailyReports = await db.collection('dailyreports')
            .find({})
            .sort({ date: -1 })
            .limit(7)
            .toArray();

        const reportStats = {
            total: dailyReports.length,
            totalCredit: dailyReports.reduce((sum: number, r: any) => sum + (r.totalCreditAmount || 0), 0),
            totalDebit: dailyReports.reduce((sum: number, r: any) => sum + (r.totalDebitAmount || 0), 0),
            netAmount: dailyReports.reduce((sum: number, r: any) => sum + (r.netAmount || 0), 0),
            recent: dailyReports.map((r: any) => ({
                date: r.date,
                credit: r.totalCreditAmount || 0,
                debit: r.totalDebitAmount || 0,
                net: r.netAmount || 0,
            })),
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
