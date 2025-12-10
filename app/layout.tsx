import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";
import RootClientProvider from "./components/contextProviders/RootClientProvider";
import { ExerciseProvider } from "./components/contextProviders/ExerciseProvider";

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
      <body className={`${font.className} antialiased w-screen min-h-screen h-fit bg-stone-400 overflow-x-hidden flex flex-col items-center`}>
        <RootClientProvider >
          <ExerciseProvider>
            {children}
          </ExerciseProvider>
        </RootClientProvider>
      </body>
    </html>
  );
}
