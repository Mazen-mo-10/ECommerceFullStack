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

interface Review {
  _id: string;
  user: { _id: string; name: string };
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/api/products/${id}`);
      setProduct(data.product);
      setReviews(data.product.reviews || []);
      const related = await api.get(`/api/products?category=${data.product.category}`);
      setRelatedProducts(related.data.products.filter((p: Product) => p._id !== id).slice(0, 4));
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleSubmitReview = async () => {
    if (!user) { toast.error("Please login first"); return; }
    if (userRating === 0) { toast.error("Please select a rating"); return; }
    if (!comment.trim()) { toast.error("Please write a comment"); return; }

    setSubmitting(true);
    try {
      await api.post(`/api/products/${id}/reviews`, {
        rating: userRating,
        comment,
      });
      toast.success("Review submitted!");
      setUserRating(0);
      setComment("");
      fetchProduct(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyReviewed = reviews.some((r) => r.user?._id === user?._id);

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
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
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

        {/* ===== REVIEWS SECTION ===== */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">
            Customer Reviews
            {reviews.length > 0 && (
              <span className="text-lg font-normal text-muted-foreground ml-3">
                ({reviews.length} reviews)
              </span>
            )}
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rating Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border bg-card p-6 text-center space-y-4">
                <div className="text-6xl font-bold text-primary">
                  {product.rating > 0 ? product.rating.toFixed(1) : "0"}
                </div>
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("h-6 w-6",
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                    )} />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">{product.numReviews} reviews</p>

                {/* Rating Bars */}
                <div className="space-y-2 text-left">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => Math.floor(r.rating) === star).length;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-3">{star}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-6 text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List + Add Review */}
            <div className="lg:col-span-2 space-y-6">

              {/* Add Review Form */}
              {user && !alreadyReviewed && (
                <div className="rounded-xl border bg-card p-6 space-y-4">
                  <h3 className="font-bold text-lg">Write a Review</h3>

                  {/* Star Selector */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star className={cn("h-8 w-8 transition-colors",
                            star <= (hoverRating || userRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted"
                          )} />
                        </button>
                      ))}
                    </div>
                    {userRating > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][userRating]}
                      </p>
                    )}
                  </div>

                  {/* Comment */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your Comment</p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows={4}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button onClick={handleSubmitReview} disabled={submitting} className="w-full">
                    {submitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              )}

              {/* Already Reviewed */}
              {user && alreadyReviewed && (
                <div className="rounded-xl border bg-primary/5 border-primary/20 p-4 text-sm text-primary">
                  ✓ You have already reviewed this product
                </div>
              )}

              {/* Login to Review */}
              {!user && (
                <div className="rounded-xl border bg-card p-6 text-center space-y-3">
                  <p className="text-muted-foreground">Login to write a review</p>
                  <Button variant="outline" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No reviews yet. Be the first to review!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="rounded-xl border bg-card p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {review.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{review.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric"
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("h-4 w-4",
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
                            )} />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
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