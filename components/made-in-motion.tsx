"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { ReelItem } from "@/lib/cms/homepage";
import { ViewportVideo } from "./viewport-video";
import Image from "./store-image";

export function MadeInMotion({ items }: { items: ReelItem[] }) {
  if (!items.length) return null;

  return <div className="motion-reel-grid">
    {items.map(item => <Link key={item.id} href={`/products/${item.slug}`} className="motion-reel-card group">
      {item.videoUrl ? <ViewportVideo src={item.videoUrl} poster={item.poster} className="motion-reel-media" /> : <div className="motion-reel-media"><Image src={item.image} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" /></div>}
      <span className="motion-reel-shade" />
      <span className="motion-reel-play"><Play size={15} fill="currentColor" /></span>
      <span className="motion-reel-title">{item.title}</span>
    </Link>)}
  </div>;
}
