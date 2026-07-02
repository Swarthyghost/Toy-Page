import type { Metadata } from "next";
import { Providers } from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: "PleasureToys GH | Premium Adult Toys & Accessories in Ghana",
  description: "Ghana's premier destination for high-quality adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery across Ghana. Shop confidently with PleasureToys GH.",
  keywords: "adult toys Ghana, rose vibrator, dildo Ghana, adult toys adenta, lubricant store spintex, sex toys cantonments, vibrator shop osu, buy vibrator accra, adult toys east legon, sex toys near me ghana,discreet adult toy delivery accra, wand vibrator Ghana, couple sex toys Ghana, couple vibrator Ghana, Rabbit vibrator Ghana, Bullet vibrator Ghana, sex toys Ghana, Remote control vibrator Ghana, vibrators Ghana, BDSM Ghana, lubricants Ghana, Water-based lubricant Ghana, pleasure toys Accra, discreet adult shop Ghana, PleasureToys GH, Male masturbator Ghana, Penis sleeve Ghana, Pocket pussy Ghana, Automatic masturbator Ghana, Male vibrator Ghana, Penis ring Ghana, Delay spray Ghana, Penis pump Ghana, Prostate massager Ghana, Sex toys in Kumasi, Vibrators in Takoradi, Adult toys in Tamale, Rose vibrator in Cape Coast, Adult shop in Sunyani, Vibrators in Koforidua, Adult toys in Ho, Sex toys in Bolgatanga, Adult products in Wa",
  authors: [{ name: "PleasureToys GH" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://pleasuretoysgh.com/",
  },
  openGraph: {
    type: "website",
    url: "https://pleasuretoysgh.com/",
    siteName: "PleasureToys GH",
    title: "PleasureToys GH | Premium Adult Toys & Accessories in Ghana",
    description: "Ghana's premier destination for high-quality adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery across Ghana.",
    images: [
      {
        url: "/toy-og.png",
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
    images: ["/toy-og.png"],
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
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href="/toy.jpg" />
        <link rel="apple-touch-icon" href="/toy.jpg" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PleasureToys GH",
              "url": "https://pleasuretoysgh.com",
              "logo": "https://pleasuretoysgh.com/toy-og.png",
              "description": "Ghana's premier destination for high-quality adult toys, vibrators, BDSM gear, lubricants and accessories.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Accra",
                "addressRegion": "Greater Accra",
                "addressCountry": "GH"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+233-26-618-1581",
                "contactType": "customer service",
                "availableLanguage": "English",
                "contactOption": "TollFree"
              },
              "sameAs": []
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Store", "LocalBusiness"],
              "name": "PleasureToys GH",
              "image": "https://pleasuretoysgh.com/toy-og.png",
              "url": "https://pleasuretoysgh.com",
              "telephone": "+233266181581",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Ablekuma",
                "addressLocality": "Accra",
                "addressCountry": "GH"
              },
              "areaServed": [
                { "@type": "City", "name": "Accra" },
                { "@type": "City", "name": "Ablekuma" },
                { "@type": "City", "name": "East Legon" },
                { "@type": "City", "name": "Airport Residential Area" },
                { "@type": "City", "name": "Cantonments" },
                { "@type": "City", "name": "Osu" },
                { "@type": "City", "name": "Tesano" },
                { "@type": "City", "name": "North Ridge" },
                { "@type": "City", "name": "Adabraka" },
                { "@type": "City", "name": "Dzorwulu" },
                { "@type": "City", "name": "Madina" },
                { "@type": "City", "name": "Abelemkpe" },
                { "@type": "City", "name": "Ridge" },
                { "@type": "City", "name": "Spintex" },
                { "@type": "City", "name": "East Airport" },
                { "@type": "City", "name": "Tema Community 25" },
                { "@type": "City", "name": "Tema Community 18" },
                { "@type": "City", "name": "Tema" },
                { "@type": "City", "name": "Labone" },
                { "@type": "City", "name": "Kumasi" },
                { "@type": "City", "name": "Cape Coast" },
                { "@type": "City", "name": "Koforidua" },
                { "@type": "City", "name": "Takoradi" },
                { "@type": "City", "name": "Tamale" },
                { "@type": "City", "name": "Sunyani" },
                { "@type": "City", "name": "Ho" },
                { "@type": "City", "name": "Bolgatanga" },
                { "@type": "City", "name": "Madina" },
                { "@type": "City", "name": "Adenta" },
                { "@type": "City", "name": "Achimota" },
                { "@type": "City", "name": "Dansoman" },
                { "@type": "City", "name": "Kasoa" },
                { "@type": "City", "name": "Haatso" },
                { "@type": "City", "name": "Dome" },
                { "@type": "City", "name": "Taifa" },
                { "@type": "City", "name": "Lapaz" },
                { "@type": "City", "name": "Weija" },
                { "@type": "City", "name": "Teshie" },
                { "@type": "City", "name": "Nungua" },
                { "@type": "City", "name": "Ashaiman" },
                { "@type": "City", "name": "Sakumono" },
                { "@type": "City", "name": "Wa" }
              ],
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
                ],
                "opens": "08:00",
                "closes": "21:00"
              },
              "priceRange": "GHS 35 - GHS 500",
              "currenciesAccepted": "GHS",
              "paymentAccepted": "Mobile Money, Cash on Delivery",
              "hasMap": "https://maps.google.com/?q=Ablekuma,Accra,Ghana"
            })
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
