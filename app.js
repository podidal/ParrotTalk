/**
 * @file app.js
 * @description Main application file that initializes and coordinates all components
 */

import AudioRecorder from './scripts/AudioRecorder.js';
import AudioPlayback from './scripts/AudioPlayback.js';
import StorageManager from './scripts/StorageManager.js';
import UIController from './scripts/UIController.js';

class App {
    constructor() {
        this.recorder = new AudioRecorder();
        this.player = new AudioPlayback();
        this.storage = new StorageManager();
        this.ui = new UIController();
        
        this.currentRecording = null;
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
            this.loadSavedRecordings();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            // TODO: Show user-friendly error message
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

        recordBtn.addEventListener('click', () => this.handleRecordClick());
        playBtn.addEventListener('click', () => this.handlePlayClick());
        stopBtn.addEventListener('click', () => this.handleStopClick());

        // Handle recording completion
        window.addEventListener('recordingComplete', (event) => {
            this.currentRecording = event.detail.audioBlob;
            this.promptForPhraseName();
        });
    }

    /**
     * @private
     * @method handleRecordClick
     * @description Handles record button click
     */
    handleRecordClick() {
        if (!this.recorder.isRecording) {
            this.recorder.startRecording();
            window.dispatchEvent(new CustomEvent('recordingStart'));
        }
    }

    /**
     * @private
     * @method handlePlayClick
     * @description Handles play button click
     */
    handlePlayClick() {
        if (this.currentRecording && !this.player.isPlaying) {
            this.player.playAudio(this.currentRecording);
            window.dispatchEvent(new CustomEvent('playbackStart'));
        }
    }

    /**
     * @private
     * @method handleStopClick
     * @description Handles stop button click
     */
    handleStopClick() {
        if (this.recorder.isRecording) {
            this.recorder.stopRecording();
        }
        if (this.player.isPlaying) {
            this.player.stopAudio();
        }
    }

    /**
     * @private
     * @method promptForPhraseName
     * @description Prompts user for phrase name and saves recording
     */
    promptForPhraseName() {
        const name = prompt('Enter a name for this phrase:');
        if (name) {
            this.storage.saveRecording(name, this.currentRecording)
                .then(() => this.loadSavedRecordings());
        }
    }

    /**
     * @private
     * @method loadSavedRecordings
     * @description Loads and displays saved recordings
     */
    loadSavedRecordings() {
        const recordings = this.storage.getRecordings();
        this.ui.updatePhraseList(recordings);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
