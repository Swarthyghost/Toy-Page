/**
 * Utility to convert text/name to a URL-safe, lowercase slug
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')         // Remove all non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-')         // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');         // Trim hyphens from start and end
}

/**
 * Standardized SEO Title, Description, and Keywords generator for product items.
 * Ensures server-side metadata and client-side hooks return identical results.
 */
export function getProductMetadata(product: any) {
  if (!product) {
    return {
      title: "Premium Adult Toys & Accessories in Ghana | PleasureToys GH",
      description: "Ghana's premier destination for high-quality adult toys, vibrators, and intimacy accessories. Fast, safe, and 100% discreet nationwide delivery.",
      keywords: "sex toys Ghana, buy vibrator Accra, discreet adult toy delivery, PleasureToys GH"
    };
  }

  const name = product.name;
  const category = product.category;
  const description = product.description || "";
  const cleanName = name.toLowerCase().trim();
  
  let seoTitle = `${name} Ghana — Discreet ${category} Delivery Accra`;
  let seoDescription = `${name} - ${description.substring(0, 140)}... Discreet delivery in Accra and across Ghana.`;

  // Specific product keyword mappings
  if (cleanName.includes('rose toy')) {
    seoTitle = "Rose Vibrator — Discreet Clitoral Stimulator | Buy Online Ghana";
    seoDescription = "Shop the popular Rose Toy clitoral vibrator in Ghana. 100% private shopping and same-day discreet delivery in Accra. Payment on delivery available.";
  } else if (cleanName.includes('sucking') || cleanName.includes('air pulse')) {
    seoTitle = `${name} — Sucking Vibrator Ghana | Discreet Delivery Accra`;
    seoDescription = `Buy the ultimate sucking vibrator online in Ghana. Discreet same-day delivery in Accra. 100% confidential packaging and fast shipping.`;
  } else if (cleanName.includes('thrusting') || cleanName.includes('telescopic')) {
    seoTitle = `${name} — Thrusting Vibrator | Buy Online Ghana | Fast Discreet Shipping`;
    seoDescription = `Shop high-quality thrusting vibrators. Private adult toy shopping in Ghana with fast nationwide delivery and payment on delivery options.`;
  } else if (category.toLowerCase().includes('vibrator') && cleanName.includes('g-spot')) {
    seoTitle = `${name} — Rechargeable G-Spot Vibrator Ghana | Nationwide Delivery`;
    seoDescription = `Find the best rechargeable G-Spot vibrators in Ghana. Fast, discreet adult toys delivery in Accra and nationwide. Shop in complete privacy.`;
  } else if (cleanName.includes('bdsm') || cleanName.includes('bondage') || cleanName.includes('leather')) {
    seoTitle = `${name} — BDSM Gear Ghana | Discreet Adult Shop Accra`;
    seoDescription = `Explore premium BDSM gear and bondage kits. Secure private sex toy shopping in Ghana. 100% discreet packaging and delivery.`;
  } else if (cleanName.includes('handcuff')) {
    seoTitle = `${name} — Bondage Handcuffs | Buy Online Ghana`;
    seoDescription = `Shop high-quality bondage restraints and handcuffs online. Fast, discreet shipping in Accra and across Ghana. Secure payment on delivery.`;
  } else if (cleanName.includes('butt plug') || cleanName.includes('anal')) {
    seoTitle = `${name} — Butt Plugs Ghana | Discreet Packaging & Delivery`;
    seoDescription = `Buy premium silicone butt plugs and anal toys in Ghana. 100% confidential packaging and same-day discreet delivery in Accra.`;
  } else if (cleanName.includes('masturbator') || cleanName.includes('pocket pussy') || cleanName.includes('fleshlight')) {
    seoTitle = `${name} — Male Masturbator Ghana | Private Shopping, Discreet Delivery`;
    seoDescription = `Purchase premium male masturbators and pocket pussies in Accra, Ghana. 100% private shopping, discreet shipping, payment on delivery.`;
  } else if (cleanName.includes('dildo') || cleanName.includes('jelly dildo')) {
    seoTitle = `${name} — Jelly Dildo Ghana | Buy Online, Nationwide Delivery`;
    seoDescription = `Buy realistic jelly dildos online in Ghana. Fast, confidential packaging and safe sex toys delivery in Accra and other regions.`;
  } else if (category.toLowerCase().includes('lubricant') || cleanName.includes('lube')) {
    seoTitle = `${name} — Water-Based Lubricant Ghana | Buy Online, Discreet Shipping`;
    seoDescription = `Shop premium body-safe lubricants in Ghana. Long-lasting water-based lube with 100% discreet delivery. Buy online today.`;
  }

  const keywords = `${name}, ${category} Ghana, adult toys Accra, ${name} price Ghana, discreet delivery, pleasure toys, sex toys Ghana, ${name} review`;

  return { title: seoTitle, description: seoDescription, keywords };
}

/**
 * Standardized SEO Title, Description, and Keywords generator for product categories.
 */
export function getCategoryMetadata(categoryName: string) {
  if (!categoryName) {
    return {
      title: "Premium Adult Toy Categories in Ghana | PleasureToys GH",
      description: "Browse our premium categories of adult toys, vibrators, and accessories. Fast, 100% discreet delivery in Accra and across Ghana.",
      keywords: "sex toys Ghana, categories, adult shop Accra"
    };
  }

  const decodedName = decodeURIComponent(categoryName).trim();
  const cleanCategory = decodedName.toLowerCase();
  
  let title = `${decodedName} in Ghana — Discreet Same-Day Delivery Accra | PleasureToys GH`;
  let description = `Shop high-quality ${decodedName.toLowerCase()} in Accra and nationwide. 100% private, secure online sex toy shopping with discreet packaging.`;
  
  if (cleanCategory.includes('vibrator')) {
    title = "Buy Vibrators in Ghana — Discreet Same-Day Delivery Accra";
    description = "Shop rechargeable, silent, and waterproof vibrators in Ghana. Browse rose toys, G-spot, wand, and clitoral vibrators. 100% discreet packaging.";
  } else if (cleanCategory.includes('bdsm') || cleanCategory.includes('bondage')) {
    title = "BDSM Gear & Bondage Kits Ghana | Discreet Adult Toy Shop Accra";
    description = "Explore high-quality BDSM gear, leather constraints, handcuffs, and bondage kits in Ghana. 100% private shopping & same-day delivery in Accra.";
  } else if (cleanCategory.includes('lubricant') || cleanCategory.includes('lube')) {
    title = "Body-Safe Personal Lubricants Ghana | Buy Lube Online Accra";
    description = "Shop organic water-based and silicone-based personal lubricants in Ghana. Enhance intimacy with skin-safe lube. Discreet nationwide shipping.";
  } else if (cleanCategory.includes('men') || cleanCategory.includes('mens') || cleanCategory.includes('male')) {
    title = "Male Masturbators & Pocket Pussies Ghana | Private Delivery Accra";
    description = "Explore premium male masturbators, automatic cups, and realistic pocket pussies in Ghana. Confidential shipping and payment on delivery options.";
  } else if (cleanCategory.includes('accessories') || cleanCategory.includes('accessory')) {
    title = "Adult Toy Accessories & Cleaners Ghana | PleasureToys GH";
    description = "Buy battery chargers, toy cleaners, storage bags, and intimacy accessories in Ghana. Fast, discreet shipping in Accra and other regions.";
  }

  const keywords = `${decodedName} Ghana, buy ${decodedName.toLowerCase()} Accra, discreet adult toys delivery, PleasureToys GH category`;

  return { title, description, keywords };
}
