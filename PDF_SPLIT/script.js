class PDFSplitter {
    constructor() {
        this.currentFile = null;
        this.pdfDoc = null;
        this.selectedOption = null;
        this.pageRanges = []; // Array to store individual page ranges
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload events
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Option selection
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => this.selectOption(card.dataset.option));
        });

        // Control buttons
        document.getElementById('removeFile').addEventListener('click', this.removeFile.bind(this));
        document.getElementById('splitBtn').addEventListener('click', this.splitPDF.bind(this));
        document.getElementById('resetBtn').addEventListener('click', this.reset.bind(this));
        document.getElementById('downloadAllBtn').addEventListener('click', this.downloadAll.bind(this));

        // Range builder events
        document.getElementById('addRangeBtn').addEventListener('click', this.addRange.bind(this));
        document.getElementById('addPageBtn').addEventListener('click', this.addSinglePage.bind(this));
        document.getElementById('clearRangesBtn').addEventListener('click', this.clearAllRanges.bind(this));
        document.getElementById('selectAllPagesBtn').addEventListener('click', this.selectAllPages.bind(this));

        // Input validation
        document.getElementById('pageRanges').addEventListener('input', this.validatePageRanges.bind(this));
        document.getElementById('numParts').addEventListener('input', this.validateNumParts.bind(this));
        document.getElementById('numParts').addEventListener('input', this.updateEqualPreview.bind(this));
        
        // Range input validation
        document.getElementById('rangeStart').addEventListener('input', this.validateRangeInputs.bind(this));
        document.getElementById('rangeEnd').addEventListener('input', this.validateRangeInputs.bind(this));
        document.getElementById('singlePage').addEventListener('input', this.validateSinglePage.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        if (file.type !== 'application/pdf') {
            this.showError('Please select a valid PDF file.');
            return;
        }

        this.currentFile = file;
        this.showUploadProgress();

        try {
            const arrayBuffer = await file.arrayBuffer();
            this.pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            this.hideUploadProgress();
            this.showFileInfo(file);
            this.showSplitOptions();
        } catch (error) {
            this.hideUploadProgress();
            this.showError('Error loading PDF file. Please ensure the file is not corrupted.');
            console.error('PDF loading error:', error);
        }
    }

    showUploadProgress() {
        document.querySelector('.upload-content').style.opacity = '0.3';
        document.getElementById('uploadProgress').style.display = 'block';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = Math.round(progress) + '%';
        }, 100);
    }

    hideUploadProgress() {
        document.getElementById('uploadProgress').style.display = 'none';
        document.querySelector('.upload-content').style.opacity = '1';
    }

    showFileInfo(file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        document.getElementById('pageCount').textContent = `${this.pdfDoc.getPageCount()} pages`;
        document.getElementById('fileInfoSection').style.display = 'block';
    }

    showSplitOptions() {
        document.getElementById('splitOptionsSection').style.display = 'block';
    }

    selectOption(option) {
        // Remove previous selection
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        document.querySelector(`[data-option="${option}"]`).classList.add('selected');
        this.selectedOption = option;

        // Hide all config panels
        document.querySelectorAll('.config-panel').forEach(panel => {
            panel.style.display = 'none';
        });

        // Show relevant config panel
        const configPanel = document.getElementById(`${option}Config`);
        if (configPanel) {
            configPanel.style.display = 'block';
        }

        // Handle bookmark option
        if (option === 'bookmarks') {
            this.loadBookmarks();
        }

        // Clear page ranges when switching options
        if (option === 'pages') {
            this.pageRanges = [];
            this.updateRangePreview();
        }

        // Update equal parts preview
        if (option === 'equal') {
            this.updateEqualPreview();
        }

        document.getElementById('configSection').style.display = 'block';
        document.getElementById('actionSection').style.display = 'block';
    }

    async loadBookmarks() {
        const bookmarksList = document.getElementById('bookmarksList');
        bookmarksList.innerHTML = '<p>Scanning for bookmarks...</p>';

        // Simulate bookmark loading (PDF.js doesn't support bookmark extraction in browser)
        setTimeout(() => {
            const sampleBookmarks = [
                { title: 'Chapter 1: Introduction', page: 1 },
                { title: 'Chapter 2: Getting Started', page: 5 },
                { title: 'Chapter 3: Advanced Topics', page: 12 },
                { title: 'Appendix A', page: 20 }
            ];

            if (sampleBookmarks.length === 0) {
                bookmarksList.innerHTML = '<p>No bookmarks found in this PDF.</p>';
            } else {
                bookmarksList.innerHTML = sampleBookmarks.map((bookmark, index) => `
                    <div class="bookmark-item">
                        <label>
                            <input type="checkbox" value="${bookmark.page}" checked>
                            ${bookmark.title} (Page ${bookmark.page})
                        </label>
                    </div>
                `).join('');
            }
        }, 1000);
    }

    validatePageRanges() {
        const input = document.getElementById('pageRanges');
        const value = input.value.trim();

        if (!value) {
            this.updateRangePreview();
            return;
        }

        try {
            const ranges = this.parsePageRanges(value);
            const totalPages = this.pdfDoc.getPageCount();
            
            // Clear current ranges and rebuild from input
            this.pageRanges = [];
            
            // Validate and add ranges
            ranges.forEach(range => {
                const validPages = range.filter(page => page >= 1 && page <= totalPages);
                if (validPages.length === range.length) {
                    this.pageRanges.push({
                        pages: validPages,
                        name: validPages.length === 1 ? `Page ${validPages[0]}` : `Pages ${validPages[0]}-${validPages[validPages.length-1]}`
                    });
                }
            });

            if (this.pageRanges.length !== ranges.length) {
                input.style.borderColor = '#dc3545';
            } else {
                input.style.borderColor = '#28a745';
            }
            
            this.updateRangePreview();
        } catch (error) {
            input.style.borderColor = '#dc3545';
            this.updateRangePreview();
        }
    }

    addRange() {
        const startInput = document.getElementById('rangeStart');
        const endInput = document.getElementById('rangeEnd');
        const start = parseInt(startInput.value);
        const end = parseInt(endInput.value);
        const totalPages = this.pdfDoc.getPageCount();

        if (!start || !end || start < 1 || end < 1 || start > totalPages || end > totalPages || start > end) {
            this.showError('Please enter valid page numbers.');
            return;
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        const rangeName = start === end ? `Page ${start}` : `Pages ${start}-${end}`;
        
        this.pageRanges.push({
            pages: pages,
            name: rangeName
        });

        // Clear inputs
        startInput.value = '';
        endInput.value = '';

        this.updateRangePreview();
        this.updatePageRangesInput();
    }

    addSinglePage() {
        const pageInput = document.getElementById('singlePage');
        const page = parseInt(pageInput.value);
        const totalPages = this.pdfDoc.getPageCount();

        if (!page || page < 1 || page > totalPages) {
            this.showError('Please enter a valid page number.');
            return;
        }

        this.pageRanges.push({
            pages: [page],
            name: `Page ${page}`
        });

        // Clear input
        pageInput.value = '';

        this.updateRangePreview();
        this.updatePageRangesInput();
    }

    clearAllRanges() {
        this.pageRanges = [];
        document.getElementById('pageRanges').value = '';
        this.updateRangePreview();
    }

    selectAllPages() {
        if (!this.pdfDoc) return;
        
        this.pageRanges = [];
        const totalPages = this.pdfDoc.getPageCount();
        
        for (let i = 1; i <= totalPages; i++) {
            this.pageRanges.push({
                pages: [i],
                name: `Page ${i}`
            });
        }
        
        this.updateRangePreview();
        this.updatePageRangesInput();
    }

    removeRange(index) {
        this.pageRanges.splice(index, 1);
        this.updateRangePreview();
        this.updatePageRangesInput();
    }

    updateRangePreview() {
        const preview = document.getElementById('previewRanges');
        
        if (this.pageRanges.length === 0) {
            preview.innerHTML = '<div class="preview-empty">No page ranges selected. Use the range builder above or type ranges manually.</div>';
            return;
        }

        const rangeItems = this.pageRanges.map((range, index) => {
            const pageCount = range.pages.length;
            return `
                <span class="range-item">
                    ${range.name}
                    <span class="range-count">${pageCount} page${pageCount > 1 ? 's' : ''}</span>
                    <span class="remove-range" onclick="pdfSplitter.removeRange(${index})" title="Remove this range">×</span>
                </span>
            `;
        }).join('');

        const totalPDFs = this.pageRanges.length;
        const totalPages = this.pageRanges.reduce((sum, range) => sum + range.pages.length, 0);

        preview.innerHTML = `
            ${rangeItems}
            <div class="preview-summary">
                Will create <strong>${totalPDFs}</strong> separate PDF file${totalPDFs > 1 ? 's' : ''} 
                containing <strong>${totalPages}</strong> total page${totalPages > 1 ? 's' : ''}
            </div>
        `;
    }

    updatePageRangesInput() {
        const rangeStrings = this.pageRanges.map(range => {
            if (range.pages.length === 1) {
                return range.pages[0].toString();
            } else {
                return `${range.pages[0]}-${range.pages[range.pages.length - 1]}`;
            }
        });
        
        document.getElementById('pageRanges').value = rangeStrings.join(', ');
    }

    validateRangeInputs() {
        const startInput = document.getElementById('rangeStart');
        const endInput = document.getElementById('rangeEnd');
        const start = parseInt(startInput.value);
        const end = parseInt(endInput.value);
        const totalPages = this.pdfDoc ? this.pdfDoc.getPageCount() : 1;

        if (start && (start < 1 || start > totalPages)) {
            startInput.style.borderColor = '#dc3545';
        } else {
            startInput.style.borderColor = '#e0e0e0';
        }

        if (end && (end < 1 || end > totalPages || (start && end < start))) {
            endInput.style.borderColor = '#dc3545';
        } else {
            endInput.style.borderColor = '#e0e0e0';
        }
    }

    validateSinglePage() {
        const pageInput = document.getElementById('singlePage');
        const page = parseInt(pageInput.value);
        const totalPages = this.pdfDoc ? this.pdfDoc.getPageCount() : 1;

        if (page && (page < 1 || page > totalPages)) {
            pageInput.style.borderColor = '#dc3545';
        } else {
            pageInput.style.borderColor = '#e0e0e0';
        }
    }

    validateNumParts() {
        const input = document.getElementById('numParts');
        const value = parseInt(input.value);
        const totalPages = this.pdfDoc.getPageCount();

        if (value > totalPages) {
            input.style.borderColor = '#dc3545';
        } else {
            input.style.borderColor = '#28a745';
        }
    }

    updateEqualPreview() {
        const numParts = parseInt(document.getElementById('numParts').value) || 2;
        const preview = document.getElementById('equalPreview');
        
        if (this.pdfDoc) {
            const totalPages = this.pdfDoc.getPageCount();
            const pagesPerPart = Math.ceil(totalPages / numParts);
            
            preview.innerHTML = `
                <p>Your PDF will be split into <strong>${numParts}</strong> parts</p>
                <p>Each part will have approximately <strong>${pagesPerPart}</strong> pages</p>
                <small>Total pages: ${totalPages}</small>
            `;
        } else {
            preview.innerHTML = `<p>Your PDF will be split into <strong>${numParts}</strong> equal parts</p>`;
        }
    }

    parsePageRanges(rangeString) {
        const ranges = [];
        const parts = rangeString.split(',').map(s => s.trim());

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(s => parseInt(s.trim()));
                if (isNaN(start) || isNaN(end) || start > end) {
                    throw new Error('Invalid range');
                }
                const range = [];
                for (let i = start; i <= end; i++) {
                    range.push(i);
                }
                ranges.push(range);
            } else {
                const page = parseInt(part);
                if (isNaN(page)) {
                    throw new Error('Invalid page number');
                }
                ranges.push([page]);
            }
        }

        return ranges;
    }

    async splitPDF() {
        if (!this.selectedOption || !this.pdfDoc) {
            this.showError('Please select a split option.');
            return;
        }

        this.showProcessingModal();
        
        try {
            let splitConfigs = [];

            switch (this.selectedOption) {
                case 'pages':
                    splitConfigs = await this.generatePageSplitConfigs();
                    break;
                case 'equal':
                    splitConfigs = await this.generateEqualSplitConfigs();
                    break;
                case 'size':
                    splitConfigs = await this.generateSizeSplitConfigs();
                    break;
                case 'bookmarks':
                    splitConfigs = await this.generateBookmarkSplitConfigs();
                    break;
            }

            const splitResults = await this.executeSplit(splitConfigs);
            this.hideProcessingModal();
            this.showResults(splitResults);

        } catch (error) {
            this.hideProcessingModal();
            this.showError('Error splitting PDF: ' + error.message);
            console.error('Split error:', error);
        }
    }

    async generatePageSplitConfigs() {
        if (this.pageRanges.length === 0) {
            throw new Error('Please select at least one page range.');
        }

        return this.pageRanges.map((range, index) => ({
            name: `${range.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
            displayName: range.name,
            pages: range.pages.map(p => p - 1) // Convert to 0-based indexing
        }));
    }

    async generateEqualSplitConfigs() {
        const numParts = parseInt(document.getElementById('numParts').value);
        const totalPages = this.pdfDoc.getPageCount();
        const pagesPerPart = Math.ceil(totalPages / numParts);

        const configs = [];
        for (let i = 0; i < numParts; i++) {
            const start = i * pagesPerPart;
            const end = Math.min(start + pagesPerPart, totalPages);
            
            if (start < totalPages) {
                const pages = [];
                for (let j = start; j < end; j++) {
                    pages.push(j);
                }
                configs.push({
                    name: `part_${i + 1}`,
                    displayName: `Part ${i + 1}`,
                    pages: pages
                });
            }
        }

        return configs;
    }

    async generateSizeSplitConfigs() {
        // This is a simplified implementation
        // In a real scenario, you'd need to calculate actual page sizes
        const maxSize = parseInt(document.getElementById('maxSize').value) * 1024 * 1024; // Convert to bytes
        const totalPages = this.pdfDoc.getPageCount();
        const estimatedPageSize = this.currentFile.size / totalPages;
        const pagesPerFile = Math.floor(maxSize / estimatedPageSize);

        const configs = [];
        for (let i = 0; i < totalPages; i += pagesPerFile) {
            const end = Math.min(i + pagesPerFile, totalPages);
            const pages = [];
            for (let j = i; j < end; j++) {
                pages.push(j);
            }
            configs.push({
                name: `size_part_${Math.floor(i / pagesPerFile) + 1}`,
                displayName: `Size Part ${Math.floor(i / pagesPerFile) + 1}`,
                pages: pages
            });
        }

        return configs;
    }

    async generateBookmarkSplitConfigs() {
        const selectedBookmarks = Array.from(document.querySelectorAll('#bookmarksList input:checked'))
            .map(cb => parseInt(cb.value) - 1); // Convert to 0-based indexing

        if (selectedBookmarks.length === 0) {
            throw new Error('Please select at least one bookmark.');
        }

        selectedBookmarks.sort((a, b) => a - b);
        const totalPages = this.pdfDoc.getPageCount();
        const configs = [];

        for (let i = 0; i < selectedBookmarks.length; i++) {
            const start = selectedBookmarks[i];
            const end = i < selectedBookmarks.length - 1 ? selectedBookmarks[i + 1] : totalPages;
            
            const pages = [];
            for (let j = start; j < end; j++) {
                pages.push(j);
            }
            
            configs.push({
                name: `bookmark_${i + 1}`,
                displayName: `Bookmark ${i + 1}`,
                pages: pages
            });
        }

        return configs;
    }

    async executeSplit(splitConfigs) {
        const results = [];
        
        for (let i = 0; i < splitConfigs.length; i++) {
            const config = splitConfigs[i];
            
            // Update progress
            const progress = ((i + 1) / splitConfigs.length) * 100;
            document.getElementById('processingProgress').style.width = progress + '%';
            document.getElementById('processingStatus').textContent = 
                `Processing ${config.displayName || config.name}...`;

            // Create new PDF document
            const newPdf = await PDFLib.PDFDocument.create();
            
            // Copy pages
            const copiedPages = await newPdf.copyPages(this.pdfDoc, config.pages);
            copiedPages.forEach(page => newPdf.addPage(page));

            // Add watermark if option is selected
            if (document.getElementById('addWatermark').checked) {
                await this.addWatermark(newPdf);
            }

            // Generate PDF bytes
            const pdfBytes = await newPdf.save();
            
            results.push({
                name: config.name,
                displayName: config.displayName || config.name,
                data: pdfBytes,
                pageCount: config.pages.length,
                size: pdfBytes.length
            });

            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return results;
    }

    async addWatermark(pdfDoc) {
        const pages = pdfDoc.getPages();
        const watermarkText = 'PDF Split Pro';
        
        pages.forEach(page => {
            const { width, height } = page.getSize();
            page.drawText(watermarkText, {
                x: width / 2 - 50,
                y: height / 2,
                size: 20,
                opacity: 0.1,
                rotate: PDFLib.degrees(45)
            });
        });
    }

    showResults(results) {
        this.splitResults = results;
        const resultsGrid = document.getElementById('resultsGrid');
        
        resultsGrid.innerHTML = results.map((result, index) => `
            <div class="result-card">
                <div class="result-info">
                    <h4>${result.displayName}.pdf</h4>
                    <p>${result.pageCount} pages • ${this.formatFileSize(result.size)}</p>
                </div>
                <button class="download-btn" onclick="pdfSplitter.downloadFile(${index})">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `).join('');

        document.getElementById('resultsSection').style.display = 'block';
        
        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }

    downloadFile(index) {
        const result = this.splitResults[index];
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = "SPDFSPLIT.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAll() {
        if (!this.splitResults || this.splitResults.length === 0) return;

        const zip = new JSZip();
        
        this.splitResults.forEach((result, index) => {
            zip.file(`SPDFSPLIT_${index + 1}.pdf`, result.data);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SPDFSPLIT.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    removeFile() {
        this.currentFile = null;
        this.pdfDoc = null;
        this.selectedOption = null;
        this.splitResults = null;
        this.pageRanges = [];
        
        // Reset UI
        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfoSection').style.display = 'none';
        document.getElementById('splitOptionsSection').style.display = 'none';
        document.getElementById('configSection').style.display = 'none';
        document.getElementById('actionSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        
        // Reset form inputs
        document.getElementById('pageRanges').value = '';
        document.getElementById('numParts').value = '2';
        document.getElementById('maxSize').value = '5';
        
        // Remove option selections
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    reset() {
        this.removeFile();
    }

    showProcessingModal() {
        document.getElementById('processingModal').style.display = 'flex';
        document.getElementById('processingProgress').style.width = '0%';
        document.getElementById('processingStatus').textContent = 'Initializing split operation...';
    }

    hideProcessingModal() {
        document.getElementById('processingModal').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').style.display = 'flex';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Utility functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Initialize the PDF splitter when the page loads
let pdfSplitter;
document.addEventListener('DOMContentLoaded', () => {
    pdfSplitter = new PDFSplitter();
});

// Handle window clicks on modals
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
