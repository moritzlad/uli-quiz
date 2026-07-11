import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIE FEIER — Quiz",
  description: "Das Geburtstags-Quiz für Uli!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" style={{ height: "100%" }}>
      {/* suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
          attributes into <body> before hydration; only this element is affected. */}
      <body style={{ margin: 0, height: "100%" }} suppressHydrationWarning>{children}</body>
    </html>
  );
}
