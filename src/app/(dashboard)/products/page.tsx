"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"; // Make sure you import the dialog components
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { PlusIcon } from "lucide-react"; // You can use any icon library like Lucide
import { Breadcrumbs } from "@/components/breadcrumbs";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { AuthorCard } from "@/components/content-card";
import { MessageLoading } from "@/components/ui/message-loading";

function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false); // To control dialog visibility
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    isAcceptingReviews: true,
  });

  // Fetch products on page load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/get-product");
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/create-product", formData);
      if (response.data.success) {
        setProducts((prev) => [...prev, response.data.product]); // Add the new product to the list
        setOpenDialog(false); // Close the dialog after successful product creation
        setFormData({
          title: "",
          description: "",
          price: "",
          image: "",
          isAcceptingReviews: true,
        }); // Reset form fields
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <MessageLoading />
      </div>
    );

  return (
    <>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/products", label: "Products" },
          ]}
        />
      </div>

      <div className="relative h-[90vh]">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="p-4 border rounded shadow"
            >
              {/* <img
                src={product.image}
                alt={product.title}
                className="object-cover h-20 w-20"
              />
              <h2 className="font-bold">{product.title}</h2>
              <p>{product.description}</p>
              <p>${product.price}</p> */}
              <AuthorCard
                backgroundImage={product.image}
                // author={{
                //   name: "",
                //   avatar: "",
                //   readTime: "",
                // }}
                content={{
                  title: product.title,
                  description: product.description,
                }}
                className="cursor-pointer "
              />
            </Link>
          ))}
        </div>

        {/* Floating + button to open dialog */}
        <Button
          className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg bg-blue-500 text-white"
          onClick={() => setOpenDialog(true)}
        >
          <PlusIcon className="h-6 w-6" />
        </Button>

        {/* Dialog for product creation */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger />
          <DialogContent>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new product.
            </DialogDescription>

            {/* Form to add product */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Product Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border rounded px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border rounded px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isAcceptingReviews}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isAcceptingReviews: e.target.checked,
                    })
                  }
                  id="isAcceptingReviews"
                />
                <label htmlFor="isAcceptingReviews" className="text-sm">
                  Accept Reviews
                </label>
              </div>

              {/* DialogFooter for submit and cancel actions */}
              <DialogFooter>
                <Button type="submit" className="bg-green-500 text-white">
                  Create Product
                </Button>
                <DialogClose asChild>
                  <Button className="bg-gray-500 text-white">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default ProductList;
