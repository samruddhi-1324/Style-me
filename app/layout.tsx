import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import CartDrawer from "@/components/cart/CartDrawer";
import AIAssistant from "@/components/ui/AIAssistant";

export const metadata: Metadata = {
  title: "StyleMe Eyewear — See the Better You",
  description: "Premium eyewear with virtual try-on, fit in millimetres, lens thickness preview and transparent pricing. Find your perfect pair.",
  keywords: "eyewear, glasses, sunglasses, prescription glasses, virtual try-on, blue light glasses, India",
  openGraph: {
    title: "StyleMe Eyewear",
    description: "See how your glasses will look, fit and feel — before you pay.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileNav />
        <CartDrawer />
        <AIAssistant />
      </body>
    </html>
  );
}
