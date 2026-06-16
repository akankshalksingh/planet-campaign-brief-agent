import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTM Intelligence Studio",
  description: "AI-assisted GTM workflow demonstration for turning account signals into coordinated campaign action."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
