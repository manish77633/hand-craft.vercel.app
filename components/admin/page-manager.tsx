"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Eye, EyeOff, LoaderCircle, Plus, Save, Trash2, X } from "lucide-react";
import { CMS_PAGES, type CmsPageDefinition } from "./page-definitions";
import { MediaPickerDialog } from "./media-picker-dialog";
import { ReferencePickerDialog, type ReferenceOption } from "./reference-picker-dialog";
import type { MediaItem } from "./media-library";
import { adminRequest, fetchAllRecords, responseError, type CategoryItem, type ProductItem } from "./cms-types";
import styles from "@/app/admin/admin.module.css";
import { defaultCards, defaultFaqs, type FaqItem, type ContentItem } from "@/lib/cms/default-content";
import type { ProductSource } from "@/lib/cms/product-selection";
import { SectionProducts, sectionProductIds } from "./section-products";
import { SortHandle, moveItem } from "./sort-handle";
import { PageProductEditor } from "./page-product-editor";

type RawReference = string | { _id: string };
type RawSection = { _id: string; type: string; heading?: string; subheading?: string; description?: string; faqs?: FaqItem[]; items?: ContentItem[]; media?: RawReference[]; button?: { label?: string; url?: string } | null; products?: RawReference[]; productSource?: ProductSource; categories?: RawReference[]; visible?: boolean; order?: number };
type PageRecord = { _id: string; title: string; slug: string; status: string; seoTitle?: string; seoDescription?: string; sections: RawSection[] };
type SectionDraft = { key: string; _id?: string; type: string; heading: string; subheading: string; description: string; faqs: FaqItem[]; items: ContentItem[]; media: MediaItem[]; buttonLabel: string; buttonUrl: string; productIds: string[]; productSource: ProductSource; categoryIds: string[]; visible: boolean };
type PageDraft = { _id?: string; title: string; slug: string; seoTitle: string; seoDescription: string; sections: SectionDraft[] };

function referenceId(reference: RawReference | null) { return typeof reference === "string" ? reference : reference?._id ?? ""; }
function blankSection(type: string): SectionDraft { return { key: crypto.randomUUID(), type, heading: "", subheading: "", description: "", faqs: defaultFaqs(type), items: defaultCards[type] ?? [], media: [], buttonLabel: "", buttonUrl: "", productIds: [], productSource: "automatic", categoryIds: [], visible: type !== "cta" }; }

export function PageManager({ initialSlug }: { initialSlug?: string } = {}) {
  const [definition, setDefinition] = useState<CmsPageDefinition | null>(null);
  const [draft, setDraft] = useState<PageDraft | null>(null);
  const [originalSectionIds, setOriginalSectionIds] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [mediaIndex, setMediaIndex] = useState<number | null>(null);
  const [referencePicker, setReferencePicker] = useState<{ kind: "products" | "categories"; index: number } | null>(null);
  const [newSectionType, setNewSectionType] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const openedInitialPage = useRef(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [productChanges, setProductChanges] = useState<Record<string, ProductItem>>({});

  async function openPage(pageDefinition: CmsPageDefinition) {
    setProductChanges({});
    setDefinition(pageDefinition);
    setLoading(true);
    setMessage(null);
    try {
      const [pageResponse, mediaResponse, productResponse, categoryResponse] = await Promise.all([
        adminRequest(`/api/pages/${pageDefinition.slug}`, { cache: "no-store" }),
        fetchAllRecords("/api/media?limit=100", { cache: "no-store" }),
        fetchAllRecords("/api/products?limit=100", { cache: "no-store" }),
        fetchAllRecords("/api/categories?limit=100", { cache: "no-store" }),
      ]);
      if (!mediaResponse.ok) throw new Error(await responseError(mediaResponse));
      if (!productResponse.ok) throw new Error(await responseError(productResponse));
      if (!categoryResponse.ok) throw new Error(await responseError(categoryResponse));
      const mediaItems = (await mediaResponse.json() as { items: MediaItem[] }).items;
      const productItems = (await productResponse.json() as { items: ProductItem[] }).items;
      const categoryItems = (await categoryResponse.json() as { items: CategoryItem[] }).items;
      setProducts(productItems);
      setCategories(categoryItems);
      const mediaById = new Map(mediaItems.map(item => [item._id, item]));

      if (pageResponse.status === 404) {
        setOriginalSectionIds([]);
        setDraft({ title: pageDefinition.title, slug: pageDefinition.slug, seoTitle: "", seoDescription: "", sections: pageDefinition.sectionTypes.map(item => blankSection(item.type)) });
      } else {
        if (!pageResponse.ok) throw new Error(await responseError(pageResponse));
        const page = await pageResponse.json() as PageRecord;
        const sections: SectionDraft[] = [...(page.sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(section => ({
          key: section._id,
          _id: section._id,
          type: section.type,
          heading: section.heading ?? "",
          subheading: section.subheading ?? "",
          description: section.description ?? "",
          faqs: section.faqs ?? defaultFaqs(section.type),
          items: section.items ?? defaultCards[section.type] ?? [],
          media: (section.media ?? []).map(referenceId).map(id => mediaById.get(id)).filter(Boolean) as MediaItem[],
          buttonLabel: section.button?.label ?? "",
          buttonUrl: section.button?.url ?? "",
          productIds: (section.products ?? []).map(referenceId).filter(Boolean),
          productSource: section.productSource ?? "automatic",
          categoryIds: (section.categories ?? []).map(referenceId).filter(Boolean),
          visible: section.visible ?? true,
        }));
        if (pageDefinition.slug === "home" && !sections.some(section => section.type === "made-in-motion")) sections.splice(Math.min(3, sections.length), 0, blankSection("made-in-motion"));
        setOriginalSectionIds(sections.map(section => section._id).filter(Boolean) as string[]);
        setDraft({ _id: page._id, title: page.title, slug: page.slug, seoTitle: page.seoTitle ?? "", seoDescription: page.seoDescription ?? "", sections });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load the page editor.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (!initialSlug || openedInitialPage.current) return;
    const initialPage = CMS_PAGES.find(page => page.slug === initialSlug);
    if (!initialPage) return;
    openedInitialPage.current = true;
    queueMicrotask(() => void openPage(initialPage));
  }, [initialSlug]);

  function updateSection(index: number, update: Partial<SectionDraft>) {
    setDraft(current => current ? { ...current, sections: current.sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...update } : section) } : current);
  }

  function moveSection(index: number, direction: -1 | 1) {
    setDraft(current => {
      if (!current) return current;
      const next = index + direction;
      if (next < 0 || next >= current.sections.length) return current;
      const sections = [...current.sections];
      [sections[index], sections[next]] = [sections[next], sections[index]];
      return { ...current, sections };
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      // Save shared product records first; never report page success after a product failure.
      for (const product of Object.values(productChanges)) {
        const response = await adminRequest(`/api/products/${product._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: product.title, slug: product.slug, sku: product.sku, description: product.description, material: product.material, dimensions: product.dimensions, price: product.price, category: product.category._id, media: product.media.map(item => item._id), featured: product.featured, available: product.available, showInReels: product.showInReels, reelTitle: product.reelTitle, reelOrder: product.reelOrder }) });
        if (!response.ok) throw new Error(await responseError(response));
      }
      const sectionIds = await Promise.all(draft.sections.map(async (section, order) => {
        const response = await adminRequest(section._id ? `/api/page-sections/${section._id}` : "/api/page-sections", {
          method: section._id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: section.type, heading: section.heading, subheading: section.subheading, description: section.description, faqs: section.faqs, items: section.items, media: section.media.map(item => item._id), button: section.buttonLabel || section.buttonUrl ? { label: section.buttonLabel, url: section.buttonUrl } : null, products: section.productIds, productSource: section.productSource, categories: section.categoryIds, visible: section.visible, order }),
        });
        if (!response.ok) throw new Error(await responseError(response));
        return (await response.json() as { _id: string })._id;
      }));

      const pageResponse = await adminRequest(draft._id ? `/api/pages/${draft._id}` : "/api/pages", {
        method: draft._id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draft.title, slug: draft.slug, status: "published", seoTitle: draft.seoTitle, seoDescription: draft.seoDescription, sections: sectionIds }),
      });
      if (!pageResponse.ok) throw new Error(await responseError(pageResponse));
      const savedPage = await pageResponse.json() as { _id: string };
      const removedIds = originalSectionIds.filter(id => !sectionIds.includes(id));
      await Promise.all(removedIds.map(id => adminRequest(`/api/page-sections/${id}`, { method: "DELETE" })));
      setDraft(current => current ? { ...current, _id: savedPage._id, sections: current.sections.map((section, index) => ({ ...section, _id: sectionIds[index], key: sectionIds[index] })) } : current);
      setOriginalSectionIds(sectionIds);
      setProductChanges({});
      setMessage("Page saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the page.");
    } finally { setSaving(false); }
  }

  const productOptions: ReferenceOption[] = useMemo(() => products.filter(product => product.available !== false).map(product => ({ id: product._id, label: product.title, detail: product.category?.name, image: product.media?.find(media => media.type === "image")?.thumbnail || product.media?.find(media => media.type === "image")?.cloudinaryUrl || product.media?.find(media => media.type === "video")?.thumbnail })), [products]);
  const categoryOptions: ReferenceOption[] = useMemo(() => categories.map(category => ({ id: category._id, label: category.name, detail: category.slug, image: category.image?.thumbnail || category.image?.cloudinaryUrl })), [categories]);
  const activeReferenceSection = referencePicker && draft ? draft.sections[referencePicker.index] : null;
  function sectionCategories(section: SectionDraft) {
    const selected = section.categoryIds.map(id => categories.find(category => category._id === id)).filter(Boolean) as CategoryItem[];
    return section.type === "category-grid" ? [...selected.filter(category => category.active), ...categories.filter(category => category.active && !section.categoryIds.includes(category._id)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))] : selected;
  }
  function reorder<T>(items: T[], index: number, direction: number) { const next = [...items]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next; }

  if (!definition) return <div className={styles.pageCards}>{CMS_PAGES.map(page => <button key={page.slug} type="button" onClick={() => void openPage(page)}><span><strong>{page.title}</strong><small>{page.sectionTypes.length} predefined sections</small></span><ChevronRight size={18} /></button>)}</div>;

  return <>
    <div className={styles.pageEditorTop}><button type="button" className={styles.secondaryButton} onClick={() => { setDefinition(null); setDraft(null); }}>← All pages</button><div><strong>{definition.title}</strong><span>/{definition.slug}</span></div></div>
    {message && <div className={message === "Page saved." ? styles.successAlert : styles.alert}>{message}<button onClick={() => setMessage(null)}><X size={15} /></button></div>}
    {loading ? <div className={styles.libraryState}><LoaderCircle className={styles.spinner} size={23} /> Loading page editor…</div> : !draft ? <button type="button" className={styles.secondaryButton} onClick={() => void openPage(definition)}>Retry loading page</button> : <form onSubmit={save} className={styles.pageEditor}>
      <section className={styles.seoPanel}><h2>Search appearance</h2><div className={styles.formGrid}><label className={styles.field}><span>SEO title</span><input value={draft.seoTitle} onChange={event => setDraft({ ...draft, seoTitle: event.target.value })} /></label><label className={`${styles.field} ${styles.fieldWide}`}><span>SEO description</span><textarea rows={3} value={draft.seoDescription} onChange={event => setDraft({ ...draft, seoDescription: event.target.value })} /></label></div></section>
      <div className={styles.sectionEditorList}>{draft.sections.map((section, index) => {
        const label = definition.sectionTypes.find(item => item.type === section.type)?.label ?? section.type;
        return <section key={section.key} data-sort-group="sections" data-sort-index={index} className={styles.sectionEditor}>
          <header className={styles.sectionEditorHeader}><SortHandle index={index} group="sections" label={`${label} section`} onMove={(from, to) => setDraft({ ...draft, sections: moveItem(draft.sections, from, to) })} /><div><span>{index + 1}</span><div><strong>{label}</strong><small>{section.type}</small></div></div><div><button type="button" title="Move up" disabled={index === 0} onClick={() => moveSection(index, -1)}><ArrowUp size={15} /></button><button type="button" title="Move down" disabled={index === draft.sections.length - 1} onClick={() => moveSection(index, 1)}><ArrowDown size={15} /></button><button type="button" title={section.visible ? "Visible" : "Hidden"} className={!section.visible ? styles.sectionHidden : ""} onClick={() => updateSection(index, { visible: !section.visible })}>{section.visible ? <Eye size={15} /> : <EyeOff size={15} />}</button><button type="button" title="Remove section" onClick={() => setDraft({ ...draft, sections: draft.sections.filter((_, sectionIndex) => sectionIndex !== index) })}><Trash2 size={15} /></button></div></header>
          <div className={styles.sectionEditorBody}><div className={styles.formGrid}>
            {section.type === "faq" || section.type === "faq-list" ? <div className={`${styles.fieldWide} ${styles.formSection}`}><h3>Questions and answers ({section.faqs.length})</h3>{section.faqs.map((faq, faqIndex) => <div key={faqIndex} data-sort-group={`faq-${section.key}`} data-sort-index={faqIndex} className={styles.formSection}><SortHandle index={faqIndex} group={`faq-${section.key}`} label={`question ${faqIndex + 1}`} onMove={(from, to) => updateSection(index, { faqs: moveItem(section.faqs, from, to) })} />
              <label className={styles.field}><span>Question {faqIndex + 1}</span><input required value={faq.question} onChange={event => updateSection(index, { faqs: section.faqs.map((item, i) => i === faqIndex ? { ...item, question: event.target.value } : item) })} /></label>
              <label className={styles.field}><span>Answer {faqIndex + 1}</span><textarea aria-label={`Answer ${faqIndex + 1}`} required rows={3} value={faq.answer} onChange={event => updateSection(index, { faqs: section.faqs.map((item, i) => i === faqIndex ? { ...item, answer: event.target.value } : item) })} /></label>
              <div className={styles.mediaOrderActions}><button type="button" aria-label="Move question up" disabled={faqIndex === 0} onClick={() => { const faqs = [...section.faqs]; [faqs[faqIndex - 1], faqs[faqIndex]] = [faqs[faqIndex], faqs[faqIndex - 1]]; updateSection(index, { faqs }); }}><ArrowUp size={15} /></button><button type="button" aria-label="Remove question" onClick={() => updateSection(index, { faqs: section.faqs.filter((_, i) => i !== faqIndex) })}><Trash2 size={15} /></button></div>
            </div>)}<button type="button" className={styles.secondaryButton} onClick={() => updateSection(index, { faqs: [...section.faqs, { question: "", answer: "" }] })}><Plus size={15} /> Add question</button></div> : null}
            {defaultCards[section.type] && <div className={`${styles.fieldWide} ${styles.formSection}`}><h3>Content cards ({section.items.length})</h3>{section.items.map((item, itemIndex) => <div key={itemIndex} data-sort-group={`cards-${section.key}`} data-sort-index={itemIndex} className={styles.formSection}><SortHandle index={itemIndex} group={`cards-${section.key}`} label={`card ${itemIndex + 1}`} onMove={(from, to) => updateSection(index, { items: moveItem(section.items, from, to) })} />
              <label className={styles.field}><span>Card title</span><input required value={item.title} onChange={event => updateSection(index, { items: section.items.map((card, i) => i === itemIndex ? { ...card, title: event.target.value } : card) })} /></label>
              <label className={styles.field}><span>Card description</span><textarea aria-label={`Card description ${itemIndex + 1}`} rows={3} value={item.description} onChange={event => updateSection(index, { items: section.items.map((card, i) => i === itemIndex ? { ...card, description: event.target.value } : card) })} /></label>
              <label className={styles.field}><span>Card link</span><input value={item.url ?? ""} onChange={event => updateSection(index, { items: section.items.map((card, i) => i === itemIndex ? { ...card, url: event.target.value } : card) })} /></label>
              <label className={styles.field}><span>Card button label</span><input value={item.label ?? ""} onChange={event => updateSection(index, { items: section.items.map((card, i) => i === itemIndex ? { ...card, label: event.target.value } : card) })} /></label>
              <div className={styles.mediaOrderActions}><button type="button" aria-label={`Move card ${itemIndex + 1} earlier`} disabled={itemIndex === 0} onClick={() => updateSection(index, { items: reorder(section.items, itemIndex, -1) })}><ArrowUp size={15} /></button><button type="button" aria-label={`Move card ${itemIndex + 1} later`} disabled={itemIndex === section.items.length - 1} onClick={() => updateSection(index, { items: reorder(section.items, itemIndex, 1) })}><ArrowDown size={15} /></button></div>
              <button type="button" className={styles.secondaryButton} onClick={() => updateSection(index, { items: section.items.filter((_, i) => i !== itemIndex) })}><Trash2 size={15} /> Remove card</button>
            </div>)}<button type="button" className={styles.secondaryButton} onClick={() => updateSection(index, { items: [...section.items, { title: "", description: "", url: "", label: "" }] })}><Plus size={15} /> Add card</button></div>}
            <label className={styles.field}><span>Heading</span><input value={section.heading} onChange={event => updateSection(index, { heading: event.target.value })} /></label>
            <label className={styles.field}><span>Subheading</span><input value={section.subheading} onChange={event => updateSection(index, { subheading: event.target.value })} /></label>
            <label className={`${styles.field} ${styles.fieldWide}`}><span>Description</span><textarea rows={4} value={section.description} onChange={event => updateSection(index, { description: event.target.value })} /></label>
            <label className={styles.field}><span>Button label</span><input value={section.buttonLabel} onChange={event => updateSection(index, { buttonLabel: event.target.value })} /></label>
            <label className={styles.field}><span>Button URL</span><input value={section.buttonUrl} onChange={event => updateSection(index, { buttonUrl: event.target.value })} /></label>
          </div>
          <div className={styles.sectionRelations}>
            <div><span>Images and videos</span><button type="button" onClick={() => setMediaIndex(index)}>Select media ({section.media.length})</button>{section.media.length > 0 && <div className={styles.miniMediaStrip}>{section.media.map(media => <span key={media._id}>{media.type === "video" ? <video src={media.cloudinaryUrl} muted /> : <img src={media.thumbnail || media.cloudinaryUrl} alt="" />}<button type="button" onClick={() => updateSection(index, { media: section.media.filter(item => item._id !== media._id) })}><X size={11} /></button></span>)}</div>}</div>
            <div><span>Linked products</span><button type="button" onClick={() => setReferencePicker({ kind: "products", index })}>Choose products ({sectionProductIds(section.type, section.productSource, section.productIds, products).length})</button></div>
            <div><span>Linked categories</span><button type="button" onClick={() => setReferencePicker({ kind: "categories", index })}>Choose categories ({sectionCategories(section).length})</button></div>
          </div>
          <SectionProducts group={`products-${section.key}`} onEdit={setEditingProduct} type={section.type} source={section.productSource} ids={section.productIds} products={products} onChange={(productSource, productIds) => updateSection(index, { productSource, productIds })} />
          {section.media.length > 0 && <div className={styles.sectionProductPreview}><h3>Media display order</h3><div className={styles.sectionProductGrid}>{section.media.map((media, mediaOrder) => <article key={media._id} data-sort-group={`media-${section.key}`} data-sort-index={mediaOrder} className={styles.sectionProductCard}><SortHandle index={mediaOrder} group={`media-${section.key}`} label={`media ${mediaOrder + 1}`} onMove={(from, to) => updateSection(index, { media: moveItem(section.media, from, to) })} />{media.type === "video" && !media.thumbnail ? <video src={media.cloudinaryUrl} muted controls preload="metadata" style={{ width: "100%", height: 160, objectFit: "cover" }} /> : <img src={media.thumbnail || media.cloudinaryUrl} alt={media.altText || "Section media"} />}<div><small>Position {mediaOrder + 1} · {media.type}</small><strong>{media.altText || "Section media"}</strong></div><div className={styles.mediaOrderActions}><button type="button" aria-label={`Move media ${mediaOrder + 1} earlier`} disabled={mediaOrder === 0} onClick={() => updateSection(index, { media: reorder(section.media, mediaOrder, -1) })}><ArrowUp size={16} /></button><button type="button" aria-label={`Move media ${mediaOrder + 1} later`} disabled={mediaOrder === section.media.length - 1} onClick={() => updateSection(index, { media: reorder(section.media, mediaOrder, 1) })}><ArrowDown size={16} /></button></div></article>)}</div></div>}
          {sectionCategories(section).length > 0 && <div className={styles.sectionProductPreview}><h3>Categories display order</h3>{section.type === "category-grid" && <p>All active categories are shown. Reorder here; deactivate a category in Categories to hide it.</p>}<div className={styles.sectionProductGrid}>{sectionCategories(section).map((category, categoryOrder, displayed) => <article key={category._id} data-sort-group={`categories-${section.key}`} data-sort-index={categoryOrder} className={styles.sectionProductCard}><SortHandle index={categoryOrder} group={`categories-${section.key}`} label={category.name} onMove={(from, to) => updateSection(index, { categoryIds: moveItem(displayed.map(category => category._id), from, to) })} /><img src={category.image?.thumbnail || category.image?.cloudinaryUrl || "/images/hero.png"} alt={category.name} /><div><small>Position {categoryOrder + 1}</small><strong>{category.name}</strong></div><div className={styles.mediaOrderActions}><button type="button" aria-label={`Move ${category.name} earlier`} disabled={categoryOrder === 0} onClick={() => updateSection(index, { categoryIds: reorder(displayed.map(category => category._id), categoryOrder, -1) })}><ArrowUp size={16} /></button><button type="button" aria-label={`Move ${category.name} later`} disabled={categoryOrder === displayed.length - 1} onClick={() => updateSection(index, { categoryIds: reorder(displayed.map(category => category._id), categoryOrder, 1) })}><ArrowDown size={16} /></button></div></article>)}</div></div>}
          </div>
        </section>;
      })}</div>
      <div className={styles.addSectionBar}><select value={newSectionType} onChange={event => setNewSectionType(event.target.value)}><option value="">Choose predefined section</option>{definition.sectionTypes.map(item => <option key={item.type} value={item.type}>{item.label}</option>)}</select><button type="button" className={styles.secondaryButton} disabled={!newSectionType} onClick={() => { if (!newSectionType) return; setDraft({ ...draft, sections: [...draft.sections, blankSection(newSectionType)] }); setNewSectionType(""); }}><Plus size={15} /> Add section</button></div>
      <div className={styles.stickySave}><span>Drag handles reorder items. Product edits are shared across the site. {Object.keys(productChanges).length} pending product updates.</span><button type="submit" className={styles.primaryButton} disabled={saving}><Save size={15} /> {saving ? "Saving…" : "Save page"}</button></div>
    </form>}
    {editingProduct && <PageProductEditor key={editingProduct._id} product={editingProduct} categories={categories} onClose={() => setEditingProduct(null)} onApply={product => { setProducts(current => current.map(item => item._id === product._id ? product : item)); setProductChanges(current => ({ ...current, [product._id]: product })); }} />}
    <MediaPickerDialog open={mediaIndex !== null} title="Select section media" initialItems={mediaIndex !== null && draft ? draft.sections[mediaIndex]?.media ?? [] : []} onClose={() => setMediaIndex(null)} onConfirm={items => { if (mediaIndex !== null) updateSection(mediaIndex, { media: items }); }} />
    <ReferencePickerDialog key={`${referencePicker?.kind}-${referencePicker?.index}`} open={referencePicker !== null} title={referencePicker?.kind === "products" ? "Link products" : "Link categories"} options={referencePicker?.kind === "products" ? productOptions : categoryOptions} selectedIds={referencePicker?.kind === "products" && activeReferenceSection ? sectionProductIds(activeReferenceSection.type, activeReferenceSection.productSource, activeReferenceSection.productIds, products) : activeReferenceSection?.categoryIds ?? []} onClose={() => setReferencePicker(null)} onConfirm={ids => { if (!referencePicker) return; updateSection(referencePicker.index, referencePicker.kind === "products" ? { productIds: ids, productSource: "manual" } : { categoryIds: ids }); }} />
  </>;
}
