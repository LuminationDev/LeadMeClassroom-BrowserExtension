/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,ts,vue}"],
    theme: {
        extend: {
            colors: {
                'panel-background': '#F7F7FC',
                'button-blue': '#1599F3',
                'gray-separator': '#9C9C9C',
                'gray-popup-text': '#424242',
                'gray-form-outline': '#767676',
                'gray-default': '#DEE1EC',
                'gray-default-text': '#9FA3B1',
                'gray-no-student': '#C0C3CD',
                'gray-active-student': '#F7F7FC',
                'black-form-border': '#3A3A3A',
                'navy-side-menu': '#182B50',
                'gray-menu-separator': '#E8E8E833',
                'white-menu-overlay': 'rgb(255, 255, 255, 0.2)',
                'red-end-class': '#E95858',
            },
            fontFamily: {
                'poppins': ['Poppins', 'sans-serif'],
            },
            fontSize: {
                'xsm': '0.688rem',
            },
            width: {
                'panel-width': '22rem',
                'options-panel-width': '45rem',
            },
            height: {
                'student-options-small': '3.125rem',
            }
        },
    },
    plugins: [
        function ({ addVariant }) {
            addVariant('child', '& > *');
            addVariant('child-hover', '& > *:hover');
        }
    ],
}
