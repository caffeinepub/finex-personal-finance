import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import { useGetTransactions, useGetCashflowInsights } from '../hooks/useQueries';
import { formatCurrency } from '../utils/currency';
import { useState } from 'react';
import TransactionFormDialog from '../components/transactions/TransactionFormDialog';
import IncomeExpenseBarChart from '../components/charts/IncomeExpenseBarChart';
import ExpenseCategoryPieChart from '../components/charts/ExpenseCategoryPieChart';
import CashflowTrendLineChart from '../components/charts/CashflowTrendLineChart';
import CashflowInsightsCard from '../components/analytics/CashflowInsightsCard';

export default function DashboardPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: transactionsData } = useGetTransactions(0, 1000);
  const { data: insights } = useGetCashflowInsights();

  const transactions = transactionsData?.items || [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter((t) => {
    const txDate = new Date(Number(t.date) / 1_000_000);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter((t) => t.transactionType === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = currentMonthTransactions
    .filter((t) => t.transactionType === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;
  const isOverspending = totalExpense > totalIncome;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Ringkasan keuangan Anda</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Transaksi
        </Button>
      </div>

      {isOverspending && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Pengeluaran bulan ini melebihi pemasukan. Pertimbangkan untuk mengurangi pengeluaran.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Saat Ini</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cashflow Bersih</CardTitle>
            <TrendingUp className={`h-4 w-4 ${balance >= 0 ? 'text-chart-2' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Selisih bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <CashflowInsightsCard />

      <div className="grid gap-6 md:grid-cols-2">
        <IncomeExpenseBarChart />
        <ExpenseCategoryPieChart />
      </div>

      <CashflowTrendLineChart />

      {showAddDialog && (
        <TransactionFormDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      )}
    </div>
  );
}
