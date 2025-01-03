class AudioPlayback {
    constructor() {
        this.audio = new Audio();
        this.currentPhrase = null;
        this.repetitions = 1;
        this.volume = 0.75;
        this.isPlaying = false;
        this.currentRepetition = 0;
        this.onPlaybackComplete = null;
    }

    setVolume(volume) {
        this.volume = volume / 100;
        this.audio.volume = this.volume;
    }

    setRepetitions(count) {
        this.repetitions = parseInt(count);
    }

    async playPhrase(phraseUrl, repetitions = null) {
        if (this.isPlaying) {
            this.stopPlayback();
            return;
        }

        if (repetitions !== null) {
            this.repetitions = repetitions;
        }

        this.currentPhrase = phraseUrl;
        this.currentRepetition = 0;
        this.isPlaying = true;
        this.updateUI();

        return this.startPlaybackLoop();
    }

    async startPlaybackLoop() {
        return new Promise(async (resolve) => {
            while (this.isPlaying && this.currentRepetition < this.repetitions) {
                this.audio.src = this.currentPhrase;
                this.audio.volume = this.volume;
                
                try {
                    await this.audio.play();
                    await new Promise(resolve => {
                        this.audio.onended = resolve;
                    });
                    
                    this.currentRepetition++;
                    if (this.currentRepetition >= this.repetitions) {
                        this.stopPlayback();
                        resolve();
                    }
                } catch (error) {
                    console.error('Playback error:', error);
                    this.stopPlayback();
                    resolve();
                }
            }
        });
    }

    stopPlayback() {
        this.isPlaying = false;
        this.audio.pause();
        this.audio.currentTime = 0;
        this.updateUI();
    }

    updateUI() {
        const phraseElements = document.querySelectorAll('.phrase-item');
        phraseElements.forEach(element => {
            const playBtn = element.querySelector('.play-btn');
            if (playBtn) {
                const phraseUrl = playBtn.dataset.phraseUrl;
                if (this.isPlaying && phraseUrl === this.currentPhrase) {
                    playBtn.textContent = 'Stop';
                    playBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
                    playBtn.classList.add('bg-gray-500', 'hover:bg-gray-600');
                } else {
                    playBtn.textContent = 'Play';
                    playBtn.classList.remove('bg-gray-500', 'hover:bg-gray-600');
                    playBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                }
            }
        });
    }
}

const audioPlayback = new AudioPlayback();
