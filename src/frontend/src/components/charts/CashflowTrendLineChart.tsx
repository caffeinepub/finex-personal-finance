import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTransactions } from '../../hooks/useQueries';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/currency';

interface ChartDataPoint {
  name: string;
  Cashflow: number;
}

export default function CashflowTrendLineChart() {
  const { data: transactionsData } = useGetTransactions(0, 1000);
  const transactions = transactionsData?.items || [];

  const last6Months: ChartDataPoint[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();

    const monthTransactions = transactions.filter((t) => {
      const txDate = new Date(Number(t.date) / 1_000_000);
      return txDate.getMonth() === month && txDate.getFullYear() === year;
    });

    const income = monthTransactions
      .filter((t) => t.transactionType === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = monthTransactions
      .filter((t) => t.transactionType === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    last6Months.push({
      name: date.toLocaleDateString('id-ID', { month: 'short' }),
      Cashflow: income - expense,
    });
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Tren Cashflow 6 Bulan Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={last6Months}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
            <XAxis dataKey="name" stroke="oklch(var(--muted-foreground))" />
            <YAxis stroke="oklch(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(var(--card))',
                border: '1px solid oklch(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Line
              type="monotone"
              dataKey="Cashflow"
              stroke="oklch(var(--chart-2))"
              strokeWidth={3}
              dot={{ fill: 'oklch(var(--chart-2))', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
