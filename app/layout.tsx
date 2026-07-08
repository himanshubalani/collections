import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://himanshubalani.com'), 
  title: "Himanshu Balani — Collections",
  description: "Collection of favorite books, videos, podcasts, and articles by Himanshu Balani.",
  openGraph: {
    type: "website",
    url: "https://himanshubalani.com/collections", 
    title: "Himanshu Balani — Collections",
    description: "Collection of favorite books, videos, podcasts, and articles by Himanshu Balani.",
    siteName: "Himanshu Balani",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 400,
        alt: 'Himanshu Balani — Collections Preview Image',
      },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}