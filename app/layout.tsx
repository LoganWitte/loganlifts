import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const font = Funnel_Display({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoganLifts",
  description: "Fitness tracker & planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${font.className} antialiased min-w-screen w-fit min-h-screen h-fit bg-white`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
