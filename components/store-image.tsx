"use client";
import Image, { type ImageProps, type ImageLoaderProps } from "next/image";
import { useState } from "react";

function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  return src.replace("/image/upload/", `/image/upload/f_auto,c_limit,w_${width},q_${quality || "auto"}/`);
}
export default function StoreImage({ src, onError, alt, fallbackSrc = "/images/hero.png", ...props }: ImageProps & { fallbackSrc?: string }) {
  const [failed, setFailed] = useState<ImageProps["src"] | null>(null);
  const actual = failed === src ? fallbackSrc : src;
  return <Image {...props} alt={alt} src={actual} loader={typeof actual === "string" && actual.startsWith("https://res.cloudinary.com/") && actual.includes("/image/upload/") ? cloudinaryLoader : undefined} onError={event => { if (actual === src) setFailed(src); onError?.(event); }} />;
}
