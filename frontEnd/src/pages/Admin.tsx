import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "Phones",
    image: "",
    stock: "",
    isNew: false,
    isFeatured: false,
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) navigate("/");
  }, [user, loading]);

  useEffect(() => {
    if (activeTab === "stats") fetchStats();
    if (activeTab === "products") fetchProducts();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "orders") fetchOrders();
  }, [activeTab]);

  const fetchStats = async () => {
    const { data } = await api.get("/api/users/admin/stats");
    setStats(data);
  };

  const fetchProducts = async () => {
    const { data } = await api.get("/api/products");
    setProducts(data.products);
  };

  const fetchUsers = async () => {
    const { data } = await api.get("/api/users");
    setUsers(data.users);
  };

  const fetchOrders = async () => {
    const { data } = await api.get("/api/orders/admin/all");
    setOrders(data.orders);
  };

  const handleAddProduct = async () => {
    try {
      await api.post("/api/products", {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice
          ? Number(productForm.originalPrice)
          : undefined,
        stock: Number(productForm.stock),
      });
      toast.success("Product added!");
      setShowAddProduct(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error adding product");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await api.put(`/api/products/${editProduct._id}`, {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice
          ? Number(productForm.originalPrice)
          : undefined,
        stock: Number(productForm.stock),
      });
      toast.success("Product updated!");
      setEditProduct(null);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error updating product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/api/products/${id}`);
      toast.success("Product deleted!");
      fetchProducts();
    } catch {
      toast.error("Error deleting product");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success("User deleted!");
      fetchUsers();
    } catch {
      toast.error("Error deleting user");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { orderStatus: status });
      toast.success("Order updated!");
      fetchOrders();
    } catch {
      toast.error("Error updating order");
    }
  };

  const handleToggleRole = async (id: string) => {
    try {
      await api.put(`/api/users/${id}/role`);
      toast.success("Role updated!");
      fetchUsers();
    } catch {
      toast.error("Error updating role");
    }
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: "Phones",
      image: "",
      stock: "",
      isNew: false,
      isFeatured: false,
    });
  };

  const openEdit = (product: any) => {
    setEditProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      category: product.category,
      image: product.image,
      stock: String(product.stock),
      isNew: product.isNew || false,
      isFeatured: product.isFeatured || false,
    });
  };

  const categories = [
    "Phones",
    "Computers",
    "SmartWatch",
    "Camera",
    "HeadPhones",
    "Gaming",
  ];
  const orderStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          {["stats", "products", "orders", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ===== STATS TAB ===== */}
        {activeTab === "stats" && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Users",
                  value: stats.stats.totalUsers,
                  icon: Users,
                  color: "text-blue-500",
                },
                {
                  label: "Total Products",
                  value: stats.stats.totalProducts,
                  icon: Package,
                  color: "text-green-500",
                },
                {
                  label: "Total Orders",
                  value: stats.stats.totalOrders,
                  icon: ShoppingBag,
                  color: "text-orange-500",
                },
                {
                  label: "Revenue",
                  value: `$${stats.stats.totalRevenue.toFixed(2)}`,
                  icon: DollarSign,
                  color: "text-primary",
                },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Total</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order._id} className="border-t">
                        <td className="p-3">{order.user?.name || "N/A"}</td>
                        <td className="p-3 font-medium text-primary">
                          ${order.total}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.orderStatus === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.orderStatus === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {products.length} products
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setShowAddProduct(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>

            {/* Product Form Modal */}
            {(showAddProduct || editProduct) && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-card rounded-lg border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                      {editProduct ? "Edit Product" : "Add Product"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowAddProduct(false);
                        setEditProduct(null);
                      }}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {[
                    { label: "Name", key: "name", type: "text" },
                    { label: "Description", key: "description", type: "text" },
                    { label: "Price", key: "price", type: "number" },
                    {
                      label: "Original Price (optional)",
                      key: "originalPrice",
                      type: "number",
                    },
                    { label: "Image URL", key: "image", type: "text" },
                    { label: "Stock", key: "stock", type: "number" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label>{field.label}</Label>
                      <Input
                        type={field.type}
                        value={(productForm as any)[field.key]}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            [field.key]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}

                  <div className="space-y-1">
                    <Label>Category</Label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full border rounded-md px-3 py-2 bg-background text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isNew}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            isNew: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm">New</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            isFeatured: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm">Featured</span>
                    </label>
                  </div>

                  <Button
                    className="w-full"
                    onClick={
                      editProduct ? handleUpdateProduct : handleAddProduct
                    }
                  >
                    {editProduct ? "Update Product" : "Add Product"}
                  </Button>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-3">Product</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Stock</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover bg-secondary"
                          />
                          <span className="font-medium line-clamp-1">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {product.category}
                      </td>
                      <td className="p-3 font-medium text-primary">
                        ${product.price}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock > 10
                              ? "bg-green-100 text-green-700"
                              : product.stock > 0
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.stock} left
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="p-1 hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== ORDERS TAB ===== */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">{orders.length} orders</p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-3">Customer</th>
                    <th className="text-left p-3">Items</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-t">
                      <td className="p-3">
                        <p className="font-medium">
                          {order.user?.name || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.user?.email}
                        </p>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {order.orderItems.length} items
                      </td>
                      <td className="p-3 font-medium text-primary">
                        ${order.total}
                      </td>
                      <td className="p-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order._id, e.target.value)
                          }
                          className="border rounded px-2 py-1 text-xs bg-background"
                        >
                          {orderStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== USERS TAB ===== */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">{users.length} users</p>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Role</th>
                    <th className="text-left p-3">Joined</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === "admin"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {u._id !== user?._id && (
                            <>
                              <button
                                onClick={() => handleToggleRole(u._id)}
                                className="text-xs px-2 py-1 rounded border hover:border-primary hover:text-primary transition-colors"
                              >
                                {u.role === "admin"
                                  ? "Make User"
                                  : "Make Admin"}
                              </button>
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="p-1 hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
