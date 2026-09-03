export const FREE_SHIPPING_THRESHOLD = 150000;
export const FLAT_SHIPPING = 9900;

export function calculateTotals(lines: { unitPrice: number; quantity: number }[]) {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  return { subtotal, shipping, tax: 0, total: subtotal + shipping };
}
