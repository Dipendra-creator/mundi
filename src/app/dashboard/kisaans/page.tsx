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
import { Plus, Search, TrendingUp, TrendingDown } from "lucide-react"
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

interface Kisaan {
    _id: string
    name: string
    village?: string
    totalCredit: number
    totalDebit: number
    balance: number
    createdAt: string
}

export default function KisaansPage() {
    const [kisaans, setKisaans] = useState<Kisaan[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newKisaan, setNewKisaan] = useState({ name: "", village: "" })

    useEffect(() => {
        fetchKisaans()
    }, [])

    const fetchKisaans = async () => {
        try {
            const response = await fetch("/api/kisaans")
            const data = await response.json()
            if (data.success) {
                setKisaans(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch kisaans:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateKisaan = async () => {
        try {
            const response = await fetch("/api/kisaans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newKisaan),
            })
            const data = await response.json()
            if (data.success) {
                setKisaans([...kisaans, data.data])
                setIsDialogOpen(false)
                setNewKisaan({ name: "", village: "" })
            }
        } catch (error) {
            console.error("Failed to create kisaan:", error)
        }
    }

    const filteredKisaans = kisaans.filter((kisaan) =>
        kisaan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (kisaan.village && kisaan.village.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('hi-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const totalStats = {
        totalCredit: kisaans.reduce((sum, k) => sum + k.totalCredit, 0),
        totalDebit: kisaans.reduce((sum, k) => sum + k.totalDebit, 0),
        netBalance: kisaans.reduce((sum, k) => sum + k.balance, 0),
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kisaan (किसान)</h1>
                        <p className="text-muted-foreground">
                            Manage your farmer accounts and transactions
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Kisaan
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Kisaan</DialogTitle>
                                <DialogDescription>
                                    Create a new farmer account
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Kisaan Name</Label>
                                    <Input
                                        id="name"
                                        value={newKisaan.name}
                                        onChange={(e) =>
                                            setNewKisaan({ ...newKisaan, name: e.target.value })
                                        }
                                        placeholder="Enter kisaan name"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="village">Village</Label>
                                    <Input
                                        id="village"
                                        value={newKisaan.village}
                                        onChange={(e) =>
                                            setNewKisaan({ ...newKisaan, village: e.target.value })
                                        }
                                        placeholder="Enter village name"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateKisaan}>Create Kisaan</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Credit (लेने)</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(totalStats.totalCredit)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Amount to receive from farmers
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Debit (देने)</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {formatCurrency(totalStats.totalDebit)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Amount to pay to farmers
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                            <Badge variant={totalStats.netBalance >= 0 ? "default" : "destructive"}>
                                {totalStats.netBalance >= 0 ? "Positive" : "Negative"}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${totalStats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(totalStats.netBalance)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Overall balance with farmers
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Kisaan</CardTitle>
                        <CardDescription>
                            A list of all farmers and their account balances
                        </CardDescription>
                        <div className="relative mt-4">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or village..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading kisaans...
                            </div>
                        ) : filteredKisaans.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No kisaans found
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Village</TableHead>
                                        <TableHead className="text-right">Credit (लेने)</TableHead>
                                        <TableHead className="text-right">Debit (देने)</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredKisaans.map((kisaan) => (
                                        <TableRow key={kisaan._id}>
                                            <TableCell className="font-medium">{kisaan.name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {kisaan.village || '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">
                                                {formatCurrency(kisaan.totalCredit)}
                                            </TableCell>
                                            <TableCell className="text-right text-red-600 font-medium">
                                                {formatCurrency(kisaan.totalDebit)}
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${kisaan.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(kisaan.balance)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={kisaan.balance >= 0 ? "default" : "destructive"}>
                                                    {kisaan.balance >= 0 ? "To Receive" : "To Pay"}
                                                </Badge>
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
