"use client";

import type { FormEvent } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

export function ContactForm() {
  function openWhatsApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const topic = String(data.get("topic") ?? "Product enquiry");
    const message = String(data.get("message") ?? "").trim();
    const draft = `Hi MeeraHini!${name ? ` I'm ${name}.` : ""} I have a ${topic.toLowerCase()}. ${message}`;
    window.open(whatsappUrl(draft), "_blank", "noopener,noreferrer");
  }

  return <form onSubmit={openWhatsApp} className="contact-form grid gap-5">
    <div className="grid gap-2"><label htmlFor="contact-name" className="text-[12px] font-semibold">Your name</label><input id="contact-name" name="name" autoComplete="name" placeholder="How should we address you?" className="h-12 rounded-xl border border-line bg-ivory px-4 text-[13px] outline-none focus:border-forest" /></div>
    <div className="grid gap-2"><label htmlFor="contact-topic" className="text-[12px] font-semibold">What is this about?</label><select id="contact-topic" name="topic" className="h-12 rounded-xl border border-line bg-ivory px-4 text-[13px] outline-none focus:border-forest"><option>Product enquiry</option><option>Custom request</option><option>Product care question</option><option>Other question</option></select></div>
    <div className="grid gap-2"><label htmlFor="contact-message" className="text-[12px] font-semibold">Your message</label><textarea id="contact-message" name="message" required minLength={5} rows={5} placeholder="Tell us what you’d like to know..." className="resize-y rounded-xl border border-line bg-ivory p-4 text-[13px] outline-none focus:border-forest" /></div>
    <button type="submit" className="contact-submit inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[12px] font-semibold transition md:text-sm"><MessageCircle size={18} /> Continue on WhatsApp <ArrowUpRight size={16} /></button>
    <p className="text-[11px] leading-5 text-muted">A draft opens in WhatsApp. You choose whether to send it.</p>
  </form>;
}
