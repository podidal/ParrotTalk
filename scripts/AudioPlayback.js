/**
 * @class AudioPlayback
 * @description Handles audio playback functionality for the Parrot Talk application
 */
class AudioPlayback {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentSource = null;
        this.isPlaying = false;
    }

    /**
     * @async
     * @method playAudio
     * @param {Blob} audioBlob - The audio blob to play
     * @description Plays the provided audio blob
     * @throws {Error} If audio playback fails
     */
    async playAudio(audioBlob) {
        try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            if (this.isPlaying) {
                this.stopAudio();
            }

            this.currentSource = this.audioContext.createBufferSource();
            this.currentSource.buffer = audioBuffer;
            this.currentSource.connect(this.audioContext.destination);
            
            this.currentSource.onended = () => {
                this.isPlaying = false;
                window.dispatchEvent(new CustomEvent('playbackComplete'));
            };

            this.currentSource.start();
            this.isPlaying = true;
        } catch (error) {
            console.error('Error playing audio:', error);
            throw new Error('Failed to play audio');
        }
    }

    /**
     * @method stopAudio
     * @description Stops the current audio playback
     */
    stopAudio() {
        if (this.currentSource && this.isPlaying) {
            this.currentSource.stop();
            this.isPlaying = false;
            window.dispatchEvent(new CustomEvent('playbackStopped'));
        }
    }

    /**
     * @method adjustVolume
     * @param {number} volume - Volume level between 0 and 1
     * @description Adjusts the playback volume
     */
    adjustVolume(volume) {
        if (this.currentSource) {
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume;
            this.currentSource.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
        }
    }
}

// Export as a module
export default AudioPlayback;
