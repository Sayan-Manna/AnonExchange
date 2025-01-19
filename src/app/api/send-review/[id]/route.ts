import dbConnect from "@/lib/dbConnect";
import { ProductModel } from "@/model/User";
import mongoose from "mongoose";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = params;

    // Parse the JSON body
    const body = await request.json();
    // console.log("Incoming request body:", body);

    // Destructure content and rating from the request body
    const { content, rating } = body;

    // Validate the product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid Product ID format:", id);
      return new Response(
        JSON.stringify({
          message: "Invalid product ID format",
          success: false,
        }),
        { status: 400 }
      );
    }

    // Proceed with processing the review...

    if (!["1", "2", "3", "4", "5"].includes(rating)) {
      console.error("Invalid rating value:", rating);
      return new Response(
        JSON.stringify({
          message: "Invalid rating. Allowed values are 1, 2, 3, 4, 5.",
          success: false,
        }),
        { status: 400 }
      );
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      console.error("Product not found:", id);
      return new Response(
        JSON.stringify({ message: "Product not found", success: false }),
        { status: 404 }
      );
    }

    const newReview = {
      content,
      rating,
      product: id,
      createdAt: new Date(),
    };

    product.reviews.push(newReview as never);
    await product.save();

    return new Response(
      JSON.stringify({ message: "Review added successfully", success: true }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/send-review:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error", success: false }),
      { status: 500 }
    );
  }
}
