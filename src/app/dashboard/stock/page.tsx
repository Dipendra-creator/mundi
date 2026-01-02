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
    variety?: string
    quantityBags: number
    quantityKg: number
    totalQuantity?: number // Legacy or calculated
    unit?: string
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
    const [showBagsInChart, setShowBagsInChart] = useState(false)

    const [newStock, setNewStock] = useState({
        cropType: "",
        variety: "",
        quantityBags: "",
        quantityKg: "",
    })

    const [movement, setMovement] = useState({
        quantityBags: "",
        quantityKg: "",
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
                body: JSON.stringify(newStock),
            })
            const data = await response.json()
            if (data.success) {
                setStocks([...stocks, data.data])
                setIsDialogOpen(false)
                setNewStock({ cropType: "", variety: "", quantityBags: "", quantityKg: "" })
            }
        } catch (error) {
            console.error("Failed to create stock:", error)
        }
    }

    const handleAddMovement = async () => {
        if (!selectedStock) return

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
                setMovement({ quantityBags: "", quantityKg: "", type: "increase", description: "" })
                setSelectedStock(null)
            } else {
                alert(data.error)
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

    const totalBags = stocks.reduce((sum, s) => sum + (s.quantityBags || 0), 0)
    const totalKg = stocks.reduce((sum, s) => sum + (s.quantityKg || 0), 0)

    const chartData = stocks.map(s => ({
        name: s.cropType,
        value: showBagsInChart ? (s.quantityBags || 0) : (s.quantityKg || 0)
    })).filter(item => item.value > 0)

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Stock (स्टॉक)</h1>
                        <p className="text-muted-foreground">
                            Manage your inventory with Bags and KG
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
                                    <Label>Crop Name</Label>
                                    <Input
                                        value={newStock.cropType}
                                        onChange={(e) => setNewStock({ ...newStock, cropType: e.target.value })}
                                        placeholder="e.g. Potato, Onion"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Variety (Optional)</Label>
                                    <Input
                                        value={newStock.variety}
                                        onChange={(e) => setNewStock({ ...newStock, variety: e.target.value })}
                                        placeholder="e.g. Desi, Hybrid"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Initial Bags</Label>
                                        <Input
                                            type="number"
                                            value={newStock.quantityBags}
                                            onChange={(e) => setNewStock({ ...newStock, quantityBags: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Initial Loose Kg</Label>
                                        <Input
                                            type="number"
                                            value={newStock.quantityKg}
                                            onChange={(e) => setNewStock({ ...newStock, quantityKg: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateStock}>Create Stock</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Movement Dialog */}
                <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Stock Logic</DialogTitle>
                            <DialogDescription>
                                Add or remove Bags/Kg for {selectedStock?.cropType}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Action</Label>
                                <select
                                    value={movement.type}
                                    onChange={(e) => setMovement({ ...movement, type: e.target.value as any })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="increase">Add Stock (+)</option>
                                    <option value="decrease">Remove Stock (-)</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Bags</Label>
                                    <Input
                                        type="number"
                                        value={movement.quantityBags}
                                        onChange={(e) => setMovement({ ...movement, quantityBags: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Loose Kg</Label>
                                    <Input
                                        type="number"
                                        value={movement.quantityKg}
                                        onChange={(e) => setMovement({ ...movement, quantityKg: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={movement.description}
                                    onChange={(e) => setMovement({ ...movement, description: e.target.value })}
                                    placeholder="Details..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddMovement}>Confirm Update</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reset Dialog */}
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Stock?</DialogTitle>
                            <DialogDescription>Permanently reset quantity to 0.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleResetStock}>Reset</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Stock Distribution ({showBagsInChart ? 'Bags' : 'Kg'})</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant={showBagsInChart ? "secondary" : "ghost"} size="sm" onClick={() => setShowBagsInChart(true)}>Bags</Button>
                                    <Button variant={!showBagsInChart ? "secondary" : "ghost"} size="sm" onClick={() => setShowBagsInChart(false)}>Kg</Button>
                                </div>
                            </div>
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
                                            <Tooltip formatter={(value: any) => `${value} ${showBagsInChart ? 'Bags' : 'Kg'}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">No data</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Total Inventory</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Total Bags</span>
                                    </div>
                                    <span className="text-2xl font-bold">{totalBags} Bags</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Total Loose Kg</span>
                                    </div>
                                    <span className="text-2xl font-bold">{totalKg.toFixed(2)} Kg</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div >

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory List</CardTitle>
                        <div className="relative mt-4">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Crop Name</TableHead>
                                    <TableHead>Variety</TableHead>
                                    <TableHead className="text-right">Bags (Count)</TableHead>
                                    <TableHead className="text-right">Loose Kg</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStocks.map((stock) => (
                                    <TableRow key={stock._id}>
                                        <TableCell className="font-medium">{stock.cropType}</TableCell>
                                        <TableCell>{stock.variety || '-'}</TableCell>
                                        <TableCell className="text-right text-xl font-bold">{stock.quantityBags || 0}</TableCell>
                                        <TableCell className="text-right font-medium">{stock.quantityKg || 0} kg</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="outline" size="sm" onClick={() => openMovementDialog(stock)}>
                                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                    Add / Remove
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => openResetDialog(stock)} className="text-destructive">
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredStocks.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No stocks found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div >
        </DashboardLayout >
    )
}
