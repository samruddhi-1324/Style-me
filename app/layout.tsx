import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import CartDrawer from "@/components/cart/CartDrawer";
import AIAssistant from "@/components/ui/AIAssistant";
import AuthSessionProvider from "@/components/auth/AuthSessionProvider";
import { OrganizationJsonLd, WebsiteSearchJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: {
    default: "StyleMe Eyewear — See the Better You",
    template: "%s | StyleMe Eyewear",
  },
  description: "Premium eyewear with virtual try-on, fit in millimetres, lens thickness preview and transparent pricing. Find your perfect pair.",
  keywords: "eyewear, glasses, sunglasses, prescription glasses, virtual try-on, blue light glasses, India",
  metadataBase: new URL("https://style-me-virid.vercel.app"),
  openGraph: {
    title: "StyleMe Eyewear — See the Better You",
    description: "See how your glasses will look, fit and feel — before you pay.",
    url: "https://style-me-virid.vercel.app",
    siteName: "StyleMe Eyewear",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StyleMe Eyewear",
    description: "Premium eyewear with virtual try-on and millimetre fit.",
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
        <OrganizationJsonLd />
        <WebsiteSearchJsonLd />
        <AuthSessionProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <MobileNav />
          <CartDrawer />
          <AIAssistant />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
