/**
 * @class ModalManager
 * @description Manages modal dialogs for settings and other UI components
 */
class ModalManager {
    constructor() {
        this.activeModal = null;
        this.modalStack = [];
        this.setupModalContainer();
        this.setupEventListeners();

        // TODO: Add modal templates system
        // TODO: Implement modal state management
        // TODO: Add modal accessibility features
    }

    /**
     * @private
     * @method setupModalContainer
     * @description Creates the modal container if it doesn't exist
     */
    setupModalContainer() {
        let container = document.getElementById('modal-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'modal-container';
            container.className = 'fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50';
            document.body.appendChild(container);
        }
    }

    /**
     * @private
     * @method setupEventListeners
     * @description Sets up event listeners for modal interactions
     */
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.activeModal) {
                this.hideModal();
            }
        });

        // TODO: Add keyboard navigation within modals
        // TODO: Implement focus trap in modal
        // TODO: Add screen reader support
    }

    /**
     * @method showModal
     * @param {string} content - Modal HTML content
     * @param {Object} options - Modal options
     */
    showModal(content, options = {}) {
        const container = document.getElementById('modal-container');
        const modalId = `modal-${Date.now()}`;
        
        const modalHTML = `
            <div id="${modalId}" class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center p-4 border-b">
                    <h2 class="text-xl font-semibold">${options.title || 'Modal'}</h2>
                    <button class="modal-close text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="p-4">
                    ${content}
                </div>
                ${options.footer ? `
                    <div class="border-t p-4 flex justify-end space-x-2">
                        ${options.footer}
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = modalHTML;
        container.classList.remove('hidden');
        this.activeModal = modalId;

        // Setup event listeners
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector('.modal-close');
        
        closeBtn.addEventListener('click', () => this.hideModal());
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                this.hideModal();
            }
        });

        // Setup custom event handlers
        if (options.onShow) {
            options.onShow(modal);
        }

        // TODO: Add modal transition animations
        // TODO: Implement modal position customization
        // TODO: Add modal size presets
        // TODO: Add modal lifecycle hooks
        // TODO: Implement modal content lazy loading
        // TODO: Add modal error boundary
    }

    /**
     * @method showSettings
     * @param {SettingsManager} settingsManager - Settings manager instance
     */
    showSettings(settingsManager) {
        const settings = settingsManager.getSettings();
        const content = `
            <div class="space-y-6">
                <!-- Theme Settings -->
                <div class="space-y-2">
                    <h3 class="text-lg font-medium">Theme</h3>
                    <select id="theme-select" class="w-full border rounded-md px-3 py-2">
                        <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                    </select>
                </div>

                <!-- Auto Play Settings -->
                <div class="space-y-2">
                    <h3 class="text-lg font-medium">Automated Training</h3>
                    <div class="flex items-center space-x-2">
                        <input type="checkbox" id="autoplay-enabled" 
                               ${settings.autoPlay.enabled ? 'checked' : ''}>
                        <label for="autoplay-enabled">Enable automated training</label>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm">Start Time</label>
                            <input type="time" id="autoplay-start" value="${settings.autoPlay.startTime}"
                                   class="border rounded-md px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm">End Time</label>
                            <input type="time" id="autoplay-end" value="${settings.autoPlay.endTime}"
                                   class="border rounded-md px-3 py-2">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm">Interval (minutes)</label>
                        <input type="number" id="autoplay-interval" value="${settings.autoPlay.interval / 60}"
                               min="1" max="120" class="border rounded-md px-3 py-2">
                    </div>
                </div>

                <!-- Recording Settings -->
                <div class="space-y-2">
                    <h3 class="text-lg font-medium">Recording</h3>
                    <div class="space-y-2">
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" id="recording-autostop" 
                                   ${settings.recording.autoStop ? 'checked' : ''}>
                            <label for="recording-autostop">Auto-stop recording</label>
                        </div>
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" id="recording-noise" 
                                   ${settings.recording.noiseReduction ? 'checked' : ''}>
                            <label for="recording-noise">Noise reduction</label>
                        </div>
                        <div>
                            <label class="block text-sm">Max Duration (seconds)</label>
                            <input type="number" id="recording-max-duration" 
                                   value="${settings.recording.maxDuration}"
                                   min="10" max="600" class="border rounded-md px-3 py-2">
                        </div>
                    </div>
                </div>

                <!-- Notification Settings -->
                <div class="space-y-2">
                    <h3 class="text-lg font-medium">Notifications</h3>
                    <div class="space-y-2">
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" id="notifications-enabled" 
                                   ${settings.notifications.enabled ? 'checked' : ''}>
                            <label for="notifications-enabled">Enable notifications</label>
                        </div>
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" id="notifications-sound" 
                                   ${settings.notifications.sound ? 'checked' : ''}>
                            <label for="notifications-sound">Play sound</label>
                        </div>
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" id="notifications-training" 
                                   ${settings.notifications.training ? 'checked' : ''}>
                            <label for="notifications-training">Training reminders</label>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const footer = `
            <button id="settings-reset" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                Reset to Default
            </button>
            <button id="settings-save" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Save Changes
            </button>
        `;

        this.showModal(content, {
            title: 'Settings',
            footer,
            onShow: (modal) => {
                // Save button handler
                modal.querySelector('#settings-save').addEventListener('click', () => {
                    const newSettings = {
                        theme: modal.querySelector('#theme-select').value,
                        autoPlay: {
                            enabled: modal.querySelector('#autoplay-enabled').checked,
                            interval: modal.querySelector('#autoplay-interval').value * 60,
                            startTime: modal.querySelector('#autoplay-start').value,
                            endTime: modal.querySelector('#autoplay-end').value
                        },
                        recording: {
                            maxDuration: parseInt(modal.querySelector('#recording-max-duration').value),
                            autoStop: modal.querySelector('#recording-autostop').checked,
                            noiseReduction: modal.querySelector('#recording-noise').checked
                        },
                        notifications: {
                            enabled: modal.querySelector('#notifications-enabled').checked,
                            sound: modal.querySelector('#notifications-sound').checked,
                            training: modal.querySelector('#notifications-training').checked
                        }
                    };

                    settingsManager.saveSettings(newSettings);
                    this.hideModal();
                });

                // Reset button handler
                modal.querySelector('#settings-reset').addEventListener('click', () => {
                    if (confirm('Are you sure you want to reset all settings to default?')) {
                        settingsManager.resetSettings();
                        this.hideModal();
                        this.showSettings(settingsManager);
                    }
                });
            }
        });

        // TODO: Add settings form validation
        // TODO: Implement settings preview
        // TODO: Add settings search functionality
    }

    /**
     * @method hideModal
     * @description Hides the current modal
     */
    hideModal() {
        const container = document.getElementById('modal-container');
        container.classList.add('hidden');
        container.innerHTML = '';
        this.activeModal = null;

        // TODO: Add modal hide animations
        // TODO: Implement modal cleanup
        // TODO: Add modal state persistence
    }
}

export default ModalManager;
