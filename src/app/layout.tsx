import type { Metadata } from 'next';
import { Spline_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary';

const splineSans = Spline_Sans({
  subsets: ['latin'],
  variable: '--font-spline',
  display: 'swap',
});

import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI CodeMate - Browser-Native AI Development',
  description:
    'Experience a zero-setup development environment powered by WebContainers and intelligent context-aware AI.',
};

// Script to prevent FOUC (Flash of Unstyled Content) for theme
const themeScript = `
  (function() {
    try {
      const storedTheme = localStorage.getItem('theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (storedTheme === 'dark' || (!storedTheme && systemDark)) {
        document.documentElement.classList.add('dark');
      } else if (storedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

import { Analytics } from '@vercel/analytics/react';

// ... other imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${splineSans.className} ${jetbrainsMono.variable}`}>
        <GlobalErrorBoundary>
          <Providers>{children}</Providers>
          <Analytics />
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
