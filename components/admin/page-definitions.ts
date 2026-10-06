export type CmsPageDefinition = {
  title: string;
  slug: string;
  sectionTypes: Array<{ type: string; label: string }>;
};

const collectionSections = [
  { type: "collection-hero", label: "Collection hero" },
  { type: "product-grid", label: "Product grid" },
  { type: "category-story", label: "Category story" },
];

export const CMS_PAGES: CmsPageDefinition[] = [
  { title: "Home", slug: "home", sectionTypes: [
    { type: "hero", label: "Hero" },
    { type: "featured-products", label: "Featured products" },
    { type: "category-grid", label: "Category grid" },
    { type: "made-in-motion", label: "Made in Motion" },
    { type: "story", label: "Story" },
    { type: "experience", label: "Experience" },
    { type: "cta", label: "Call to action" },
    { type: "faq", label: "FAQ" },
  ] },
  { title: "Bags", slug: "bags", sectionTypes: collectionSections },
  { title: "Home Decor", slug: "home-decor", sectionTypes: collectionSections },
  { title: "Textiles", slug: "textiles", sectionTypes: collectionSections },
  { title: "Jewellery", slug: "jewellery", sectionTypes: collectionSections },
  { title: "Story", slug: "story", sectionTypes: [
    { type: "story-hero", label: "Story hero" },
    { type: "story-content", label: "Story content" },
    { type: "values", label: "Values" },
  ] },
  { title: "Experience", slug: "experience", sectionTypes: [
    { type: "experience-hero", label: "Experience hero" },
    { type: "experience-features", label: "Experience features" },
    { type: "experience-cta", label: "Experience call to action" },
  ] },
  { title: "FAQ", slug: "faq", sectionTypes: [
    { type: "faq-hero", label: "FAQ hero" },
    { type: "faq-list", label: "FAQ list" },
  ] },
];
