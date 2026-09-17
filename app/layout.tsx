import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar de Casos de Uso de IA",
  description:
    "Mural da turma — o que a inteligência artificial já resolve (ou pode resolver) no seu ofício",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
