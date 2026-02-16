import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { useGetCashflowInsights, useGetCategories } from '../../hooks/useQueries';
import { formatCurrency } from '../../utils/currency';

export default function CashflowInsightsCard() {
  const { data: insights } = useGetCashflowInsights();
  const { data: categories } = useGetCategories();

  if (!insights) {
    return null;
  }

  const healthConfig = {
    Safe: {
      label: 'Aman',
      color: 'bg-chart-2 text-white',
      icon: CheckCircle,
      progress: 100,
    },
    Warning: {
      label: 'Waspada',
      color: 'bg-yellow-500 text-white',
      icon: AlertCircle,
      progress: 60,
    },
    Overspending: {
      label: 'Boros',
      color: 'bg-destructive text-white',
      icon: AlertCircle,
      progress: 30,
    },
  };

  const health = healthConfig[insights.healthIndicator];
  const HealthIcon = health.icon;

  const largestCategoryName = insights.largestExpenseCategoryCurrentMonth
    ? categories?.find((c) => c.id === insights.largestExpenseCategoryCurrentMonth)?.name || 'Tidak diketahui'
    : 'Tidak ada';

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Analisis Cashflow Otomatis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Rata-rata Pemasukan Bulanan</p>
            <p className="text-2xl font-bold text-chart-2">
              {formatCurrency(Number(insights.averageMonthlyIncome))}
            </p>
            {insights.monthOverMonthIncomeChange !== BigInt(0) && (
              <div className="flex items-center gap-1 text-sm">
                {Number(insights.monthOverMonthIncomeChange) > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <span className="text-chart-2">+{Number(insights.monthOverMonthIncomeChange)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">{Number(insights.monthOverMonthIncomeChange)}%</span>
                  </>
                )}
                <span className="text-muted-foreground">dari bulan lalu</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Rata-rata Pengeluaran Bulanan</p>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(Number(insights.averageMonthlyExpense))}
            </p>
            {insights.monthOverMonthExpenseChange !== BigInt(0) && (
              <div className="flex items-center gap-1 text-sm">
                {Number(insights.monthOverMonthExpenseChange) > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">+{Number(insights.monthOverMonthExpenseChange)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-chart-2" />
                    <span className="text-chart-2">{Number(insights.monthOverMonthExpenseChange)}%</span>
                  </>
                )}
                <span className="text-muted-foreground">dari bulan lalu</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Kategori Pengeluaran Terbesar Bulan Ini</p>
          <p className="text-lg font-semibold">{largestCategoryName}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Prediksi Saldo Akhir Bulan</p>
          <p
            className={`text-2xl font-bold ${
              Number(insights.endOfMonthBalanceForecast) >= 0 ? 'text-chart-2' : 'text-destructive'
            }`}
          >
            {formatCurrency(Number(insights.endOfMonthBalanceForecast))}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Indikator Kesehatan Keuangan</p>
            <Badge className={health.color}>
              <HealthIcon className="h-3 w-3 mr-1" />
              {health.label}
            </Badge>
          </div>
          <Progress value={health.progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
