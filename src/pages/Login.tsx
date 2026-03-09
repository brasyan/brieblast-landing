import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useSignIn } from "@clerk/react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn, isLoaded } = useSignIn();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        navigate("/dashboard");
      } else {
        setError("Additional verification required. Please check your email or authenticator app.");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError?.errors?.[0]?.message ?? "Login failed. Please try again.");
    }
  };

  const handleGoogleOAuth = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError?.errors?.[0]?.message ?? "Google sign-in failed. Please try again.");
    }
  };

  const handleGithubOAuth = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_github",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError?.errors?.[0]?.message ?? "GitHub sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <Link to="/" className="mb-10 font-bold text-2xl hover:opacity-80 transition-opacity">
        <span className="text-gradient-cheese">Brie</span>
        <span className="text-foreground">Hosting</span>
        <span className="text-secondary">.be</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border-2 border-border bg-card p-8 glow-cheese">
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
                placeholder="you@brie.be"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              {/* Placeholder — wire up to a /forgot-password route later */}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs text-primary hover:underline font-meme"
              >
                Forgot password? 😬
              </a>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          {error && <p className="text-sm text-destructive font-meme">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold text-base glow-cheese hover:scale-105 transition-transform"
          >
            Log In 🧀
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-meme">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* OAuth placeholder buttons — connect providers in the auth logic step */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleOAuth}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
          >
            {/* Replace with a real Google SVG icon when wiring up OAuth */}
            <span>G</span>
            Google
          </button>
          <button
            type="button"
            onClick={handleGithubOAuth}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
          >
            {/* Replace with a real GitHub SVG icon when wiring up OAuth */}
            <span>⌥</span>
            GitHub
          </button>
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
      <p className="mt-8 text-xs text-muted-foreground font-meme text-center">
        © 2026 BrieHosting.be — Made with 🧀 in Belgium
      </p>
    </div>
  );
};

export default Login;
