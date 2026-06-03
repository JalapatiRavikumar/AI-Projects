/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			backdropBlur: {
				sm: "4px",
			},
			keyframes: {
				"hero-rise": {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-14px)" },
				},
				"hero-rise-slow": {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-9px)" },
				},
				"hero-drift": {
					"0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
					"33%": { transform: "translate(5px, -8px) rotate(0.6deg)" },
					"66%": { transform: "translate(-4px, -14px) rotate(-0.6deg)" },
				},
				"hero-pulse-ring": {
					"0%, 100%": { opacity: "0.22", transform: "scale(1)" },
					"50%": { opacity: "0.42", transform: "scale(1.03)" },
				},
				"hero-icon-bob": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-5px)" },
				},
				"hero-shimmer": {
					"0%": { backgroundPosition: "200% 0" },
					"100%": { backgroundPosition: "-200% 0" },
				},
				blink: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
				"hero-laptop-float": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-20px)" },
				},
				"hero-glow-spin": {
					"0%": { transform: "rotate(0deg) scale(1)" },
					"100%": { transform: "rotate(360deg) scale(1.05)" },
				},
				"hero-steam": {
					"0%, 100%": { opacity: "0.35", transform: "translateY(0) scaleY(1)" },
					"50%": { opacity: "0.8", transform: "translateY(-6px) scaleY(1.15)" },
				},
			},
			animation: {
				"hero-rise": "hero-rise 5.5s ease-in-out infinite",
				"hero-rise-slow": "hero-rise-slow 7.2s ease-in-out infinite",
				"hero-rise-delay": "hero-rise 6.2s ease-in-out infinite 0.9s",
				"hero-drift": "hero-drift 14s ease-in-out infinite",
				"hero-pulse-ring": "hero-pulse-ring 7s ease-in-out infinite",
				"hero-icon-bob": "hero-icon-bob 3.2s ease-in-out infinite",
				"hero-shimmer": "hero-shimmer 8s linear infinite",
				blink: "blink 1s step-end infinite",
				float: "float 6s ease-in-out infinite",
				"hero-laptop-float": "hero-laptop-float 5s ease-in-out infinite",
				"hero-glow-spin": "hero-glow-spin 28s linear infinite",
				"hero-steam": "hero-steam 2.5s ease-in-out infinite",
			},
		},
	},
	plugins: [],
};
