/**
 * @class AudioPlayback
 * @description Handles audio playback functionality for the Parrot Talk application
 */
class AudioPlayback {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentSource = null;
        this.gainNode = null;
        this.pitchNode = null;
        this.isPlaying = false;
        this.playbackRate = 1;
        this.volume = 1;
        this.pitch = 1;
    }

    /**
     * @async
     * @method playAudio
     * @param {Blob} audioBlob - The audio blob to play
     * @param {Object} options - Playback options
     * @param {number} [options.volume] - Volume level (0-1)
     * @param {number} [options.pitch] - Pitch multiplier (0.5-2)
     * @param {number} [options.rate] - Playback rate (0.5-2)
     * @description Plays the provided audio blob with specified options
     * @throws {Error} If audio playback fails
     */
    async playAudio(audioBlob, options = {}) {
        try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            if (this.isPlaying) {
                this.stopAudio();
            }

            // Create and configure nodes
            this.currentSource = this.audioContext.createBufferSource();
            this.gainNode = this.audioContext.createGain();
            
            // Set audio buffer and connect nodes
            this.currentSource.buffer = audioBuffer;
            
            // Apply playback options
            this.setVolume(options.volume ?? this.volume);
            this.setPitch(options.pitch ?? this.pitch);
            this.setPlaybackRate(options.rate ?? this.playbackRate);

            // Connect nodes
            this.currentSource.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            this.currentSource.onended = () => {
                this.isPlaying = false;
                window.dispatchEvent(new CustomEvent('playbackComplete'));
            };

            this.currentSource.start();
            this.isPlaying = true;
            window.dispatchEvent(new CustomEvent('playbackStart'));
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
     * @method setVolume
     * @param {number} volume - Volume level between 0 and 1
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }

    /**
     * @method setPitch
     * @param {number} pitch - Pitch multiplier between 0.5 and 2
     */
    setPitch(pitch) {
        this.pitch = Math.max(0.5, Math.min(2, pitch));
        if (this.currentSource) {
            this.currentSource.detune.setValueAtTime((this.pitch - 1) * 1200, this.audioContext.currentTime);
        }
    }

    /**
     * @method setPlaybackRate
     * @param {number} rate - Playback rate between 0.5 and 2
     */
    setPlaybackRate(rate) {
        this.playbackRate = Math.max(0.5, Math.min(2, rate));
        if (this.currentSource) {
            this.currentSource.playbackRate.setValueAtTime(this.playbackRate, this.audioContext.currentTime);
        }
    }
}

// Export as a module
export default AudioPlayback;
