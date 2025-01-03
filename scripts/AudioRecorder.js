/**
 * @class AudioRecorder
 * @description Handles audio recording functionality
 */
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioContext = null;
        this.audioStream = null;
        this.audioProcessor = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.onAudioProcessCallback = null;
    }

    /**
     * @method initializeRecorder
     * @description Initializes the audio recorder with necessary permissions
     * @returns {Promise<void>}
     */
    async initializeRecorder() {
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create audio source from stream
            const source = this.audioContext.createMediaStreamSource(this.audioStream);
            
            // Create script processor for visualization
            this.audioProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
            this.audioProcessor.connect(this.audioContext.destination);
            source.connect(this.audioProcessor);
            
            this.audioProcessor.onaudioprocess = (e) => {
                if (this.isRecording && this.onAudioProcessCallback) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    this.onAudioProcessCallback(inputData);
                }
            };
            
            // Initialize MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.audioStream);
            
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.audioChunks.push(e.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.audioChunks = [];
                window.dispatchEvent(new CustomEvent('recordingComplete', {
                    detail: { audioBlob }
                }));
            };
        } catch (error) {
            console.error('Error initializing recorder:', error);
            throw error;
        }
    }

    /**
     * @method startRecording
     * @description Starts recording audio
     * @returns {Promise<void>}
     */
    async startRecording() {
        if (!this.mediaRecorder) {
            await this.initializeRecorder();
        }

        this.audioChunks = [];
        this.isRecording = true;
        this.mediaRecorder.start();
    }

    /**
     * @method stopRecording
     * @description Stops recording audio
     * @returns {Promise<Blob>} The recorded audio as a Blob
     */
    stopRecording() {
        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.audioChunks = [];
                this.isRecording = false;
                resolve(audioBlob);
            };
            
            this.mediaRecorder.stop();
        });
    }

    /**
     * @method onAudioProcess
     * @param {Function} callback - Function to call with audio data for visualization
     */
    onAudioProcess(callback) {
        this.onAudioProcessCallback = callback;
    }

    /**
     * @method cleanup
     * @description Cleans up audio resources
     */
    cleanup() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.audioProcessor) {
            this.audioProcessor.disconnect();
        }
    }
}

export default AudioRecorder;
