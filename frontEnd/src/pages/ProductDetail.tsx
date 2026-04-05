import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft, Heart, Minus, Plus, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/types/product";
import api from "@/lib/api";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data.product);
        // fetch related
        const related = await api.get(`/api/products?category=${data.product.category}`);
        setRelatedProducts(related.data.products.filter((p: Product) => p._id !== id).slice(0, 4));
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Product Not Found</h1>
          <Button onClick={() => navigate("/shop")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const handleWishlist = () => {
    if (!user) { toast.error("Please login first"); return; }
    toggleWishlist(product);
    toast.success(isWishlisted(product._id) ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.isNew && (
              <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                New Arrival
              </span>
            )}
            <h1 className="text-4xl font-bold">{product.name}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("h-5 w-5",
                    i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                  )} />
                ))}
              </div>
              <span className="text-muted-foreground">({product.numReviews} reviews)</span>
              <span className={cn("px-3 py-1 rounded-full text-sm font-medium",
                product.stock > 0
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}>
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
                  Add to Cart
                </Button>
                <Button size="lg" variant={isWishlisted(product._id) ? "default" : "outline"} onClick={handleWishlist}>
                  <Heart className={cn("h-5 w-5", isWishlisted(product._id) && "fill-current")} />
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-6 space-y-4 bg-secondary/30">
              <div className="flex items-start gap-4">
                <Truck className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Free Delivery</h3>
                  <p className="text-sm text-muted-foreground">Free shipping on orders over $50</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}