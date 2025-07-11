import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";
import RootClientProvider from "./components/RootClientProvider";

const font = Funnel_Display({
  weight: ["300" , "400" , "500" , "600" , "700" , "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoganLifts",
  description: "Fitness tracker & planner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased min-w-screen w-fit min-h-screen h-fit bg-white`}>
        <RootClientProvider children={children} />
      </body>
    </html>
  );
}
