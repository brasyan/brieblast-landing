/// <reference types="vite/client" />

interface Turnstile {
	render: (
		container: HTMLElement,
		options: {
			sitekey: string;
			callback?: (token: string) => void;
			"expired-callback"?: () => void;
			"error-callback"?: (errorCode?: string | number) => boolean | void;
			"timeout-callback"?: () => void;
			theme?: "auto" | "light" | "dark";
			size?: "normal" | "compact" | "flexible";
			appearance?: "always" | "execute" | "interaction-only";
		}
	) => string;
	remove: (widgetId: string) => void;
	reset: (widgetId: string) => void;
}

interface Window {
	turnstile?: Turnstile;
}

interface ImportMetaEnv {
	readonly VITE_TURNSTILE_SITE_KEY?: string;
}
