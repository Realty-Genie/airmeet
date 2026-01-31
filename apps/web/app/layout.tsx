import "./globals.css";
import localFont from "next/font/local";

const circular = localFont({
  src: [
    {
      path: "../fonts/circular-std-medium-500.ttf",
      weight: "500",
      style: "normal",
    },
  ],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${circular.className} antialiased bg-gradient-mesh min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
