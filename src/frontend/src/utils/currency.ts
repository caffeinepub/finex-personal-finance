export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyInput(value: string): string {
  if (!value) return '';
  const number = parseInt(value.replace(/\D/g, ''), 10);
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('id-ID').format(number);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/\D/g, '');
  return parseInt(cleaned, 10) || 0;
}
