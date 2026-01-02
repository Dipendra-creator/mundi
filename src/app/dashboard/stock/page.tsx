"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Package, TrendingUp, TrendingDown } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface Stock {
    _id: string
    cropType: string
    totalQuantity: number
    unit: string
    extraQuantity?: number
    createdAt: string
}

export default function StockPage() {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newStock, setNewStock] = useState({
        cropType: "",
        totalQuantity: 0,
        unit: "kg",
        extraQuantity: 0
    })

    useEffect(() => {
        fetchStocks()
    }, [])

    const fetchStocks = async () => {
        try {
            const response = await fetch("/api/stocks")
            const data = await response.json()
            if (data.success) {
                setStocks(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch stocks:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateStock = async () => {
        try {
            const response = await fetch("/api/stocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStock),
            })
            const data = await response.json()
            if (data.success) {
                setStocks([...stocks, data.data])
                setIsDialogOpen(false)
                setNewStock({ cropType: "", totalQuantity: 0, unit: "kg", extraQuantity: 0 })
            }
        } catch (error) {
            console.error("Failed to create stock:", error)
        }
    }

    const totalQuantity = stocks.reduce((sum, s) => sum + s.totalQuantity, 0)
    const totalExtra = stocks.reduce((sum, s) => sum + (s.extraQuantity || 0), 0)

    const chartData = stocks.map(s => ({
        name: s.cropType,
        value: s.totalQuantity,
    }))

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Stock (स्टॉक)</h1>
                        <p className="text-muted-foreground">
                            Manage your crop inventory and stock levels
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Stock
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Stock</DialogTitle>
                                <DialogDescription>
                                    Add a new crop to inventory
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cropType">Crop Type</Label>
                                    <Input
                                        id="cropType"
                                        value={newStock.cropType}
                                        onChange={(e) =>
                                            setNewStock({ ...newStock, cropType: e.target.value })
                                        }
                                        placeholder="e.g., गेंहू, बाजरा"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="quantity">Initial Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={newStock.totalQuantity}
                                        onChange={(e) =>
                                            setNewStock({ ...newStock, totalQuantity: parseFloat(e.target.value) || 0 })
                                        }
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="unit">Unit</Label>
                                    <select
                                        id="unit"
                                        value={newStock.unit}
                                        onChange={(e) =>
                                            setNewStock({ ...newStock, unit: e.target.value })
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="quintal">Quintal</option>
                                        <option value="ton">Ton</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="extra">Extra Quantity</Label>
                                    <Input
                                        id="extra"
                                        type="number"
                                        value={newStock.extraQuantity}
                                        onChange={(e) =>
                                            setNewStock({ ...newStock, extraQuantity: parseFloat(e.target.value) || 0 })
                                        }
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateStock}>Add Stock</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Stock Types</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stocks.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Different crop types in inventory
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Total stock in kg
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Extra Stock</CardTitle>
                            <TrendingDown className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalExtra.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                Additional stock in kg
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Stock Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Inventory</CardTitle>
                            <CardDescription>
                                Current stock levels by crop type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Loading stocks...
                                </div>
                            ) : stocks.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No stocks found
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Crop Type</TableHead>
                                            <TableHead className="text-right">Quantity</TableHead>
                                            <TableHead className="text-right">Extra</TableHead>
                                            <TableHead className="text-right">Unit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stocks.map((stock) => (
                                            <TableRow key={stock._id}>
                                                <TableCell className="font-medium">{stock.cropType}</TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {stock.totalQuantity.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">
                                                    {stock.extraQuantity?.toLocaleString() || 0}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline">{stock.unit}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stock Distribution Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Distribution</CardTitle>
                            <CardDescription>
                                Visual breakdown of stock by crop type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stocks.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry) => `${entry.name}: ${entry.value}`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                    No stock data available
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
