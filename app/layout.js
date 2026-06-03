import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CineVault | Moderní filmová knihovna",
  description: "Správa vaší osobní filmové knihovny s pomocí Next.js a Supabase. CRUD operace, dynamic pages, a Zod validation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <footer style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(10, 14, 23, 0.5)'
        }}>
          <p>© {new Date().getFullYear()} CineVault. Vytvořeno pro projekt s Supabase API.</p>
        </footer>
      </body>
    </html>
  );
}
