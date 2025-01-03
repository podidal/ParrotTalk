class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.startTime = null;
        this.timerInterval = null;
        this.initializeUI();
        // Wait for DB before updating phrase list
        console.log('Waiting for DB initialization...');
        storageManager.dbReady.then(() => {
            console.log('DB initialized, updating phrase list');
            this.updatePhraseList();
        }).catch(error => {
            console.error('Error waiting for DB:', error);
        });
    }

    initializeUI() {
        // Initialize record button
        this.recordButton = document.getElementById('recordButton');
        this.recordButton.addEventListener('click', () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });

        // Initialize rename dialog
        this.renameDialog = M.Modal.init(document.getElementById('renameDialog'), {
            dismissible: false,
            onCloseEnd: () => {
                document.getElementById('previewAudio').pause();
                document.getElementById('previewAudio').src = '';
            }
        });

        // Initialize dialog buttons
        document.getElementById('saveNameBtn').addEventListener('click', () => {
            this.saveRecording();
        });

        // Add enter key support for the name input
        document.getElementById('newPhraseName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveRecording();
            }
        });

        document.getElementById('skipNameBtn').addEventListener('click', () => {
            this.renameDialog.close();
            this.audioChunks = [];
        });

        // Initialize recording indicator
        this.recordingIndicator = document.getElementById('recordingIndicator');
        this.recordingTimer = document.getElementById('recordingTimer');
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = []; // Clear previous chunks
            
            this.mediaRecorder.ondataavailable = (event) => {
                console.log('Recording data available:', event.data.size, 'bytes');
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                console.log('Recording stopped, creating blob');
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                console.log('Created audio blob:', audioBlob.size, 'bytes');
                const audioUrl = URL.createObjectURL(audioBlob);
                document.getElementById('previewAudio').src = audioUrl;
                
                // Set default name as current timestamp
                const now = new Date();
                const defaultName = `Recording ${now.toLocaleTimeString()}`;
                document.getElementById('newPhraseName').value = defaultName;
                M.updateTextFields(); // Update Materialize labels
                
                this.renameDialog.open();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.startTime = Date.now();
            this.updateTimer();
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);

            // Update UI
            this.recordButton.innerHTML = '<i class="material-icons left">stop</i><span>Stop Recording</span>';
            this.recordButton.classList.remove('red');
            this.recordButton.classList.add('grey');
            this.recordingIndicator.classList.remove('hide');
            console.log('Recording started');

        } catch (error) {
            console.error('Error starting recording:', error);
            M.toast({html: 'Error accessing microphone', classes: 'red'});
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            console.log('Stopping recording');
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            clearInterval(this.timerInterval);

            // Update UI
            this.recordButton.innerHTML = '<i class="material-icons left">mic</i><span>Record Phrase</span>';
            this.recordButton.classList.remove('grey');
            this.recordButton.classList.add('red');
            this.recordingIndicator.classList.add('hide');
        }
    }

    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = Date.now() - this.startTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        this.recordingTimer.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async saveRecording() {
        const name = document.getElementById('newPhraseName').value.trim();
        if (!name) {
            M.toast({html: 'Please enter a name for the recording', classes: 'red'});
            return;
        }

        try {
            console.log('Creating audio blob for saving');
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            console.log('Saving recording:', name, audioBlob.size, 'bytes');
            const recordingId = await storageManager.saveRecording(name, audioBlob);
            console.log('Recording saved with ID:', recordingId);
            
            // Clear form and close dialog
            document.getElementById('newPhraseName').value = '';
            this.renameDialog.close();
            this.audioChunks = [];

            // Update UI
            await this.updatePhraseList();
            M.toast({html: 'Recording saved successfully', classes: 'green'});
        } catch (error) {
            console.error('Error saving recording:', error);
            M.toast({html: 'Error saving recording', classes: 'red'});
        }
    }

    async updatePhraseList() {
        try {
            console.log('Fetching recordings');
            const recordings = await storageManager.getRecordings();
            console.log('Got recordings:', recordings);
            const phraseList = document.getElementById('phraseList');
            phraseList.innerHTML = '';

            if (!recordings || recordings.length === 0) {
                console.log('No recordings found');
                phraseList.innerHTML = `
                    <div class="empty-recordings">
                        <i class="material-icons medium">mic_none</i>
                        <p>No recordings yet. Click the record button to get started!</p>
                    </div>
                `;
                return;
            }

            console.log('Adding recordings to list');
            recordings.forEach(recording => {
                const item = document.createElement('div');
                item.className = 'collection-item';
                const audioUrl = URL.createObjectURL(recording.audio);
                const date = new Date(recording.timestamp);
                const formattedDate = date.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                const formattedTime = date.toLocaleTimeString(undefined, { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                
                item.innerHTML = `
                    <div class="recording-content">
                        <div class="recording-info">
                            <p class="title">${recording.name}</p>
                            <p class="timestamp">
                                <i class="material-icons tiny">schedule</i>
                                ${formattedDate} at ${formattedTime}
                            </p>
                        </div>
                        <div class="audio-controls">
                            <audio src="${audioUrl}" controls class="audio-preview"></audio>
                            <div class="action-buttons">
                                <button class="btn-floating waves-effect waves-light add-to-queue-btn tooltipped" 
                                        data-id="${recording.id}"
                                        data-position="top" 
                                        data-tooltip="Add to training queue">
                                    <i class="material-icons">playlist_add</i>
                                </button>
                                <button class="btn-floating waves-effect waves-light delete-btn tooltipped" 
                                        data-id="${recording.id}"
                                        data-position="top" 
                                        data-tooltip="Delete recording">
                                    <i class="material-icons">delete</i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                // Add event listeners
                const deleteBtn = item.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', async () => {
                    try {
                        // Ask for confirmation
                        if (confirm('Are you sure you want to delete this recording?')) {
                            await storageManager.deleteRecording(recording.id);
                            await this.updatePhraseList();
                            M.toast({html: 'Recording deleted', classes: 'blue'});
                        }
                    } catch (error) {
                        console.error('Error deleting recording:', error);
                        M.toast({html: 'Error deleting recording', classes: 'red'});
                    }
                });

                const addToQueueBtn = item.querySelector('.add-to-queue-btn');
                addToQueueBtn.addEventListener('click', () => {
                    console.log('Adding to queue:', recording);
                    const event = new CustomEvent('addToQueue', { 
                        detail: recording,
                        bubbles: true,
                        composed: true
                    });
                    document.dispatchEvent(event);
                });

                phraseList.appendChild(item);
            });

            // Initialize tooltips
            const tooltips = document.querySelectorAll('.tooltipped');
            M.Tooltip.init(tooltips);

            console.log('Finished updating phrase list');
        } catch (error) {
            console.error('Error updating phrase list:', error);
            M.toast({html: 'Error loading recordings', classes: 'red'});
        }
    }
}

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing AudioRecorder');
    const audioRecorder = new AudioRecorder();
});
