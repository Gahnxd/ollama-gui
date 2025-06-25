import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Using Inter as a fallback since Funnel Display isn't available in next/font/google
const inter = Inter({
  subsets: ['latin'],
  variable: '--font',
});

export const metadata: Metadata = {
  title: 'Ollama GUI',
  description: 'A modern, animated GUI for Ollama.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-primary min-h-screen">
        {children}
      </body>
    </html>
  );
}
