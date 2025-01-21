import dbConnect from "@/lib/dbConnect";
import { ProductModel } from "@/model/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

// Named export for GET request
export async function GET(req: NextRequest) {
  // await dbConnect(); // Connect to the database
  // console.log("Connected to database");
  // const url = new URL(req.url); // Extract URL from the request
  // const id = url.pathname.split("/").pop(); // Extract ID from the URL path
  // // console.log("Product ID:", id);

  // if (!id || Array.isArray(id)) {
  //   return NextResponse.json(
  //     { success: false, message: "Invalid or missing product ID" },
  //     { status: 400 }
  //   );
  // }

  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id || Array.isArray(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing product ID" },
        { status: 400 }
      );
    }
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = session.user._id;

    const product = await ProductModel.findById(id).lean().exec();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    // Check ownership of the product
    if (product.user._id.toString() !== userId) {
      console.log("You do not own this product");

      return NextResponse.json(
        { success: false, message: "Forbidden: You do not own this product" },
        { status: 403 }
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
