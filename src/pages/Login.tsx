import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { USERS } from "@/data/users";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("❌ Wrong email or password. Are you even a real cheese fan?");
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Floating cheese background decorations */}
      <span className="absolute top-10 left-10 text-5xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: "0s" }}>🧀</span>
      <span className="absolute top-32 right-16 text-3xl opacity-15 animate-float pointer-events-none" style={{ animationDelay: "1.5s" }}>🧀</span>
      <span className="absolute bottom-20 left-20 text-4xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: "3s" }}>🧀</span>
      <span className="absolute bottom-40 right-10 text-2xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: "0.8s" }}>🧀</span>
      <span className="absolute top-1/2 left-5 text-3xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: "2s" }}>🧀</span>

      {/* Logo */}
      <Link to="/" className="mb-10 font-bold text-2xl hover:opacity-80 transition-opacity z-10">
        <span className="text-gradient-cheese">Brie</span>
        <span className="text-foreground">Hosting</span>
        <span className="text-secondary">.be</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border-2 border-primary/40 bg-card p-8 glow-cheese z-10">
        {/* Floating cheese icon */}
        <div className="text-center mb-6">
          <span className="text-6xl animate-float inline-block">🧀</span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 animate-pulse-glow">
            <span className="text-primary font-meme text-sm">🧀 Welcome back, cheese enjoyer 🧀</span>
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-gradient-cheese">Log In</span>
          </h1>
          <p className="text-muted-foreground font-meme text-sm mt-2">
            Your gouda stuff is waiting for you.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl border border-destructive/50 bg-destructive/10 text-destructive text-sm font-meme">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brie.be"
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-base glow-cheese hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="inline-block animate-spin">🧀</span>
            ) : (
              "Log In 🧀"
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowHints((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground font-meme hover:border-primary/40 transition-colors"
          >
            <span>🧪 Demo accounts (shh, don't tell the cheese police)</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showHints ? "rotate-180" : ""}`} />
          </button>
          {showHints && (
            <div className="mt-2 rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              {USERS.map((u) => (
                <div key={u.id} className="text-xs font-meme border-b border-border last:border-0 pb-3 last:pb-0">
                  <p className="text-foreground font-bold">{u.name} — {u.plan}</p>
                  <p className="text-muted-foreground">📧 {u.email}</p>
                  <p className="text-muted-foreground">🔑 {u.password}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign-up link */}
        <p className="text-center text-sm text-muted-foreground font-meme mt-6">
          No account yet?{" "}
          <Link to="/signup" className="text-primary hover:underline font-bold">
            Sign up for free 🚀
          </Link>
        </p>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs text-muted-foreground font-meme text-center z-10">
        © 2026 BrieHosting.be — Made with 🧀 in Belgium
      </p>
    </div>
  );
};

export default Login;
