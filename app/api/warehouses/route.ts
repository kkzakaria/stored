import { NextResponse } from "next/server";
import { warehouseRepository } from "@/lib/db/repositories";

export async function GET() {
  try {
    const warehouses = await warehouseRepository.findMany({});

    // Return simplified warehouse data
    const simplifiedWarehouses = warehouses.map((w) => ({
      id: w.id,
      name: w.name,
      code: w.code,
      active: w.active,
    }));

    return NextResponse.json(simplifiedWarehouses);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}
