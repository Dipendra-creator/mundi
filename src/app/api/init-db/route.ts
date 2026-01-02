import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Firm from '@/models/Firm';
import Kisaan from '@/models/Kisaan';
import Stock from '@/models/Stock';

// Data from Excel file
const firmsData = [
    'श्री बंशिवाले',
    'हिमांशु एंड संस',
    'चौधरी ट्रेडर्स',
    'लाला हरिश्चंद्र एंड संस',
    'राजन किसान केंद्र',
    'अमन ट्रेडर्स',
    'यामिन खान एंड संस',
    'श्री राम ट्रेडिंग कंपनी',
    'राना ट्रेडर्स',
    'लालाराम एंड संस',
    'चौहान एंड संस',
    'सत्यप्रकाश अग्रवाल एंड संस',
    'नीरज कुमार पंकज कुमार',
    'भानु ट्रेडिंग कंपनी',
    'टी एंड संस',
    'गौरव गुप्ता',
    'डी.एस. एंड संस',
    'अभिषेक ट्रेडर्स',
    'मनोज कुमार कृष्णा कुमार',
    'सुरेन्द्र सिंह चांदपुर',
    'महादेव ट्रेडर्स',
    'कपिल एंड हेमंत ट्रेडर्स',
    'विभु एंड संस',
    'अंशु ट्रेडिंग कंपनी',
    'सुशिल कुमार',
    'सीताराम ट्रेडर्स',
    'विजय एंड संस',
    'कान्हा जी ट्रेडर्स',
    'कुलदीप कुमार एंड संस',
    'हरी एंड संस',
    'अंशु बिट्टू एंड संस',
    'सिंह ट्रेडर्स',
    'हेमंत कुमार तरुण कुमार',
    'सार्थक एंटरप्राइज',
    'नारायण ट्रेडर्स',
    'सिटू सिंह ग्वालरा',
];

const kisaansData = [
    { name: 'शंकर शर्मा', village: 'गोकुलपुर' },
    { name: 'धरमवीर सिंह', village: 'ओंगर' },
    { name: 'दिनेश', village: 'गभाना' },
    { name: 'संजय शर्मा', village: 'हरदासपुर' },
    { name: 'योगेन कुमार', village: 'रामपुर' },
    { name: 'देशराज चौहान', village: 'अम्रतपुर' },
];

const stocksData = [
    { cropType: 'गेंहू', unit: 'kg' },
    { cropType: 'बड्डा', unit: 'kg' },
    { cropType: 'बाजरा', unit: 'kg' },
    { cropType: 'उरद', unit: 'kg' },
    { cropType: 'O9', unit: 'kg' },
    { cropType: 'R1', unit: 'kg' },
];

export async function POST() {
    try {
        await dbConnect();

        // Clear existing data
        await Firm.deleteMany({});
        await Kisaan.deleteMany({});
        await Stock.deleteMany({});

        // Insert firms
        const firms = await Firm.insertMany(
            firmsData.map(name => ({
                name,
                totalCredit: 0,
                totalDebit: 0,
                balance: 0,
                transactions: [],
            }))
        );

        // Insert kisaans
        const kisaans = await Kisaan.insertMany(
            kisaansData.map(({ name, village }) => ({
                name,
                village,
                totalCredit: 0,
                totalDebit: 0,
                balance: 0,
                transactions: [],
            }))
        );

        // Insert stocks
        const stocks = await Stock.insertMany(
            stocksData.map(({ cropType, unit }) => ({
                cropType,
                unit,
                totalQuantity: 0,
                extraQuantity: 0,
                movements: [],
            }))
        );

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully',
            data: {
                firms: firms.length,
                kisaans: kisaans.length,
                stocks: stocks.length,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
