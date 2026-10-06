import mongoose from "mongoose";
import { defaultCards, defaultFaqs } from "../lib/cms/default-content.ts";

// Add missing editor fields and rename brand copy without resetting existing content or media.
if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  let updated = 0;
  for (const collection of ["pages", "pagesections", "sitesettings", "footers", "navigations"]) {
    for (const doc of await db.collection(collection).find({}).toArray()) {
      const changes = {};
      for (const key of ["title", "heading", "subheading", "description", "seoTitle", "seoDescription", "copyright"]) {
        if (typeof doc[key] === "string" && /meerahini/i.test(doc[key])) changes[key] = doc[key].replace(/meerahini/gi, "Ammaai");
      }
      if (collection === "pagesections") {
        if (["faq", "faq-list"].includes(doc.type) && doc.faqs === undefined) changes.faqs = defaultFaqs(doc.type);
        if (defaultCards[doc.type] && doc.items === undefined) changes.items = defaultCards[doc.type];
        if (doc.button?.url && /meerahini|919999999999/i.test(doc.button.url)) changes.button = { ...doc.button, url: /919999999999/.test(doc.button.url) ? "/contact#contact-form" : doc.button.url.replace(/meerahini/gi, "Ammaai") };
      }
      if (Object.keys(changes).length) { await db.collection(collection).updateOne({ _id: doc._id }, { $set: changes }); updated++; }
    }
  }
  console.log(`Updated ${updated} content records. Existing products and media preserved.`);
} finally { await mongoose.disconnect(); }
