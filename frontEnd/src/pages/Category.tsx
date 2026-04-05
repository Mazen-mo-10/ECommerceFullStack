import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/products";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const category = categories.find((c) => c.slug === slug);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const categoryName = category?.name || slug;
        const { data } = await api.get(`/api/products?category=${categoryName}`);
        setProducts(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Category Not Found</h1>
          <Link to="/shop"><Button><ArrowLeft className="mr-2 h-4 w-4" />Back to Shop</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary/30 py-12">
        <div className="container mx-auto px-4">
          <Link to="/shop">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Shop
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-muted-foreground">{products.length} products available</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-80 rounded-lg bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <h2 className="text-2xl font-bold">No Products Yet</h2>
            <p className="text-muted-foreground">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}