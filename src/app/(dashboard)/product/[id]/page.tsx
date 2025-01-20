"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/model/User"; // Assuming this interface includes all required fields
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch"; // Assuming a switch component is available
import { Loader2, RefreshCcw } from "lucide-react"; // Loader and refresh icons
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MessageLoading } from "@/components/ui/message-loading";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import ScriptCopyBtn from "@/components/ui/script-copy-btn";
import { MessageCard } from "@/components/MessageCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

function ProductDetailsPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [productReview, setProductReview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [isAcceptingReviews, setIsAcceptingReviews] = useState(false); // State for accepting reviews

  const { toast } = useToast();
  const router = useRouter();

  // Fetch product details by ID
  const fetchProductDetails = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.product); // Assuming `data.product` contains product details
          setIsAcceptingReviews(data.product.isAcceptingReviews); // Set the review acceptance state
          setProductReview(data.product.reviews);
        } else {
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to fetch product details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (params.id) {
      // console.log("Fetching product with ID:", params.id); // Debugging log

      fetchProductDetails(params.id);
    }
  }, [params.id, fetchProductDetails]);

  // Handle switch change for accepting reviews
  // const handleSwitchChange = async () => {
  //   setIsSwitchLoading(true);
  //   try {
  //     const response = await fetch(`/api/accept-reviews/${params?.id}`, {
  //       method: "POST",
  //       body: JSON.stringify({ acceptReviews: !isAcceptingReviews }),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const data = await response.json();

  //     if (data.success) {
  //       setIsAcceptingReviews(!isAcceptingReviews);
  //       toast({
  //         title: "Updated",
  //         description: `Reviews are now ${
  //           isAcceptingReviews ? "disabled" : "enabled"
  //         }.`,
  //       });
  //     } else {
  //       toast({
  //         title: "Error",
  //         description: "Failed to update review settings",
  //         variant: "destructive",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error updating review settings:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to update review settings",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsSwitchLoading(false);
  //   }
  // };
  const handleSwitchChange = async () => {
    setIsSwitchLoading(true);
    try {
      const response = await fetch(`/api/accept-reviews/${params.id}`, {
        method: "POST",
        body: JSON.stringify({ acceptReviews: !isAcceptingReviews }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      // console.log("Backend Response:", data); // Log the response to see more details

      if (data.success) {
        setIsAcceptingReviews(!isAcceptingReviews);
        toast({
          title: "Updated",
          description: `Reviews are now ${
            isAcceptingReviews ? "disabled" : "enabled"
          }.`,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update review settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating review settings:", error);
      toast({
        title: "Error",
        description: "Failed to update review settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  };

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const productUrl = `${baseUrl}/product-review/${product?._id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(productUrl);
    toast({
      title: "URL Copied!",
      description: "Product URL has been copied to clipboard.",
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <MessageLoading />
      </div>
    );

  if (!product) {
    return <div>Product not found.</div>;
  }
  const customCommandMap = {
    "public url": `${productUrl}`,
  };

  return (
    <>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/products", label: "Products" },
            { href: `/product/${params.id}`, label: product.title },
          ]}
        />
      </div>

      <div className="relative p-4 md:p-40 min-h-[90vh] ">
        <GridPattern
          width={30}
          height={30}
          x={-1}
          y={-1}
          strokeDasharray={"4 2"}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] !w-full"
          )}
        />
        <div className="relative flex flex-col gap-11 mx-auto text-white rounded">
          <h1 className="text-center text-4xl md:text-7xl md:h-24 font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-600">
            {product.title}
          </h1>
          <div>
            <p className="mb-4">{product.description}</p>
            <p className="mb-4">Price: ${product.price}</p>
          </div>

          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="md:w-80 h-80 object-cover mt-4 mx-auto"
            />
          ) : (
            <div>No image available</div>
          )}

          {/* Display public URL */}
          {/* <div className="my-4">
            <h2 className="text-lg font-semibold">Share Product</h2>
            <div className="flex items-center mt-2">
              <input
                type="text"
                value={productUrl}
                disabled
                className="w-full p-2 mr-2 border rounded"
              />
              <Button onClick={copyToClipboard}>Copy URL</Button>
            </div>
          </div> */}

          <ScriptCopyBtn
            showMultiplePackageOptions={true}
            codeLanguage="shell"
            lightTheme="nord"
            darkTheme="vitesse-dark"
            commandMap={customCommandMap}
            className="!w-60 mx-auto !ml-0"
          />

          {/* Accept Reviews Switch */}
          <div className="flex">
            <Switch
              checked={isAcceptingReviews}
              onCheckedChange={handleSwitchChange}
              disabled={isSwitchLoading}
            />
            <span className="ml-2">
              Accept Reviews: {isAcceptingReviews ? "On" : "Off"}
            </span>
          </div>

          {/* Refresh Reviews Button */}
          <div>
            <Button
              className="mt-4"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                fetchProductDetails(params.id); // Refresh product details
                toast({
                  title: "Refreshed Product",
                  description: "Showing latest product details",
                });
              }}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="overflow-y-auto h-[30rem] w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Display reviews if available */}
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review, index) => (
                  <MessageCard key={index} message={review} />
                ))
              ) : (
                <p>No reviews available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetailsPage;
