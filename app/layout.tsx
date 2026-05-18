import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planet Campaign Brief Generator",
  description: "From account signal to campaign brief in minutes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
