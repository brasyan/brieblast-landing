import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function RegisterPage() {
  const { signUp, user, loading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    if (!turnstileSiteKey) {
      setTurnstileError("Security check is not configured.");
      return;
    }

    if (!turnstileToken) {
      setTurnstileError("Please complete the security check.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, turnstileToken);
    if (error) {
      setServerError(error);
      setTurnstileToken(null);
      setTurnstileKey((previous) => previous + 1);
    } else {
      setEmailSent(true);
    }
    setIsSubmitting(false);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <Link to="/" className="block mb-8">
            <span className="font-bold text-3xl">
              <span className="text-gradient-cheese">Brie</span>
              <span className="text-foreground">Hosting</span>
            </span>
          </Link>
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="text-5xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Check your email!</h1>
            <p className="text-muted-foreground text-sm">
              We've sent a confirmation link to your email address. Click it to activate your account.
            </p>
            <Link
              to="/login"
              className="inline-block mt-6 text-primary hover:underline font-medium text-sm"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="block text-center mb-8">
          <span className="font-bold text-3xl">
            <span className="text-gradient-cheese">Brie</span>
            <span className="text-foreground">Hosting</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            Create an account 🚀
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Join the cheesiest hosting on the internet
          </p>

          {serverError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm mb-4">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="cheese@briehosting.be"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• At least 8 characters</li>
              <li>• One uppercase letter</li>
              <li>• One number</li>
              <li>• One special character</li>
            </ul>

            <TurnstileWidget
              key={turnstileKey}
              siteKey={turnstileSiteKey}
              className="flex justify-center"
              onVerify={(token) => {
                setTurnstileToken(token);
                setTurnstileError(null);
              }}
              onExpire={() => {
                setTurnstileToken(null);
                setTurnstileError("Security check expired. Please complete it again.");
              }}
              onError={(message) => {
                setTurnstileToken(null);
                setTurnstileError(message);
              }}
            />
            {turnstileError && (
              <p className="text-destructive text-xs">{turnstileError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !turnstileToken || !turnstileSiteKey}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Creating account..." : "Create Account 🧀"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
