import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types/product";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface WishlistContextType {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);
  const { user } = useAuth();

  // لو user logged in جيب الـ wishlist من الـ DB
  useEffect(() => {
    if (user) {
      api.get("/api/users/profile").then(({ data }) => {
        setItems(data.user.wishlist || []);
      });
    } else {
      setItems([]);
    }
  }, [user]);

  const toggleWishlist = async (product: Product) => {
    if (!user) return;
    const { data } = await api.put(`/api/users/wishlist/${product._id}`);
    // refresh wishlist from DB
    const profile = await api.get("/api/users/profile");
    setItems(profile.data.user.wishlist || []);
  };

  const isWishlisted = (productId: string) => {
    return items.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};