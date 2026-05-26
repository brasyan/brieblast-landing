import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NavBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-center gap-4 sm:gap-8">
        <Link to="/" className="font-bold text-lg sm:text-xl flex-shrink-0">
          <span className="text-gradient-cheese">Brie</span>
          <span className="text-foreground">Hosting</span>
        </Link>
        <div className="hidden md:flex items-center justify-center gap-6 text-sm text-muted-foreground flex-1">
          <a href="/#features" className="hover:text-primary transition-colors">Features</a>
          <a href="/#pricing" className="hover:text-primary transition-colors">Pricing</a>
          <a href="/status" className="hover:text-primary transition-colors">Status</a>
        </div>
        {user ? (
          <>
            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/account-settings"
                className="px-3 py-2 rounded-lg border border-border text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                Settings
              </Link>
              <Link
                to="/dashboard"
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:scale-105 transition-transform"
              >
                Dashboard 🧀
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 rounded-lg border border-border text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                Sign out
              </button>
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg border border-border hover:border-primary transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hidden sm:block px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-105 transition-transform"
            >
              Login 🧀
            </Link>
            <Link
              to="/login"
              className="sm:hidden px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:scale-105 transition-transform"
            >
              Login
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {user && mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard 🧀
            </Link>
            <Link
              to="/account-settings"
              className="block px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 rounded-lg border border-destructive/40 text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
