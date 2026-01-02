# 🚀 Quick Start Guide - Mandi Management System

## 📋 Table of Contents
1. [First Time Setup](#first-time-setup)
2. [Daily Usage](#daily-usage)
3. [Understanding the System](#understanding-the-system)
4. [Common Tasks](#common-tasks)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 First Time Setup

### Step 1: Start the Server
```bash
cd mundi
npm run dev
```
✅ Server will start at: **http://localhost:3000**

### Step 2: Initialize Database
1. Open http://localhost:3000 in your browser
2. You'll see "Initialize Database" button
3. Click it to load all data from Excel file
4. Wait for confirmation message

**What gets loaded:**
- ✅ 36 Firms (फर्म)
- ✅ 6 Kisaan (किसान)
- ✅ 6 Stock Types (स्टॉक)

### Step 3: Explore the Dashboard
Navigate through the sidebar:
- 📊 **Dashboard** - Overview and statistics
- 🏢 **Firms** - Manage trading firms
- 👥 **Kisaan** - Manage farmers
- 📦 **Stock** - Track inventory

---

## 📅 Daily Usage

### Morning Routine
1. **Check Dashboard**
   - View overall balance
   - Check receivables and payables
   - Review stock levels

2. **Review Top Entities**
   - See who owes the most
   - See whom you owe the most

### During the Day
1. **Add New Entities** (if needed)
   - Go to Firms/Kisaan page
   - Click "Add" button
   - Fill in details

2. **Check Stock**
   - Monitor inventory levels
   - Plan purchases/sales

### End of Day
1. **Upload Daily Report** (coming soon)
   - Record all transactions
   - System auto-updates balances

---

## 💡 Understanding the System

### Financial Terms

#### Credit (लेने) - GREEN ✅
- **Meaning:** Amount TO RECEIVE from entity
- **Example:** Firm bought goods worth ₹10,000
- **You:** Will receive ₹10,000 from firm
- **Display:** Green color, positive number

#### Debit (देने) - RED ❌
- **Meaning:** Amount TO PAY to entity
- **Example:** You bought goods worth ₹5,000
- **You:** Will pay ₹5,000 to firm
- **Display:** Red color, positive number

#### Balance - BLUE 💙
- **Formula:** Credit - Debit
- **Positive Balance:** You will receive money (good!)
- **Negative Balance:** You will pay money (liability)

### Example Scenario

**Firm: "श्री बंशिवाले"**
- Credit (लेने): ₹50,000 (they bought from you)
- Debit (देने): ₹20,000 (you bought from them)
- **Balance: ₹30,000** (they owe you)
- **Status:** "To Receive" (green badge)

---

## ✅ Common Tasks

### Task 1: Add a New Firm
1. Go to **Firms** page
2. Click **"Add Firm"** button
3. Enter firm name
4. Click **"Create Firm"**
5. ✅ Firm added with ₹0 balance

### Task 2: Add a New Kisaan
1. Go to **Kisaan** page
2. Click **"Add Kisaan"** button
3. Enter name and village
4. Click **"Create Kisaan"**
5. ✅ Kisaan added with ₹0 balance

### Task 3: Add New Stock
1. Go to **Stock** page
2. Click **"Add Stock"** button
3. Enter:
   - Crop type (e.g., "मक्का")
   - Initial quantity
   - Unit (kg/quintal/ton)
   - Extra quantity (optional)
4. Click **"Add Stock"**
5. ✅ Stock added to inventory

### Task 4: Search for Entity
1. Go to Firms or Kisaan page
2. Use search box at top
3. Type name (or village for kisaan)
4. Results filter automatically

### Task 5: View Statistics
1. Go to **Dashboard**
2. See summary cards:
   - Total Receivable (green)
   - Total Payable (red)
   - Net Balance (blue)
3. Scroll down for charts
4. Check top creditors/debtors

---

## 🎨 Color Guide

### Dashboard Colors
- 🟢 **Green** = Money coming IN (receivable)
- 🔴 **Red** = Money going OUT (payable)
- 🔵 **Blue** = Net balance
- ⚪ **Gray** = Neutral/info

### Status Badges
- 🟢 **"To Receive"** = Positive balance (they owe you)
- 🔴 **"To Pay"** = Negative balance (you owe them)
- 🟡 **"Positive"** = Overall profit
- 🔴 **"Negative"** = Overall loss

---

## 📊 Reading the Charts

### Stock Distribution (Pie Chart)
- Shows crop-wise inventory
- Bigger slice = more stock
- Hover to see exact quantity
- Click legend to toggle crops

### Financial Activity (Bar Chart)
- Green bars = Credit (received)
- Red bars = Debit (paid)
- X-axis = Dates
- Y-axis = Amount in ₹
- Hover for exact values

---

## 🔍 Navigation Guide

### Sidebar Menu

**Overview Section:**
- 📊 Dashboard - Main overview
- 📈 Analytics - Detailed analysis (coming soon)

**Management Section:**
- 🏢 Firms (फर्म) - Trading companies
- 👥 Kisaan (किसान) - Farmers
- 📦 Stock (स्टॉक) - Inventory

**Reports Section:**
- 📄 Daily Reports - Transaction history (coming soon)
- 📤 Upload Report - Import data (coming soon)

**Settings Section:**
- ⚙️ Settings - System configuration (coming soon)

---

## 🐛 Troubleshooting

### Issue: "Initialize Database" button not working
**Solution:**
1. Check MongoDB is running
2. Verify `.env.local` has correct connection string
3. Check browser console for errors

### Issue: No data showing on dashboard
**Solution:**
1. Click "Refresh" button on dashboard
2. Check if database was initialized
3. Verify API endpoints are working

### Issue: Can't add new entity
**Solution:**
1. Ensure all required fields are filled
2. Check for duplicate names (firms must be unique)
3. Verify MongoDB connection

### Issue: Charts not displaying
**Solution:**
1. Ensure data exists in database
2. Refresh the page
3. Check browser console for errors

### Issue: Search not working
**Solution:**
1. Type at least 2 characters
2. Check spelling (case-insensitive)
3. Try different search terms

---

## 💾 Data Backup

### Recommended Backup Schedule
- **Daily:** Export important transactions
- **Weekly:** MongoDB backup
- **Monthly:** Full system backup

### MongoDB Backup Command
```bash
mongodump --db mundi --out ./backup
```

### Restore Command
```bash
mongorestore --db mundi ./backup/mundi
```

---

## 📱 Mobile Access

The system is responsive and works on:
- ✅ Desktop (best experience)
- ✅ Tablet (good)
- ✅ Mobile (basic functionality)

**Recommended:** Use desktop for data entry, mobile for viewing.

---

## 🔐 Security Tips

1. **Change default secrets** in `.env.local`
2. **Use strong MongoDB password**
3. **Don't share credentials**
4. **Regular backups**
5. **Keep system updated**

---

## 📞 Quick Reference

### URLs
- Dashboard: http://localhost:3000/dashboard
- Firms: http://localhost:3000/dashboard/firms
- Kisaan: http://localhost:3000/dashboard/kisaans
- Stock: http://localhost:3000/dashboard/stock

### Keyboard Shortcuts
- `Ctrl + K` - Search (coming soon)
- `Ctrl + R` - Refresh page
- `Esc` - Close dialog

### Currency Format
- Indian Rupee (₹)
- Comma-separated (₹1,00,000)
- No decimals for whole amounts

---

## 🎓 Learning Path

### Week 1: Basics
- [ ] Understand Credit vs Debit
- [ ] Navigate all pages
- [ ] Add test entities
- [ ] Read charts

### Week 2: Operations
- [ ] Add real firms
- [ ] Add real kisaans
- [ ] Update stock
- [ ] Monitor balances

### Week 3: Analysis
- [ ] Review top entities
- [ ] Analyze trends
- [ ] Plan actions
- [ ] Generate reports

---

## 📈 Success Metrics

Track these KPIs:
- ✅ Total Receivable (should increase)
- ✅ Total Payable (should decrease)
- ✅ Net Balance (should be positive)
- ✅ Stock Turnover (should be optimal)

---

## 🆘 Getting Help

1. **Check this guide first**
2. **Review README.md** for technical details
3. **Check IMPLEMENTATION.md** for architecture
4. **Inspect browser console** for errors
5. **Verify MongoDB logs**

---

## ✨ Pro Tips

1. **Use search** to find entities quickly
2. **Check dashboard daily** for overview
3. **Monitor top debtors** for collections
4. **Keep stock updated** for accuracy
5. **Regular backups** prevent data loss

---

**Happy Trading! 🌾**

*Last Updated: 2026-01-02*
