/**
 * @class NotificationManager
 * @description Manages application notifications and reminders
 */
class NotificationManager {
    constructor(settings) {
        this.settings = settings;
        this.notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiDMwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2JOQgUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU2jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUuhM/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYELIHO8diDMwgZaLvt559NEAxPqOPwtmMcBjiP1/PMeSwFJHfH8N2JOQgUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUug8/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYELIHO8diDMwgZaLvt559NEAxPqOPwtmMcBjiP1/PMeSwFJHfH8N2JOQgUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUug8/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYELIHO8diDMwgZaLvt559NEAxPqOPwtmMcBjiP1/PMeSwFJHfH8N2JOQgUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUug8/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYELIHO8diDMwgZaLvt559NEAxPqOPwtmMcBjiP1/PMeSwFJHfH8N2JOQgUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUug8/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYELIHO8diDMwgZaLvt559NEAxPqOPwtmMcBjiP1/PMeSwFJHfH8N2JOQgUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUug8/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYELIHO8diDMwgZaLvt559NEAxPqOPwtmMcBjiP1/PMeSwFJHfH8N2JOQgUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUug8/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYELIHO8diDMwgZaLvt559NEAxPqOPwtmMcBjiP1/PMeSwFJHfH8N2JOQgUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUug8/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYELIHO8diDMwgZaLvt559NEAxPqOPwtmMcBjiP1/PMeSwFJHfH8N2JOQgUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUug8/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYELIHO8diDMwgZaLvt559NEAxPqOPwtmMcBjiP1/PMeSwFJHfH8N2JOQgUXrTp66hVFApGnt/yvmwhBTCG0fPTgjMGHm7A7+OZRA4NVqzn77BdGAg+ltryxnMpBSl+zPLaizsIGGS57OihUBELTKXh8bllHgU1jdXzzn0vBSF1xe/fizsHE1ux6OyrWBUIQ5zd8sFuJAUug8/z1YU2Bhxqvu7mnEYPDFOq5O+zYBoIPJPY8sl3KwUme8rx3I4+CBZiturqpVITC0mi4PK8aB8GM4nU8tGAMQYfcsLu4Y4/BxFYr+ftrVoXCECY3PLEcSYE');
        this.initialize();
    }

    /**
     * @private
     * @method initialize
     * @description Initializes notification system and requests permissions
     */
    async initialize() {
        if ('Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                await Notification.requestPermission();
            }
        }
    }

    /**
     * @method showNotification
     * @param {string} title - Notification title
     * @param {Object} options - Notification options
     * @returns {Promise<boolean>} Success status
     */
    async showNotification(title, options = {}) {
        if (!this.settings.getSettings().notifications.enabled) {
            return false;
        }

        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                const notification = new Notification(title, {
                    icon: options.icon || '/icons/notification.png',
                    badge: options.badge || '/icons/badge.png',
                    ...options
                });

                if (this.settings.getSettings().notifications.sound) {
                    this.notificationSound.play();
                }

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                    if (options.onClick) {
                        options.onClick();
                    }
                };

                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to show notification:', error);
            return false;
        }
    }

    /**
     * @method scheduleTrainingReminder
     * @param {Date} time - Time to show reminder
     * @param {string} message - Reminder message
     */
    scheduleTrainingReminder(time, message) {
        if (!this.settings.getSettings().notifications.training) {
            return;
        }

        const now = new Date();
        const delay = time.getTime() - now.getTime();

        if (delay > 0) {
            setTimeout(() => {
                this.showNotification('Training Reminder', {
                    body: message,
                    tag: 'training-reminder'
                });
            }, delay);
        }
    }

    /**
     * @method showPlaybackNotification
     * @param {string} phraseName - Name of the phrase being played
     */
    showPlaybackNotification(phraseName) {
        this.showNotification('Now Playing', {
            body: `Playing phrase: ${phraseName}`,
            tag: 'playback',
            requireInteraction: false
        });
    }

    /**
     * @method showRecordingComplete
     * @param {string} phraseName - Name of the recorded phrase
     */
    showRecordingComplete(phraseName) {
        this.showNotification('Recording Complete', {
            body: `Successfully recorded: ${phraseName}`,
            tag: 'recording',
            requireInteraction: false
        });
    }
}

export default NotificationManager;
