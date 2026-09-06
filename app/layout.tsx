import type { Metadata } from "next";
import "./globals.css";
import "./workspace.css";
import "./interaction-fixes.css";
import "./feature-fixes.css";
import "./loan-fixes.css";

const pagesPath = process.env.GITHUB_PAGES === "true" ? "/money-management" : "";

export const metadata: Metadata = {
  title: "Money Management",
  description: "A calm, complete view of your money.",
  manifest: `${pagesPath}/manifest.webmanifest`,
  icons: { icon: `${pagesPath}/favicon.svg` }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
