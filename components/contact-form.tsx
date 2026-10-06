"use client";

import type { FormEvent } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";
import { useStoreSettings } from "./store-settings-provider";
import { useState } from "react";

export function ContactForm() {
  const settings = useStoreSettings();
  const [feedback, setFeedback] = useState("");
  function openWhatsApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const topic = String(data.get("topic") ?? "Product enquiry");
    const message = String(data.get("message") ?? "").trim();
    const draft = `Hi Ammaai!${name ? ` I'm ${name}.` : ""} I have a ${topic.toLowerCase()}. ${message}`;
    if (settings?.whatsapp) window.open(whatsappUrl(draft, settings.whatsapp), "_blank", "noopener,noreferrer");
    else if (settings?.contact.email) window.location.href = `mailto:${settings.contact.email}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(draft)}`;
    else setFeedback("Our contact details will be available soon. Please check back shortly.");
  }

  return <form id="contact-form" onSubmit={openWhatsApp} className="contact-form grid gap-5">
    {feedback && <p role="status" className="rounded-xl border border-line bg-ivory p-4 text-sm">{feedback}</p>}
    <div className="grid gap-2"><label htmlFor="contact-name" className="text-[12px] font-semibold">Your name</label><input id="contact-name" name="name" autoComplete="name" placeholder="How should we address you?" className="h-12 rounded-xl border border-line bg-ivory px-4 text-[13px] outline-none focus:border-forest" /></div>
    <div className="grid gap-2"><label htmlFor="contact-topic" className="text-[12px] font-semibold">What is this about?</label><select id="contact-topic" name="topic" className="h-12 rounded-xl border border-line bg-ivory px-4 text-[13px] outline-none focus:border-forest"><option>Product enquiry</option><option>Custom request</option><option>Product care question</option><option>Other question</option></select></div>
    <div className="grid gap-2"><label htmlFor="contact-message" className="text-[12px] font-semibold">Your message</label><textarea id="contact-message" name="message" required minLength={5} rows={5} placeholder="Tell us what you’d like to know..." className="resize-y rounded-xl border border-line bg-ivory p-4 text-[13px] outline-none focus:border-forest" /></div>
    <button type="submit" className="contact-submit inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[12px] font-semibold transition md:text-sm"><MessageCircle size={18} /> {settings?.whatsapp ? "Continue on WhatsApp" : settings?.contact.email ? "Continue by email" : "Contact us"} <ArrowUpRight size={16} /></button>
    <p className="text-[11px] leading-5 text-muted">{settings?.whatsapp ? "A draft opens in WhatsApp. You choose whether to send it." : settings?.contact.email ? "A draft opens in your email app. You choose whether to send it." : "Business contact details will be available soon."}</p>
  </form>;
}
