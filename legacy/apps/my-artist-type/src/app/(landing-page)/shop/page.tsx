"use client";

import { Button } from "@repo/ui";
import Image from "next/image";

const products = [
  {
    name: "Artist Type Guide",
    description:
      "A comprehensive guide to understanding your artist type and creative process.",
    price: "$19.99",
    image: "/placeholder.svg",
  },
  {
    name: "Creative Journal",
    description: "A beautifully designed journal tailored to your artist type.",
    price: "$24.99",
    image: "/placeholder.svg",
  },
  {
    name: "Art Course Bundle",
    description: "Online courses customized for each artist type.",
    price: "$99.99",
    image: "/placeholder.svg",
  },
  {
    name: "Premium Consultation",
    description: "One-on-one consultation to explore your artistic journey.",
    price: "$149.99",
    image: "/placeholder.svg",
  },
];

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-16 space-y-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Shop
          </h1>
          <p className="max-w-3xl text-xl text-muted-foreground">
            Discover resources and tools designed to help you develop your
            artistic style and creative practice.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="group relative space-y-4 rounded-lg bg-card p-6"
            >
              <div className="relative mb-6 aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {product.name}
              </h2>
              <p className="text-muted-foreground">{product.description}</p>
              <p className="text-lg font-medium text-foreground">
                {product.price}
              </p>
              <Button className="w-full">Add to Cart</Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
