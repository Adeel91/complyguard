import type { Metadata } from "next";

import "./globals.css";
import "@fontsource/maple-mono/400.css";
import "@fontsource/maple-mono/500.css";
import "@fontsource/maple-mono/600.css";
import "@fontsource/maple-mono/700.css";

export const metadata: Metadata = {
  title: {
    default: "ComplyGuard",
    template: "%s | ComplyGuard",
  },
  description:
    "Continuous source code analysis for compliance related engineering risks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
