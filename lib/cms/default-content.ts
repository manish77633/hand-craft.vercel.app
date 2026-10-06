export type FaqItem = { question: string; answer: string };
export type ContentItem = { title: string; description: string; url?: string; label?: string };

export const homeFaqs: FaqItem[] = [
  { question: "How do I order a product?", answer: "Open a product and tap ‘Chat on WhatsApp’ to ask about its availability and next steps." },
  { question: "Can I save products for later?", answer: "Yes. Tap the heart on a product card to add it to your wishlist. Your saved items stay in this browser." },
  { question: "Can I ask for more product details?", answer: "Yes. Send us a WhatsApp enquiry and mention the product you are interested in." },
  { question: "Do handmade items look exactly alike?", answer: "Handmade work can have small variations in texture and finish. Ask us about the specific piece before ordering." },
];
export const contactFaqs: FaqItem[] = [
  { question: "How do I enquire about a product?", answer: "Open the product page and choose Chat on WhatsApp. The product name and price are included in your draft message." },
  { question: "Can I ask about a custom request?", answer: "Yes. Use the form above, choose Custom request, and describe what you have in mind." },
  { question: "Does completing the form send a message?", answer: "The form opens a WhatsApp draft. You decide whether and when to send it." },
];
export const defaultCards: Record<string, ContentItem[]> = {
  experience: [
    { title: "Thoughtful details", description: "Explore materials, dimensions, and the story behind every piece.", url: "/collections", label: "Discover pieces" },
    { title: "Easy enquiries", description: "A conversation is just one tap away when you want to know more.", url: "/contact", label: "Get in touch" },
    { title: "Saved favourites", description: "Keep the pieces you love close and return whenever you’re ready.", url: "/wishlist", label: "View wishlist" },
  ],
  values: [
    { title: "A human touch", description: "Small differences in texture and finish are part of what makes a handmade piece feel personal." },
    { title: "Natural character", description: "We are drawn to warm materials, earthy colour, and objects that sit comfortably in everyday life." },
    { title: "Quiet beauty", description: "Useful things can also be lovely to look at, hold, and return to every day." },
  ],
  "experience-features": [
    { title: "A product caught your eye?", description: "Ask about a piece, its details, or availability before deciding.", url: "/collections", label: "Browse pieces" },
    { title: "A custom idea in mind?", description: "Tell us what you are imagining and start a conversation.", url: "/contact#contact-form", label: "Start a chat" },
    { title: "Need a little guidance?", description: "We can help you compare pieces and find one that feels right.", url: "/contact#contact-form", label: "Ask us" },
  ],
};
export function defaultFaqs(type: string) { return type === "faq" ? homeFaqs : type === "faq-list" ? contactFaqs : []; }
