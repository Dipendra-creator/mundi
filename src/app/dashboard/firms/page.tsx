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

interface Firm {
    _id: string
    name: string
    totalCredit: number
    totalDebit: number
    balance: number
    createdAt: string
}

export default function FirmsPage() {
    const [firms, setFirms] = useState<Firm[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newFirm, setNewFirm] = useState({ name: "" })

    useEffect(() => {
        fetchFirms()
    }, [])

    const fetchFirms = async () => {
        try {
            const response = await fetch("/api/firms")
            const data = await response.json()
            if (data.success) {
                setFirms(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch firms:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateFirm = async () => {
        try {
            const response = await fetch("/api/firms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newFirm),
            })
            const data = await response.json()
            if (data.success) {
                setFirms([...firms, data.data])
                setIsDialogOpen(false)
                setNewFirm({ name: "" })
            }
        } catch (error) {
            console.error("Failed to create firm:", error)
        }
    }

    const filteredFirms = firms.filter((firm) =>
        firm.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('hi-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const totalStats = {
        totalCredit: firms.reduce((sum, f) => sum + f.totalCredit, 0),
        totalDebit: firms.reduce((sum, f) => sum + f.totalDebit, 0),
        netBalance: firms.reduce((sum, f) => sum + f.balance, 0),
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Firms (फर्म)</h1>
                        <p className="text-muted-foreground">
                            Manage your firm accounts and transactions
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Firm
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Firm</DialogTitle>
                                <DialogDescription>
                                    Create a new firm account
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Firm Name</Label>
                                    <Input
                                        id="name"
                                        value={newFirm.name}
                                        onChange={(e) =>
                                            setNewFirm({ ...newFirm, name: e.target.value })
                                        }
                                        placeholder="Enter firm name"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateFirm}>Create Firm</Button>
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
                                Amount to receive from firms
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
                                Amount to pay to firms
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
                                Overall balance with firms
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Firms</CardTitle>
                        <CardDescription>
                            A list of all firms and their account balances
                        </CardDescription>
                        <div className="relative mt-4">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search firms..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading firms...
                            </div>
                        ) : filteredFirms.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No firms found
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Firm Name</TableHead>
                                        <TableHead className="text-right">Credit (लेने)</TableHead>
                                        <TableHead className="text-right">Debit (देने)</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFirms.map((firm) => (
                                        <TableRow key={firm._id}>
                                            <TableCell className="font-medium">{firm.name}</TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">
                                                {formatCurrency(firm.totalCredit)}
                                            </TableCell>
                                            <TableCell className="text-right text-red-600 font-medium">
                                                {formatCurrency(firm.totalDebit)}
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${firm.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(firm.balance)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={firm.balance >= 0 ? "default" : "destructive"}>
                                                    {firm.balance >= 0 ? "To Receive" : "To Pay"}
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
