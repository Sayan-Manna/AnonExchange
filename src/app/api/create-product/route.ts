import dbConnect from "@/lib/dbConnect";
import UserModel, { ProductModel } from "@/model/User";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options"; // Path to your NextAuth configuration
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const requestBody = await request.json();
    let { title, description, price, image, isAcceptingReviews } = requestBody;

    console.log("Received data:", {
      title,
      description,
      price,
      image,
      isAcceptingReviews,
    });

    // Get the session of the logged-in user
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = session.user._id; // Assuming `id` is part of your session.user

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
      isAcceptingReviews,
      reviews: [], // Initialize with an empty reviews array
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    // Find the user and update their products array
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { products: savedProduct._id } }, // Push the product ID into the products array
      { new: true } // Return the updated user document
    );
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return a success response with the product data
    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully and added to user",
        product: savedProduct,
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
