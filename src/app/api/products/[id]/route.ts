import dbConnect from "@/lib/dbConnect";
import { ProductModel } from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

// Named export for GET request
export async function GET(req: NextRequest) {
  const url = new URL(req.url); // Extract URL from the request
  const id = url.pathname.split("/").pop(); // Extract ID from the URL path

  if (!id || Array.isArray(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid or missing product ID" },
      { status: 400 }
    );
  }

  try {
    // Fetch the product by ID
    const product = await ProductModel.findById(id).exec();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
