/**
 * @class ThemeManager
 * @description Manages application theming and dark mode
 */
class ThemeManager {
    constructor() {
        this.darkModeClass = 'dark-mode';
        this.initialize();
    }

    /**
     * @private
     * @method initialize
     * @description Initializes theme manager and sets up system preference listener
     */
    initialize() {
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => this.handleSystemThemeChange(e));
    }

    /**
     * @method setTheme
     * @param {string} theme - Theme to set ('light' or 'dark')
     */
    setTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add(this.darkModeClass);
        } else {
            document.documentElement.classList.remove(this.darkModeClass);
        }

        // Update theme color meta tag for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        }

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    /**
     * @private
     * @method handleSystemThemeChange
     * @param {MediaQueryListEvent} e - System theme change event
     */
    handleSystemThemeChange(e) {
        this.setTheme(e.matches ? 'dark' : 'light');
    }

    /**
     * @method getCurrentTheme
     * @returns {string} Current theme ('light' or 'dark')
     */
    getCurrentTheme() {
        return document.documentElement.classList.contains(this.darkModeClass) 
            ? 'dark' 
            : 'light';
    }

    /**
     * @method isDarkMode
     * @returns {boolean} Whether dark mode is active
     */
    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }
}

export default ThemeManager;
