import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { NavigationLoader } from "@/components/NavigationLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Alumni Directory",
  description: "Reconnect. Network. Thrive.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Alumni Directory",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Alumni Directory",
    title: "Alumni Directory",
    description: "Reconnect. Network. Thrive.",
  },
  twitter: {
    card: "summary",
    title: "Alumni Directory", 
    description: "Reconnect. Network. Thrive.",
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-256x256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Alumni Directory',
    'application-name': 'Alumni Directory',
    'msapplication-TileColor': '#0066ff',
    'msapplication-tap-highlight': 'no',
  },
};

export const viewport = {
  themeColor: "#0066ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
