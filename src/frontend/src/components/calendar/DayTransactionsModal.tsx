import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '../../utils/currency';
import type { Transaction, Category } from '../../backend';

interface DayTransactionsModalProps {
  date: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  categories: Category[];
}

export default function DayTransactionsModal({
  date,
  open,
  onOpenChange,
  transactions,
  categories,
}: DayTransactionsModalProps) {
  const dayTransactions = transactions.filter((t) => {
    const txDate = new Date(Number(t.date) / 1_000_000);
    return (
      txDate.getDate() === date.getDate() &&
      txDate.getMonth() === date.getMonth() &&
      txDate.getFullYear() === date.getFullYear()
    );
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Tidak diketahui';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Transaksi {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {dayTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Tidak ada transaksi</p>
          ) : (
            dayTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
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
                  </div>
                  <p className="text-sm font-medium mt-1">{getCategoryName(transaction.categoryId)}</p>
                  <p className="text-xs text-muted-foreground truncate">{transaction.note || 'Tanpa catatan'}</p>
                </div>
                <p
                  className={`text-lg font-bold ${
                    transaction.transactionType === 'income' ? 'text-chart-2' : 'text-destructive'
                  }`}
                >
                  {transaction.transactionType === 'income' ? '+' : '-'}
                  {formatCurrency(Number(transaction.amount))}
                </p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
