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
                onyx: "#0a0a0f",
                surface: "#111118",
                card: "#1a1a2e",
                "card-hover": "#222240",
                accent: "#3b82f6",
                "accent-hover": "#2563eb",
                "accent-light": "#60a5fa",
                border: "#1e293b",
                "text-primary": "#e2e8f0",
                "text-secondary": "#94a3b8",
                "text-muted": "#64748b",
            }
        },
    },
    plugins: [],
}