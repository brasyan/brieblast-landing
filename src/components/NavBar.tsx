import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const NavBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          <span className="text-gradient-cheese">Brie</span>
          <span className="text-foreground">Hosting</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-primary transition-colors">Features</a>
          <a href="/#pricing" className="hover:text-primary transition-colors">Pricing</a>
          <a href="/status" className="hover:text-primary transition-colors">Status</a>
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/account-settings"
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              Settings
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform"
            >
              Dashboard 🧀
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform"
          >
            Login 🧀
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
