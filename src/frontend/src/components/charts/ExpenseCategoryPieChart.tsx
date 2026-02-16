import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTransactions, useGetCategories } from '../../hooks/useQueries';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/currency';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function ExpenseCategoryPieChart() {
  const { data: transactionsData } = useGetTransactions(0, 1000);
  const { data: categories } = useGetCategories();
  const transactions = transactionsData?.items || [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = transactions.filter((t) => {
    const txDate = new Date(Number(t.date) / 1_000_000);
    return (
      t.transactionType === 'expense' &&
      txDate.getMonth() === currentMonth &&
      txDate.getFullYear() === currentYear
    );
  });

  const categoryTotals = new Map<string, number>();
  currentMonthExpenses.forEach((t) => {
    const current = categoryTotals.get(t.categoryId) || 0;
    categoryTotals.set(t.categoryId, current + Number(t.amount));
  });

  const data = Array.from(categoryTotals.entries())
    .map(([categoryId, value]) => ({
      name: categories?.find((c) => c.id === categoryId)?.name || 'Lainnya',
      value,
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Distribusi Kategori Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Belum ada data pengeluaran bulan ini</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Distribusi Kategori Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
