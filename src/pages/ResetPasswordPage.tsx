import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations";

export default function ResetPasswordPage() {
  const { updatePassword, session, loading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Wait for loading to complete before checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  // User must have a session (from the reset email link) to access this page
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    const { error } = await updatePassword(data.password);
    if (error) {
      setServerError(error);
    } else {
      setSuccess(true);
    }
    setIsSubmitting(false);
  };

  if (success) {
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
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Password updated!</h1>
            <p className="text-muted-foreground text-sm">
              Your password has been successfully changed.
            </p>
            <Link
              to="/dashboard"
              className="inline-block mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform"
            >
              Go to Dashboard
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
            Set new password 🔐
          </h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Choose a strong new password
          </p>

          {serverError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm mb-4">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                New Password
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
                Confirm New Password
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
