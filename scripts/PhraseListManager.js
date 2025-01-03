/**
 * @class PhraseListManager
 * @description Manages phrase list interactions including drag-and-drop and batch operations
 */
class PhraseListManager {
    constructor(storage, ui) {
        this.storage = storage;
        this.ui = ui;
        this.selectedPhrases = new Set();
        this.draggedItem = null;
        this.dropTarget = null;
        this.initialize();
    }

    /**
     * @private
     * @method initialize
     * @description Sets up drag-and-drop and selection functionality
     */
    initialize() {
        this.setupDragAndDrop();
        this.setupBatchOperations();
    }

    /**
     * @private
     * @method setupDragAndDrop
     * @description Sets up drag and drop functionality for phrase items
     */
    setupDragAndDrop() {
        const phraseList = document.getElementById('phraseList');
        
        // Enable HTML5 drag and drop
        phraseList.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.phrase-item');
            if (!item) return;

            this.draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.dataset.recordingId);
        });

        phraseList.addEventListener('dragend', (e) => {
            const item = e.target.closest('.phrase-item');
            if (!item) return;

            item.classList.remove('dragging');
            this.draggedItem = null;
            this.dropTarget = null;

            // Remove all drag-over styling
            phraseList.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
        });

        phraseList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const item = e.target.closest('.phrase-item');
            if (!item || item === this.draggedItem) return;

            // Determine drop position (before or after)
            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            const isAbove = e.clientY < midY;

            // Remove drag-over styling from all items
            phraseList.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => {
                el.classList.remove('drag-over-top', 'drag-over-bottom');
            });

            // Add appropriate drag-over styling
            item.classList.add(isAbove ? 'drag-over-top' : 'drag-over-bottom');
            this.dropTarget = { item, position: isAbove ? 'before' : 'after' };
        });

        phraseList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!this.draggedItem || !this.dropTarget) return;

            const { item: targetItem, position } = this.dropTarget;
            const recordings = this.storage.getRecordings();
            const orderedIds = Object.keys(recordings);
            
            // Get current positions
            const fromIndex = orderedIds.indexOf(this.draggedItem.dataset.recordingId);
            const toIndex = orderedIds.indexOf(targetItem.dataset.recordingId);
            
            // Reorder recordings
            orderedIds.splice(fromIndex, 1);
            orderedIds.splice(position === 'before' ? toIndex : toIndex + 1, 0, this.draggedItem.dataset.recordingId);
            
            // Update order in storage
            const reorderedRecordings = {};
            orderedIds.forEach(id => {
                reorderedRecordings[id] = recordings[id];
                reorderedRecordings[id].order = orderedIds.indexOf(id);
            });
            
            this.storage.saveReorderedRecordings(reorderedRecordings);
            this.ui.updatePhraseList(reorderedRecordings);
        });
    }

    /**
     * @private
     * @method setupBatchOperations
     * @description Sets up batch selection and operations for phrases
     */
    setupBatchOperations() {
        const phraseList = document.getElementById('phraseList');
        
        // Add checkbox to each phrase item
        phraseList.addEventListener('click', (e) => {
            const checkbox = e.target.closest('.phrase-select');
            if (!checkbox) return;

            const item = checkbox.closest('.phrase-item');
            const recordingId = item.dataset.recordingId;

            if (checkbox.checked) {
                this.selectedPhrases.add(recordingId);
            } else {
                this.selectedPhrases.delete(recordingId);
            }

            this.updateBatchOperationsUI();
        });

        // Batch operation buttons
        document.getElementById('batchDelete').addEventListener('click', () => {
            if (this.selectedPhrases.size === 0) return;
            
            if (confirm(`Delete ${this.selectedPhrases.size} selected phrases?`)) {
                this.selectedPhrases.forEach(id => {
                    this.storage.deleteRecording(id);
                });
                this.selectedPhrases.clear();
                this.ui.updatePhraseList(this.storage.getRecordings());
                this.updateBatchOperationsUI();
            }
        });

        document.getElementById('batchCategory').addEventListener('click', () => {
            if (this.selectedPhrases.size === 0) return;
            
            const categories = this.storage.getCategories();
            const category = prompt(`Enter category (${categories.join(', ')}):`, 'Phrases');
            
            if (category) {
                if (!categories.includes(category)) {
                    this.storage.addCategory(category);
                }
                
                this.selectedPhrases.forEach(id => {
                    this.storage.updateRecordingMetadata(id, { category });
                });
                
                this.selectedPhrases.clear();
                this.ui.updatePhraseList(this.storage.getRecordings());
                this.updateBatchOperationsUI();
            }
        });
    }

    /**
     * @private
     * @method updateBatchOperationsUI
     * @description Updates the batch operations UI based on selection state
     */
    updateBatchOperationsUI() {
        const batchControls = document.getElementById('batchControls');
        const selectedCount = this.selectedPhrases.size;
        
        if (selectedCount > 0) {
            batchControls.classList.remove('hidden');
            document.getElementById('selectedCount').textContent = `${selectedCount} selected`;
        } else {
            batchControls.classList.add('hidden');
        }
    }
}

export default PhraseListManager;
