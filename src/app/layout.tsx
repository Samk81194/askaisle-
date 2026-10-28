import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AskAisle — The 24/7 AI Support Chatbot Built for Shopify Stores",
  description:
    "Install in 1 click via Shopify OAuth. Automatically syncs your products, policies, and FAQs. Answers shopper questions in seconds with 0% hallucinations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
