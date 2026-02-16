import { useState, ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetTransactions, useGetCategories } from '../hooks/useQueries';
import { formatCurrency } from '../utils/currency';
import DayTransactionsModal from '../components/calendar/DayTransactionsModal';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: transactionsData } = useGetTransactions(0, 1000);
  const { data: categories } = useGetCategories();

  const transactions = transactionsData?.items || [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDayData = (day: number) => {
    const dayTransactions = transactions.filter((t) => {
      const txDate = new Date(Number(t.date) / 1_000_000);
      return (
        txDate.getDate() === day &&
        txDate.getMonth() === month &&
        txDate.getFullYear() === year
      );
    });

    const income = dayTransactions
      .filter((t) => t.transactionType === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = dayTransactions
      .filter((t) => t.transactionType === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { income, expense, transactions: dayTransactions };
  };

  const monthTransactions = transactions.filter((t) => {
    const txDate = new Date(Number(t.date) / 1_000_000);
    return txDate.getMonth() === month && txDate.getFullYear() === year;
  });

  const monthlyIncome = monthTransactions
    .filter((t) => t.transactionType === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpense = monthTransactions
    .filter((t) => t.transactionType === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const days: ReactElement[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const { income, expense } = getDayData(day);
    const isDominantIncome = income > expense;
    const isDominantExpense = expense > income;
    const hasTransactions = income > 0 || expense > 0;

    days.push(
      <button
        key={day}
        onClick={() => setSelectedDate(new Date(year, month, day))}
        className={`aspect-square rounded-lg border p-2 text-left transition-all hover:shadow-md ${
          hasTransactions
            ? isDominantIncome
              ? 'border-chart-2/50 bg-chart-2/5 hover:bg-chart-2/10'
              : isDominantExpense
              ? 'border-destructive/50 bg-destructive/5 hover:bg-destructive/10'
              : 'border-border bg-card hover:bg-accent/5'
            : 'border-border bg-card hover:bg-accent/5'
        }`}
      >
        <div className="text-sm font-medium">{day}</div>
        {hasTransactions && (
          <div className="mt-1 space-y-0.5 text-xs">
            {income > 0 && (
              <div className="text-chart-2 truncate">+{formatCurrency(income)}</div>
            )}
            {expense > 0 && (
              <div className="text-destructive truncate">-{formatCurrency(expense)}</div>
            )}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kalender Transaksi</h1>
        <p className="text-muted-foreground mt-1">Lihat transaksi berdasarkan tanggal</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{formatCurrency(monthlyIncome)}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(monthlyExpense)}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                monthlyIncome - monthlyExpense >= 0 ? 'text-chart-2' : 'text-destructive'
              }`}
            >
              {formatCurrency(monthlyIncome - monthlyExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {days}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <DayTransactionsModal
          date={selectedDate}
          open={!!selectedDate}
          onOpenChange={(open) => !open && setSelectedDate(null)}
          transactions={transactions}
          categories={categories || []}
        />
      )}
    </div>
  );
}
