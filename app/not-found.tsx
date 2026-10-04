import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() { return <section className="grid min-h-[70vh] place-items-center px-6 text-center"><div><p className="font-serif text-8xl text-forest">404</p><h1 className="mt-3 font-serif text-4xl">This piece wandered away.</h1><p className="mt-4 text-sm text-muted">The page you’re looking for doesn’t seem to be here.</p><Link href="/" className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white"><ArrowLeft size={16} /> Back home</Link></div></section>; }
