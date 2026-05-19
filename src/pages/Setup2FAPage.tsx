import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMfaStatus } from "@/hooks/useMfaStatus";
import { supabase } from "@/lib/supabase";

interface Enrollment {
  factorId: string;
  qrImageSrc: string;
  secret: string;
  uri: string;
}

const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getQrSvgMarkup = (qrCode: string) => {
  if (qrCode.startsWith("data:image/svg+xml")) {
    const [, payload = ""] = qrCode.split(",", 2);
    return safeDecodeURIComponent(payload);
  }

  if (qrCode.includes("%3Csvg")) {
    return safeDecodeURIComponent(qrCode);
  }

  return qrCode;
};

const svgToDataUrl = (svg: string) => {
  const encodedSvg = window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encodedSvg}`;
};

export default function Setup2FAPage() {
  const { user, loading: authLoading } = useAuth();
  const { loading, error: statusError, needsChallenge, profileRequires2fa, refetch } = useMfaStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const from = typeof location.state?.from === "string" ? location.state.from : "/dashboard";

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasStartedEnrollment = useRef(false);

  useEffect(() => {
    if (!user || loading || needsChallenge || enrollment || hasStartedEnrollment.current) return;

    let isMounted = true;
    hasStartedEnrollment.current = true;

    const startEnrollment = async () => {
      setIsStarting(true);
      setError(null);

      const existingFactors = await supabase.auth.mfa.listFactors();
      if (existingFactors.error) {
        if (isMounted) setError(existingFactors.error.message);
        if (isMounted) setIsStarting(false);
        if (isMounted) hasStartedEnrollment.current = false;
        return;
      }

      const unverifiedTotpFactors = existingFactors.data.all.filter(
        (factor) => factor.factor_type === "totp" && factor.status === "unverified",
      );
      for (const factor of unverifiedTotpFactors) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Authenticator app ${Date.now()}`,
        issuer: "BrieHosting",
      });

      if (!isMounted) return;

      if (enrollError) {
        setError(enrollError.message);
        hasStartedEnrollment.current = false;
      } else {
        const qrSvg = getQrSvgMarkup(data.totp.qr_code);
        setEnrollment({
          factorId: data.id,
          qrImageSrc: svgToDataUrl(qrSvg),
          secret: data.totp.secret,
          uri: data.totp.uri,
        });
      }

      setIsStarting(false);
    };

    void startEnrollment();

    return () => {
      isMounted = false;
    };
  }, [enrollment, loading, needsChallenge, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (needsChallenge) {
    return <Navigate to="/verify-2fa" replace state={{ from }} />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!enrollment) {
      setError("Two-factor setup is still loading.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const challenge = await supabase.auth.mfa.challenge({ factorId: enrollment.factorId });

    if (challenge.error) {
      setError(challenge.error.message);
      setIsSubmitting(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollment.factorId,
      challengeId: challenge.data.id,
      code,
    });

    if (verifyError) {
      setError(verifyError.message);
      setCode("");
    } else {
      await supabase
        .from("profiles")
        .update({ two_factor_required: true })
        .eq("id", user.id);
      await refetch();
      navigate(from, { replace: true });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <span className="font-bold text-3xl">
            <span className="text-gradient-cheese">Brie</span>
            <span className="text-foreground">Hosting</span>
          </span>
        </Link>

        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">Set up two-factor authentication</h1>
          <p className="text-muted-foreground text-center text-sm mb-6">
            {profileRequires2fa
              ? "Your account requires this before continuing."
              : "Add an authenticator app to protect future sign-ins."}
          </p>

          {(statusError || error) && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm mb-4">
              {statusError ?? error}
            </div>
          )}

          {isStarting && (
            <div className="text-primary text-center text-sm animate-pulse">Preparing setup...</div>
          )}

          {enrollment && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex justify-center rounded-lg bg-white p-4">
                <img
                  src={enrollment.qrImageSrc}
                  alt="Authenticator app QR code"
                  className="h-56 w-56 object-contain [image-rendering:pixelated]"
                />
              </div>

              <a
                href={enrollment.uri}
                className="block text-center text-sm font-medium text-primary hover:underline"
              >
                Open in authenticator app
              </a>

              <div>
                <label htmlFor="secret" className="block text-sm font-medium text-foreground mb-1.5">
                  Manual setup key
                </label>
                <input
                  id="secret"
                  type="text"
                  readOnly
                  value={enrollment.secret}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-foreground mb-1.5">
                  Verification code
                </label>
                <input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring tracking-[0.4em] text-center"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || code.length !== 6}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? "Enabling..." : "Enable 2FA"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
