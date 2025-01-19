import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ProductModel } from "@/model/User";

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Retrieve all products
    const products = await ProductModel.find().exec();

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
