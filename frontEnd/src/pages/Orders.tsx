import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

interface Order {
  _id: string;
  orderItems: { name: string; image: string; price: number; quantity: number }[];
  total: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
  shippingAddress: { fullName: string; city: string; country: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusSteps = ["pending", "processing", "shipped", "delivered"];

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    api.get("/api/orders/myorders")
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (orders.length === 0) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">No Orders Yet</h2>
        <p className="text-muted-foreground">You haven't placed any orders yet</p>
        <button onClick={() => navigate("/shop")}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          Start Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="rounded-xl border bg-card overflow-hidden">
              {/* Order Header */}
              <div className="bg-secondary/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm font-medium">{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-bold text-primary">${order.total}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Payment</p>
                  <p className="text-sm font-medium capitalize">{order.paymentMethod}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.orderStatus] || "bg-gray-100 text-gray-700"}`}>
                  {order.orderStatus}
                </span>
              </div>

              {/* Progress Bar */}
              {order.orderStatus !== "cancelled" && (
                <div className="px-6 py-4 border-b">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-3 h-1 bg-secondary">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${(statusSteps.indexOf(order.orderStatus) / (statusSteps.length - 1)) * 100}%`
                        }}
                      />
                    </div>
                    {statusSteps.map((step, i) => {
                      const currentIndex = statusSteps.indexOf(order.orderStatus);
                      return (
                        <div key={step} className="flex flex-col items-center gap-2 z-10">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            i <= currentIndex
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-background border-muted"
                          }`}>
                            {i <= currentIndex && <span className="text-xs">✓</span>}
                          </div>
                          <span className="text-xs capitalize text-muted-foreground">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="p-6 space-y-4">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <img src={item.image} alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-secondary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-1">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div className="px-6 pb-6">
                <p className="text-sm text-muted-foreground">
                  📍 {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.country}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}