import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antarctica Portfolio Recommendation",
  description: "A pragmatic portfolio recommendation dashboard for a small internal fund.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
