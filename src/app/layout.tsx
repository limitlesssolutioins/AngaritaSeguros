import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";
import styles from './layout.module.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Angarita Seguros - Tu Aliado en Protección",
  description: "Cotiza y adquiere tu seguro de forma rápida y sencilla. Asesoría personalizada y las mejores aseguradoras del mercado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ClientLayoutWrapper>
          <div className={styles.body}>
            {children}
          </div>
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
