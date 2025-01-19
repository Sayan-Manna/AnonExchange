import dbConnect from "@/lib/dbConnect";
import { ProductModel } from "@/model/User";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Import next-auth token for user authentication

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const requestBody = await request.json();
    let { title, description, price, image, isAcceptingReviews, user } =
      requestBody;

    console.log("Received data:", {
      title,
      description,
      price,
      image,
      user,
      isAcceptingReviews,
    });

    // If no user is provided in the request body, attempt to fetch from the session (if using next-auth)
    let userId = user;
    if (!userId) {
      const token = await getToken({ req: request });
      if (token?.sub) {
        // Use the user ID from the token if the user is authenticated
        userId = token.sub;
      } else {
        // If no user is found, return an error
        return NextResponse.json(
          { error: "User is required" },
          { status: 400 }
        );
      }
    }

    // Handle image field: If it's an empty string, make it undefined
    if (image === "") {
      image = undefined; // Do not set empty string, set as undefined
    }

    // Create the new product
    const newProduct = new ProductModel({
      title,
      description,
      price,
      image, // This will be either undefined or a valid image URL
      user: userId, // Ensure this is a valid ObjectId
      isAcceptingReviews,
      reviews: [], // Initialize with an empty reviews array
    });

    // Save the product to the database
    await newProduct.save();

    // Return a success response with the product data
    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create product",
        error: error,
      },
      { status: 500 }
    );
  }
}
