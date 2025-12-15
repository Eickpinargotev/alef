
import { NextRequest, NextResponse } from 'next/server';

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
  size?: string; // Talla selection for cart
  sizes: string[]; // Available sizes for this variant
  price: number;
  gender: string;
  media: ProductImage[];
  description?: string;
}

export interface Product {
  id: string; // generated from grouping
  type: 'camisa' | 'articulo';
  name: string; // edition for shirts, name for articles
  basePrice: number;
  description?: string;
  variants: ProductVariant[];
  // Aggregated data for filters
  genders: string[];
  editions: string[]; // only for shirts
  models: string[]; // only for shirts
  colors: string[]; // only for shirts
  sizes: string[]; // aggregated available sizes
}

// NocoDB Config
const NOCO_TOKEN = 'J85xPNLm5dtBtEMBYtPRbl0kNSuBzYH53P2sXTHc';
const URL_CAMISAS = 'https://n8n-nocodb.hvo3jf.easypanel.host/api/v2/tables/mp5ukvigb8y2hnx/records?offset=0&limit=100&viewId=vwmb6wabkp5a36za';
const URL_ARTICULOS = 'https://n8n-nocodb.hvo3jf.easypanel.host/api/v2/tables/mwrbfzn0e5e7x1y/records?offset=0&limit=100&viewId=vwejmjwe478vt03p';

async function fetchNocoData(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'xc-token': NOCO_TOKEN },
      cache: 'no-store' // Disable caching for real-time updates
    });
    if (!res.ok) throw new Error(`Failed to fetch NocoDB: ${res.statusText}`);
    const json = await res.json();
    return json.list || [];
  } catch (error) {
    console.error("NocoDB Fetch Error:", error);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  const [camisasData, articulosData] = await Promise.all([
    fetchNocoData(URL_CAMISAS),
    fetchNocoData(URL_ARTICULOS)
  ]);

  const productsMap = new Map<string, Product>();

  // Process Camisas
  camisasData.forEach((record: any) => {
    const edition = record.edicion;
    const model = record.modelo;
    const color = record.color;
    const gender = record.genero?.toLowerCase() || 'hombre';
    const price = parseFloat(record.precio) || 0;
    const description = record.descripcion || '';
    // Parse sizes: "S,M,L,XL" -> ["S", "M", "L", "XL"]
    const sizes = record.tallas ? record.tallas.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [];

    if (!edition) return;

    const productId = `camisa-${edition}`;

    if (!productsMap.has(productId)) {
      productsMap.set(productId, {
        id: productId,
        type: 'camisa',
        name: edition.replace(/_/g, ' '),
        basePrice: price,
        description, // Use description from first variant/record
        variants: [],
        genders: [],
        editions: [],
        models: [],
        colors: [],
        sizes: []
      });
    }

    const product = productsMap.get(productId)!;

    // Aggregates
    if (!product.genders.includes(gender)) product.genders.push(gender);
    if (!product.editions.includes(edition)) product.editions.push(edition);
    if (model && !product.models.includes(model)) product.models.push(model);
    if (color && !product.colors.includes(color)) product.colors.push(color);

    sizes.forEach((s: string) => {
      if (!product.sizes.includes(s)) product.sizes.push(s);
    });

    // Media
    const mediaItems: ProductImage[] = [];
    if (record.imagen && Array.isArray(record.imagen)) {
      record.imagen.forEach((img: any, idx: number) => {
        if (img.path) {
          mediaItems.push({
            src: `/api/images?path=${encodeURIComponent(img.path)}`,
            order: idx,
            type: (img.mimetype && img.mimetype.includes('video')) ? 'video' : 'image'
          });
        }
      });
    }

    product.variants.push({
      id: `${record.Id}`,
      edition,
      model,
      color,
      sizes,
      price,
      gender,
      media: mediaItems,
      description
    });
  });

  // Process Articulos
  articulosData.forEach((record: any) => {
    const name = record.nombre_articulo;
    const gender = record.genero?.toLowerCase() || 'hombre';
    const price = parseFloat(record.precio) || 0;
    const description = record.descripcion || '';
    const sizes = record.tallas ? record.tallas.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [];

    if (!name) return;

    const productId = `articulo-${name}`;

    if (!productsMap.has(productId)) {
      productsMap.set(productId, {
        id: productId,
        type: 'articulo',
        name: name.replace(/_/g, ' '),
        basePrice: price,
        description,
        variants: [],
        genders: [],
        editions: [],
        models: [],
        colors: [],
        sizes: []
      });
    }

    const product = productsMap.get(productId)!;
    if (!product.genders.includes(gender)) product.genders.push(gender);

    sizes.forEach((s: string) => {
      if (!product.sizes.includes(s)) product.sizes.push(s);
    });

    // Media
    const mediaItems: ProductImage[] = [];
    if (record.imagen && Array.isArray(record.imagen)) {
      record.imagen.forEach((img: any, idx: number) => {
        if (img.path) {
          mediaItems.push({
            src: `/api/images?path=${encodeURIComponent(img.path)}`,
            order: idx,
            type: 'image'
          });
        }
      });
    }

    product.variants.push({
      id: `${record.Id}`,
      price,
      gender,
      sizes,
      media: mediaItems,
      description
    });
  });

  return Array.from(productsMap.values()).map(p => {
    // Grouping logic for clean output if needed
    // For now we return raw variants but aggregated sizes are on Product level
    return p;
  });
}

const URL_TZITZIT = 'https://n8n-nocodb.hvo3jf.easypanel.host/api/v2/tables/mpbvibjnz5kaf24/records?offset=0&limit=25&where=&viewId=vw6vav32narvatfh';

export async function getTzitzitImage(): Promise<string | null> {
  const data = await fetchNocoData(URL_TZITZIT);
  // User confirmed: table has "nombre" and "imagen". We look for the one named "tzitzits_add"
  const record = data.find((r: any) => r.nombre === 'tzitzits_add');

  if (record && record.imagen && Array.isArray(record.imagen) && record.imagen.length > 0) {
    const img = record.imagen[0];
    if (img.path) {
      return `/api/images?path=${encodeURIComponent(img.path)}`;
    }
  }
  return null;
}
