/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SAP Morning Horizon (100% Light Mode)
        brandBg: '#F3F4F5',      // Light gray background
        brandCard: '#FFFFFF',    // White card background
        brandBorder: '#E5E9EC',  // Subtle light border
        
        // Redefinimos indigo para que use los tonos oficiales de SAP Blue (Horizon)
        indigo: {
          50: '#F2F8FC',
          100: '#E1F0FA',
          200: '#BBDCF5',
          300: '#8BC3F0',
          400: '#4DB3FF', // SAP Blue Light
          500: '#0070F2', // SAP Horizon Blue
          600: '#0A6ED1', // SAP Primary Blue
          700: '#0854A0',
          800: '#063B70',
          900: '#032240',
        }
      }
    },
  },
  plugins: [],
}
