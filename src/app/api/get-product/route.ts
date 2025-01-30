import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel, { ProductModel } from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options"; // Path to your NextAuth configuration

export async function GET(req: Request) {
  await dbConnect();

  try {
    // Get the session of the logged-in user
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const userId = session.user._id; // Assuming `id` is part of your session.user

    // Retrieve the user's products based on their ID
    // const user = await UserModel.findById(userId).populate("products").exec();
    const products = await ProductModel.find({ user: userId });
    // console.log("products", products);

    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, message: "User not found" },
    //     { status: 404 }
    //   );
    // }
    // const products = user.products; // The populated array of products

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
