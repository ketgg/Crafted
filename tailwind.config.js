/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: ["./app/**/*.{jsx,tsx,mdx}", "./components/**/*.{jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        "scr-20": "20rem",
        "scr-30": "30rem",
        "scr-50": "50rem",
        "scr-60": "60rem",
        "scr-70": "70rem",
        "scr-90": "90rem",
        "scr-1360": "1360px",
        "scr-1560": "1560px",
      },
      width: {
        "full-30px": "calc(100% + 30px)",
      },
      borderRadius: {
        "radii-sm": "var(--radii-sm)",
        "radii-md": "var(--radii-md)",
        "radii-lg": "var(--radii-lg)",
        "radii-xl": "var(--radii-xl)",
        "radii-full": "var(--radii-full)",
        "radii-skeleton": "var(--radii-skeleton)",
      },
      colors: {
        black: "rgb(var(--black))",
        gray: "rgb(var(--gray))",
        white: "rgb(var(--white))",
        "blue-light": "rgb(var(--blue-light))",
        blue: "rgb(var(--blue))",
        "blue-hover": "rgb(var(--blue-hover))",
        "red-alt": "rgb(var(--red-alt))",
        green: "rgb(var(--green))",
        "green-dark": "rgb(var(--green-dark))",

        "base-main": "rgb(var(--base-main))",
        "base-alt": "rgb(var(--base-alt))",
        "base-light": "rgb(var(--base-light))",
        elevation: "rgb(var(--elevation))",
        "elevation-high": "rgb(var(--elevation-high))",
        "elevation-higher": "rgb(var(--elevation-higher))",

        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        "foreground-muted": "rgb(var(--foreground-muted))",
        "foreground-muted-dark": "rgb(var(--foreground-muted-dark))",
      },
      fontFamily: {
        sans: "var(--font-agrandir-narrow)",
        "sans-alt": "var(--font-agrandir-normal)",
        mono: "var(--font-rg-mono)",
      },
    },
  },
  plugins: [],
}
