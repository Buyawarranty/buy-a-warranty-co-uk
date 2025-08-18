
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'breathing': {
					'0%, 100%': {
						transform: 'scale(1)',
						boxShadow: '0 0 0 0 rgba(235, 75, 0, 0.7)'
					},
					'50%': {
						transform: 'scale(1.05)',
						boxShadow: '0 0 0 10px rgba(235, 75, 0, 0)'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'car-drive': {
					'0%, 100%': {
						transform: 'translateX(-10px) translateY(0px)'
					},
					'50%': {
						transform: 'translateX(10px) translateY(-2px)'
					}
				},
				'slide-right': {
					'0%': {
						transform: 'translateX(-100px)'
					},
					'100%': {
						transform: 'translateX(100px)'
					}
				},
				'car-progress': {
					'0%, 100%': {
						transform: 'translateX(-50%) translateY(0px)'
					},
					'50%': {
						transform: 'translateX(-50%) translateY(-2px)'
					}
				},
				'progress-fill': {
					'0%': {
						width: '20%'
					},
					'50%': {
						width: '70%'
					},
					'100%': {
						width: '90%'
					}
				},
				'wind-lines': {
					'0%': {
						opacity: '0',
						transform: 'translateX(40px)'
					},
					'50%': {
						opacity: '0.6'
					},
					'100%': {
						opacity: '0',
						transform: 'translateX(-40px)'
					}
				},
				'fade-drift': {
					'0%': {
						opacity: '1',
						transform: 'translateX(0px) scale(1)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateX(50px) scale(0.8)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'breathing': 'breathing 2s ease-in-out infinite',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'spin-slow': 'spin 3s linear infinite',
				'car-drive': 'car-drive 3s ease-in-out infinite',
				'car-progress': 'car-progress 3s ease-in-out infinite',
				'progress-fill': 'progress-fill 3s ease-in-out infinite',
				'wind-lines': 'wind-lines 1.5s linear infinite',
				'slide-right': 'slide-right 1s linear infinite',
				'fade-drift': 'fade-drift 2s ease-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
