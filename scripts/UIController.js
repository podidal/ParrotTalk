/**
 * @class UIController
 * @description Manages UI interactions and updates for the Parrot Talk application
 */
class UIController {
    constructor() {
        this.recordBtn = document.getElementById('recordBtn');
        this.playBtn = document.getElementById('playBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.phraseList = document.getElementById('phraseList');
        
        this.setupEventListeners();
    }

    /**
     * @private
     * @method setupEventListeners
     * @description Sets up event listeners for UI elements
     */
    setupEventListeners() {
        // Recording state UI updates
        window.addEventListener('recordingStart', () => {
            this.updateRecordingUI(true);
        });

        window.addEventListener('recordingComplete', () => {
            this.updateRecordingUI(false);
        });

        // Playback state UI updates
        window.addEventListener('playbackStart', () => {
            this.updatePlaybackUI(true);
        });

        window.addEventListener('playbackComplete', () => {
            this.updatePlaybackUI(false);
        });
    }

    /**
     * @method updateRecordingUI
     * @param {boolean} isRecording - Whether recording is in progress
     * @description Updates UI elements based on recording state
     */
    updateRecordingUI(isRecording) {
        this.recordBtn.classList.toggle('recording', isRecording);
        this.recordBtn.textContent = isRecording ? 'Recording...' : 'Record';
        this.recordBtn.disabled = isRecording;
        this.playBtn.disabled = isRecording;
    }

    /**
     * @method updatePlaybackUI
     * @param {boolean} isPlaying - Whether playback is in progress
     * @description Updates UI elements based on playback state
     */
    updatePlaybackUI(isPlaying) {
        this.playBtn.textContent = isPlaying ? 'Playing...' : 'Play';
        this.playBtn.disabled = isPlaying;
        this.recordBtn.disabled = isPlaying;
    }

    /**
     * @method updatePhraseList
     * @param {Object} recordings - Object containing all recordings
     * @description Updates the phrase list in the UI
     */
    updatePhraseList(recordings) {
        this.phraseList.innerHTML = '';
        Object.values(recordings).forEach(recording => {
            const item = this.createPhraseItem(recording);
            this.phraseList.appendChild(item);
        });
    }

    /**
     * @private
     * @method createPhraseItem
     * @param {Object} recording - Recording data
     * @returns {HTMLElement} Phrase list item element
     */
    createPhraseItem(recording) {
        const item = document.createElement('div');
        item.className = 'phrase-item flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100';
        item.innerHTML = `
            <span class="font-medium">${recording.name}</span>
            <span class="text-sm text-gray-500">Played ${recording.playCount} times</span>
        `;
        return item;
    }
}

// Export as a module
export default UIController;
