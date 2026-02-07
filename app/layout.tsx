import './globals.css';
import type { Metadata } from 'next';
import { Sidebar } from '../components/Sidebar';

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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 text-slate-900 flex flex-col min-h-screen">
        <Sidebar />
        <main className="flex-1 mx-auto max-w-5xl px-4 pt-6 pb-12 md:px-6 md:pl-72 md:pt-8 md:pb-16">{children}</main>
        <footer className="border-t border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 mt-auto">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-slate-500 md:px-6 md:pl-72">
            © {new Date().getFullYear()} Basket LSAT Tutoring
          </div>
        </footer>
      </body>
    </html>
  );
}
