import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { Product } from "@/types/product";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "eshop_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const syncCart = async () => {
        try {
          const { data } = await api.get("/api/cart");
          const dbItems: CartItem[] = data.cart.map((item: any) => ({
            ...item.product,
            quantity: item.quantity,
          }));

          const localItems: CartItem[] = JSON.parse(
            localStorage.getItem(CART_STORAGE_KEY) || "[]",
          );

          if (localItems.length === 0) {
            setItems(dbItems);
            return;
          }

          if (dbItems.length === 0) {
            setItems(localItems);
            await api.post("/api/cart", { items: localItems });
            return;
          }

          const merged = [...dbItems];
          localItems.forEach((localItem) => {
            const exists = merged.find((i) => i._id === localItem._id);
            if (!exists) {
              merged.push(localItem);
            }
          });
          setItems(merged);
          await api.post("/api/cart", { items: merged });
        } catch (error) {
          console.error(error);
        }
      };
      syncCart();
    } else {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      setItems(stored ? JSON.parse(stored) : []);
    }
  }, [user]);

  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));

    if (user && items.length > 0) {
      api.post("/api/cart", { items }).catch(() => {});
    }
  }, [items, user]);

  const addItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
    if (user) api.delete("/api/cart").catch(() => {});
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
