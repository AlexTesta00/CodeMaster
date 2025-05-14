import typography from '@tailwindcss/typography'
/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        colors: {
            primary: '#6246EA',
            secondary: '#D1D1E9',
            headline: '#2B2C34',
            background: '#FFFFFE',
            success: '#0C7C59',
            info: '#58A4B0',
            error: '#D64933',
            warning: '#E1BC29',
            bgdark: '#161616',
            white: '#FFFFFF',
            black: '#000000',
            'border-gray': '#1E1E1E',
            gray: {
                50: '#F9FAFB',
                100: '#F3F4F6',
                200: '#E5E7EB',
                300: '#D1D5DB',
                400: '#9CA3AF',
                500: '#6B7280',
                600: '#4B5563',
                700: '#374151',
                800: '#1F2937',
                900: '#111827',
            },
        },
        extend: {
            backgroundImage: {
                'liquid-pattern': "url('/images/background-image.png')",
            },
            fontFamily: {
                sans: ['Inter-Regular', 'sans-serif'],
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-out': {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                'scale-up-center': {
                    '0%': {
                        transform: 'scale(0.5)',
                    },
                    '100%': {
                        transform: 'scale(1)',
                    },
                },
                shake: {
                    '0%': { transform: 'translateX(0)' },
                    '15%': { transform: 'translateX(-10px)' },
                    '30%': { transform: 'translateX(10px)' },
                    '45%': { transform: 'translateX(-10px)' },
                    '60%': { transform: 'translateX(10px)' },
                    '75%': { transform: 'translateX(-10px)' },
                    '90%': { transform: 'translateX(10px)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 1.0s ease-in-out',
                'fade-out': 'fade-out 1.0s ease-in-out',
                shake: 'shake 1.0s ease-in-out infinite',
                'scale-up-center':
                    'scale-up-center 1.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both',
            },
        },
    },
    plugins: [typography],
}
