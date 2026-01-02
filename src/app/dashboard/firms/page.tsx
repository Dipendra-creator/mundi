"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, Search, TrendingUp, TrendingDown, ArrowRightLeft, RotateCcw } from "lucide-react"
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

interface Firm {
    _id: string
    name: string
    totalCredit: number
    totalDebit: number
    balance: number
    createdAt: string
}

export default function FirmsPage() {
    const router = useRouter()
    const [firms, setFirms] = useState<Firm[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
    const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null)
    const [newFirm, setNewFirm] = useState({ name: "" })
    const [transaction, setTransaction] = useState({
        amount: "",
        type: "credit" as "credit" | "debit" | "payment-received" | "payment-made",
        description: ""
    })

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

    const handleAddTransaction = async () => {
        if (!selectedFirm || !transaction.amount) return

        try {
            const response = await fetch(`/api/firms/${selectedFirm._id}/transactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transaction),
            })
            const data = await response.json()
            if (data.success) {
                setFirms(firms.map(f => f._id === selectedFirm._id ? data.data : f))
                setIsTransactionDialogOpen(false)
                setTransaction({ amount: "", type: "credit", description: "" })
                setSelectedFirm(null)
            }
        } catch (error) {
            console.error("Failed to add transaction:", error)
        }
    }

    const openTransactionDialog = (firm: Firm) => {
        setSelectedFirm(firm)
        setIsTransactionDialogOpen(true)
    }

    const openResetDialog = (firm: Firm) => {
        setSelectedFirm(firm)
        setIsResetDialogOpen(true)
    }

    const handleResetTransactions = async () => {
        if (!selectedFirm) return

        try {
            const response = await fetch(`/api/firms/${selectedFirm._id}/reset`, {
                method: "DELETE",
            })
            const data = await response.json()
            if (data.success) {
                setFirms(firms.map(f => f._id === selectedFirm._id ? data.data : f))
                setIsResetDialogOpen(false)
                setSelectedFirm(null)
            }
        } catch (error) {
            console.error("Failed to reset transactions:", error)
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

                {/* Transaction Dialog */}
                <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Transaction</DialogTitle>
                            <DialogDescription>
                                Record a credit or debit transaction for {selectedFirm?.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Transaction Type</Label>
                                <select
                                    id="type"
                                    value={transaction.type}
                                    onChange={(e) =>
                                        setTransaction({ ...transaction, type: e.target.value as any })
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <optgroup label="Receivable (लेने हैं)">
                                        <option value="credit">Bill/Sale (सामान दिया) - You gave goods</option>
                                        <option value="payment-received">Payment Received (पैसा आया) - They paid you</option>
                                    </optgroup>
                                    <optgroup label="Payable (देने हैं)">
                                        <option value="debit">Bill/Purchase (सामान लिया) - You took goods</option>
                                        <option value="payment-made">Payment Given (पैसा दिया) - You paid them</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={transaction.amount}
                                    onChange={(e) =>
                                        setTransaction({ ...transaction, amount: e.target.value })
                                    }
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={transaction.description}
                                    onChange={(e) =>
                                        setTransaction({ ...transaction, description: e.target.value })
                                    }
                                    placeholder="Enter transaction details"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddTransaction}>Add Transaction</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reset Confirmation Dialog */}
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset All Transactions?</DialogTitle>
                            <DialogDescription>
                                This will permanently delete all transactions for {selectedFirm?.name} and reset the balance to ₹0. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleResetTransactions}>
                                Reset All Transactions
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFirms.map((firm) => (
                                        <TableRow key={firm._id}>
                                            <TableCell className="font-medium">
                                                <button
                                                    onClick={() => router.push(`/dashboard/firms/${firm._id}`)}
                                                    className="hover:underline text-left text-primary font-semibold"
                                                >
                                                    {firm.name}
                                                </button>
                                            </TableCell>
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
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openTransactionDialog(firm)}
                                                    >
                                                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                                                        Add Entry
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openResetDialog(firm)}
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
