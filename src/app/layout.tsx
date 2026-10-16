import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartProvider } from "@/components/cart-provider";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "TUKEN OX | Electric Machines for the City", template: "%s | TUKEN OX" },
  description: "Electric bicycles engineered with motorcycle attitude for the modern city.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={GeistSans.variable}><body><CartProvider><Header />{children}<Footer /></CartProvider></body></html>;
}
