import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "../context/DataContext";
import { AppLayout } from "../components/AppLayout";

export const metadata: Metadata = {
  title: "tentwenty - Margin Dashboard",
  description: "Executive Margin & Profitability Dashboard for Agency Leadership",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full overflow-hidden bg-[#FAFBFF]">
        <DataProvider>
          <AppLayout>{children}</AppLayout>
        </DataProvider>
      </body>
    </html>
  );
}
