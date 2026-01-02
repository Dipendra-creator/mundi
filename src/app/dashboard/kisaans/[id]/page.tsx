"use client"

import { useState, useEffect, use } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useParams, useRouter } from "next/navigation"
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
import { ArrowLeft, Pencil, Trash2, Save, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Transaction {
    _id?: string
    date: string
    amount: number
    type: string
    description: string
}

interface Kisaan {
    _id: string
    name: string
    village: string
    totalCredit: number
    totalDebit: number
    totalReceived: number
    totalPaid: number
    balance: number
    transactions: Transaction[]
}

export default function KisaanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [kisaan, setKisaan] = useState<Kisaan | null>(null)
    const [loading, setLoading] = useState(true)
    const [editingTx, setEditingTx] = useState<Transaction | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        fetchKisaanDetails()
    }, [id])

    const fetchKisaanDetails = async () => {
        try {
            const response = await fetch("/api/kisaans")
            const data = await response.json()
            if (data.success) {
                const found = data.data.find((k: Kisaan) => k._id === id)
                if (found) setKisaan(found)
            }
        } catch (error) {
            console.error("Failed to fetch kisaan:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId || !kisaan) return
        try {
            const response = await fetch(`/api/kisaans/${kisaan._id}/transactions/${deleteId}`, {
                method: "DELETE"
            })
            if (response.ok) {
                fetchKisaanDetails()
                setDeleteId(null)
            }
        } catch (error) {
            console.error("Delete failed:", error)
        }
    }

    const handleUpdate = async () => {
        if (!editingTx || !kisaan) return
        try {
            const response = await fetch(`/api/kisaans/${kisaan._id}/transactions/${editingTx._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingTx)
            })
            if (response.ok) {
                fetchKisaanDetails()
                setEditingTx(null)
            }
        } catch (error) {
            console.error("Update failed:", error)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('hi-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const getTransactionLabel = (type: string) => {
        switch (type) {
            case 'credit': return 'Bill/Sale (सामान दिया)'
            case 'debit': return 'Bill/Purchase (सामान लिया)'
            case 'payment-received': return 'Payment Received (पैसा आया)'
            case 'payment-made': return 'Payment Given (पैसा दिया)'
            default: return type
        }
    }

    if (loading) return <div className="p-8">Loading...</div>
    if (!kisaan) return <div className="p-8">Kisaan not found</div>

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{kisaan.name}</h1>
                        <p className="text-muted-foreground">Village: {kisaan.village} | Transaction History</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Total Credit (Receivable)</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(kisaan.totalCredit)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Total Received</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-green-700">{formatCurrency(kisaan.totalReceived || 0)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Total Debit (Payable)</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(kisaan.totalDebit)}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Net Balance</CardTitle></CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${kisaan.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(kisaan.balance)}
                            </div>
                            <Badge className="mt-1" variant={kisaan.balance >= 0 ? "default" : "destructive"}>
                                {kisaan.balance >= 0 ? "To Receive" : "To Pay"}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kisaan.transactions?.slice().reverse().map((tx, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {new Date(tx.date).toLocaleDateString('hi-IN')}
                                        </TableCell>
                                        <TableCell>{getTransactionLabel(tx.type)}</TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                        <TableCell className={`text-right font-medium ${['credit', 'payment-made'].includes(tx.type) ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {formatCurrency(tx.amount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setEditingTx(tx)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteId(tx._id!)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!kisaan.transactions || kisaan.transactions.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={!!editingTx} onOpenChange={(open) => !open && setEditingTx(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Transaction</DialogTitle>
                        </DialogHeader>
                        {editingTx && (
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Type</Label>
                                    <Input value={getTransactionLabel(editingTx.type)} disabled />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        value={editingTx.amount}
                                        onChange={(e) => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={editingTx.description}
                                        onChange={(e) => setEditingTx({ ...editingTx, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingTx(null)}>Cancel</Button>
                            <Button onClick={handleUpdate}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Transaction?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. The balance will be recalculated automatically.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    )
}
