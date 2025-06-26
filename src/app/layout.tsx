import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Load fonts

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ollama GUI',
  description: 'A GUI for Ollama.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-background text-primary min-h-screen">
        {children}
      </body>
    </html>
  );
}
