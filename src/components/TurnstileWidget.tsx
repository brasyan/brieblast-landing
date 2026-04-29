import { useEffect, useRef, useState } from "react";

type TurnstileTheme = "light" | "dark" | "auto";
type TurnstileSize = "normal" | "compact" | "flexible";

interface TurnstileWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: (message: string) => void;
  theme?: TurnstileTheme;
  size?: TurnstileSize;
  className?: string;
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  theme?: TurnstileTheme;
  size?: TurnstileSize;
}

interface TurnstileApi {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Turnstile script.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Turnstile script."));

    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export default function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
  onError,
  theme = "auto",
  size = "normal",
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    let mounted = true;

    if (!siteKey) {
      setIsLoading(false);
      return;
    }

    const renderWidget = async () => {
      try {
        await loadTurnstileScript();

        if (!mounted || !containerRef.current || !window.turnstile) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            onVerifyRef.current(token);
          },
          "expired-callback": () => {
            onExpireRef.current();
          },
          "error-callback": () => {
            onErrorRef.current("Security check failed. Please try again.");
          },
          theme,
          size,
        });

        setIsLoading(false);
      } catch {
        if (mounted) {
          setIsLoading(false);
          onErrorRef.current("Unable to load security check. Please refresh and try again.");
        }
      }
    };

    void renderWidget();

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, size]);

  if (!siteKey) {
    return (
      <div className={className}>
        <p className="text-xs text-destructive">Turnstile is not configured.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {isLoading && <p className="text-xs text-muted-foreground mb-2">Loading security check...</p>}
      <div ref={containerRef} style={{ minHeight: 65 }} />
    </div>
  );
}
