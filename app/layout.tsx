import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
import "./interaction-fixes.css";
import "./feature-fixes.css";

export const metadata: Metadata = {
  title: "Money Management",
  description: "A calm, complete view of your money.",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
