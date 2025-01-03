/**
 * @class StorageManager
 * @description Manages local storage of audio recordings and metadata
 */
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'parrotTalk_recordings';
    }

    /**
     * @method saveRecording
     * @param {string} name - Name of the recording
     * @param {Blob} audioBlob - The audio blob to save
     * @returns {Promise<string>} ID of the saved recording
     */
    async saveRecording(name, audioBlob) {
        const recordings = this.getRecordings();
        const id = `recording_${Date.now()}`;
        
        // Convert blob to base64
        const base64Data = await this.blobToBase64(audioBlob);
        
        recordings[id] = {
            id,
            name,
            data: base64Data,
            createdAt: new Date().toISOString(),
            playCount: 0
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recordings));
        return id;
    }

    /**
     * @private
     * @method blobToBase64
     * @param {Blob} blob - The blob to convert
     * @returns {Promise<string>} Base64 string
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * @method getRecordings
     * @returns {Object} Object containing all recordings
     */
    getRecordings() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    /**
     * @method deleteRecording
     * @param {string} id - ID of the recording to delete
     */
    deleteRecording(id) {
        const recordings = this.getRecordings();
        delete recordings[id];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recordings));
    }

    /**
     * @method updatePlayCount
     * @param {string} id - ID of the recording
     */
    updatePlayCount(id) {
        const recordings = this.getRecordings();
        if (recordings[id]) {
            recordings[id].playCount += 1;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recordings));
        }
    }
}

// Export as a module
export default StorageManager;
