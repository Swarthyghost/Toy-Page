import type { Metadata } from "next";
import { Providers } from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: "PleasureToys GH | Premium Adult Toys & Accessories in Ghana",
  description: "Ghana's premier destination for high-quality adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery. We accept online payments, MoMo (MTN & AT), Card, and Bank Transfer. Shop confidently with PleasureToys GH.",
  keywords: "adult toys Ghana, rose vibrator, dildo Ghana, adult toys adenta, lubricant store spintex, sex toys cantonments, vibrator shop osu, buy vibrator accra, adult toys east legon, sex toys near me ghana, discreet adult toy delivery accra, pay online adult toys ghana, buy adult toys with mobile money accra, paystack adult shop ghana, bank transfer payment adult toys, wand vibrator Ghana, couple sex toys Ghana, couple vibrator Ghana, Rabbit vibrator Ghana, Bullet vibrator Ghana, sex toys Ghana, Remote control vibrator Ghana, vibrators Ghana, BDSM Ghana, lubricants Ghana, Water-based lubricant Ghana, pleasure toys Accra, discreet adult shop Ghana, PleasureToys GH, Male masturbator Ghana, Penis sleeve Ghana, Pocket pussy Ghana, Automatic masturbator Ghana, Male vibrator Ghana, Penis ring Ghana, Delay spray Ghana, Penis pump Ghana, Prostate massager Ghana, Sex toys in Kumasi, Vibrators in Takoradi, Adult toys in Tamale, Rose vibrator in Cape Coast, Adult shop in Sunyani, Vibrators in Koforidua, Adult toys in Ho, Sex toys in Bolgatanga, Adult products in Wa",
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
                "availableLanguage": "English"
              },
              "sameAs": [
                "https://www.instagram.com/pleasuretoys.gh",
                "https://t.me/pleasuretoysgh"
              ]
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
              "@type": "Store",
              "name": "PleasureToysGH",
              "image": "https://pleasuretoysgh.com/toy-og.png",
              "url": "https://pleasuretoysgh.com",
              "telephone": "+233266181581",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Majesty Road (GA-577), off Olebu Amamoley Road, Ablekuma",
                "addressLocality": "Accra",
                "addressRegion": "Greater Accra",
                "addressCountry": "GH"
              },
              "hasMap": "https://www.google.com/maps?q=Majesty+Road+GA-577+Ablekuma+Accra",
              "priceRange": "GH₵",
              "areaServed": "Ghana"
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
