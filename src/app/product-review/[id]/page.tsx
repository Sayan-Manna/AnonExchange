"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import * as z from "zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Product } from "@/model/User";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What did you like about this product?||What can be improved?||Would you recommend this product to others?";

const reviewSchema = z.object({
  content: z
    .string()
    .min(10, "Review content should be at least 10 characters long"),
  rating: z.enum(["1", "2", "3", "4", "5"], {
    errorMap: () => ({ message: "Please select a rating" }),
  }),
});

interface ApiResponse {
  message: string;
}

export default function ProductReview() {
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      content: "",
      rating: "",
    },
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const fetchProductDetails = useCallback(async () => {
    setIsLoadingProduct(true);
    try {
      const response = await axios.get<Product>(`/api/products/${id}`);
      console.log("Fetched product:", response.data);
      setProduct(response.data.product);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProduct(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const onSubmit = async (data: z.infer<typeof reviewSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>(`/api/send-review/${id}`, {
        ...data,
      });

      toast({
        title: response.data.message,
        variant: "default",
      });
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      {isLoadingProduct ? (
        <div className="text-center">Loading Product Details...</div>
      ) : product ? (
        <>
          <h1 className="text-4xl font-bold mb-4 text-center">
            Review {product.title}
          </h1>
          <p className="text-lg text-center mb-6">{product.description}</p>

          {/* Conditional check for isAcceptingReviews */}
          {!product.isAcceptingReviews ? (
            <div className="text-center text-red-500">
              You can&apos;t add review at the moment.
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Write a Review for {product?.title}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your thoughts about the product"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-full p-2 border rounded"
                        >
                          <option value="">Select Rating</option>
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Fair</option>
                          <option value="3">3 - Good</option>
                          <option value="4">4 - Very Good</option>
                          <option value="5">5 - Excellent</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center">
                  {isLoading ? (
                    <Button disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading || !messageContent}
                    >
                      Submit Review
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </>
      ) : (
        <div className="text-center text-red-500">
          Failed to load product details.
        </div>
      )}

      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Want to review more products?</div>
        <Link href={"/sign-up"}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}
