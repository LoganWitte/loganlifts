import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";
import RootClientProvider from "./components/contextProviders/RootClientProvider";
import { ExerciseProvider } from "./components/contextProviders/ExerciseProvider";
import Navbar from "./components/Navbar";

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
      <body className={`${font.className} antialiased bg-stone-400`}>
        <RootClientProvider>
          <ExerciseProvider>
            <Navbar />
            <main className="w-full h-[calc(100vh-4.25rem)] flex flex-col items-center mt-17 overflow-x-hidden overflow-y-auto">
              {children}
            </main>
          </ExerciseProvider>
        </RootClientProvider>
      </body>
    </html>
  );
}