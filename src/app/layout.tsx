import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPDR-BT | Specialized Public Data Relay - Broadcast Terminal",
  description: "NYC real-time civic data terminal - news, weather, subway tracker, traffic, and more. The SPDR-BT network connects New York.",
  keywords: ["NYC", "New York City", "dashboard", "subway", "traffic", "weather", "real-time", "Spider-Man", "SPDR-BT"],
  authors: [{ name: "SPDR-BT Network" }],
  openGraph: {
    title: "SPDR-BT | NYC Data Terminal",
    description: "Real-time NYC civic data - weather, news, subway tracker, traffic cameras, and more.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SPDR-BT | NYC Data Terminal",
    description: "Real-time NYC civic data terminal",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#DB231E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕷️</text></svg>" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
