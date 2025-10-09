import { NextRequest, NextResponse } from "next/server";
import { stockRepository } from "@/lib/db/repositories";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const warehouseId = searchParams.get("warehouseId");
    const productId = searchParams.get("productId");
    const variantId = searchParams.get("variantId");

    if (!warehouseId || !productId) {
      return NextResponse.json(
        { error: "warehouseId and productId are required" },
        { status: 400 }
      );
    }

    const available = await stockRepository.getAvailableStock(
      warehouseId,
      productId,
      variantId || null
    );

    return NextResponse.json({ available });
  } catch (error) {
    console.error("Error fetching available stock:", error);
    return NextResponse.json(
      { error: "Failed to fetch available stock" },
      { status: 500 }
    );
  }
}
