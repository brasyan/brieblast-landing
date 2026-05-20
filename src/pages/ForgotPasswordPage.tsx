import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations";
import TurnstileWidget from "@/components/TurnstileWidget";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
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
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
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
    const { error } = await resetPassword(data.email, turnstileToken);
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
              If an account exists with that email, we've sent a password reset link.
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="block text-center mb-6 sm:mb-8">
          <span className="font-bold text-2xl sm:text-3xl">
            <span className="text-gradient-cheese">Brie</span>
            <span className="text-foreground">Hosting</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2">
            Forgot your password? 🔑
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            No worries, we'll send you a reset link
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
              className="w-full py-3 sm:py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
