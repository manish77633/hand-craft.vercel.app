export const WHATSAPP_NUMBER = "919999999999"; // Replace with the business number.

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function productWhatsAppMessage(name: string, price: string, url?: string) {
  return `Hi MeeraHini! I'm interested in the ${name}, priced at ${price}.${url ? ` Product link: ${url}` : ""} Could you please share more details?`;
}
