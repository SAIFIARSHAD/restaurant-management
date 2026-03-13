/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                brand: {
                    400: "#ffa040",
                    500: "#ff6b00",
                    600: "#e55a00",
                },
                surface: {
                    800: "#1e293b",
                    900: "#0f172a",
                    950: "#020617",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            boxShadow: {
                "glow-brand": "0 0 24px rgba(255,107,0,0.25)",
                "card-dark": "0 4px 24px rgba(0,0,0,0.4)",
            },
            backgroundImage: {
                "gradient-brand": "linear-gradient(135deg, #ff6b00 0%, #ff9a3c 100%)",
                "gradient-dark": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-out",
                "slide-up": "slideUp 0.3s ease-out",
            },
            keyframes: {
                fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
                slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
            },
        },
    },
    plugins: [],
};