/// <reference types="vite/client" />

interface Turnstile {
	render: (
		container: HTMLElement,
		options: {
			sitekey: string;
			callback?: (token: string) => void;
			"expired-callback"?: () => void;
			"error-callback"?: () => void;
			theme?: "auto" | "light" | "dark";
		}
	) => string;
	remove: (widgetId: string) => void;
}

interface Window {
	turnstile?: Turnstile;
}

interface ImportMetaEnv {
	readonly VITE_TURNSTILE_SITE_KEY?: string;
}
