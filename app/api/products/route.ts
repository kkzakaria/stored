import { NextResponse } from "next/server";
import { productRepository } from "@/lib/db/repositories";
import { Product, ProductVariant } from "@prisma/client";

type ProductWithVariants = Product & { variants: ProductVariant[] };

export async function GET() {
  try {
    const products = await productRepository.findMany({}, {
      variants: true,
    }) as unknown as ProductWithVariants[];

    // Return simplified product data with variants
    const simplifiedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      unit: p.unit,
      active: p.active,
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
      })),
    }));

    return NextResponse.json(simplifiedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
