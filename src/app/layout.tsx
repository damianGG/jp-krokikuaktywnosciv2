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
  title: "Restart Pracy - Podkarpackie Centrum Wsparcia OPT",
  description: "Restart Pracy - Podkarpackie Centrum Wsparcia OPT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (


    <html lang="pl" data-bs-theme="light">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/ico/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/ico/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/ico/favicon-16x16.png" />
        <link rel="manifest" href="/ico/site.webmanifest" />
        <link rel="mask-icon" href="/ico/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
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
