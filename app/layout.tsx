import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Basket LSAT Tutoring',
  description: '1-on-1 LSAT tutoring and video resources with Basket.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 text-slate-900">
        <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
            <Link href="/" className="text-xl font-bold text-slate-900 transition-colors hover:text-indigo-600">
              Basket LSAT
            </Link>
            <div className="flex gap-6 text-base">
              <Link href="/" className="font-medium text-slate-700 transition-colors hover:text-indigo-600">
                Home
              </Link>
              <Link href="/about" className="font-medium text-slate-700 transition-colors hover:text-indigo-600">
                About
              </Link>
              <Link href="/pricing" className="font-medium text-slate-700 transition-colors hover:text-indigo-600">
                Pricing
              </Link>
              <Link href="/book" className="font-medium text-slate-700 transition-colors hover:text-indigo-600">
                Book a Session
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-16">{children}</main>
        <footer className="border-t border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-slate-500 md:px-6">
            © {new Date().getFullYear()} Basket LSAT Tutoring
          </div>
        </footer>
      </body>
    </html>
  );
}
