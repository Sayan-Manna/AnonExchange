import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { ProductModel } from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  // Get session and user
  const session = await getServerSession(authOptions);
  console.log("Session Object:", session);
  const user: User = session?.user;

  if (!session || !user) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Unauthorized: Please log in",
      }),
      { status: 401 }
    );
  }

  const { acceptReviews } = await req.json();
  const productId = params.id;

  try {
    // Find the product and validate ownership
    const product = await ProductModel.findById(productId);

    if (!product) {
      return new Response(
        JSON.stringify({ success: false, message: "Product not found" }),
        { status: 404 }
      );
    }

    // Log the ownership check
    console.log("Session User ID:", user.id);
    console.log("Product User ID:", product.user.toString());

    if (product.user.toString() !== user._id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Forbidden: You do not own this product",
        }),
        { status: 403 }
      );
    }

    // Update the review acceptance status
    product.isAcceptingReviews = acceptReviews;
    await product.save();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Review acceptance status updated successfully",
        updatedProduct: product,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating review acceptance status:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to update review acceptance status",
      }),
      { status: 500 }
    );
  }
}
