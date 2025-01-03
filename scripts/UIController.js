class UIController {
    constructor() {
        this.currentScreen = 'home';
        this.progressChart = null;
        this.trainingSession = null;
        this.waitForDB().then(() => {
            this.initializeUI();
            this.loadTrainingQueue();
            this.updateHomeScreen();
        });
    }

    async waitForDB() {
        // Wait for database to be initialized
        let attempts = 0;
        while (!storageManager.db && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        if (!storageManager.db) {
            console.error('Database initialization timeout');
        }
    }

    initializeUI() {
        // Initialize Materialize components
        M.AutoInit();
        
        // Navigation
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const screen = e.target.closest('.nav-button').dataset.screen;
                this.showScreen(screen);
            });
        });

        // Training controls initialized in TrainingSession class
        
        // Settings sliders
        const volumeSlider = document.getElementById('volumeSlider');
        const repetitionsSlider = document.getElementById('repetitionsSlider');
        const intervalSlider = document.getElementById('intervalSlider');

        volumeSlider.addEventListener('input', () => {
            document.getElementById('volumeValue').textContent = volumeSlider.value + '%';
        });

        repetitionsSlider.addEventListener('input', () => {
            document.getElementById('repetitionsValue').textContent = repetitionsSlider.value;
            if (this.trainingSession) {
                this.trainingSession.setRepetitions(repetitionsSlider.value);
            }
        });

        intervalSlider.addEventListener('input', () => {
            document.getElementById('intervalValue').textContent = intervalSlider.value + 's';
            if (this.trainingSession) {
                this.trainingSession.setInterval(intervalSlider.value);
            }
        });

        // Initialize chart
        this.initializeChart();

        // Update home screen periodically
        setInterval(() => {
            if (this.currentScreen === 'home') {
                this.updateHomeScreen();
            }
        }, 30000); // Update every 30 seconds
    }

    async updateHomeScreen() {
        try {
            const stats = await storageManager.getStatistics();
            
            // Update quick stats
            document.getElementById('homeTotalPhrases').textContent = stats.totalPhrases;
            document.getElementById('homeTotalSessions').textContent = stats.totalSessions;
            document.getElementById('homeTotalTime').textContent = `${Math.round(stats.totalTime)}m`;

            // Update activity log
            const activityLog = document.getElementById('homeActivityLog');
            activityLog.innerHTML = '';
            
            if (!stats.recentActivity || stats.recentActivity.length === 0) {
                activityLog.innerHTML = `
                    <div class="collection-item center-align grey-text">
                        <i class="material-icons medium">history</i>
                        <p>No activity yet</p>
                    </div>
                `;
            } else {
                // Show only last 5 activities on home screen
                stats.recentActivity.slice(0, 5).forEach(activity => {
                    const item = document.createElement('div');
                    item.className = 'collection-item';
                    item.innerHTML = `
                        <div class="row mb-0">
                            <div class="col s12">
                                <p class="blue-text">${activity.date}</p>
                                <p>${activity.description}</p>
                            </div>
                        </div>
                    `;
                    activityLog.appendChild(item);
                });
            }
        } catch (error) {
            console.error('Error updating home screen:', error);
        }
    }

    initializeChart() {
        const ctx = document.getElementById('progressChart').getContext('2d');
        this.progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Practice Time (minutes)',
                    data: [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    async updateAnalytics() {
        try {
            const stats = await storageManager.getStatistics();
            
            // Update stats cards
            document.getElementById('totalPhrases').textContent = stats.totalPhrases;
            document.getElementById('totalSessions').textContent = stats.totalSessions;
            document.getElementById('totalTime').textContent = `${Math.round(stats.totalTime)}m`;

            // Update summary statistics
            const summaryStats = document.getElementById('summaryStats');
            summaryStats.innerHTML = `
                <ul class="collection">
                    <li class="collection-item">Average Session Length: ${Math.round(stats.avgSessionLength)} minutes</li>
                    <li class="collection-item">Average Phrases per Session: ${Math.round(stats.avgPhrasesPerSession)}</li>
                    <li class="collection-item">Last Practice: ${stats.lastPracticeDate}</li>
                </ul>
            `;

            // Update activity log
            const activityLog = document.getElementById('activityLog');
            activityLog.innerHTML = '';
            
            if (!stats.recentActivity || stats.recentActivity.length === 0) {
                activityLog.innerHTML = `
                    <div class="collection-item center-align grey-text">
                        <i class="material-icons medium">history</i>
                        <p>No activity yet</p>
                    </div>
                `;
            } else {
                stats.recentActivity.forEach(activity => {
                    const item = document.createElement('div');
                    item.className = 'collection-item';
                    item.innerHTML = `
                        <div class="row mb-0">
                            <div class="col s12">
                                <p class="blue-text">${activity.date}</p>
                                <p>${activity.description}</p>
                            </div>
                        </div>
                    `;
                    activityLog.appendChild(item);
                });
            }

            // Update chart
            // Generate last 7 days for chart
            const last7Days = Array.from({length: 7}, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toLocaleDateString();
            }).reverse();

            // Calculate practice time for each day
            const practiceData = last7Days.map(date => {
                const dayActivity = stats.recentActivity
                    .filter(a => new Date(a.date).toLocaleDateString() === date)
                    .reduce((total, activity) => {
                        const minutes = parseInt(activity.description.match(/\d+/)[0]) / 60;
                        return total + minutes;
                    }, 0);
                return Math.round(dayActivity * 10) / 10; // Round to 1 decimal place
            });

            // Update chart data
            this.progressChart.data.labels = last7Days;
            this.progressChart.data.datasets[0].data = practiceData;
            this.progressChart.update();
        } catch (error) {
            console.error('Error updating analytics:', error);
        }
    }

    showScreen(screenName) {
        // Update navigation
        document.querySelectorAll('.nav-button').forEach(button => {
            if (button.dataset.screen === screenName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hide');
        });

        // Show selected screen
        document.getElementById(screenName + '-screen').classList.remove('hide');
        this.currentScreen = screenName;

        // Update content if needed
        if (screenName === 'analytics') {
            this.updateAnalytics();
        } else if (screenName === 'train' && !this.trainingSession) {
            this.trainingSession = new TrainingSession();
        }
    }

    async loadTrainingQueue() {
        // Load queue from localStorage
        const queue = JSON.parse(localStorage.getItem('trainingQueue') || '[]');
        const queueContainer = document.getElementById('trainingQueue');
        queueContainer.innerHTML = '';

        if (queue.length === 0) {
            queueContainer.innerHTML = `
                <div class="collection-item center-align grey-text">
                    <i class="material-icons medium">queue_music</i>
                    <p>Training queue is empty</p>
                </div>
            `;
            return;
        }

        for (const id of queue) {
            try {
                const recording = await storageManager.getRecording(id);
                if (recording) {
                    const item = document.createElement('div');
                    item.className = 'collection-item';
                    item.dataset.id = id;
                    item.innerHTML = `
                        <div class="row mb-0">
                            <div class="col s6">
                                <p class="title">${recording.name}</p>
                                <p class="grey-text">${new Date(recording.timestamp).toLocaleString()}</p>
                            </div>
                            <div class="col s6 right-align">
                                <audio src="${URL.createObjectURL(recording.audio)}" controls class="audio-preview"></audio>
                                <a class="btn-floating waves-effect waves-light red remove-from-queue-btn">
                                    <i class="material-icons">remove</i>
                                </a>
                            </div>
                        </div>
                    `;

                    item.querySelector('.remove-from-queue-btn').addEventListener('click', () => {
                        this.removeFromQueue(id);
                    });

                    queueContainer.appendChild(item);
                }
            } catch (error) {
                console.error('Error loading queue item:', error);
            }
        }
    }

    addToQueue(recording) {
        try {
            // Get current queue
            const queue = JSON.parse(localStorage.getItem('trainingQueue') || '[]');
            
            // Check if recording is already in queue
            if (queue.includes(recording.id)) {
                M.toast({html: 'Recording is already in queue', classes: 'orange'});
                return;
            }
            
            // Add to queue
            queue.push(recording.id);
            localStorage.setItem('trainingQueue', JSON.stringify(queue));
            
            // Update UI
            this.loadTrainingQueue();
            M.toast({html: 'Added to training queue', classes: 'green'});
            
            // Switch to train screen
            this.showScreen('train');
        } catch (error) {
            console.error('Error adding to queue:', error);
            M.toast({html: 'Error adding to queue', classes: 'red'});
        }
    }

    removeFromQueue(recordingId) {
        try {
            // Get current queue
            const queue = JSON.parse(localStorage.getItem('trainingQueue') || '[]');
            
            // Remove recording
            const index = queue.indexOf(recordingId);
            if (index > -1) {
                queue.splice(index, 1);
                localStorage.setItem('trainingQueue', JSON.stringify(queue));
                
                // Update UI
                this.loadTrainingQueue();
                M.toast({html: 'Removed from queue', classes: 'blue'});
            }
        } catch (error) {
            console.error('Error removing from queue:', error);
            M.toast({html: 'Error removing from queue', classes: 'red'});
        }
    }
}

// Initialize UI Controller
document.addEventListener('DOMContentLoaded', () => {
    const uiController = new UIController();
    window.uiController = uiController; // Make it globally accessible

    // Listen for addToQueue events
    document.addEventListener('addToQueue', (event) => {
        uiController.addToQueue(event.detail);
    });
});

class TrainingSession {
    constructor() {
        this.queue = JSON.parse(localStorage.getItem('trainingQueue') || '[]');
        this.currentIndex = 0;
        this.isTraining = false;
        this.repetitions = parseInt(document.getElementById('repetitionsSlider')?.value || '3');
        this.interval = parseInt(document.getElementById('intervalSlider')?.value || '5') * 1000;
        this.startBtn = document.getElementById('startTrainingBtn');
        this.sessionStartTime = null;
        this.isRandomOrder = false;
        this.initialize();
    }

    initialize() {
        console.log('Initializing training session');
        
        // Initialize start button
        if (this.startBtn) {
            // Remove any existing listeners
            const newBtn = this.startBtn.cloneNode(true);
            this.startBtn.parentNode.replaceChild(newBtn, this.startBtn);
            this.startBtn = newBtn;
            
            this.startBtn.addEventListener('click', () => {
                if (this.isTraining) {
                    this.stopTraining();
                } else {
                    this.startTraining();
                }
            });
        }

        // Initialize random order toggle
        const randomOrderToggle = document.getElementById('randomOrderToggle');
        if (randomOrderToggle) {
            randomOrderToggle.addEventListener('change', (e) => {
                this.isRandomOrder = e.target.checked;
                console.log('Random order:', this.isRandomOrder);
            });
        }

        // Initialize sliders
        const repetitionsSlider = document.getElementById('repetitionsSlider');
        const intervalSlider = document.getElementById('intervalSlider');

        if (repetitionsSlider) {
            repetitionsSlider.addEventListener('change', (e) => {
                this.setRepetitions(e.target.value);
            });
        }

        if (intervalSlider) {
            intervalSlider.addEventListener('change', (e) => {
                this.setInterval(e.target.value);
            });
        }
    }

    shuffleQueue() {
        // Fisher-Yates shuffle algorithm
        const array = [...this.queue];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    setRepetitions(value) {
        console.log('Setting repetitions to:', value);
        this.repetitions = parseInt(value);
    }

    setInterval(value) {
        console.log('Setting interval to:', value);
        this.interval = parseInt(value) * 1000; // Convert to milliseconds
    }

    async startTraining() {
        console.log('Starting training session');
        if (this.queue.length === 0) {
            M.toast({html: 'Add some recordings to the queue first', classes: 'orange'});
            return;
        }

        try {
            this.isTraining = true;
            this.sessionStartTime = Date.now(); // Track session start time
            
            const startBtn = document.getElementById('startTrainingBtn');
            if (startBtn) {
                startBtn.innerHTML = '<i class="material-icons left">stop</i>Stop Training';
                startBtn.classList.remove('green');
                startBtn.classList.add('red');
            }

            // Update UI to show training is active
            const queueItems = document.querySelectorAll('#trainingQueue .collection-item');
            queueItems.forEach(item => {
                if (item) {
                    const progressDiv = item.querySelector('.progress');
                    if (progressDiv) progressDiv.classList.remove('hide');
                    
                    const statusDiv = item.querySelector('.training-status');
                    if (statusDiv) {
                        statusDiv.textContent = 'Waiting...';
                        statusDiv.classList.remove('hide');
                    }
                }
            });

            // Start the training loop
            for (let rep = 0; rep < this.repetitions && this.isTraining; rep++) {
                console.log(`Starting repetition ${rep + 1} of ${this.repetitions}`);
                
                // Get the queue order for this repetition
                const playQueue = this.isRandomOrder ? this.shuffleQueue() : this.queue;
                
                for (let i = 0; i < playQueue.length && this.isTraining; i++) {
                    const recordingId = playQueue[i];
                    const recording = await storageManager.getRecording(recordingId);
                    
                    if (!recording) {
                        console.warn('Recording not found:', recordingId);
                        continue;
                    }

                    // Update current item UI
                    const currentItem = document.querySelector(`#trainingQueue .collection-item[data-id="${recordingId}"]`);
                    if (currentItem) {
                        currentItem.classList.add('active');
                        const statusDiv = currentItem.querySelector('.training-status');
                        if (statusDiv) {
                            statusDiv.textContent = `Playing (${rep + 1}/${this.repetitions})`;
                        }
                    }

                    // Play the recording
                    try {
                        const audio = new Audio(URL.createObjectURL(recording.audio));
                        await new Promise((resolve, reject) => {
                            audio.onended = resolve;
                            audio.onerror = reject;
                            audio.play();
                        });
                    } catch (error) {
                        console.error('Error playing recording:', error);
                    }

                    // Update progress
                    if (currentItem) {
                        const progressBar = currentItem.querySelector('.determinate');
                        if (progressBar) {
                            progressBar.style.width = '100%';
                        }
                        currentItem.classList.remove('active');
                    }

                    // Wait for interval unless it's the last item
                    if (this.isTraining && (i < playQueue.length - 1 || rep < this.repetitions - 1)) {
                        await new Promise(resolve => setTimeout(resolve, this.interval));
                    }
                }
            }

            // Training completed
            if (this.isTraining) {
                await this.saveTrainingSession();
                this.stopTraining();
                M.toast({html: 'Training session completed!', classes: 'green'});
            }

        } catch (error) {
            console.error('Training error:', error);
            M.toast({html: 'Error during training', classes: 'red'});
            this.stopTraining();
        }
    }

    async saveTrainingSession() {
        const duration = Date.now() - this.sessionStartTime;
        await storageManager.savePracticeSession(duration, this.queue);
        // Update analytics
        const uiController = window.uiController;
        if (uiController) {
            if (uiController.currentScreen === 'analytics') {
                uiController.updateAnalytics();
            }
            uiController.updateHomeScreen();
        }
    }

    stopTraining() {
        console.log('Stopping training session');
        this.isTraining = false;

        // Save session if it was running
        if (this.sessionStartTime) {
            this.saveTrainingSession();
            this.sessionStartTime = null;
        }

        // Update button
        const startBtn = document.getElementById('startTrainingBtn');
        if (startBtn) {
            startBtn.innerHTML = '<i class="material-icons left">play_arrow</i>Start Training';
            startBtn.classList.remove('red');
            startBtn.classList.add('green');
        }

        // Reset UI
        const queueItems = document.querySelectorAll('#trainingQueue .collection-item');
        queueItems.forEach(item => {
            if (item) {
                item.classList.remove('active');
                const progressDiv = item.querySelector('.progress');
                if (progressDiv) progressDiv.classList.add('hide');
                
                const statusDiv = item.querySelector('.training-status');
                if (statusDiv) {
                    statusDiv.textContent = '';
                    statusDiv.classList.add('hide');
                }
            }
        });
    }
}
