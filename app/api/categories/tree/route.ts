import { NextResponse } from "next/server";
import { categoryRepository } from "@/lib/db/repositories/category.repository";

export async function GET() {
  try {
    const tree = await categoryRepository.findTree();
    return NextResponse.json(tree);
  } catch (error) {
    console.error("Failed to fetch category tree:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
