import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DER JUBILAR — Quiz",
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
      <body style={{ margin: 0, height: "100%" }}>{children}</body>
    </html>
  );
}
