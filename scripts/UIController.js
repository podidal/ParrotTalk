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
        this.progressBar = document.getElementById('recordingProgress');
        this.durationDisplay = document.getElementById('durationDisplay');
        this.autoplayBtn = document.getElementById('autoplayBtn');
        this.phraseName = document.getElementById('phraseName');
        this.recordingStatus = document.getElementById('recordingStatus');
        this.waveform = document.getElementById('waveform');
        
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

        window.addEventListener('recordingProgress', (event) => {
            this.updateProgressBar(event.detail.duration);
        });

        window.addEventListener('recordingComplete', () => {
            this.updateRecordingUI(false);
            this.resetProgressBar();
        });

        // Playback state UI updates
        window.addEventListener('playbackStart', () => {
            this.updatePlaybackUI(true);
        });

        window.addEventListener('playbackComplete', () => {
            this.updatePlaybackUI(false);
        });

        // Recording controls
        this.recordBtn.addEventListener('click', () => {
            this.recordBtn.classList.add('hidden');
            this.stopBtn.classList.remove('hidden');
            this.recordBtn.classList.add('recording');
            // handlers.onStartRecording();
        });

        this.stopBtn.addEventListener('click', () => {
            this.stopBtn.classList.add('hidden');
            this.recordBtn.classList.remove('hidden');
            this.recordBtn.classList.remove('recording');
            // handlers.onStopRecording();
        });

        // Phrase list interactions
        this.phraseList.addEventListener('click', (event) => {
            const playBtn = event.target.closest('.play-btn');
            const deleteBtn = event.target.closest('.delete-btn');
            const phraseItem = event.target.closest('.phrase-item');

            if (!phraseItem) return;

            const recordingId = phraseItem.dataset.recordingId;

            if (playBtn) {
                // handlers.onPlayPhrase(recordingId);
            } else if (deleteBtn) {
                // handlers.onDeletePhrase(recordingId);
            }
        });

        // Autoplay toggle
        this.autoplayBtn.addEventListener('click', () => {
            const isActive = this.autoplayBtn.classList.toggle('bg-blue-600');
            this.autoplayBtn.classList.toggle('text-white');
            // handlers.onToggleAutoplay(isActive);
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
     * @method updateProgressBar
     * @param {number} duration - Current recording duration in seconds
     */
    updateProgressBar(duration) {
        if (this.progressBar && this.durationDisplay) {
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            this.durationDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.progressBar.value = duration;
        }
    }

    /**
     * @method resetProgressBar
     */
    resetProgressBar() {
        if (this.progressBar && this.durationDisplay) {
            this.progressBar.value = 0;
            this.durationDisplay.textContent = '0:00';
        }
    }

    /**
     * @method updateRecordingStatus
     * @param {string} status - Current recording status
     * @description Updates the recording status display
     */
    updateRecordingStatus(status) {
        this.recordingStatus.textContent = status;
    }

    /**
     * @method updateWaveform
     * @param {Float32Array} audioData - Audio data for visualization
     * @description Updates the waveform visualization
     */
    updateWaveform(audioData) {
        this.waveform.innerHTML = '';
        const width = this.waveform.clientWidth;
        const step = Math.ceil(audioData.length / width);

        for (let i = 0; i < width; i++) {
            const value = audioData[i * step] || 0;
            const bar = document.createElement('div');
            bar.className = 'waveform-bar';
            bar.style.left = `${i}px`;
            bar.style.height = `${Math.abs(value) * 50}%`;
            this.waveform.appendChild(bar);
        }
    }

    /**
     * @method updatePhraseList
     * @param {Object} recordings - Object containing all recordings
     * @description Updates the phrase list in the UI
     */
    updatePhraseList(recordings) {
        const phraseList = document.getElementById('phraseList');
        phraseList.innerHTML = '';

        Object.entries(recordings)
            .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
            .forEach(([id, recording]) => {
                const li = document.createElement('li');
                li.className = 'phrase-item bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-all';
                li.dataset.recordingId = id;
                li.draggable = true;

                li.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <input type="checkbox" class="phrase-select w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                        <div class="flex-1">
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold dark:text-white">${recording.name}</h3>
                                <span class="text-sm text-gray-500 dark:text-gray-400">${recording.duration}s</span>
                            </div>
                            <div class="flex items-center space-x-2 mt-2">
                                <span class="text-sm text-gray-500 dark:text-gray-400">
                                    <i class="fas fa-play mr-1"></i>${recording.playCount || 0} plays
                                </span>
                                ${recording.category ? `
                                    <span class="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                        ${recording.category}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button class="play-btn text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="delete-btn text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;

                phraseList.appendChild(li);
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
        
        const lastPlayed = recording.lastPlayed 
            ? new Date(recording.lastPlayed).toLocaleDateString()
            : 'Never';

        item.innerHTML = `
            <div class="flex-1">
                <div class="font-medium">${recording.name}</div>
                <div class="text-sm text-gray-500">
                    Category: ${recording.category} | 
                    Played: ${recording.playCount} times | 
                    Last: ${lastPlayed}
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button class="play-btn p-2 rounded-full bg-green-100 hover:bg-green-200">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                </button>
                <button class="edit-btn p-2 rounded-full bg-blue-100 hover:bg-blue-200">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button class="delete-btn p-2 rounded-full bg-red-100 hover:bg-red-200">
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `;

        return item;
    }
}

// Export as a module
export default UIController;
