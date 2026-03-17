import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SupabaseHealthCheck } from "@/components/SupabaseHealthCheck";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "RCA Official - Rajshahi City Association RUET",
  description: "Uniting Rajshahi City Students and Alumni of RUET to share knowledge, inspire growth and build a strong network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider>
          <SupabaseHealthCheck />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
