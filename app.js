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
            this.setupEventListeners();
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
     * @method setupEventListeners
     * @description Sets up event listeners for user interactions
     */
    setupEventListeners() {
        const recordBtn = document.getElementById('recordBtn');
        const playBtn = document.getElementById('playBtn');
        const stopBtn = document.getElementById('stopBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        const pitchSlider = document.getElementById('pitchSlider');
        const rateSlider = document.getElementById('rateSlider');

        recordBtn.addEventListener('click', () => this.handleRecordClick());
        playBtn.addEventListener('click', () => this.handlePlayClick());
        stopBtn.addEventListener('click', () => this.handleStopClick());

        // Playback control listeners
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.player.setVolume(parseFloat(e.target.value));
            });
        }
        if (pitchSlider) {
            pitchSlider.addEventListener('input', (e) => {
                this.player.setPitch(parseFloat(e.target.value));
            });
        }
        if (rateSlider) {
            rateSlider.addEventListener('input', (e) => {
                this.player.setPlaybackRate(parseFloat(e.target.value));
            });
        }

        // Recording progress tracking
        window.addEventListener('recordingProgress', (event) => {
            this.recordingDuration = event.detail.duration;
        });

        // Handle recording completion
        window.addEventListener('recordingComplete', (event) => {
            this.currentRecording = event.detail.audioBlob;
            this.promptForPhraseName();
        });

        // Phrase list event delegation
        document.getElementById('phraseList').addEventListener('click', (e) => {
            const phraseItem = e.target.closest('.phrase-item');
            if (!phraseItem) return;

            const recordingId = phraseItem.dataset.recordingId;
            
            if (e.target.closest('.play-btn')) {
                this.playRecording(recordingId);
            } else if (e.target.closest('.edit-btn')) {
                this.editRecording(recordingId);
            } else if (e.target.closest('.delete-btn')) {
                this.deleteRecording(recordingId);
            }
        });

        // Settings button click
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.modal.showSettings(this.settings);
        });

        // Settings change handler
        window.addEventListener('settingsChanged', () => {
            this.applySettings();
            this.setupAutoPlay();
        });

        // Theme change handler
        window.addEventListener('themeChanged', (event) => {
            const isDark = event.detail.theme === 'dark';
            document.documentElement.classList.toggle('dark', isDark);
        });

        // Recording completion notification
        window.addEventListener('recordingComplete', (event) => {
            if (this.settings.getSettings().notifications.enabled) {
                this.notifications.showRecordingComplete('New Recording');
            }
        });
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
     * @method promptForPhraseName
     * @description Prompts user for phrase name and category, then saves recording
     */
    promptForPhraseName() {
        const name = prompt('Enter a name for this phrase:');
        if (name) {
            const categories = this.storage.getCategories();
            const category = prompt(`Enter category (${categories.join(', ')}):`, 'Phrases');
            
            if (category && !categories.includes(category)) {
                this.storage.addCategory(category);
            }

            const recordingData = {
                name,
                audioBlob: this.currentRecording,
                category: category || 'Phrases',
                duration: this.recordingDuration,
                settings: {
                    volume: this.player.volume,
                    pitch: this.player.pitch,
                    rate: this.player.playbackRate
                }
            };

            this.storage.saveRecording(recordingData)
                .then(() => this.loadSavedRecordings());
        }
    }

    /**
     * @private
     * @method playRecording
     * @param {string} recordingId - ID of the recording to play
     */
    async playRecording(recordingId) {
        const recordings = this.storage.getRecordings();
        const recording = recordings[recordingId];
        
        if (recording) {
            const audioBlob = await this.base64ToBlob(recording.data);
            await this.player.playAudio(audioBlob, recording.settings);
            this.storage.updatePlayCount(recordingId);
            this.notifications.showPlaybackNotification(recording.name);
            this.loadSavedRecordings();
        }
    }

    /**
     * @private
     * @method editRecording
     * @param {string} recordingId - ID of the recording to edit
     */
    editRecording(recordingId) {
        const recordings = this.storage.getRecordings();
        const recording = recordings[recordingId];
        
        if (recording) {
            const newName = prompt('Enter new name:', recording.name);
            const categories = this.storage.getCategories();
            const newCategory = prompt(`Enter new category (${categories.join(', ')}):`, recording.category);

            if (newName || newCategory) {
                this.storage.updateRecordingMetadata(recordingId, {
                    name: newName || recording.name,
                    category: newCategory || recording.category
                });
                this.loadSavedRecordings();
            }
        }
    }

    /**
     * @private
     * @method deleteRecording
     * @param {string} recordingId - ID of the recording to delete
     */
    deleteRecording(recordingId) {
        if (confirm('Are you sure you want to delete this recording?')) {
            this.storage.deleteRecording(recordingId);
            this.loadSavedRecordings();
        }
    }

    /**
     * @private
     * @method base64ToBlob
     * @param {string} base64 - Base64 string to convert
     * @returns {Blob} Audio blob
     */
    base64ToBlob(base64) {
        const byteString = atob(base64.split(',')[1]);
        const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        return new Blob([ab], { type: mimeString });
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
