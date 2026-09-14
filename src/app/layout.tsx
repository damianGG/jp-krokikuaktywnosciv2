import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Image from "next/image";
// Bootstrap and custom scss
import "@/assets/scss/style.scss";
import NavbarOne from "@/components/blocks/navbar/navbar-1/NavbarOne";
import Toplogo from "@/components/blocks/navbar/top-logo/Toplogo";
import Footer2 from "@/components/blocks/footer/Footer2";
import Link from "next/link";
import AccessibilityButton from "@/components/reuseable/AccessibilityButton";
import PopupForm from "@/components/blocks/form/popupform";



const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kroki ku Aktywności: Bierna Kobieta, Aktywna Zmiana!",
  description:
    "Kroki ku Aktywności: Bierna Kobieta, Aktywna Zmiana! - projekt aktywizacji zawodowej kobiet z Radomia oraz gmin Wieniawa i Chlewiska.",
  icons: {
    icon: [
      { url: "/ico/favicon.ico" },
      { url: "/ico/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/ico/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/ico/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (


    <html lang="pl" data-bs-theme="light">
      <head>
        <link rel="icon" href="/ico/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" sizes="180x180" href="/ico/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/ico/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/ico/favicon-16x16.png" />
        <link rel="manifest" href="/ico/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#0a1a5c" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={manrope.className}>

        <div style={{ width: "100%", background: "#ffffff", padding: "0.75rem 1rem" }}>
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Image
              src="/img/logos/logotypy-fundusze-mazowsze.jpg"
              alt="Fundusze Europejskie dla Mazowsza, Rzeczpospolita Polska, Dofinansowane przez Unię Europejską, Mazowsze serce Polski"
              width={2560}
              height={220}
              style={{ width: "100%", height: "auto", maxWidth: "900px" }}
              priority
            />
          </div>
        </div>

        <NavbarOne
        //  button={<PopupForm />} 
        />
        <AccessibilityButton />
        <div>{children}</div>
        <Footer2 />
      </body>
    </html>

  );
}
