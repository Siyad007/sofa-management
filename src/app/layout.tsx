import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import SplashScreen from "@/components/SplashScreen";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Daxo Sofa Management",
  description: "Premium Production Tracker for Daxo Sofa Workshops",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Daxo Sofa",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTEwMCAzMDAgTDQxMiAzMDAgTDQxMiAzNTAgQzQxMiAzNjAsIDQwMiAzNzAsIDM5MiAzNzAgTDEyMCAzNzAgQzExMCAzNzAsIDEwMCAzNjAsIDEwMCAzNTAgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEE4NEZGIiBzdHJva2Utd2lkdGg9IjIwIi8+CiAgPHBhdGggZD0iTTEzMCAzMDAgTDEzMCAyMDAgQzEzMCAxODAsIDE1MCAxNjAsIDE3MCAxNjAgTDM0MiAxNjAgQzM2MiAxNjAsIDM4MiAxODAsIDM4MiAyMDAgTDM4MiAzMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBBODRGRiIgc3Ryb2tlLXdpZHRoPSIyMCIvPgogIDxwYXRoIGQ9Ik04MCAzMDAgTDgwIDI1MCBDODAgMjQwLCA5MCAyMzAsIDEwMCAyMzAgTDEzMCAyMzAgTDEzMCAzMDAgTTM4MiAzMDAgTDM4MiAyMzAgTDQxMiAyMzAgQzQyMiAyMzAsIDQzMiAyNDAsIDQzMiAyNTAgTDQzMiAzMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBBODRGRiIgc3Ryb2tlLXdpZHRoPSIyMCIvPgo8L3N2Zz4=" />
        <link rel="apple-touch-icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTEwMCAzMDAgTDQxMiAzMDAgTDQxMiAzNTAgQzQxMiAzNjAsIDQwMiAzNzAsIDM5MiAzNzAgTDEyMCAzNzAgQzExMCAzNzAsIDEwMCAzNjAsIDEwMCAzNTAgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMEE4NEZGIiBzdHJva2Utd2lkdGg9IjIwIi8+CiAgPHBhdGggZD0iTTEzMCAzMDAgTDEzMCAyMDAgQzEzMCAxODAsIDE1MCAxNjAsIDE3MCAxNjAgTDM0MiAxNjAgQzM2MiAxNjAsIDM4MiAxODAsIDM4MiAyMDAgTDM4MiAzMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBBODRGRiIgc3Ryb2tlLXdpZHRoPSIyMCIvPgogIDxwYXRoIGQ9Ik04MCAzMDAgTDgwIDI1MCBDODAgMjQwLCA5MCAyMzAsIDEwMCAyMzAgTDEzMCAyMzAgTDEzMCAzMDAgTTM4MiAzMDAgTDM4MiAyMzAgTDQxMiAyMzAgQzQyMiAyMzAsIDQzMiAyNDAsIDQzMiAyNTAgTDQzMiAzMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzBBODRGRiIgc3Ryb2tlLXdpZHRoPSIyMCIvPgo8L3N2Zz4=" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </head>
      <body className={`${inter.className} antialiased bg-black`}>
        <SplashScreen />
        {children}
        <Navigation />
      </body>
    </html>
  );
}
