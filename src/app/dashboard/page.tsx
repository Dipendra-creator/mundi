"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    Package,
    IndianRupee,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCw
} from "lucide-react"
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface DashboardStats {
    overall: {
        totalPayable: number
        totalReceivable: number
        netBalance: number
    }
    firms: {
        total: number
        totalCredit: number
        totalDebit: number
        netBalance: number
        topCreditors: Array<{ name: string; amount: number }>
        topDebtors: Array<{ name: string; amount: number }>
    }
    kisaans: {
        total: number
        totalCredit: number
        totalDebit: number
        netBalance: number
        topCreditors: Array<{ name: string; village?: string; amount: number }>
        topDebtors: Array<{ name: string; village?: string; amount: number }>
    }
    stocks: {
        total: number
        totalQuantity: number
        byType: Array<{ cropType: string; quantity: number; unit: string; extraQuantity?: number }>
    }
    reports: {
        total: number
        totalCredit: number
        totalDebit: number
        netAmount: number
        recent: Array<{ date: string; credit: number; debit: number; net: number }>
    }
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [initializing, setInitializing] = useState(false)

    const fetchStats = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/dashboard/stats")
            const data = await response.json()
            if (data.success) {
                setStats(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error)
        } finally {
            setLoading(false)
        }
    }

    const initializeDatabase = async () => {
        try {
            setInitializing(true)
            const response = await fetch("/api/init-db", { method: "POST" })
            const data = await response.json()
            if (data.success) {
                await fetchStats()
            }
        } catch (error) {
            console.error("Failed to initialize database:", error)
        } finally {
            setInitializing(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('hi-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }


    if (!stats) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle>No Data Available</CardTitle>
                            <CardDescription>
                                Unable to load dashboard data. Please check your MongoDB connection.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={fetchStats}
                                className="w-full"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }


    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">मंडी Dashboard</h1>
                        <p className="text-muted-foreground">
                            Agriculture Trading Management System
                        </p>
                    </div>
                    <Button onClick={fetchStats} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {/* Overall Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Receivable</CardTitle>
                            <ArrowUpCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(stats.overall.totalReceivable)}
                            </div>
                            <p className="text-xs text-muted-foreground">Amount to receive</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payable</CardTitle>
                            <ArrowDownCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(stats.overall.totalPayable)}
                            </div>
                            <p className="text-xs text-muted-foreground">Amount to pay</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                            <IndianRupee className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.overall.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(stats.overall.netBalance)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.overall.netBalance >= 0 ? 'Profit' : 'Loss'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Entity Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Firms (फर्म)</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.firms.total}</div>
                            <div className="mt-2 space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Credit:</span>
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(stats.firms.totalCredit)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Debit:</span>
                                    <span className="font-medium text-red-600">
                                        {formatCurrency(stats.firms.totalDebit)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kisaan (किसान)</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.kisaans.total}</div>
                            <div className="mt-2 space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Credit:</span>
                                    <span className="font-medium text-green-600">
                                        {formatCurrency(stats.kisaans.totalCredit)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Debit:</span>
                                    <span className="font-medium text-red-600">
                                        {formatCurrency(stats.kisaans.totalDebit)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Stock (स्टॉक)</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.stocks.total}</div>
                            <div className="mt-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Quantity:</span>
                                    <span className="font-medium">
                                        {stats.stocks.totalQuantity.toLocaleString()} kg
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Stock Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Distribution</CardTitle>
                            <CardDescription>Crop-wise inventory</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.stocks.byType}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry) => `${entry.cropType}: ${entry.quantity}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="quantity"
                                    >
                                        {stats.stocks.byType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Recent Financial Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Financial Activity</CardTitle>
                            <CardDescription>Last 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.reports.recent}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => new Date(value).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' })}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        labelFormatter={(value) => new Date(value).toLocaleDateString('hi-IN')}
                                    />
                                    <Legend />
                                    <Bar dataKey="credit" fill="#10b981" name="Credit" />
                                    <Bar dataKey="debit" fill="#ef4444" name="Debit" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Entities */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Top Firm Creditors */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Firms - Credit</CardTitle>
                            <CardDescription>Highest receivables from firms</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.firms.topCreditors.slice(0, 5).map((firm, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{index + 1}</Badge>
                                            <span className="text-sm font-medium">{firm.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-green-600">
                                            {formatCurrency(firm.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Kisaan Creditors */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Kisaan - Credit</CardTitle>
                            <CardDescription>Highest receivables from farmers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.kisaans.topCreditors.slice(0, 5).map((kisaan, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{index + 1}</Badge>
                                            <div>
                                                <div className="text-sm font-medium">{kisaan.name}</div>
                                                {kisaan.village && (
                                                    <div className="text-xs text-muted-foreground">{kisaan.village}</div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm font-bold text-green-600">
                                            {formatCurrency(kisaan.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
