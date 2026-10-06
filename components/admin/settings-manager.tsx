"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { MediaPickerDialog } from "./media-picker-dialog";
import type { MediaItem } from "./media-library";
import { responseError } from "./cms-types";
import styles from "@/app/admin/admin.module.css";

type SettingsDraft = { logo: MediaItem | null; whatsapp: string; contact: { email: string; phone: string; address: string }; defaultSeo: { title: string; description: string }; socialLinks: Array<{ platform: string; url: string }> };
const emptySettings: SettingsDraft = { logo: null, whatsapp: "", contact: { email: "", phone: "", address: "" }, defaultSeo: { title: "Ammaai — Handmade with Heart", description: "Thoughtfully crafted handmade pieces for a warmer everyday." }, socialLinks: [] };
export function SettingsManager() {
  const [draft, setDraft] = useState<SettingsDraft>(emptySettings);
  const [footer, setFooter] = useState({ description: "Thoughtfully made pieces with warmth, character, and a little more meaning for everyday living.", copyright: "Ammaai" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { void (async () => { try {
    const [settingsResponse, footerResponse] = await Promise.all([fetch("/api/site-settings", { cache: "no-store" }), fetch("/api/footer", { cache: "no-store" })]);
    if (!settingsResponse.ok) throw new Error(await responseError(settingsResponse));
    if (!footerResponse.ok) throw new Error(await responseError(footerResponse));
    const data = await settingsResponse.json(); const footerData = await footerResponse.json();
    if (data) setDraft({ ...emptySettings, ...data, contact: { ...emptySettings.contact, ...data.contact }, defaultSeo: { ...emptySettings.defaultSeo, ...data.defaultSeo } });
    if (footerData) setFooter({ description: footerData.description, copyright: footerData.copyright });
  } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load settings"); } finally { setLoading(false); } })(); }, []);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/site-settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, logo: draft.logo?._id ?? null, whatsapp: draft.whatsapp.replace(/\D/g, "") }) });
      if (!response.ok) throw new Error(await responseError(response));
      const footerResponse = await fetch("/api/footer", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(footer) });
      if (!footerResponse.ok) throw new Error(await responseError(footerResponse));
      setMessage("Settings saved. Refresh the storefront to see changes.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save settings"); } finally { setSaving(false); }
  }
  if (loading) return <p role="status">Loading settings…</p>;
  return <><form onSubmit={save} className={styles.pageEditor}>
    {message && <div role="status" className={message.startsWith("Settings saved") ? styles.successAlert : styles.alert}>{message}</div>}
    <section className={styles.seoPanel}><h2>Brand and contact</h2><p>The supplied Ammaai logo is used unless you select a different logo.</p><button type="button" className={styles.secondaryButton} onClick={() => setPicker(true)}>Choose logo</button>{draft.logo && <button type="button" className={styles.secondaryButton} onClick={() => setDraft({ ...draft, logo: null })}>Use supplied logo</button>}
      <div className={styles.formGrid}>
        <label className={styles.field}><span>WhatsApp number (country code + number)</span><input type="tel" pattern="[+0-9 ()-]{8,25}" value={draft.whatsapp} placeholder="Business WhatsApp number" onChange={e => setDraft({ ...draft, whatsapp: e.target.value })} /></label>
        <label className={styles.field}><span>Email</span><input type="email" value={draft.contact.email} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, email: e.target.value } })} /></label>
        <label className={styles.field}><span>Phone</span><input type="tel" value={draft.contact.phone} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, phone: e.target.value } })} /></label>
        <label className={`${styles.field} ${styles.fieldWide}`}><span>Studio address</span><textarea rows={3} value={draft.contact.address} onChange={e => setDraft({ ...draft, contact: { ...draft.contact, address: e.target.value } })} /></label>
      </div></section>
    <section className={styles.seoPanel}><h2>Search appearance</h2><div className={styles.formGrid}>
      <label className={styles.field}><span>Default SEO title</span><input value={draft.defaultSeo.title} onChange={e => setDraft({ ...draft, defaultSeo: { ...draft.defaultSeo, title: e.target.value } })} /></label>
      <label className={`${styles.field} ${styles.fieldWide}`}><span>Default SEO description</span><textarea rows={3} value={draft.defaultSeo.description} onChange={e => setDraft({ ...draft, defaultSeo: { ...draft.defaultSeo, description: e.target.value } })} /></label>
    </div></section>
    <section className={styles.seoPanel}><h2>Footer and social links</h2><div className={styles.formGrid}>
      <label className={`${styles.field} ${styles.fieldWide}`}><span>Footer description</span><textarea rows={3} value={footer.description} onChange={e => setFooter({ ...footer, description: e.target.value })} /></label>
      <label className={styles.field}><span>Copyright name</span><input value={footer.copyright} onChange={e => setFooter({ ...footer, copyright: e.target.value })} /></label>
      {['Instagram', 'Facebook', 'YouTube'].map(platform => <label key={platform} className={styles.field}><span>{platform} URL</span><input type="url" value={draft.socialLinks.find(s => s.platform.toLowerCase() === platform.toLowerCase())?.url ?? ""} onChange={e => setDraft({ ...draft, socialLinks: [...draft.socialLinks.filter(s => s.platform.toLowerCase() !== platform.toLowerCase()), ...(e.target.value ? [{ platform: platform.toLowerCase(), url: e.target.value }] : [])] })} /></label>)}
    </div></section>
    <div className={styles.stickySave}><span>Settings apply across the storefront.</span><button type="submit" className={styles.primaryButton} disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save settings"}</button></div>
  </form><MediaPickerDialog open={picker} title="Select logo" allowedTypes={["image"]} maxTotal={1} initialItems={draft.logo ? [draft.logo] : []} onClose={() => setPicker(false)} onConfirm={items => setDraft({ ...draft, logo: items[0] ?? null })} /></>;
}
