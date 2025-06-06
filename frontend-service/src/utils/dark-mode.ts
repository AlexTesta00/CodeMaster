export const enableDarkMode = () => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
}

export const disableDarkMode = () => {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
}

export const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
        disableDarkMode()
    } else {
        enableDarkMode()
    }
}

export const isDarkModeEnabled = () => {
    return localStorage.getItem('theme') === 'dark'
}

export const initDarkMode = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
        enableDarkMode()
    } else if (savedTheme === 'light') {
        disableDarkMode()
    } else {
        //System preference fallback
        const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)',
        ).matches

        if(prefersDark){
            enableDarkMode()
        }else{
            disableDarkMode()
        }
    }
}
