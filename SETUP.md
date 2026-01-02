# Mundi Dashboard - Quick Setup Guide

## ✅ What's Been Set Up

Your Mundi management dashboard has been successfully initialized with:

### 1. **Next.js Project**
- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS for styling
- ESLint for code quality

### 2. **MongoDB Integration**
- Mongoose for MongoDB ODM
- Connection utility with caching (`src/lib/mongodb.ts`)
- User model with TypeScript interfaces (`src/models/User.ts`)
- RESTful API routes for user management (`src/app/api/users/route.ts`)

### 3. **shadcn/ui Components**
The following UI components have been installed:
- Button
- Card
- Input
- Label
- Table
- Dropdown Menu
- Avatar
- Badge
- Dialog
- Sidebar
- Separator
- Sheet
- Tooltip
- Skeleton

### 4. **Dashboard Pages**
- **Main Dashboard** (`/dashboard`) - Analytics overview with stats cards
- **Users Management** (`/dashboard/users`) - Full CRUD interface for users
- **Dashboard Layout** - Responsive sidebar navigation

### 5. **Environment Configuration**
- `.env.local` created with MongoDB connection string
- Default configuration for local MongoDB

## 🚀 Next Steps

### 1. Configure MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mundi?retryWrites=true&w=majority
   ```

### 2. Access the Dashboard

The development server is running at:
- **Local:** http://localhost:3000
- **Network:** http://172.19.192.1:3000

### 3. Test the Application

1. Navigate to http://localhost:3000 (redirects to `/dashboard`)
2. Explore the dashboard interface
3. Go to `/dashboard/users` to test user management
4. Try creating a new user (requires MongoDB connection)

## 📁 Project Structure

```
mundi/
├── src/
│   ├── app/
│   │   ├── api/users/          # User API endpoints
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── users/          # User management
│   │   │   └── page.tsx        # Main dashboard
│   │   └── page.tsx            # Home (redirects)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── dashboard-layout.tsx
│   ├── lib/
│   │   ├── mongodb.ts          # DB connection
│   │   └── utils.ts
│   └── models/
│       └── User.ts             # User schema
└── .env.local                  # Environment vars
```

## 🛠️ Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Add new shadcn/ui component
npx shadcn@latest add [component-name]

# Lint code
npm run lint
```

## 🎨 Customization Ideas

1. **Add More Models**: Create additional MongoDB models in `src/models/`
2. **Extend API**: Add more API routes in `src/app/api/`
3. **New Pages**: Create pages in `src/app/dashboard/`
4. **UI Components**: Add more shadcn/ui components as needed
5. **Authentication**: Integrate NextAuth.js for user authentication
6. **Charts**: Add chart libraries like Recharts for data visualization

## 📝 API Endpoints

### Users
- `GET /api/users` - Fetch all users
- `POST /api/users` - Create new user

**Example POST:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check `.env.local` has the correct `MONGODB_URI`
- Verify network connectivity for Atlas

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder: `rm -rf .next` or `rmdir /s .next`
- Restart the dev server

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Happy Coding! 🎉**
