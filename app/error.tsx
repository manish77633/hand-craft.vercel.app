"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="shell py-20 text-center"><h1 className="font-serif text-4xl">We couldn’t load this page.</h1><p className="mt-4 text-sm text-muted">Please try again in a moment.</p><button type="button" onClick={reset} className="mt-6 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white">Try again</button></section>;
}
