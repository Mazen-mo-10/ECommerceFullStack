import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, ShoppingBag, Heart, LogOut, Settings } from "lucide-react";

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading || !user) return null;

  const quickLinks = [
    { label: "My Wishlist", icon: Heart, path: "/wishlist" },
    { label: "Shop Now", icon: ShoppingBag, path: "/shop" },
    ...(user.role === "admin"
      ? [{ label: "Admin Dashboard", icon: Settings, path: "/admin" }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">My Account</h1>

        {/* User Info */}
        <div className="rounded-xl border bg-card p-6 mb-6 flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground mt-1">{user.email}</p>
            <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full mt-2 inline-block capitalize font-medium">
              {user.role}
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className={`grid gap-4 mb-6 ${quickLinks.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {quickLinks.map(({ label, icon: Icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="rounded-xl border bg-card p-6 flex flex-col items-center gap-3 hover:border-primary hover:shadow-md transition-all w-full"
            >
              <Icon className="h-8 w-8 text-primary" />
              <span className="font-medium text-sm text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button variant="destructive" size="lg" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}