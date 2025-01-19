import dbConnect from "@/lib/dbConnect";
import { ProductModel } from "@/model/User";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  // Extract product ID from the query parameters
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");

  if (!productId) {
    return Response.json(
      { success: false, message: "Product ID is required" },
      { status: 400 }
    );
  }

  const productObjectId = new mongoose.Types.ObjectId(productId);

  try {
    const product = await ProductModel.aggregate([
      { $match: { _id: productObjectId } },
      { $unwind: { path: "$reviews", preserveNullAndEmptyArrays: true } }, // Include empty arrays of reviews
      { $sort: { "reviews.createdAt": -1 } }, // Sort reviews by createdAt in descending order
      { $group: { _id: "$_id", reviews: { $push: "$reviews" } } },
    ]).exec();

    if (!product || product.length === 0) {
      return Response.json(
        { message: "Product not found", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { reviews: product[0].reviews },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
