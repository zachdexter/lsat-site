import './globals.css';
import type { Metadata } from 'next';
import { NavBar } from '../components/NavBar';

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
        <NavBar />
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
