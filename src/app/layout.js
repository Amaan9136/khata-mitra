import "./globals.css";
import { Fraunces, Plus_Jakarta_Sans, Noto_Sans_Kannada, Noto_Serif_Kannada } from "next/font/google";
import Providers from "@/components/Providers";
const displayEn = Fraunces({ subsets: ["latin"], variable: "--font-display-en", display: "swap" });
const bodyEn = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body-en", display: "swap" });
const bodyKn = Noto_Sans_Kannada({ subsets: ["kannada"], variable: "--font-body-kn", display: "swap" });
const displayKn = Noto_Serif_Kannada({ subsets: ["kannada"], variable: "--font-display-kn", display: "swap" });
export const metadata = {
  title: { default: "ಖಾತಾ ಮಿತ್ರ · Khata Mitra", template: "%s · Khata Mitra" },
  description: "Khata mutation workflow for village and hobli level revenue officers. Four clear steps, AI suggestions, the officer decides.",
  icons: { icon: "/logo.svg" }
};
export const viewport = { themeColor: "#052e2b", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }) {
  return (
    <html lang="kn" data-scroll-behavior="smooth" suppressHydrationWarning className={`${displayEn.variable} ${bodyEn.variable} ${bodyKn.variable} ${displayKn.variable}`}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}