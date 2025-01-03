class StorageManager {
    constructor() {
        this.dbName = 'parrotTrainerDB';
        this.dbVersion = 1;
        this.db = null;
        this.dbReady = this.initDB();
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            console.log('Opening IndexedDB:', this.dbName);
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('Error opening database:', event.target.error);
                reject(event.target.error);
            };

            request.onupgradeneeded = (event) => {
                console.log('Database upgrade needed');
                const db = event.target.result;

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains('recordings')) {
                    console.log('Creating recordings store');
                    const recordingsStore = db.createObjectStore('recordings', { keyPath: 'id', autoIncrement: true });
                    recordingsStore.createIndex('name', 'name', { unique: false });
                    recordingsStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains('sessions')) {
                    console.log('Creating sessions store');
                    const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
                    sessionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    sessionsStore.createIndex('duration', 'duration', { unique: false });
                }

                if (!db.objectStoreNames.contains('practice')) {
                    console.log('Creating practice store');
                    const practiceStore = db.createObjectStore('practice', { keyPath: 'id', autoIncrement: true });
                    practiceStore.createIndex('recordingId', 'recordingId', { unique: false });
                    practiceStore.createIndex('timestamp', 'timestamp', { unique: false });
                    practiceStore.createIndex('duration', 'duration', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database initialized successfully');
                
                // Listen for errors
                this.db.onerror = (event) => {
                    console.error('Database error:', event.target.error);
                };
                
                resolve(this.db);
            };
        });
    }

    async ensureDB() {
        if (!this.db) {
            console.log('Waiting for database to be ready');
            await this.dbReady;
            console.log('Database is ready');
        }
        return this.db;
    }

    async saveRecording(name, audioBlob) {
        try {
            console.log('Saving recording:', name);
            await this.ensureDB();
            const recording = {
                name: name,
                audio: audioBlob,
                timestamp: new Date().toISOString()
            };
            const id = await this.addToStore('recordings', recording);
            console.log('Recording saved with ID:', id);
            return id;
        } catch (error) {
            console.error('Error saving recording:', error);
            throw error;
        }
    }

    async getRecordings() {
        try {
            console.log('Getting all recordings');
            await this.ensureDB();
            const recordings = await this.getAllFromStore('recordings');
            console.log('Retrieved recordings:', recordings.length);
            return recordings;
        } catch (error) {
            console.error('Error getting recordings:', error);
            throw error;
        }
    }

    async getRecording(id) {
        try {
            console.log('Getting recording:', id);
            await this.ensureDB();
            const recording = await this.getFromStore('recordings', id);
            console.log('Retrieved recording:', recording?.name);
            return recording;
        } catch (error) {
            console.error('Error getting recording:', error);
            throw error;
        }
    }

    async deleteRecording(id) {
        try {
            console.log('Deleting recording:', id);
            await this.ensureDB();
            await this.deleteFromStore('recordings', id);
            console.log('Recording deleted');
        } catch (error) {
            console.error('Error deleting recording:', error);
            throw error;
        }
    }

    async savePracticeSession(duration, recordingIds) {
        try {
            console.log('Saving practice session');
            await this.ensureDB();
            const session = {
                timestamp: new Date().toISOString(),
                duration: duration,
                recordingIds: recordingIds
            };

            const sessionId = await this.addToStore('sessions', session);
            console.log('Session saved:', sessionId);

            // Save individual practice records
            for (const recordingId of recordingIds) {
                const practice = {
                    sessionId: sessionId,
                    recordingId: recordingId,
                    timestamp: new Date().toISOString(),
                    duration: duration / recordingIds.length // Approximate duration per recording
                };
                await this.addToStore('practice', practice);
            }

            return sessionId;
        } catch (error) {
            console.error('Error saving practice session:', error);
            throw error;
        }
    }

    async getStatistics() {
        try {
            console.log('Getting statistics');
            await this.ensureDB();
            const [recordings, sessions, practices] = await Promise.all([
                this.getAllFromStore('recordings'),
                this.getAllFromStore('sessions'),
                this.getAllFromStore('practice')
            ]);

            const totalPhrases = recordings.length;
            const totalSessions = sessions.length;
            const totalTime = sessions.reduce((acc, session) => acc + session.duration, 0) / 60000; // Convert to minutes

            // Get recent activity
            const recentActivity = [...sessions]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10)
                .map(session => ({
                    date: new Date(session.timestamp).toLocaleString(),
                    description: `Practiced ${session.recordingIds.length} phrases for ${Math.round(session.duration / 1000)} seconds`
                }));

            // Calculate average session length
            const avgSessionLength = totalSessions > 0 ? totalTime / totalSessions : 0;

            // Calculate average phrases per session
            const avgPhrasesPerSession = totalSessions > 0 ? 
                sessions.reduce((acc, session) => acc + session.recordingIds.length, 0) / totalSessions : 0;

            // Get last practice date
            const lastPracticeDate = sessions.length > 0 ? 
                new Date(sessions[sessions.length - 1].timestamp).toLocaleDateString() : 'Never';

            const stats = {
                totalPhrases,
                totalSessions,
                totalTime,
                recentActivity,
                avgSessionLength,
                avgPhrasesPerSession,
                lastPracticeDate
            };
            
            console.log('Statistics:', stats);
            return stats;
        } catch (error) {
            console.error('Error getting statistics:', error);
            throw error;
        }
    }

    // Helper methods for IndexedDB operations
    async addToStore(storeName, data) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            console.log(`Adding to ${storeName}:`, data);
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => {
                console.log(`Successfully added to ${storeName}`);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error(`Error adding to ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    async getAllFromStore(storeName) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            console.log(`Getting all from ${storeName}`);
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                console.log(`Retrieved ${request.result.length} items from ${storeName}`);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error(`Error getting all from ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    async getFromStore(storeName, id) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            console.log(`Getting item ${id} from ${storeName}`);
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => {
                console.log(`Retrieved item from ${storeName}:`, request.result);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error(`Error getting from ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }

    async deleteFromStore(storeName, id) {
        const db = await this.ensureDB();
        return new Promise((resolve, reject) => {
            console.log(`Deleting item ${id} from ${storeName}`);
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log(`Successfully deleted from ${storeName}`);
                resolve();
            };
            request.onerror = () => {
                console.error(`Error deleting from ${storeName}:`, request.error);
                reject(request.error);
            };
        });
    }
}

// Create a single instance
const storageManager = new StorageManager();
