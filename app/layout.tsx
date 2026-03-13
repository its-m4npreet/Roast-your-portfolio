import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roastfolio - Get Your Portfolio Roasted by AI",
  description: "Paste your portfolio URL and receive funny but useful feedback from AI. Choose from Roast Mode, Recruiter Mode, or Brutal Mode.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Roastfolio - Get Your Portfolio Roasted by AI',
    description: 'AI feedback for portfolios in Roast, Recruiter, and Brutal modes.',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Roastfolio preview image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roastfolio - Get Your Portfolio Roasted by AI',
    description: 'AI feedback for portfolios in Roast, Recruiter, and Brutal modes.',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgb(31 41 55 / 0.9)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

