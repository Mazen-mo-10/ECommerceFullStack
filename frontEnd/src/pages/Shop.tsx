import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { categories } from "@/data/products";
import { Product } from "@/types/product";
import api from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 3000]);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, priceRange]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;
        if (sortBy === "price-low") params.sort = "price-asc";
        else if (sortBy === "price-high") params.sort = "price-desc";
        else if (sortBy === "rating") params.sort = "rating";
        params.minPrice = String(priceRange[0]);
        params.maxPrice = String(priceRange[1]);

        const { data } = await api.get("/api/products", {
          params: { ...params, page: currentPage, limit: 9 },
        });
        setProducts(data.products);
        setTotalPages(data.pages);
        setTotalProducts(data.total);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy, priceRange, currentPage]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : "Shop"}
          </h1>
          <p className="text-muted-foreground">
            Showing {products.length} of {products.length} products
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="rounded-lg border bg-card p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Category</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Products
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.name ? "default" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Price Range</h3>
                <div className="space-y-4">
                  <Slider
                    min={0}
                    max={3000}
                    step={50}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {products.length} Products
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <SkeletonGrid count={8} />
            ) : products.length === 0 ? (
              <div className="text-center py-16 space-y-6">
                <p className="text-xl text-muted-foreground">
                  {searchQuery
                    ? `No results found for "${searchQuery}"`
                    : "No products found"}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.slice(0, 3).map((cat) => (
                    <Link key={cat.id} to={`/category/${cat.slug}`}>
                      <Button variant="outline">{cat.name}</Button>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
            {/*Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg border transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:border-primary"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
