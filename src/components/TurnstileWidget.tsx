import { useEffect, useRef, useState } from "react";

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TURNSTILE_READY_TIMEOUT_MS = 5000;

let turnstileScriptPromise: Promise<void> | null = null;

function waitForTurnstile() {
  return new Promise<void>((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (window.turnstile) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= TURNSTILE_READY_TIMEOUT_MS) {
        reject(new Error("Turnstile did not become ready in time"));
        return;
      }

      window.setTimeout(check, 50);
    };

    check();
  });
}

function loadTurnstileScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile can only be loaded in the browser"));
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (!turnstileScriptPromise) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
      const handleLoaded = () => {
        waitForTurnstile()
          .then(resolve)
          .catch((error) => {
            turnstileScriptPromise = null;
            reject(error);
          });
      };
      const handleError = () => {
        turnstileScriptPromise = null;
        reject(new Error("Failed to load Turnstile script"));
      };

      if (existingScript) {
        if (window.turnstile || existingScript.dataset.loaded === "true") {
          handleLoaded();
          return;
        }

        existingScript.addEventListener("load", handleLoaded, { once: true });
        existingScript.addEventListener("error", handleError, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        script.dataset.loaded = "true";
        handleLoaded();
      };
      script.onerror = handleError;
      document.head.appendChild(script);
    });
  }

  return turnstileScriptPromise;
}

interface TurnstileWidgetProps {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
}

export default function TurnstileWidget({ siteKey, onTokenChange }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    setLoadError(null);
    onTokenChange(null);

    const renderTurnstile = async () => {
      try {
        await loadTurnstileScript();

        if (!isActive || !containerRef.current || !window.turnstile) {
          return;
        }

        containerRef.current.innerHTML = "";
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onTokenChange(token);
          },
          "expired-callback": () => {
            onTokenChange(null);
          },
          "error-callback": () => {
            onTokenChange(null);
          },
          theme: "auto",
        });
      } catch {
        if (isActive) {
          setLoadError("Could not load security check. Please disable blockers or refresh and try again.");
          onTokenChange(null);
        }
      }
    };

    renderTurnstile();

    return () => {
      isActive = false;

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onTokenChange, siteKey]);

  if (loadError) {
    return <p className="text-destructive text-xs">{loadError}</p>;
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
}
