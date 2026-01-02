# Mundi - मंडी Management Dashboard

A comprehensive agriculture trading (Mandi) management platform built with Next.js, MongoDB, and shadcn/ui. This system manages Firms (फर्म) and Kisaan (किसान/Farmers) with complete financial tracking and stock management.

## 🌾 Features

### Core Functionality
- ✅ **Firm Management** - Track all trading firms with credit/debit transactions
- ✅ **Kisaan Management** - Manage farmer accounts with village-wise tracking
- ✅ **Stock Management** - Monitor crop inventory with visual analytics
- ✅ **Financial Tracking** - Automatic calculation of payables, receivables, and net balance
- ✅ **Dashboard Analytics** - Comprehensive overview with charts and insights
- ✅ **Daily Reports** - Upload and track daily transaction reports

### Technical Stack
- **Framework:** Next.js 15 with App Router
- **Database:** MongoDB with Mongoose ODM
- **UI Components:** shadcn/ui with Tailwind CSS
- **Charts:** Recharts for data visualization
- **Language:** TypeScript for type safety
- **Styling:** Tailwind CSS with custom design system

## 📊 Data Structure

The system is based on the provided Excel file (`Data.xlsx`) containing:

### Firms (फर्म)
36 trading firms including:
- श्री बंशिवाले, हिमांशु एंड संस, चौधरी ट्रेडर्स, etc.
- Each with Credit (लेने) and Debit (देने) tracking

### Kisaan (किसान)
6 farmers with village information:
- शंकर शर्मा (गोकुलपुर)
- धरमवीर सिंह (ओंगर)
- दिनेश (गभाना)
- And more...

### Stock (स्टॉक)
6 crop types:
- गेंहू (Wheat)
- बड्डा
- बाजरा (Millet)
- उरद (Black Gram)
- O9, R1

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account

### Installation

1. **Navigate to project directory:**
   ```bash
   cd mundi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Update `.env.local` with your MongoDB connection string:
   
   ```env
   MONGODB_URI=mongodb://localhost:27017/mundi
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mundi
   
   NEXTAUTH_SECRET=your-secret-key-change-this-in-production
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start MongoDB (if running locally):**
   ```bash
   # On Windows
   net start MongoDB
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Initialize Database:**
   - Open http://localhost:3000
   - Click "Initialize Database" to load data from Excel file
   - This will create all firms, kisaans, and stock entries

## 📁 Project Structure

```
mundi/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── firms/          # Firm CRUD operations
│   │   │   ├── kisaans/        # Kisaan CRUD operations
│   │   │   ├── stocks/         # Stock CRUD operations
│   │   │   ├── dashboard/      # Dashboard statistics
│   │   │   └── init-db/        # Database initialization
│   │   ├── dashboard/
│   │   │   ├── firms/          # Firm management page
│   │   │   ├── kisaans/        # Kisaan management page
│   │   │   ├── stock/          # Stock management page
│   │   │   ├── reports/        # Daily reports
│   │   │   └── page.tsx        # Main dashboard
│   │   └── page.tsx            # Home (redirects to dashboard)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── dashboard-layout.tsx # Dashboard layout
│   ├── lib/
│   │   ├── mongodb.ts          # MongoDB connection
│   │   └── utils.ts            # Utility functions
│   └── models/
│       ├── Firm.ts             # Firm schema
│       ├── Kisaan.ts           # Kisaan schema
│       ├── Stock.ts            # Stock schema
│       └── DailyReport.ts      # Daily report schema
└── package.json
```

## 🎯 Available Pages

### Dashboard (`/dashboard`)
- Overall financial summary
- Entity statistics (Firms, Kisaan, Stock)
- Recent financial activity charts
- Top creditors/debtors
- Stock distribution visualization

### Firms Management (`/dashboard/firms`)
- List all firms with balances
- Add new firms
- View credit/debit totals
- Search and filter firms

### Kisaan Management (`/dashboard/kisaans`)
- List all farmers with village info
- Add new kisaans
- Track farmer balances
- Search by name or village

### Stock Management (`/dashboard/stock`)
- View all crop inventory
- Add new stock items
- Visual stock distribution
- Track quantities and units

### Daily Reports (`/dashboard/reports`)
- Upload daily transaction reports
- View historical reports
- Track daily financial activity

## 💰 Financial Tracking

The system automatically calculates:

- **Total Payable** - Amount to pay to firms and kisaans
- **Total Receivable** - Amount to receive from firms and kisaans
- **Net Balance** - Overall profit/loss position
- **Entity-wise Balances** - Individual balances for each firm and kisaan

### Credit vs Debit
- **Credit (लेने)** - Amount TO RECEIVE from entity
- **Debit (देने)** - Amount TO PAY to entity
- **Balance** - Credit - Debit (positive = receivable, negative = payable)

## 📈 Charts & Visualizations

- **Bar Charts** - Daily financial activity (credit vs debit)
- **Pie Charts** - Stock distribution by crop type
- **Top Lists** - Highest creditors and debtors
- **Trend Indicators** - Visual indicators for positive/negative balances

## 🔌 API Endpoints

### Firms
- `GET /api/firms` - Get all firms
- `POST /api/firms` - Create new firm
- `GET /api/firms/[id]` - Get firm by ID
- `PUT /api/firms/[id]` - Update firm
- `DELETE /api/firms/[id]` - Delete firm

### Kisaans
- `GET /api/kisaans` - Get all kisaans
- `POST /api/kisaans` - Create new kisaan

### Stocks
- `GET /api/stocks` - Get all stocks
- `POST /api/stocks` - Create new stock

### Dashboard
- `GET /api/dashboard/stats` - Get comprehensive statistics

### Database
- `POST /api/init-db` - Initialize database with Excel data

## 🛠️ Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Add new shadcn/ui component
npx shadcn@latest add [component-name]
```

## 📝 Data Models

### Firm Schema
```typescript
{
  name: string
  totalCredit: number
  totalDebit: number
  balance: number
  transactions: Transaction[]
}
```

### Kisaan Schema
```typescript
{
  name: string
  village?: string
  totalCredit: number
  totalDebit: number
  balance: number
  transactions: Transaction[]
}
```

### Stock Schema
```typescript
{
  cropType: string
  totalQuantity: number
  unit: string
  extraQuantity?: number
  movements: StockMovement[]
}
```

## 🌐 Internationalization

The system supports Hindi labels:
- फर्म (Firm)
- किसान (Kisaan/Farmer)
- स्टॉक (Stock)
- लेने (Credit/To Receive)
- देने (Debit/To Pay)

## 📚 Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **date-fns** - Date utilities

## 🤝 Contributing

This is a custom Mandi management system. For modifications:
1. Update models in `src/models/`
2. Create/modify API routes in `src/app/api/`
3. Update pages in `src/app/dashboard/`
4. Add UI components as needed

## 📄 License

MIT

## 🙏 Acknowledgments

Built for agriculture trading management with data from `Data.xlsx`.
