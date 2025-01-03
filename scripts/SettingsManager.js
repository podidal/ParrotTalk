/**
 * @class SettingsManager
 * @description Manages application settings and preferences
 */
class SettingsManager {
    constructor() {
        this.SETTINGS_KEY = 'parrotTalk_settings';
        this.defaultSettings = {
            theme: 'light',
            autoPlay: {
                enabled: false,
                interval: 300, // 5 minutes
                startTime: '09:00',
                endTime: '17:00'
            },
            recording: {
                maxDuration: 300,
                autoStop: true,
                noiseReduction: true
            },
            playback: {
                defaultVolume: 1,
                defaultPitch: 1,
                defaultRate: 1,
                fadeEffect: true
            },
            notifications: {
                enabled: true,
                sound: true,
                training: true
            }
        };
        this.initializeSettings();
    }

    /**
     * @private
     * @method initializeSettings
     * @description Initializes settings with default values if not exists
     */
    initializeSettings() {
        if (!localStorage.getItem(this.SETTINGS_KEY)) {
            this.saveSettings(this.defaultSettings);
        }
    }

    /**
     * @method getSettings
     * @returns {Object} Current settings
     */
    getSettings() {
        const settings = localStorage.getItem(this.SETTINGS_KEY);
        return settings ? JSON.parse(settings) : this.defaultSettings;
    }

    /**
     * @method saveSettings
     * @param {Object} settings - Settings to save
     */
    saveSettings(settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
    }

    /**
     * @method updateSettings
     * @param {string} path - Settings path (e.g., 'autoPlay.enabled')
     * @param {any} value - New value
     */
    updateSettings(path, value) {
        const settings = this.getSettings();
        const pathParts = path.split('.');
        let current = settings;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }
        
        current[pathParts[pathParts.length - 1]] = value;
        this.saveSettings(settings);
    }

    /**
     * @method resetSettings
     * @description Resets settings to default values
     */
    resetSettings() {
        this.saveSettings(this.defaultSettings);
    }

    /**
     * @method exportSettings
     * @returns {string} Settings JSON string
     */
    exportSettings() {
        return JSON.stringify(this.getSettings(), null, 2);
    }

    /**
     * @method importSettings
     * @param {string} jsonString - Settings JSON string
     * @returns {boolean} Success status
     */
    importSettings(jsonString) {
        try {
            const settings = JSON.parse(jsonString);
            this.saveSettings(settings);
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }
}

export default SettingsManager;
