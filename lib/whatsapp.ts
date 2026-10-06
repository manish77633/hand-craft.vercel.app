export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export function whatsappUrl(message: string, number = WHATSAPP_NUMBER) {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : "/contact#contact-form";
}

export function productWhatsAppMessage(name: string, price: string, url?: string) {
  return `Hi Ammaai! I'm interested in the ${name}, priced at ${price}.${url ? ` Product link: ${url}` : ""} Could you please share more details?`;
}
