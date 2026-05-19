import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useMfaStatus } from "@/hooks/useMfaStatus";
import { supabase } from "@/lib/supabase";
import {
  accountProfileSchema,
  changeEmailSchema,
  changePasswordSchema,
  type AccountProfileFormData,
  type ChangeEmailFormData,
  type ChangePasswordFormData,
} from "@/lib/validations";

export default function AccountSettingsPage() {
  const { user, signOut, updatePassword } = useAuth();
  const { loading: mfaLoading, profileRequires2fa, verifiedFactors, currentLevel, error: mfaError } = useMfaStatus();
  const navigate = useNavigate();

  const initialDisplayName = useMemo(() => {
    const name = user?.user_metadata?.full_name;
    return typeof name === "string" ? name : "";
  }, [user?.id, user?.user_metadata?.full_name]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<AccountProfileFormData>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: {
      fullName: initialDisplayName,
    },
  });

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: user?.email ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const onProfileSubmit = async (data: AccountProfileFormData) => {
    setProfileError(null);
    setProfileMessage(null);
    setIsProfileSubmitting(true);

    const fullName = data.fullName?.trim() ?? "";
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.length > 0 ? fullName : null,
      },
    });

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileMessage("Profile updated successfully.");
    }

    setIsProfileSubmitting(false);
  };

  const onEmailSubmit = async (data: ChangeEmailFormData) => {
    if (!user?.email) {
      setEmailError("No active account found.");
      return;
    }

    setEmailError(null);
    setEmailMessage(null);

    if (data.email.toLowerCase() === user.email.toLowerCase()) {
      setEmailError("Please enter a different email address.");
      return;
    }

    setIsEmailSubmitting(true);

    const { error } = await supabase.auth.updateUser({ email: data.email });

    if (error) {
      setEmailError(error.message);
    } else {
      setEmailMessage("Check both inboxes to confirm your email change.");
    }

    setIsEmailSubmitting(false);
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    setPasswordError(null);
    setPasswordMessage(null);
    setIsPasswordSubmitting(true);

    const { error } = await updatePassword(data.password);

    if (error) {
      setPasswordError(error);
    } else {
      setPasswordMessage("Password updated successfully.");
      resetPasswordForm();
    }

    setIsPasswordSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="font-bold text-xl">
            <span className="text-gradient-cheese">Brie</span>
            <span className="text-foreground">Hosting</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your profile details, login email, and password.</p>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-1">Profile</h2>
            <p className="text-sm text-muted-foreground mb-4">Update your public display name stored in Supabase user metadata.</p>

            {profileError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm mb-4">
                {profileError}
              </div>
            )}
            {profileMessage && (
              <div className="bg-accent/20 border border-accent/40 text-foreground rounded-lg p-3 text-sm mb-4">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1.5">
                  Display name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Captain Brie"
                  {...registerProfile("fullName")}
                />
                {profileErrors.fullName && (
                  <p className="text-destructive text-xs mt-1">{profileErrors.fullName.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {isProfileSubmitting ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-1">Email</h2>
            <p className="text-sm text-muted-foreground mb-4">Change your login email. Supabase may require confirmation before it becomes active.</p>

            {emailError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm mb-4">
                {emailError}
              </div>
            )}
            {emailMessage && (
              <div className="bg-accent/20 border border-accent/40 text-foreground rounded-lg p-3 text-sm mb-4">
                {emailMessage}
              </div>
            )}

            <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  New email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@example.com"
                  {...registerEmail("email")}
                />
                {emailErrors.email && (
                  <p className="text-destructive text-xs mt-1">{emailErrors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isEmailSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {isEmailSubmitting ? "Updating..." : "Update Email"}
              </button>
            </form>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-1">Password</h2>
            <p className="text-sm text-muted-foreground mb-4">Set a stronger password for your account.</p>

            {passwordError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm mb-4">
                {passwordError}
              </div>
            )}
            {passwordMessage && (
              <div className="bg-accent/20 border border-accent/40 text-foreground rounded-lg p-3 text-sm mb-4">
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  {...registerPassword("password")}
                />
                {passwordErrors.password && (
                  <p className="text-destructive text-xs mt-1">{passwordErrors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  {...registerPassword("confirmPassword")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPasswordSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {isPasswordSubmitting ? "Saving..." : "Update Password"}
              </button>
            </form>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-foreground mb-1">Two-factor authentication</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Protect your account with a code from an authenticator app when signing in.
            </p>

            {mfaError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm mb-4">
                {mfaError}
              </div>
            )}

            {mfaLoading ? (
              <div className="text-primary text-sm animate-pulse">Checking two-factor status...</div>
            ) : verifiedFactors.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-accent/20 border border-accent/40 text-foreground rounded-lg p-3 text-sm">
                  Two-factor authentication is enabled{profileRequires2fa ? " and required" : ""}.
                </div>
                {currentLevel !== "aal2" && (
                  <Link
                    to="/verify-2fa"
                    state={{ from: "/account-settings" }}
                    className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform"
                  >
                    Verify 2FA
                  </Link>
                )}
              </div>
            ) : (
              <Link
                to="/setup-2fa"
                state={{ from: "/account-settings" }}
                className="inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform"
              >
                Enable 2FA
              </Link>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
