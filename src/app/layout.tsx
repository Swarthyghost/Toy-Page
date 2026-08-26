import type { Metadata } from "next";
import { Providers } from "./providers";
import "../index.css";
import FloatingWhatsApp from "../components/FloatingWhatsApp";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PleasureToys GH | Premium Adult Toys & Accessories in Ghana",
  description: "Ghana's premier destination for high-quality adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery. We accept online payments, MoMo (MTN & AT), Card, and Bank Transfer. Shop confidently with PleasureToys GH.",
  keywords: "adult toys Ghana, rose vibrator, dildo Ghana, adult toys adenta, lubricant store spintex, sex toys cantonments, vibrator shop osu, buy vibrator accra, adult toys east legon, sex toys near me ghana, discreet adult toy delivery accra, pay online adult toys ghana, buy adult toys with mobile money accra, paystack adult shop ghana, bank transfer payment adult toys, wand vibrator Ghana, couple sex toys Ghana, couple vibrator Ghana, Rabbit vibrator Ghana, Bullet vibrator Ghana, sex toys Ghana, Remote control vibrator Ghana, vibrators Ghana, BDSM Ghana, lubricants Ghana, Water-based lubricant Ghana, pleasure toys Accra, discreet adult shop Ghana, PleasureToys GH, Male masturbator Ghana, Penis sleeve Ghana, Pocket pussy Ghana, Automatic masturbator Ghana, Male vibrator Ghana, Penis ring Ghana, Delay spray Ghana, Penis pump Ghana, Prostate massager Ghana, Sex toys in Kumasi, Vibrators in Takoradi, Adult toys in Tamale, Rose vibrator in Cape Coast, Adult shop in Sunyani, Vibrators in Koforidua, Adult toys in Ho, Sex toys in Bolgatanga, Adult products in Wa, rose vibrator Ghana, online adult store Ghana, adult toy shop Accra, rose toy Ghana, waterproof vibrator Ghana, clitoral stimulator Ghana, best adult toys Ghana, best vibrator Ghana, affordable vibrators Ghana, premium sex toys Ghana, rechargeable vibrator Ghana, silent vibrator Ghana, beginner vibrator Ghana, women pleasure toys Ghana, female vibrator Ghana, intimacy products Ghana, sexual wellness Ghana, intimate products Ghana, discreet packaging Ghana, confidential delivery Ghana, luxury vibrators Ghana, rose suction vibrator Ghana, Pleasure Toys Ghana, adult toys Airport Residential, adult toys Labone, adult shop Achimota, sex toys Madina, adult toys Tema, BDSM toys Ghana, bondage accessories Ghana, restraints Ghana, G-spot vibrator Ghana, clitoral vibrator Ghana, personal lubricant Ghana, warming lubricant Ghana, intimate lubricant Ghana, couples vibrator Ghana, romantic gifts Ghana",
  authors: [{ name: "PleasureToys GH" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    url: "https://pleasuretoysgh.com/",
    siteName: "PleasureToys GH",
    title: "PleasureToys GH | Premium Adult Toys & Accessories in Ghana",
    description: "Ghana's premier destination for high-quality adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery across Ghana.",
    images: [
      {
        url: "/toy-og.webp",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_GH",
  },
  twitter: {
    card: "summary_large_image",
    title: "PleasureToys GH | Premium Adult Toys & Accessories in Ghana",
    description: "Ghana's premier destination for high-quality adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery across Ghana.",
    images: ["/toy-og.webp"],
  },
  other: {
    "google-site-verification": "ZSLzc0dOTGfAdxR59efuOGeE1pQrSWusa9S36ykZ9I0",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" type="image/webp" href="/toy.webp" />
        <link rel="apple-touch-icon" href="/toy.webp" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "PleasureToys GH",
              "image": "https://pleasuretoysgh.com/toy-og.png",
              "url": "https://pleasuretoysgh.com/",
              "telephone": "+233 26 618 1581",
              "priceRange": "GH₵",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Majesty Road (GA-577), off Olebu Amamoley Road, Ablekuma",
                "addressLocality": "Accra",
                "addressRegion": "Greater Accra",
                "addressCountry": "GH"
              },
              "sameAs": [
                "https://www.instagram.com/pleasuretoys.gh",
                "https://t.me/pleasuretoysgh",
                "https://facebook.com/AdultToysGhana",
                "https://www.google.com/maps/place/?q=place_id:ChIJa20knFGj3w8Rs-QV5Vswhqc"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "reviewCount": "11",
                "bestRating": "5"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "PleasureToys GH",
              "url": "https://pleasuretoysgh.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://pleasuretoysgh.com/?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
          <FloatingWhatsApp />
        </Providers>
      </body>
    </html>
  );
}
