import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { Lock } from "lucide-react";
import api from "@/lib/api";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
});

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    country: "Egypt",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const shipping = total > 50 ? 0 : 10;
  const finalTotal = total + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please login first"); navigate("/auth"); return; }
    setIsProcessing(true);
    setErrors({});

    try {
      const result = checkoutSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        setIsProcessing(false);
        return;
      }

      const orderItems = items.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      }));

      await api.post("/api/orders", {
        orderItems,
        shippingAddress: formData,
        paymentMethod: "cash",
      });

      clearCart();
      toast.success("Order placed successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-2xl font-bold">Shipping Information</h2>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={errors.fullName ? "border-destructive" : ""} />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={errors.address ? "border-destructive" : ""} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={errors.city ? "border-destructive" : ""} />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input id="country" value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className={errors.country ? "border-destructive" : ""} />
                    {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={errors.phone ? "border-destructive" : ""} />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 p-3 bg-secondary rounded-lg">
                  <Lock className="h-4 w-4" />
                  <span>Payment method: Cash on Delivery</span>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                {isProcessing ? "Placing Order..." : `Place Order — $${finalTotal.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-card p-6 space-y-6 sticky top-4">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover bg-secondary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}