import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";


const circularStd = localFont({
  src: './fonts/circular-std-medium-500.ttf',
})
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={circularStd.className}>
        {children}
      </body>
    </html>
  );
}
