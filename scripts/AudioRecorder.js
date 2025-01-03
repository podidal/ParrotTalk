/**
 * @class AudioRecorder
 * @description Handles audio recording functionality for the Parrot Talk application
 */
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
    }

    /**
     * @async
     * @method initializeRecorder
     * @description Initializes the media recorder with user's microphone
     * @throws {Error} If microphone access is denied or not available
     */
    async initializeRecorder() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.setupRecorderEvents();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw new Error('Unable to access microphone');
        }
    }

    /**
     * @private
     * @method setupRecorderEvents
     * @description Sets up event listeners for the media recorder
     */
    setupRecorderEvents() {
        this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = () => {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            this.audioChunks = [];
            // Dispatch custom event with the recorded audio
            window.dispatchEvent(new CustomEvent('recordingComplete', {
                detail: { audioBlob }
            }));
        };
    }

    /**
     * @method startRecording
     * @description Starts recording audio
     * @throws {Error} If recorder is not initialized
     */
    startRecording() {
        if (!this.mediaRecorder) {
            throw new Error('Recorder not initialized');
        }
        this.audioChunks = [];
        this.mediaRecorder.start();
        this.isRecording = true;
    }

    /**
     * @method stopRecording
     * @description Stops recording audio
     */
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }
}

// Export as a module
export default AudioRecorder;
