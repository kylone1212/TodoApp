import type { Metadata } from 'next';
import { Zen_Kaku_Gothic_New, Shippori_Mincho } from 'next/font/google';
import './globals.css';

const zenKaku = Zen_Kaku_Gothic_New({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-zen',
  display: 'swap',
});

const shippori = Shippori_Mincho({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-shippori',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '静 — ToDo',
  description: 'シンプルなタスク管理',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${zenKaku.variable} ${shippori.variable}`}>
      <body>{children}</body>
    </html>
  );
}
