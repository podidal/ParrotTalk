/**
 * @file app.js
 * @description Main application file that initializes and coordinates all components
 */

import AudioRecorder from './scripts/AudioRecorder.js';
import AudioPlayback from './scripts/AudioPlayback.js';
import StorageManager from './scripts/StorageManager.js';
import SettingsManager from './scripts/SettingsManager.js';
import ModalManager from './scripts/ModalManager.js';
import ThemeManager from './scripts/ThemeManager.js';
import UIController from './scripts/UIController.js';
import NotificationManager from './scripts/NotificationManager.js';
import PhraseListManager from './scripts/PhraseListManager.js';

/**
 * @class App
 * @description Main application class that coordinates all components
 */
class App {
    constructor() {
        this.initializeComponents();
        this.setupEventListeners();
    }

    /**
     * @private
     * @method initializeComponents
     * @description Initializes all application components
     */
    async initializeComponents() {
        try {
            this.recorder = new AudioRecorder();
            this.player = new AudioPlayback();
            this.storage = new StorageManager();
            this.settings = new SettingsManager();
            this.modal = new ModalManager();
            this.theme = new ThemeManager();
            this.ui = new UIController();
            this.notifications = new NotificationManager();
            this.phraseManager = new PhraseListManager(this.storage, this.ui);

            await this.recorder.initializeRecorder();
            this.loadSavedRecordings();
            this.applySettings();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.notifications.showError('Failed to initialize. Please check microphone permissions.');
        }
    }

    /**
     * @private
     * @method setupEventListeners
     * @description Sets up event handlers for UI interactions
     */
    setupEventListeners() {
        const handlers = {
            onStartRecording: async () => {
                const phraseName = document.getElementById('phraseName').value.trim();
                if (!phraseName) {
                    this.notifications.showError('Please enter a phrase name');
                    return;
                }

                try {
                    await this.recorder.startRecording();
                    this.ui.updateRecordingStatus('Recording...');
                    this.recorder.onAudioProcess((audioData) => {
                        this.ui.updateWaveform(audioData);
                    });
                } catch (error) {
                    console.error('Failed to start recording:', error);
                    this.notifications.showError('Failed to start recording');
                }
            },

            onStopRecording: async () => {
                try {
                    const audioBlob = await this.recorder.stopRecording();
                    const phraseName = document.getElementById('phraseName').value.trim();
                    
                    await this.storage.saveRecording({
                        name: phraseName,
                        audioBlob,
                        createdAt: new Date().toISOString(),
                        playCount: 0
                    });

                    this.ui.updateRecordingStatus('Recording saved!');
                    document.getElementById('phraseName').value = '';
                    this.loadSavedRecordings();
                    this.notifications.showSuccess(`Recorded "${phraseName}"`);
                } catch (error) {
                    console.error('Failed to save recording:', error);
                    this.notifications.showError('Failed to save recording');
                }
            },

            onPlayPhrase: async (recordingId) => {
                try {
                    const recording = await this.storage.getRecording(recordingId);
                    if (!recording) return;

                    await this.player.playAudio(recording.audioBlob);
                    await this.storage.updatePlayCount(recordingId);
                    this.loadSavedRecordings();
                } catch (error) {
                    console.error('Failed to play recording:', error);
                    this.notifications.showError('Failed to play recording');
                }
            },

            onDeletePhrase: async (recordingId) => {
                if (confirm('Are you sure you want to delete this phrase?')) {
                    try {
                        await this.storage.deleteRecording(recordingId);
                        this.loadSavedRecordings();
                        this.notifications.showSuccess('Phrase deleted');
                    } catch (error) {
                        console.error('Failed to delete recording:', error);
                        this.notifications.showError('Failed to delete recording');
                    }
                }
            }
        };

        this.ui.setupEventListeners(handlers);
    }

    /**
     * @private
     * @method loadSavedRecordings
     * @description Loads and displays saved recordings
     */
    async loadSavedRecordings() {
        try {
            const recordings = await this.storage.getRecordings();
            this.ui.updatePhraseList(recordings);
        } catch (error) {
            console.error('Failed to load recordings:', error);
            this.notifications.showError('Failed to load recordings');
        }
    }

    /**
     * @private
     * @method applySettings
     * @description Applies current settings to the application
     */
    applySettings() {
        const settings = this.settings.getSettings();
        this.theme.setTheme(settings.theme);
        // Apply other settings as needed
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
