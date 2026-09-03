export async function sendOrderEmail(orderNumber: string, email: string) {
  console.info(`[mail:local] Order ${orderNumber} notification for ${email}`);
}
