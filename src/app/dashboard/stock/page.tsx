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
import { Plus, Search, Package, ArrowRightLeft, RotateCcw } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface Stock {
    _id: string
    cropType: string
    totalQuantity: number
    unit: string
    extraQuantity?: number
    updatedAt: string
}

export default function StockPage() {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

    const [newStock, setNewStock] = useState({
        cropType: "",
        totalQuantity: "",
        unit: "kg"
    })

    const [movement, setMovement] = useState({
        quantity: "",
        type: "increase" as "increase" | "decrease",
        description: ""
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
                body: JSON.stringify({
                    ...newStock,
                    totalQuantity: parseFloat(newStock.totalQuantity)
                }),
            })
            const data = await response.json()
            if (data.success) {
                setStocks([...stocks, data.data])
                setIsDialogOpen(false)
                setNewStock({ cropType: "", totalQuantity: "", unit: "kg" })
            }
        } catch (error) {
            console.error("Failed to create stock:", error)
        }
    }

    const handleAddMovement = async () => {
        if (!selectedStock || !movement.quantity) return

        try {
            const response = await fetch(`/api/stocks/${selectedStock._id}/movements`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(movement),
            })
            const data = await response.json()
            if (data.success) {
                setStocks(stocks.map(s => s._id === selectedStock._id ? data.data : s))
                setIsMovementDialogOpen(false)
                setMovement({ quantity: "", type: "increase", description: "" })
                setSelectedStock(null)
            } else {
                alert(data.error) // Add data.error check from API
            }
        } catch (error) {
            console.error("Failed to add movement:", error)
        }
    }

    const handleResetStock = async () => {
        if (!selectedStock) return

        try {
            const response = await fetch(`/api/stocks/${selectedStock._id}/reset`, {
                method: "DELETE",
            })
            const data = await response.json()
            if (data.success) {
                setStocks(stocks.map(s => s._id === selectedStock._id ? data.data : s))
                setIsResetDialogOpen(false)
                setSelectedStock(null)
            }
        } catch (error) {
            console.error("Failed to reset stock:", error)
        }
    }

    const openMovementDialog = (stock: Stock) => {
        setSelectedStock(stock)
        setIsMovementDialogOpen(true)
    }

    const openResetDialog = (stock: Stock) => {
        setSelectedStock(stock)
        setIsResetDialogOpen(true)
    }

    const filteredStocks = stocks.filter((stock) =>
        stock.cropType.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalQuantity = stocks.reduce((sum, s) => sum + s.totalQuantity, 0)

    const chartData = stocks.map(s => ({
        name: s.cropType,
        value: s.totalQuantity
    })).filter(item => item.value > 0)

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Stock (स्टॉक)</h1>
                        <p className="text-muted-foreground">
                            Manage your inventory and stock movements
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Stock
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Stock Item</DialogTitle>
                                <DialogDescription>
                                    Create a new stock item to track
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
                                        placeholder="e.g. Wheat, Rice"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="quantity">Initial Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={newStock.totalQuantity}
                                        onChange={(e) =>
                                            setNewStock({ ...newStock, totalQuantity: e.target.value })
                                        }
                                        placeholder="Enter quantity"
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
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateStock}>Create Stock</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Movement Dialog */}
                <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Stock</DialogTitle>
                            <DialogDescription>
                                Record stock movement for {selectedStock?.cropType}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Movement Type</Label>
                                <select
                                    id="type"
                                    value={movement.type}
                                    onChange={(e) =>
                                        setMovement({ ...movement, type: e.target.value as "increase" | "decrease" })
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="increase">Increase (+)</option>
                                    <option value="decrease">Decrease (-)</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="movement-quantity">Quantity ({selectedStock?.unit})</Label>
                                <Input
                                    id="movement-quantity"
                                    type="number"
                                    value={movement.quantity}
                                    onChange={(e) =>
                                        setMovement({ ...movement, quantity: e.target.value })
                                    }
                                    placeholder="Enter quantity"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={movement.description}
                                    onChange={(e) =>
                                        setMovement({ ...movement, description: e.target.value })
                                    }
                                    placeholder="Enter movement details"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddMovement}>Update Stock</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reset Confirmation Dialog */}
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Stock Quantity?</DialogTitle>
                            <DialogDescription>
                                This will permanently delete all movements for {selectedStock?.cropType} and reset the quantity to 0. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleResetStock}>
                                Reset Stock
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Stock Overview</CardTitle>
                            <CardDescription>Distribution of inventory by crop type</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value} kg`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        No stock data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Stock Summary</CardTitle>
                            <CardDescription>
                                Quick stats about your inventory
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Total Quantity</span>
                                    </div>
                                    <span className="text-2xl font-bold">{totalQuantity.toLocaleString()} kg</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-4">
                                    <span className="font-medium">Total Items</span>
                                    <span className="text-xl font-bold">{stocks.length}</span>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-sm font-medium text-muted-foreground">Low Stock Alerts</span>
                                    {stocks.filter(s => s.totalQuantity < 100).length === 0 ? (
                                        <div className="text-sm text-green-600">All stock levels are sufficient</div>
                                    ) : (
                                        stocks.filter(s => s.totalQuantity < 100).map(s => (
                                            <div key={s._id} className="flex justify-between text-sm items-center text-red-600">
                                                <span>{s.cropType}</span>
                                                <span>{s.totalQuantity} {s.unit}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory List</CardTitle>
                        <CardDescription>
                            Detailed view of all stock items
                        </CardDescription>
                        <div className="relative mt-4">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search crops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading inventory...
                            </div>
                        ) : filteredStocks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No crops found
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Crop Type</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Unit</TableHead>
                                        <TableHead className="text-right">Last Updated</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStocks.map((stock) => (
                                        <TableRow key={stock._id}>
                                            <TableCell className="font-medium">{stock.cropType}</TableCell>
                                            <TableCell className="text-right text-xl font-bold">
                                                {stock.totalQuantity}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {stock.unit}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {stock.updatedAt
                                                    ? new Date(stock.updatedAt).toLocaleDateString()
                                                    : new Date().toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openMovementDialog(stock)}
                                                    >
                                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                        Update
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openResetDialog(stock)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
