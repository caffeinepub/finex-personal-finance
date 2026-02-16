import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useGetTransactions, useGetCategories, useDeleteTransaction } from '../hooks/useQueries';
import { formatCurrency } from '../utils/currency';
import TransactionFormDialog from '../components/transactions/TransactionFormDialog';
import ReceiptThumbnail from '../components/transactions/ReceiptThumbnail';
import { toast } from 'sonner';
import type { Transaction } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TransactionsPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'largest' | 'smallest'>('newest');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: transactionsData } = useGetTransactions(0, 1000);
  const { data: categories } = useGetCategories();
  const deleteTransaction = useDeleteTransaction();

  let transactions = transactionsData?.items || [];

  if (searchTerm) {
    transactions = transactions.filter(
      (t) =>
        t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categories?.find((c) => c.id === t.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (filterType !== 'all') {
    transactions = transactions.filter((t) => t.transactionType === filterType);
  }

  transactions = [...transactions].sort((a, b) => {
    if (sortBy === 'newest') {
      return Number(b.date) - Number(a.date);
    } else if (sortBy === 'largest') {
      return Number(b.amount) - Number(a.amount);
    } else {
      return Number(a.amount) - Number(b.amount);
    }
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction.mutateAsync(id);
      toast.success('Transaksi berhasil dihapus');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Gagal menghapus transaksi');
      console.error(error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c) => c.id === categoryId)?.name || 'Tidak diketahui';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground mt-1">Kelola pemasukan dan pengeluaran Anda</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="largest">Terbesar</SelectItem>
                <SelectItem value="smallest">Terkecil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>Belum ada transaksi</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-4 hover:bg-accent/5 transition-colors"
                >
                  {transaction.receiptId && (
                    <ReceiptThumbnail receiptId={transaction.receiptId} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          transaction.transactionType === 'income'
                            ? 'bg-chart-2/10 text-chart-2'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {transaction.transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getCategoryName(transaction.categoryId)}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1 truncate">{transaction.note || 'Tanpa catatan'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(Number(transaction.date) / 1_000_000).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.transactionType === 'income' ? 'text-chart-2' : 'text-destructive'
                      }`}
                    >
                      {transaction.transactionType === 'income' ? '+' : '-'}
                      {formatCurrency(Number(transaction.amount))}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddDialog && (
        <TransactionFormDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      )}

      {editingTransaction && (
        <TransactionFormDialog
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          transaction={editingTransaction}
        />
      )}

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
