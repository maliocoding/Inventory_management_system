import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Warehouse Inventory Manager",
    template: "%s | Warehouse Inventory Manager",
  },
  description: "MVP frontend for warehouse stock tracking and ledger visibility",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
