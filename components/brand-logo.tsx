import Image from "./store-image";
export function BrandLogo({ src = "/images/ammaai-logo.webp", tone = "light" }: { src?: string; tone?: "light" | "dark" }) {
  if (src !== "/images/ammaai-logo.webp") return <span className="brand-logo custom-logo"><Image src={src} fallbackSrc="/images/ammaai-black.png" alt="Ammaai" width={150} height={150} priority /></span>;
  return <span className={`brand-logo brand-logo-${tone}`}><Image src={tone === "dark" ? "/images/ammaai-white.png" : "/images/ammaai-black.png"} alt="Ammaai" width={1774} height={887} sizes="(max-width: 768px) 200px, 320px" priority /></span>;
}
