import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetCategories, useAddTransaction, useUpdateTransaction } from '../../hooks/useQueries';
import { parseCurrency, formatCurrencyInput } from '../../utils/currency';
import { toast } from 'sonner';
import type { Transaction, CategoryType } from '../../backend';
import { CategoryType as CategoryTypeEnum } from '../../backend';
import ReceiptPicker from '../receipts/ReceiptPicker';

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
}

export default function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionFormDialogProps) {
  const [type, setType] = useState<CategoryType>(transaction?.transactionType || CategoryTypeEnum.expense);
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || '');
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : '');
  const [date, setDate] = useState(
    transaction
      ? new Date(Number(transaction.date) / 1_000_000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState(transaction?.note || '');
  const [receiptId, setReceiptId] = useState(transaction?.receiptId || '');

  const { data: categories } = useGetCategories();
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();

  const filteredCategories = categories?.filter((c) => c.categoryType === type) || [];

  useEffect(() => {
    if (filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      toast.error('Pilih kategori terlebih dahulu');
      return;
    }

    const parsedAmount = parseCurrency(amount);
    if (parsedAmount <= 0) {
      toast.error('Nominal harus lebih dari 0');
      return;
    }

    const transactionData: Transaction = {
      id: transaction?.id || `tx-${Date.now()}`,
      transactionType: type,
      categoryId,
      amount: BigInt(parsedAmount),
      date: BigInt(new Date(date).getTime() * 1_000_000),
      note,
      receiptId: receiptId || undefined,
    };

    try {
      if (transaction) {
        await updateTransaction.mutateAsync(transactionData);
        toast.success('Transaksi berhasil diperbarui');
      } else {
        await addTransaction.mutateAsync(transactionData);
        toast.success('Transaksi berhasil ditambahkan');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Gagal menyimpan transaksi');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Jenis Transaksi</Label>
            <Select value={type} onValueChange={(v: CategoryType) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CategoryTypeEnum.income}>Pemasukan</SelectItem>
                <SelectItem value={CategoryTypeEnum.expense}>Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nominal</Label>
            <Input
              type="text"
              value={formatCurrencyInput(amount)}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambahkan catatan (opsional)"
              rows={3}
            />
          </div>

          <ReceiptPicker receiptId={receiptId} onReceiptIdChange={setReceiptId} />

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={addTransaction.isPending || updateTransaction.isPending}
            >
              {addTransaction.isPending || updateTransaction.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
