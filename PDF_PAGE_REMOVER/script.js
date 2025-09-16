class PDFPageRemover {
    constructor() {
        this.pdfDoc = null;
        this.originalPdfBytes = null;
        this.selectedPages = new Set();
        this.totalPages = 0;
        this.isShiftPressed = false;
        this.lastSelectedPage = null;
        this.originalFileName = '';
        
        this.initializeEventListeners();
        this.setupDragAndDrop();
    }

    initializeEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Page number input
        const pageNumbers = document.getElementById('pageNumbers');
        pageNumbers.addEventListener('input', (e) => this.handlePageNumberInput(e));

        // Buttons
        document.getElementById('removeButton').addEventListener('click', () => this.removePages());
        document.getElementById('resetButton').addEventListener('click', () => this.resetSelection());
        document.getElementById('downloadButton').addEventListener('click', () => this.downloadProcessedPDF());
        document.getElementById('selectAllBtn').addEventListener('click', () => this.selectAllPages());
        document.getElementById('selectNoneBtn').addEventListener('click', () => this.selectNoPages());

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {
                this.isShiftPressed = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Shift') {
                this.isShiftPressed = false;
            }
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.loadPDF(files[0]);
            } else {
                this.showError('Please drop a valid PDF file.');
            }
        });
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            await this.loadPDF(file);
        } else {
            this.showError('Please select a valid PDF file.');
        }
    }

    async loadPDF(file) {
        try {
            this.showLoading(true);
            
            // Store file info
            this.originalFileName = file.name.replace('.pdf', '');
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('fileSize').textContent = this.formatFileSize(file.size);

            // Read file as array buffer
            const arrayBuffer = await file.arrayBuffer();
            this.originalPdfBytes = new Uint8Array(arrayBuffer);

            // Load PDF with pdf-lib
            this.pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            this.totalPages = this.pdfDoc.getPageCount();

            // Update UI
            document.getElementById('totalPages').textContent = this.totalPages;
            
            // Render PDF pages
            await this.renderPDFPages(arrayBuffer);
            
            // Show main content
            document.getElementById('uploadSection').style.display = 'none';
            document.getElementById('mainContent').style.display = 'flex';
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.showError('Failed to load PDF. Please make sure the file is not corrupted.');
            this.showLoading(false);
        }
    }

    async renderPDFPages(arrayBuffer) {
        const pagesGrid = document.getElementById('pagesGrid');
        pagesGrid.innerHTML = '';

        // Load PDF with pdf.js for rendering
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        for (let i = 1; i <= this.totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.3 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Create page item
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.dataset.pageNumber = i;
            
            pageItem.innerHTML = `
                <canvas class="page-canvas"></canvas>
                <div class="page-number">Page ${i}</div>
            `;

            // Replace the placeholder canvas with the rendered one
            const placeholderCanvas = pageItem.querySelector('.page-canvas');
            placeholderCanvas.replaceWith(canvas);
            canvas.className = 'page-canvas';

            // Add click event
            pageItem.addEventListener('click', (e) => this.handlePageClick(i, e));

            pagesGrid.appendChild(pageItem);
        }
    }

    handlePageClick(pageNumber, event) {
        if (this.isShiftPressed && this.lastSelectedPage !== null) {
            // Range selection
            const start = Math.min(this.lastSelectedPage, pageNumber);
            const end = Math.max(this.lastSelectedPage, pageNumber);
            
            for (let i = start; i <= end; i++) {
                this.selectedPages.add(i);
            }
        } else {
            // Single selection
            if (this.selectedPages.has(pageNumber)) {
                this.selectedPages.delete(pageNumber);
            } else {
                this.selectedPages.add(pageNumber);
            }
            this.lastSelectedPage = pageNumber;
        }

        this.updatePageSelection();
        this.updateUI();
    }

    updatePageSelection() {
        const pageItems = document.querySelectorAll('.page-item');
        pageItems.forEach(item => {
            const pageNumber = parseInt(item.dataset.pageNumber);
            if (this.selectedPages.has(pageNumber)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    handlePageNumberInput(event) {
        const input = event.target.value;
        this.selectedPages.clear();
        
        if (input.trim()) {
            const ranges = input.split(',');
            
            ranges.forEach(range => {
                range = range.trim();
                if (range.includes('-')) {
                    // Range (e.g., "3-5")
                    const [start, end] = range.split('-').map(n => parseInt(n.trim()));
                    if (start && end && start <= end) {
                        for (let i = start; i <= end && i <= this.totalPages; i++) {
                            if (i > 0) this.selectedPages.add(i);
                        }
                    }
                } else {
                    // Single page
                    const pageNum = parseInt(range);
                    if (pageNum && pageNum > 0 && pageNum <= this.totalPages) {
                        this.selectedPages.add(pageNum);
                    }
                }
            });
        }
        
        this.updatePageSelection();
        this.updateUI();
    }

    updateUI() {
        const removeCount = this.selectedPages.size;
        document.getElementById('pagesToRemoveCount').textContent = removeCount;
        document.getElementById('removeButton').disabled = removeCount === 0;
        
        // Update input field
        const pageNumbers = Array.from(this.selectedPages).sort((a, b) => a - b);
        document.getElementById('pageNumbers').value = this.formatPageNumbers(pageNumbers);
    }

    formatPageNumbers(pages) {
        if (pages.length === 0) return '';
        
        const ranges = [];
        let start = pages[0];
        let end = pages[0];
        
        for (let i = 1; i < pages.length; i++) {
            if (pages[i] === end + 1) {
                end = pages[i];
            } else {
                if (start === end) {
                    ranges.push(start.toString());
                } else {
                    ranges.push(`${start}-${end}`);
                }
                start = end = pages[i];
            }
        }
        
        if (start === end) {
            ranges.push(start.toString());
        } else {
            ranges.push(`${start}-${end}`);
        }
        
        return ranges.join(', ');
    }

    async removePages() {
        if (this.selectedPages.size === 0) return;
        
        try {
            this.showLoading(true);
            
            // Create new PDF with remaining pages
            const newPdf = await PDFLib.PDFDocument.create();
            const pagesToKeep = [];
            
            for (let i = 1; i <= this.totalPages; i++) {
                if (!this.selectedPages.has(i)) {
                    pagesToKeep.push(i - 1); // pdf-lib uses 0-based indexing
                }
            }
            
            // Copy pages that should be kept
            const copiedPages = await newPdf.copyPages(this.pdfDoc, pagesToKeep);
            copiedPages.forEach(page => newPdf.addPage(page));
            
            // Save the new PDF
            this.processedPdfBytes = await newPdf.save();
            
            // Show download section
            document.getElementById('downloadSection').style.display = 'block';
            
            // Update download filename display
            const downloadFileName = "SPDFREMOVED.pdf";
            document.getElementById('downloadFileName').textContent = downloadFileName;
            
            this.showLoading(false);
            this.showSuccess(`Successfully removed ${this.selectedPages.size} page(s). ${pagesToKeep.length} pages remaining.`);
            
        } catch (error) {
            console.error('Error removing pages:', error);
            this.showError('Failed to remove pages. Please try again.');
            this.showLoading(false);
        }
    }

    downloadProcessedPDF() {
        if (!this.processedPdfBytes) return;
        
        const blob = new Blob([this.processedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Generate filename with SPDFREMOVED name
        const fileName = "SPDFREMOVED.pdf";
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    resetSelection() {
        this.selectedPages.clear();
        this.updatePageSelection();
        this.updateUI();
        document.getElementById('downloadSection').style.display = 'none';
    }

    selectAllPages() {
        this.selectedPages.clear();
        for (let i = 1; i <= this.totalPages; i++) {
            this.selectedPages.add(i);
        }
        this.updatePageSelection();
        this.updateUI();
    }

    selectNoPages() {
        this.selectedPages.clear();
        this.updatePageSelection();
        this.updateUI();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showLoading(show) {
        document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 5000);
    }

    showSuccess(message) {
        // Create a simple success toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 300px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    // Initialize the PDF page remover
    new PDFPageRemover();
});
