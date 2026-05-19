import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMfaStatus } from "@/hooks/useMfaStatus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY_PREFIX = "briehosting:mfa-intro-dismissed";
const EXCLUDED_PATHS = new Set(["/setup-2fa", "/verify-2fa", "/login", "/register", "/forgot-password", "/reset-password"]);

const getStorageKey = (userId: string) => `${STORAGE_KEY_PREFIX}:${userId}`;

const hasDismissedPrompt = (userId: string) => {
  try {
    return window.localStorage.getItem(getStorageKey(userId)) === "true";
  } catch {
    return true;
  }
};

const dismissPrompt = (userId: string) => {
  try {
    window.localStorage.setItem(getStorageKey(userId), "true");
  } catch {
    // Ignore storage failures. The dialog can safely reappear next session.
  }
};

export default function MfaEncouragementDialog() {
  const { user } = useAuth();
  const { loading, profileRequires2fa, verifiedFactors } = useMfaStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || loading || EXCLUDED_PATHS.has(location.pathname)) {
      setOpen(false);
      return;
    }

    const shouldPrompt = !profileRequires2fa && verifiedFactors.length === 0 && !hasDismissedPrompt(user.id);
    setOpen(shouldPrompt);
  }, [loading, location.pathname, profileRequires2fa, user, verifiedFactors.length]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && user) {
      dismissPrompt(user.id);
    }
  };

  const handleEnable = () => {
    if (user) {
      dismissPrompt(user.id);
    }
    setOpen(false);
    navigate("/setup-2fa", { state: { from: location.pathname } });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <DialogTitle>Two-factor authentication is now available</DialogTitle>
          <DialogDescription>
            This is a new security feature for existing accounts. We highly encourage enabling it to better protect your
            BrieHosting account from unauthorized sign-ins.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Maybe later
          </Button>
          <Button type="button" onClick={handleEnable}>
            Enable 2FA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
