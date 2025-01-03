/**
 * @file app.js
 * @description Main application file that initializes and coordinates all components
 */

import AudioRecorder from './scripts/AudioRecorder.js';
import AudioPlayback from './scripts/AudioPlayback.js';
import StorageManager from './scripts/StorageManager.js';
import UIController from './scripts/UIController.js';
import SettingsManager from './scripts/SettingsManager.js';
import ModalManager from './scripts/ModalManager.js';
import ThemeManager from './scripts/ThemeManager.js';
import NotificationManager from './scripts/NotificationManager.js';
import PhraseListManager from './scripts/PhraseListManager.js';

/**
 * @class App
 * @description Main application class that coordinates all components
 */
class App {
    constructor() {
        this.recorder = new AudioRecorder();
        this.player = new AudioPlayback();
        this.storage = new StorageManager();
        this.settings = new SettingsManager();
        this.modal = new ModalManager();
        this.theme = new ThemeManager();
        this.ui = new UIController();
        this.notifications = new NotificationManager(this.settings);
        this.phraseManager = new PhraseListManager(this.storage, this.ui);
        
        this.currentRecording = null;
        this.currentCategory = null;
        this.recordingDuration = 0;
        this.autoPlayInterval = null;
        
        this.initialize();
    }

    /**
     * @method initialize
     * @description Initializes the application and sets up event listeners
     */
    async initialize() {
        try {
            await this.recorder.initializeRecorder();
            this.setupEventHandlers();
            this.setupCategoryFilter();
            this.loadSavedRecordings();
            this.applySettings();
            this.setupAutoPlay();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            alert('Failed to access microphone. Please check your permissions.');
        }
    }

    /**
     * @private
     * @method setupEventHandlers
     * @description Sets up event handlers for UI interactions
     */
    setupEventHandlers() {
        const handlers = {
            onStartRecording: async () => {
                const phraseName = this.ui.phraseName.value.trim();
                if (!phraseName) {
                    alert('Please enter a phrase name');
                    return;
                }

                try {
                    await this.recorder.startRecording();
                    this.ui.updateRecordingStatus('Recording...');
                    
                    // Start visualizing audio
                    this.recorder.onAudioProcess((audioData) => {
                        this.ui.updateWaveform(audioData);
                    });
                } catch (error) {
                    console.error('Failed to start recording:', error);
                    alert('Failed to start recording. Please check your microphone permissions.');
                }
            },

            onStopRecording: async () => {
                try {
                    const audioBlob = await this.recorder.stopRecording();
                    const phraseName = this.ui.phraseName.value.trim();
                    
                    await this.storage.saveRecording({
                        name: phraseName,
                        data: await this.blobToBase64(audioBlob),
                        duration: this.recordingDuration,
                        createdAt: new Date().toISOString(),
                        playCount: 0
                    });

                    this.ui.updateRecordingStatus('Recording saved!');
                    this.ui.phraseName.value = '';
                    this.loadSavedRecordings();
                    this.notifications.showRecordingComplete(phraseName);
                } catch (error) {
                    console.error('Failed to save recording:', error);
                    alert('Failed to save recording. Please try again.');
                }
            },

            onPlayPhrase: async (recordingId) => {
                try {
                    const recording = this.storage.getRecording(recordingId);
                    if (!recording) return;

                    const audioBlob = await this.base64ToBlob(recording.data);
                    await this.player.playAudio(audioBlob);
                    this.storage.updatePlayCount(recordingId);
                    this.notifications.showPlaybackNotification(recording.name);
                    this.loadSavedRecordings();
                } catch (error) {
                    console.error('Failed to play recording:', error);
                    alert('Failed to play recording. Please try again.');
                }
            },

            onDeletePhrase: (recordingId) => {
                if (confirm('Are you sure you want to delete this phrase?')) {
                    this.storage.deleteRecording(recordingId);
                    this.loadSavedRecordings();
                }
            },

            onToggleAutoplay: (isActive) => {
                if (isActive) {
                    this.startAutoPlay();
                } else {
                    this.stopAutoPlay();
                }
            }
        };

        this.ui.setupEventListeners(handlers);
    }

    /**
     * @private
     * @method blobToBase64
     * @param {Blob} blob - Audio blob to convert
     * @returns {Promise<string>} Base64 string
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * @private
     * @method base64ToBlob
     * @param {string} base64 - Base64 string to convert
     * @returns {Promise<Blob>} Audio blob
     */
    base64ToBlob(base64) {
        const byteString = atob(base64);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    /**
     * @private
     * @method applySettings
     * @description Applies current settings to the application
     */
    applySettings() {
        const settings = this.settings.getSettings();
        
        // Apply theme
        this.theme.setTheme(settings.theme);
        
        // Apply recording settings
        this.recorder.setMaxDuration(settings.recording.maxDuration);
        
        // Apply playback settings
        this.player.setVolume(settings.playback.defaultVolume);
        this.player.setPitch(settings.playback.defaultPitch);
        this.player.setPlaybackRate(settings.playback.defaultRate);
    }

    /**
     * @private
     * @method setupAutoPlay
     * @description Sets up automated playback if enabled
     */
    setupAutoPlay() {
        const settings = this.settings.getSettings().autoPlay;
        if (settings.enabled) {
            this.startAutoPlay();
        }
    }

    /**
     * @private
     * @method startAutoPlay
     * @description Starts automated playback schedule
     */
    startAutoPlay() {
        const settings = this.settings.getSettings().autoPlay;
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }

        const checkAndPlay = () => {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const [startHour, startMinute] = settings.startTime.split(':').map(Number);
            const [endHour, endMinute] = settings.endTime.split(':').map(Number);
            const startTimeMinutes = startHour * 60 + startMinute;
            const endTimeMinutes = endHour * 60 + endMinute;

            if (currentTime >= startTimeMinutes && currentTime <= endTimeMinutes) {
                this.playRandomPhrase();
            }
        };

        this.autoPlayInterval = setInterval(checkAndPlay, settings.interval * 1000);
        checkAndPlay(); // Check immediately
    }

    /**
     * @private
     * @method playRandomPhrase
     * @description Plays a random phrase from the stored recordings
     */
    async playRandomPhrase() {
        const recordings = this.storage.getRecordings();
        const phrases = Object.values(recordings);
        
        if (phrases.length > 0) {
            const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
            const audioBlob = await this.base64ToBlob(randomPhrase.data);
            
            await this.player.playAudio(audioBlob, randomPhrase.settings);
            this.storage.updatePlayCount(randomPhrase.id);
            this.notifications.showPlaybackNotification(randomPhrase.name);
            this.loadSavedRecordings();
        }
    }

    /**
     * @private
     * @method setupCategoryFilter
     * @description Sets up category filter dropdown
     */
    setupCategoryFilter() {
        const categorySelect = document.getElementById('categoryFilter');
        if (categorySelect) {
            const categories = this.storage.getCategories();
            categorySelect.innerHTML = `
                <option value="">All Categories</option>
                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            `;

            categorySelect.addEventListener('change', (e) => {
                this.currentCategory = e.target.value;
                this.loadSavedRecordings();
            });
        }
    }

    /**
     * @private
     * @method loadSavedRecordings
     * @description Loads and displays saved recordings
     */
    loadSavedRecordings() {
        const recordings = this.storage.getRecordings();
        this.ui.updatePhraseList(recordings, this.currentCategory);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
