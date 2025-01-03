// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for required browser features
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Your browser does not support audio recording. Please use a modern browser like Chrome or Firefox.');
        return;
    }

    // Initialize the application
    try {
        // The StorageManager, AudioRecorder, AudioPlayback, and UIController instances 
        // are already created in their respective files
        
        // Update the phrase list on initial load
        storageManager.updatePhraseList();

        console.log('Parrot Trainer initialized successfully!');
    } catch (error) {
        console.error('Error initializing Parrot Trainer:', error);
        alert('There was an error initializing the application. Please refresh the page.');
    }
});
