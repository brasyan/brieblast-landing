import { Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        <span className="absolute top-10 right-10 text-5xl opacity-20 animate-float pointer-events-none">🧀</span>
        <span className="absolute bottom-20 left-16 text-3xl opacity-15 animate-float pointer-events-none" style={{ animationDelay: "2s" }}>🧀</span>
        <Link to="/" className="mb-10 font-bold text-2xl hover:opacity-80 transition-opacity z-10">
          <span className="text-gradient-cheese">Brie</span>
          <span className="text-foreground">Hosting</span>
          <span className="text-secondary">.be</span>
        </Link>
        <div className="w-full max-w-md rounded-2xl border-2 border-primary/40 bg-card p-10 glow-cheese z-10 text-center space-y-6">
          <span className="text-6xl animate-float inline-block">🧀</span>
          <h2 className="text-2xl font-bold text-foreground">Coming soon, cheese friend!</h2>
          <p className="text-muted-foreground font-meme text-sm">
            Account creation is coming soon! For now, use one of our demo accounts on the login page. 🧀
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold glow-cheese hover:scale-105 transition-transform"
          >
            Go to Login 🧀
          </Link>
        </div>
        <p className="mt-8 text-xs text-muted-foreground font-meme text-center z-10">
          © 2026 BrieHosting.be — Made with 🧀 in Belgium
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Floating cheese background decorations */}
      <span className="absolute top-10 right-10 text-5xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: "0.5s" }}>🧀</span>
      <span className="absolute bottom-20 left-16 text-3xl opacity-15 animate-float pointer-events-none" style={{ animationDelay: "2s" }}>🧀</span>
      <span className="absolute top-1/3 left-8 text-2xl opacity-10 animate-float pointer-events-none" style={{ animationDelay: "1s" }}>🧀</span>

      {/* Logo */}
      <Link to="/" className="mb-10 font-bold text-2xl hover:opacity-80 transition-opacity z-10">
        <span className="text-gradient-cheese">Brie</span>
        <span className="text-foreground">Hosting</span>
        <span className="text-secondary">.be</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border-2 border-primary/40 bg-card p-8 glow-cheese z-10">
        {/* Demo mode banner */}
        <div className="mb-6 px-4 py-3 rounded-xl border border-secondary/40 bg-secondary/10 text-secondary text-xs font-meme text-center">
          🧪 Demo mode — new signups are disabled. Use the{" "}
          <Link to="/login" className="underline font-bold hover:text-primary">
            login page
          </Link>{" "}
          with a demo account.
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl animate-float inline-block mb-4">🧀</span>
          <div className="inline-block mb-4 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 animate-pulse-glow">
            <span className="text-primary font-meme text-sm">🧀 Join the cheesy side 🧀</span>
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-gradient-cheese">Sign Up</span>
          </h1>
          <p className="text-muted-foreground font-meme text-sm mt-2">
            Free for 14 days. No credit card required. 🎉
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name field */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="w-4 h-4" />
              </span>
              <input
                id="name"
                type="text"
                placeholder="Your name"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="you@brie.be"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
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

          {/* Confirm password field */}
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="block text-sm font-medium text-foreground">Confirm Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5">
            <input id="terms" type="checkbox" className="mt-0.5 accent-primary cursor-pointer" />
            <label htmlFor="terms" className="text-xs text-muted-foreground font-meme leading-relaxed cursor-pointer">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              {" "}(yes we actually have those 🙏)
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-base glow-cheese hover:scale-105 transition-transform"
          >
            Create Account 🧀
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground font-meme mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-bold">
            Log in here 🧀
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

export default SignUp;
