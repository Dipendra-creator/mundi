// MongoDB initialization script
// Run with: mongosh mongodb://localhost:27017/mundi init-data.js

// Clear existing collections
db.firms.deleteMany({});
db.kisaans.deleteMany({});
db.stocks.deleteMany({});

// Insert Firms
const firms = [
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
].map(name => ({
    name,
    totalCredit: 0,
    totalDebit: 0,
    balance: 0,
    transactions: [],
    createdAt: new Date(),
    updatedAt: new Date()
}));

db.firms.insertMany(firms);
print(`Inserted ${firms.length} firms`);

// Insert Kisaans
const kisaans = [
    { name: 'शंकर शर्मा', village: 'गोकुलपुर' },
    { name: 'धरमवीर सिंह', village: 'ओंगर' },
    { name: 'दिनेश', village: 'गभाना' },
    { name: 'संजय शर्मा', village: 'हरदासपुर' },
    { name: 'योगेन कुमार', village: 'रामपुर' },
    { name: 'देशराज चौहान', village: 'अम्रतपुर' },
].map(({ name, village }) => ({
    name,
    village,
    totalCredit: 0,
    totalDebit: 0,
    balance: 0,
    transactions: [],
    createdAt: new Date(),
    updatedAt: new Date()
}));

db.kisaans.insertMany(kisaans);
print(`Inserted ${kisaans.length} kisaans`);

// Insert Stocks
const stocks = [
    { cropType: 'गेंहू', unit: 'kg' },
    { cropType: 'बड्डा', unit: 'kg' },
    { cropType: 'बाजरा', unit: 'kg' },
    { cropType: 'उरद', unit: 'kg' },
    { cropType: 'O9', unit: 'kg' },
    { cropType: 'R1', unit: 'kg' },
].map(({ cropType, unit }) => ({
    cropType,
    unit,
    totalQuantity: 0,
    extraQuantity: 0,
    movements: [],
    createdAt: new Date(),
    updatedAt: new Date()
}));

db.stocks.insertMany(stocks);
print(`Inserted ${stocks.length} stocks`);

print('\n✅ Database initialized successfully!');
print(`Total: ${firms.length} firms, ${kisaans.length} kisaans, ${stocks.length} stocks`);
