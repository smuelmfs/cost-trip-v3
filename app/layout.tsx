import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider } from "@/components/layout/theme-provider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Costimizer - Seu Guia Completo de Viagens Personalizadas",
  description:
    "Planeje sua viagem de forma simples e eficiente com o Costimizer. Crie roteiros personalizados, calcule custos e aproveite dicas valiosas para tornar sua viagem perfeita.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background"
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="container mx-auto p-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
