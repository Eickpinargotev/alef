import fs from 'fs';
import path from 'path';

export interface ProductImage {
  src: string;
  order: number;
  type: 'image' | 'video';
}

export interface ProductVariant {
  id: string; // generated from specific attributes
  edition?: string;
  model?: string;
  color?: string;
  size?: string; // Talla logic might be separate or default
  price: number;
  gender: string;
  media: ProductImage[];
}

export interface Product {
  id: string; // generated from grouping
  type: 'camisa' | 'articulo';
  name: string; // edition for shirts, name for articles
  basePrice: number;
  variants: ProductVariant[];
  // Aggregated data for filters
  genders: string[];
  editions: string[]; // only for shirts
  models: string[]; // only for shirts
  colors: string[]; // only for shirts
}

// Format 1 (Camisas): producto$edicion$modelo_x$orden$color$precio$genero
// Example: camisa$shemah_israel$modelo_1$0$blanco$35.4$masculino
//
// Format 2 (Articulos): producto$nombre$orden$precio$genero
// Example: articulo$talith$1$17.5$masculino (Assuming gender is added as per strict rule)

const PRODUCTS_DIR = path.join(process.cwd(), 'public/products');

export function getProducts(): Product[] {
  if (!fs.existsSync(PRODUCTS_DIR)) return [];

  const files = fs.readdirSync(PRODUCTS_DIR);
  const productsMap = new Map<string, Product>();

  files.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.mp4', '.webp'].includes(ext)) return;

    const basename = path.basename(file, ext);
    const parts = basename.split('$');

    if (parts[0] === 'camisa') {
      // Expecting 7 parts: producto, edicion, modelo, orden, color, precio, genero
      if (parts.length !== 7) return; 

      const [type, edition, model, orderStr, color, priceStr, gender] = parts;
      const order = parseInt(orderStr);
      const price = parseFloat(priceStr);

      const productId = `camisa-${edition}`; // Group by edition
      
      if (!productsMap.has(productId)) {
        productsMap.set(productId, {
          id: productId,
          type: 'camisa',
          name: edition.replace(/_/g, ' '),
          basePrice: price,
          variants: [],
          genders: [],
          editions: [],
          models: [],
          colors: [],
        });
      }

      const product = productsMap.get(productId)!;
      
      // Update aggregated fields
      if (!product.genders.includes(gender)) product.genders.push(gender);
      if (!product.editions.includes(edition)) product.editions.push(edition);
      if (!product.models.includes(model)) product.models.push(model);
      if (!product.colors.includes(color)) product.colors.push(color);

      // Find or create variant
      // A variant is defined by model + color + gender for bundling images?
      // Actually images are "cards". User said: "obviously when choosing... filtering happens"
      // So we should verify if we group all media under the product or variant.
      // User says: "camisa$shemah_israel$modelo_1$0$blanco$35.4$masculino"
      // This file represents ONE media item for a specific configuration.
      
      // Let's store all raw media items in the product and let the UI filter.
      // Or better, create a flat list of media items with their attributes.
      
      // Re-reading usage: "para camisas solo mostramos una multimedia y es la de orden 0 ... y para artículos"
      // "cuando vamos eligiendo qué edición, modelo y color, se va filtrando las imágenes"
      
      // So detailed structure:
      product.variants.push({
        id: basename,
        edition,
        model,
        color,
        price,
        gender,
        media: [{
          src: `/products/${file}`,
          order: order,
          type: ext === '.mp4' ? 'video' : 'image'
        }]
      });

    } else if (parts[0] === 'articulo') {
      // Expecting 5 parts: producto, nombre, orden, precio, genero
      if (parts.length !== 5) return;

      const [type, name, orderStr, priceStr, gender] = parts;
      const order = parseInt(orderStr);
      const price = parseFloat(priceStr);

      const productId = `articulo-${name}`;
      
      if (!productsMap.has(productId)) {
        productsMap.set(productId, {
          id: productId,
          type: 'articulo',
          name: name.replace(/_/g, ' '),
          basePrice: price,
          variants: [],
          genders: [],
          editions: [],
          models: [],
          colors: [],
        });
      }

      const product = productsMap.get(productId)!;
      if (!product.genders.includes(gender)) product.genders.push(gender);

      product.variants.push({
        id: basename,
        price,
        gender,
        media: [{
          src: `/products/${file}`,
          order: order,
          type: ext === '.mp4' ? 'video' : 'image'
        }]
      });
    }
  });

  return Array.from(productsMap.values()).map(p => {
    // Post-processing to merge variants or sort media if needed?
    // Current logic pushes a "variant" for every file. 
    // Ideally we should group files that belong to the exact same SKU (same model, color, gender etc).
    
    // Grouping variants by unique attributes
    const groupedVariants = new Map<string, ProductVariant>();
    
    p.variants.forEach(v => {
      const key = `${v.edition || ''}-${v.model || ''}-${v.color || ''}-${v.gender}`;
      if (!groupedVariants.has(key)) {
        groupedVariants.set(key, { ...v, media: [] });
      }
      const existing = groupedVariants.get(key)!;
      existing.media.push(...v.media);
    });

    // Sort media by order
    const optimizedVariants = Array.from(groupedVariants.values()).map(v => {
        v.media.sort((a, b) => a.order - b.order);
        return v;
    });

    return { ...p, variants: optimizedVariants };
  });
}
