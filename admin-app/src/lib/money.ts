export function money(cents: number, currency = "USD") {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency }).format(cents / 100);
}
