/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                onyx: "var(--color-onyx)",
                surface: "var(--color-surface)",
                card: "var(--color-card)",
                "card-hover": "var(--color-card-hover)",
                accent: "var(--color-accent)",
                "accent-hover": "var(--color-accent-hover)",
                "accent-light": "var(--color-accent-light)",
                border: "var(--color-border)",
                "text-primary": "var(--color-text-primary)",
                "text-secondary": "var(--color-text-secondary)",
                "text-muted": "var(--color-text-muted)",
            }
        },
    },
    plugins: [],
}