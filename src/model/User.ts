import { messageSchema } from "@/schemas/messageSchema";
import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);
// Review Schema
export interface Review extends Document {
  content: string;
  rating: "1" | "2" | "3" | "4" | "5";
  product: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ReviewSchema = new Schema<Review>(
  {
    content: { type: String, required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: String,
      required: true,
      enum: ["1", "2", "3", "4", "5"],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Product Schema
export interface Product extends Document {
  title: string;
  description: string;
  price?: number;
  image?: string;
  user: mongoose.Types.ObjectId;
  isAcceptingReviews: boolean;
  reviews: Review[];
  createdAt: Date;
}

const ProductSchema: Schema<Product> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number },
    image: {
      type: String,
      required: false,
      set: (v: string) => (v === "" ? undefined : v), // Set to undefined if empty string
      validate: {
        validator: (v: string) =>
          !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/.test(v),
        message: "Invalid image URL",
      },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isAcceptingReviews: { type: Boolean, default: true },
    reviews: [ReviewSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
  products: Product[];
}
const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export const MessageModel =
  (mongoose.models.Message as mongoose.Model<Message>) ||
  mongoose.model<Message>("Message", MessageSchema);

export const ProductModel =
  (mongoose.models.Product as mongoose.Model<Product>) ||
  mongoose.model<Product>("Product", ProductSchema);

export const ReviewModel =
  (mongoose.models.Review as mongoose.Model<Review>) ||
  mongoose.model<Review>("Review", ReviewSchema);

export default UserModel;
