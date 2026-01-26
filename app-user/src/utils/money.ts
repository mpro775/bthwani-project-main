const currencySymbolMap: Record<string, string> = {
  YER: "ر.ي",
  SAR: "ر.س",
  USD: "$",
};

export function formatMoney(amount: number, currency: string = "YER") {
  const sym = currencySymbolMap[currency] || currency;
  return `${Number(amount || 0).toFixed(1)} ${sym}`;
}
