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
				navbar: {
					DEFAULT: 'hsl(var(--navbar))',
					foreground: 'hsl(var(--navbar-foreground))'
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
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 5px rgba(11, 206, 49, 0.5)'
					},
					'50%': {
						boxShadow: '0 0 20px rgba(11, 206, 49, 0.8), 0 0 30px rgba(11, 206, 49, 0.6)'
					}
				},
				'data-transfer': {
					'0%': {
						transform: 'translateX(-100%) translateY(-100%)',
						opacity: '0'
					},
					'50%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateX(100%) translateY(100%)',
						opacity: '0'
					}
				},
				'data-pulse': {
					'0%, 100%': {
						textShadow: '0 0 5px rgba(11, 206, 49, 0.5)',
						transform: 'scale(1)'
					},
					'50%': {
						textShadow: '0 0 15px rgba(11, 206, 49, 0.9), 0 0 25px rgba(11, 206, 49, 0.7)',
						transform: 'scale(1.02)'
					}
				},
				'neon-flicker': {
					'0%, 18%, 22%, 25%, 53%, 57%, 100%': {
						textShadow: '0 0 3px rgba(11, 206, 49, 0.6), 0 0 6px rgba(11, 206, 49, 0.4)',
						opacity: '1'
					},
					'20%, 24%, 55%': {
						textShadow: '0 0 1px rgba(11, 206, 49, 0.3)',
						opacity: '0.7'
					}
				},
				'scan-line': {
					'0%': {
						transform: 'translateX(-100%)',
						opacity: '0'
					},
					'50%': {
						opacity: '1'
					},
					'100%': {
						transform: 'translateX(100%)',
						opacity: '0'
					}
				},
				'connect-line': {
					'0%': {
						strokeDasharray: '0 1000'
					},
					'50%': {
						strokeDasharray: '1000 0'
					},
					'100%': {
						strokeDasharray: '0 1000'
					}
				},
				'circuit-trace': {
					'0%': {
						borderImageSource: 'linear-gradient(0deg, transparent 95%, #2ecc71 95%)',
						borderImageSlice: '1'
					},
					'25%': {
						borderImageSource: 'linear-gradient(90deg, transparent 95%, #2ecc71 95%)',
						borderImageSlice: '1'
					},
					'50%': {
						borderImageSource: 'linear-gradient(180deg, transparent 95%, #2ecc71 95%)',
						borderImageSlice: '1'
					},
					'75%': {
						borderImageSource: 'linear-gradient(270deg, transparent 95%, #2ecc71 95%)',
						borderImageSlice: '1'
					},
					'100%': {
						borderImageSource: 'linear-gradient(360deg, transparent 95%, #2ecc71 95%)',
						borderImageSlice: '1'
					}
				},
				'wave-sweep': {
					'0%': {
						transform: 'translateX(-100%) rotate(45deg)'
					},
					'100%': {
						transform: 'translateX(300%) rotate(45deg)'
					}
				},
				'game-icon-cable': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.5) translateY(-20px)'
					},
					'20%': {
						opacity: '1',
						transform: 'scale(1.2) translateY(0px)'
					},
					'60%': {
						opacity: '1',
						transform: 'scale(1) translateY(0px)'
					},
					'100%': {
						opacity: '0',
						transform: 'scale(0.8) translateY(10px)'
					}
				},
				'game-icon-computer': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.3) rotate(-90deg)'
					},
					'20%': {
						opacity: '1',
						transform: 'scale(1.3) rotate(0deg)'
					},
					'60%': {
						opacity: '1',
						transform: 'scale(1) rotate(0deg)'
					},
					'100%': {
						opacity: '0',
						transform: 'scale(0.8) rotate(90deg)'
					}
				},
				'game-icon-bitcoin': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.5) translateX(0px) translateY(0px)'
					},
					'30%': {
						opacity: '1',
						transform: 'scale(1.5) translateX(0px) translateY(0px)'
					},
					'70%': {
						opacity: '1',
						transform: 'scale(1.2) translateX(20px) translateY(-10px)'
					},
					'100%': {
						opacity: '0',
						transform: 'scale(0.5) translateX(100px) translateY(-50px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s infinite',
				'data-transfer': 'data-transfer 2s ease-in-out infinite',
				'data-pulse': 'data-pulse 3s ease-in-out infinite',
				'neon-flicker': 'neon-flicker 3s ease-in-out infinite',
				'scan-line': 'scan-line 1.5s ease-in-out',
				'connect-line': 'connect-line 4s ease-in-out infinite',
				'circuit-trace': 'circuit-trace 3s linear infinite',
				'wave-sweep': 'wave-sweep 2s ease-in-out infinite',
				'game-icon-cable': 'game-icon-cable 3s ease-in-out forwards',
				'game-icon-computer': 'game-icon-computer 3s ease-in-out forwards',
				'game-icon-bitcoin': 'game-icon-bitcoin 3s ease-in-out forwards'
			},
			fontFamily: {
				'orbitron': ['Orbitron', 'sans-serif'],
				'sans': ['Share Tech Mono', 'ui-sans-serif', 'system-ui'],
				'mono': ['Share Tech Mono', 'Courier New', 'monospace']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;