// PDF Constructor - Main JavaScript File
class PDFConstructor {
    constructor() {
        this.currentPDF = null;
        this.pdfDoc = null;
        this.pdfPages = [];
        this.currentZoom = 1.0;
        this.selectedPages = new Set(); // For multi-selection
        this.selectedForRemoval = new Set(); // Pages marked for removal
        this.lastClickedPage = null; // For range selection
        
        this.initializeEventListeners();
        this.setupDropZone();
        
        // Initialize PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    initializeEventListeners() {
        // File upload
        document.getElementById('pdfUpload').addEventListener('change', (e) => this.handleFileUpload(e));
        document.getElementById('mergeUpload').addEventListener('change', (e) => this.handleMergeUpload(e));
        
        // Page operations
        document.getElementById('addPageBtn').addEventListener('click', () => this.addBlankPage());
        document.getElementById('removeSelectedBtn').addEventListener('click', () => this.removeSelectedPages());
        document.getElementById('rotateSelectedBtn').addEventListener('click', () => this.rotateSelectedPages());
        document.getElementById('resetSelectionBtn').addEventListener('click', () => this.resetSelection());
        document.getElementById('movePageBtn').addEventListener('click', () => this.movePage());
        
        // Page range input
        document.getElementById('pageRangeInput').addEventListener('input', (e) => this.handlePageRangeInput(e));
        
        // Controls
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadPDF());
        
        // Zoom controls
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
    }

    // Enhanced drag and drop for file uploads
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = document.getElementById('pdfPreview');
        if (!this.pdfDoc) {
            dropZone.classList.add('drag-over');
            
            // Add visual feedback to the button
            const uploadBtn = dropZone.querySelector('.btn-upload-large');
            if (uploadBtn) {
                uploadBtn.style.transform = 'translateY(-3px) scale(1.1)';
                uploadBtn.style.boxShadow = '0 20px 60px rgba(40, 167, 69, 0.4)';
            }
        }
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Add entrance animation
        const dropZone = document.getElementById('pdfPreview');
        if (!this.pdfDoc) {
            dropZone.style.transform = 'scale(1.02)';
        }
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        const dropZone = document.getElementById('pdfPreview');
        
        // Only remove class if we're actually leaving the drop zone
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-over');
            dropZone.style.transform = '';
            
            // Reset button styling
            const uploadBtn = dropZone.querySelector('.btn-upload-large');
            if (uploadBtn) {
                uploadBtn.style.transform = '';
                uploadBtn.style.boxShadow = '';
            }
        }
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = document.getElementById('pdfPreview');
        dropZone.classList.remove('drag-over');
        dropZone.style.transform = '';
        
        // Reset button styling
        const uploadBtn = dropZone.querySelector('.btn-upload-large');
        if (uploadBtn) {
            uploadBtn.style.transform = '';
            uploadBtn.style.boxShadow = '';
        }
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                // Show loading animation on the upload area
                dropZone.innerHTML = `
                    <div class="upload-loading">
                        <div class="loading-spinner-large"></div>
                        <h3 class="text-primary mt-3">Processing "${file.name}"...</h3>
                        <p class="text-muted">Please wait while we load your PDF</p>
                    </div>
                `;
                
                // Simulate file input change
                const fileInput = document.getElementById('pdfUpload');
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                
                this.handleFileUpload({ target: fileInput });
                
                // Show success animation
                this.showToast('Success', `PDF "${file.name}" uploaded successfully! 🎉`, 'success');
            } else {
                this.showToast('Error', 'Please drop a valid PDF file.', 'error');
                
                // Add shake animation for error
                dropZone.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    dropZone.style.animation = '';
                }, 500);
            }
        }
    }

    setupDropZone() {
        const dropZone = document.getElementById('pdfPreview');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                this.loadPDF(files[0]);
            }
        });
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            await this.loadPDF(file);
        } else {
            this.showToast('Error', 'Please select a valid PDF file.', 'error');
        }
    }

    async loadPDF(file) {
        try {
            this.showLoading('Loading PDF...');
            
            // Hide help instructions
            const helpInstructions = document.getElementById('helpInstructions');
            if (helpInstructions) helpInstructions.style.display = 'none';
            
            const arrayBuffer = await file.arrayBuffer();
            this.currentPDF = arrayBuffer;
            
            // Load with PDF-lib for editing
            this.pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            // Load with PDF.js for rendering
            const loadingTask = pdfjsLib.getDocument(arrayBuffer);
            const pdf = await loadingTask.promise;
            
            await this.renderPDF(pdf);
            this.updatePDFInfo(file.name, this.pdfDoc.getPageCount());
            this.enableControls();
            
            // Update PDF title
            document.getElementById('pdfTitle').textContent = file.name;
            document.getElementById('pdfSizeInfo').textContent = `${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`;
            
            this.hideLoading();
            this.showToast('Success', `PDF loaded! ${this.pdfDoc.getPageCount()} pages ready to edit.`, 'success');
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.hideLoading();
            this.showToast('Error', 'Failed to load PDF. Please try again.', 'error');
        }
    }

    async renderPDF(pdf) {
        const previewContainer = document.getElementById('pdfPreview');
        previewContainer.innerHTML = '';
        previewContainer.className = 'pdf-pages-grid';
        
        this.pdfPages = [];
        
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: this.currentZoom });
            
            const pageContainer = document.createElement('div');
            pageContainer.className = 'pdf-page';
            pageContainer.dataset.pageNumber = pageNumber;
            
            // Enhanced page label with hover effects
            const pageLabel = document.createElement('div');
            pageLabel.className = 'page-label';
            pageLabel.innerHTML = `
                <span class="page-number">Page ${pageNumber}</span>
                <small class="page-size">${Math.round(viewport.width)}×${Math.round(viewport.height)}</small>
            `;
            pageContainer.appendChild(pageLabel);
            
            // Add click instruction overlay
            const clickOverlay = document.createElement('div');
            clickOverlay.className = 'click-overlay';
            clickOverlay.innerHTML = `
                <div class="click-instruction">
                    <i class="bi bi-hand-index"></i>
                    <span>Click to select</span>
                </div>
            `;
            pageContainer.appendChild(clickOverlay);
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            pageContainer.appendChild(canvas);
            previewContainer.appendChild(pageContainer);
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Add click event for page selection with multi-select support
            pageContainer.addEventListener('click', (e) => this.handlePageClick(pageNumber, e));
            
            // Add drag and drop for reordering
            pageContainer.draggable = true;
            pageContainer.addEventListener('dragstart', (e) => this.handleDragStart(e, pageNumber));
            pageContainer.addEventListener('dragover', (e) => this.handleDragOver(e));
            pageContainer.addEventListener('drop', (e) => this.handleDrop(e, pageNumber));
            pageContainer.addEventListener('dragend', (e) => this.handleDragEnd(e));
            
            this.pdfPages.push({
                pageNumber,
                canvas,
                pageContainer
            });
        }
        
        this.updatePageCount();
    }

    handleDragStart(e, pageNumber) {
        this.draggedPage = pageNumber;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', pageNumber);
        
        // Show toast for user guidance
        this.showToast('Info', `Dragging Page ${pageNumber}. Drop on target page to swap positions.`, 'info');
        
        // Add visual feedback to all other pages
        document.querySelectorAll('.pdf-page').forEach(page => {
            if (page !== e.target) {
                page.style.transition = 'all 0.3s ease';
                page.style.border = '2px dashed #28a745';
            }
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const targetPage = e.target.closest('.pdf-page');
        if (targetPage && !targetPage.classList.contains('dragging')) {
            // Remove drag-over from all pages first
            document.querySelectorAll('.pdf-page').forEach(page => {
                page.classList.remove('drag-over');
            });
            targetPage.classList.add('drag-over');
        }
    }

    handleDrop(e, targetPageNumber) {
        e.preventDefault();
        
        const targetPage = e.target.closest('.pdf-page');
        if (targetPage) {
            targetPage.classList.remove('drag-over');
        }
        
        if (this.draggedPage && this.draggedPage !== targetPageNumber) {
            // Set the move inputs and trigger the move
            document.getElementById('moveFromPage').value = this.draggedPage;
            document.getElementById('moveToPage').value = targetPageNumber;
            
            // Show confirmation message
            this.showToast('Success', `Moving Page ${this.draggedPage} to position ${targetPageNumber}...`, 'success');
            
            // Trigger the move with a small delay for better UX
            setTimeout(() => {
                this.movePage();
            }, 100);
        }
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedPage = null;
        
        // Reset all visual effects
        document.querySelectorAll('.pdf-page').forEach(page => {
            page.classList.remove('drag-over');
            page.style.border = '';
            page.style.transition = '';
        });
    }

    handlePageClick(pageNumber, event) {
        const isShiftPressed = event.shiftKey;
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        
        // Add visual feedback on click
        const pageElement = event.currentTarget;
        pageElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            pageElement.style.transform = '';
        }, 150);
        
        if (isShiftPressed && this.lastClickedPage) {
            // Range selection
            const start = Math.min(this.lastClickedPage, pageNumber);
            const end = Math.max(this.lastClickedPage, pageNumber);
            
            for (let i = start; i <= end; i++) {
                this.selectedForRemoval.add(i);
            }
            
            // Show range selection feedback
            this.showToast('Info', `Selected pages ${start} to ${end} (${end - start + 1} pages)`, 'info');
        } else if (isCtrlPressed) {
            // Multi-select (toggle)
            if (this.selectedForRemoval.has(pageNumber)) {
                this.selectedForRemoval.delete(pageNumber);
                this.showToast('Info', `Page ${pageNumber} deselected`, 'info');
            } else {
                this.selectedForRemoval.add(pageNumber);
                this.showToast('Info', `Page ${pageNumber} selected for removal`, 'warning');
            }
        } else {
            // Single select (clear others)
            const wasSelected = this.selectedForRemoval.has(pageNumber);
            this.selectedForRemoval.clear();
            
            if (!wasSelected) {
                this.selectedForRemoval.add(pageNumber);
                this.showToast('Info', `Page ${pageNumber} selected for removal`, 'warning');
            } else {
                this.showToast('Info', 'Selection cleared', 'info');
            }
        }
        
        this.lastClickedPage = pageNumber;
        this.updatePageSelection();
        this.updateRemovalList();
    }

    updatePageSelection() {
        // Update visual selection
        document.querySelectorAll('.pdf-page').forEach(page => {
            const pageNumber = parseInt(page.dataset.pageNumber);
            page.classList.remove('selected-for-removal');
            
            if (this.selectedForRemoval.has(pageNumber)) {
                page.classList.add('selected-for-removal');
            }
        });
        
        // Enable/disable buttons
        const hasSelection = this.selectedForRemoval.size > 0;
        document.getElementById('removeSelectedBtn').disabled = !hasSelection;
        document.getElementById('rotateSelectedBtn').disabled = !hasSelection;
        
        // Update page range input
        const rangeArray = Array.from(this.selectedForRemoval).sort((a, b) => a - b);
        document.getElementById('pageRangeInput').value = this.formatPageRange(rangeArray);
    }

    updateRemovalList() {
        const removalList = document.getElementById('selectedPagesForRemoval');
        const removeBtn = document.getElementById('removeSelectedBtn');
        const rotateBtn = document.getElementById('rotateSelectedBtn');
        
        if (this.selectedForRemoval.size === 0) {
            removalList.innerHTML = '<span class="text-muted small">No pages selected</span>';
            removeBtn.disabled = true;
            rotateBtn.disabled = true;
            return;
        }
        
        removeBtn.disabled = false;
        rotateBtn.disabled = false;
        
        const sortedPages = Array.from(this.selectedForRemoval).sort((a, b) => a - b);
        
        // Create elegant page display
        removalList.innerHTML = `
            <div class="d-flex flex-wrap gap-1">
                ${sortedPages.map(page => `
                    <span class="badge bg-danger position-relative" style="cursor: pointer;" 
                          onclick="window.pdfConstructor.removeFromSelection(${page})" 
                          title="Click to remove from selection">
                        Page ${page} 
                        <i class="bi bi-x-circle ms-1"></i>
                    </span>
                `).join('')}
            </div>
            <small class="text-muted mt-2 d-block">
                <i class="bi bi-info-circle"></i> ${sortedPages.length} page(s) selected for removal
            </small>
        `;
    }

    removeFromSelection(pageNumber) {
        this.selectedForRemoval.delete(pageNumber);
        this.updatePageSelection();
        this.updateRemovalList();
    }

    handlePageRangeInput(event) {
        const input = event.target.value.trim();
        if (!input) {
            this.selectedForRemoval.clear();
            this.updatePageSelection();
            this.updateRemovalList();
            return;
        }
        
        try {
            const pages = this.parsePageRange(input);
            this.selectedForRemoval.clear();
            pages.forEach(page => {
                if (page >= 1 && page <= this.pdfDoc.getPageCount()) {
                    this.selectedForRemoval.add(page);
                }
            });
            this.updatePageSelection();
            this.updateRemovalList();
        } catch (error) {
            // Invalid input, ignore
        }
    }

    parsePageRange(input) {
        const pages = new Set();
        const parts = input.split(',');
        
        for (let part of parts) {
            part = part.trim();
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                        pages.add(i);
                    }
                }
            } else {
                const pageNum = parseInt(part);
                if (!isNaN(pageNum)) {
                    pages.add(pageNum);
                }
            }
        }
        
        return Array.from(pages);
    }

    formatPageRange(pages) {
        if (pages.length === 0) return '';
        if (pages.length === 1) return pages[0].toString();
        
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
        
        return ranges.join(',');
    }

    updatePageCount() {
        const totalPages = this.pdfDoc ? this.pdfDoc.getPageCount() : 0;
        document.getElementById('totalPagesCount').textContent = totalPages;
    }

    async removeSelectedPages() {
        if (this.selectedForRemoval.size === 0) {
            this.showToast('Info', 'Please select pages to remove first', 'warning');
            return;
        }

        if (this.selectedForRemoval.size >= this.pdfDoc.getPageCount()) {
            this.showToast('Error', 'Cannot remove all pages from the PDF.', 'error');
            return;
        }

        try {
            // Sort pages in descending order to remove from end first
            const pagesToRemove = Array.from(this.selectedForRemoval).sort((a, b) => b - a);
            
            for (const pageNumber of pagesToRemove) {
                this.pdfDoc.removePage(pageNumber - 1);
            }
            
            await this.refreshPreview();
            this.showToast('Success', `${pagesToRemove.length} page(s) removed successfully.`, 'success');
            
            // Clear selection
            this.selectedForRemoval.clear();
            this.updatePageSelection();
            this.updateRemovalList();
            
        } catch (error) {
            console.error('Error removing pages:', error);
            this.showToast('Error', 'Failed to remove pages.', 'error');
        }
    }

    async rotateSelectedPages() {
        if (this.selectedForRemoval.size === 0) {
            this.showToast('Info', 'Please select pages to rotate first', 'warning');
            return;
        }

        try {
            const angle = parseInt(document.getElementById('rotateAngle').value);
            
            for (const pageNumber of this.selectedForRemoval) {
                const page = this.pdfDoc.getPage(pageNumber - 1);
                page.setRotation(PDFLib.degrees(angle));
            }
            
            await this.refreshPreview();
            this.showToast('Success', `${this.selectedForRemoval.size} page(s) rotated ${angle}° successfully.`, 'success');
            
        } catch (error) {
            console.error('Error rotating pages:', error);
            this.showToast('Error', 'Failed to rotate pages.', 'error');
        }
    }

    resetSelection() {
        this.selectedForRemoval.clear();
        this.updatePageSelection();
        this.updateRemovalList();
        document.getElementById('pageRangeInput').value = '';
        this.showToast('Info', 'Selection cleared', 'info');
    }

    async movePage() {
        if (!this.pdfDoc) {
            this.showToast('Error', 'Please load a PDF first.', 'error');
            return;
        }

        const fromPage = parseInt(document.getElementById('moveFromPage').value);
        const toPage = parseInt(document.getElementById('moveToPage').value);
        const totalPages = this.pdfDoc.getPageCount();
        
        if (!fromPage || !toPage || fromPage < 1 || toPage < 1 || 
            fromPage > totalPages || toPage > totalPages || fromPage === toPage) {
            this.showToast('Error', 'Please enter valid page numbers.', 'error');
            return;
        }

        try {
            // Add loading animation to the preview area
            const previewArea = document.getElementById('pdfPreview');
            previewArea.style.transition = 'opacity 0.3s ease';
            previewArea.style.opacity = '0.6';
            
            // Create a new PDF document
            const newPdfDoc = await PDFLib.PDFDocument.create();
            
            // Create array of page indices in the new order
            const pageIndices = [];
            for (let i = 1; i <= totalPages; i++) {
                pageIndices.push(i - 1);
            }
            
            // Move the page in the indices array
            const pageToMove = pageIndices.splice(fromPage - 1, 1)[0];
            pageIndices.splice(toPage - 1, 0, pageToMove);
            
            // Copy pages in the new order
            const copiedPages = await newPdfDoc.copyPages(this.pdfDoc, pageIndices);
            copiedPages.forEach(page => newPdfDoc.addPage(page));
            
            // Replace the current PDF with the new one
            this.pdfDoc = newPdfDoc;
            
            await this.refreshPreview();
            
            // Restore preview area
            previewArea.style.opacity = '1';
            
            this.showToast('Success', `Page ${fromPage} moved to position ${toPage}.`, 'success');
            
            // Clear inputs
            document.getElementById('moveFromPage').value = '';
            document.getElementById('moveToPage').value = '';
            
        } catch (error) {
            console.error('Error moving page:', error);
            this.showToast('Error', 'Failed to move page.', 'error');
            
            // Restore preview area even on error
            const previewArea = document.getElementById('pdfPreview');
            previewArea.style.opacity = '1';
        }
    }

    async addBlankPage() {
        if (!this.pdfDoc) {
            this.showToast('Error', 'Please load a PDF first.', 'error');
            return;
        }

        try {
            // Add page at the end
            this.pdfDoc.addPage();
            
            await this.refreshPreview();
            this.showToast('Success', `Blank page added at the end`, 'success');
            
        } catch (error) {
            console.error('Error adding page:', error);
            this.showToast('Error', 'Failed to add page.', 'error');
        }
    }

    async refreshPreview() {
        if (!this.pdfDoc) return;
        
        try {
            const pdfBytes = await this.pdfDoc.save();
            const loadingTask = pdfjsLib.getDocument(pdfBytes);
            const pdf = await loadingTask.promise;
            
            // Clear selections since page numbers may have changed
            this.selectedForRemoval.clear();
            
            await this.renderPDF(pdf);
            this.updatePDFInfo('Modified PDF', this.pdfDoc.getPageCount());
            
        } catch (error) {
            console.error('Error refreshing preview:', error);
            this.showToast('Error', 'Failed to refresh preview.', 'error');
        }
    }

    enableControls() {
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('addPageBtn').disabled = false;
        document.getElementById('movePageBtn').disabled = false;
    }

    disableControls() {
        document.getElementById('downloadBtn').disabled = true;
        document.getElementById('addPageBtn').disabled = true;
        document.getElementById('movePageBtn').disabled = true;
        document.getElementById('removeSelectedBtn').disabled = true;
        document.getElementById('rotateSelectedBtn').disabled = true;
    }

    showLoading(message) {
        const preview = document.getElementById('pdfPreview');
        preview.innerHTML = `
            <div class="text-center p-5">
                <div class="loading-spinner"></div>
                <h5 class="text-muted mt-3">${message}</h5>
            </div>
        `;
        preview.className = 'text-center';
    }

    hideLoading() {
        // Loading will be hidden when content is rendered
    }

    async handleMergeUpload(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            this.mergeFile = await file.arrayBuffer();
            // Automatically merge the PDF
            await this.mergePDF();
        }
    }

    async mergePDF() {
        if (!this.pdfDoc || !this.mergeFile) {
            this.showToast('Error', 'Please load a PDF first, then select another PDF to merge.', 'error');
            return;
        }

        try {
            this.showLoading('Merging PDFs...');
            
            const mergePdfDoc = await PDFLib.PDFDocument.load(this.mergeFile);
            const pages = await this.pdfDoc.copyPages(mergePdfDoc, mergePdfDoc.getPageIndices());
            
            pages.forEach(page => this.pdfDoc.addPage(page));
            
            await this.refreshPreview();
            this.hideLoading();
            this.showToast('Success', `PDFs merged! Added ${pages.length} pages.`, 'success');
            
            // Reset merge upload
            document.getElementById('mergeUpload').value = '';
            this.mergeFile = null;
            
        } catch (error) {
            console.error('Error merging PDFs:', error);
            this.hideLoading();
            this.showToast('Error', 'Failed to merge PDFs.', 'error');
        }
    }

    async refreshPreview() {
        if (!this.pdfDoc) return;
        
        try {
            const pdfBytes = await this.pdfDoc.save();
            const loadingTask = pdfjsLib.getDocument(pdfBytes);
            const pdf = await loadingTask.promise;
            
            await this.renderPDF(pdf);
            this.updatePDFInfo('Modified PDF', this.pdfDoc.getPageCount());
            
        } catch (error) {
            console.error('Error refreshing preview:', error);
            this.showToast('Error', 'Failed to refresh preview.', 'error');
        }
    }

    async downloadPDF() {
        if (!this.pdfDoc) {
            this.showToast('Error', 'No PDF to download.', 'error');
            return;
        }

        try {
            // Show loading with progress
            this.showLoading('Preparing download...');
            
            // Get current timestamp for unique filename
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const pageCount = this.pdfDoc.getPageCount();
            
            // Update loading message
            setTimeout(() => {
                this.showLoading('Optimizing PDF...');
            }, 500);
            
            // Save the PDF with optimization
            const pdfBytes = await this.pdfDoc.save({
                useObjectStreams: false,
                addDefaultPage: false,
                objectStream: true
            });
            
            // Update loading message
            setTimeout(() => {
                this.showLoading('Creating download...');
            }, 1000);
            
            // Create download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            // Generate meaningful filename
            const filename = `edited-pdf-${pageCount}pages-${timestamp}.pdf`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            this.hideLoading();
            
            // Update download button to show success
            const downloadBtn = document.getElementById('downloadBtn');
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="bi bi-check-circle"></i> Downloaded!';
            downloadBtn.classList.add('btn-outline-success');
            downloadBtn.classList.remove('btn-success');
            
            setTimeout(() => {
                downloadBtn.innerHTML = originalText;
                downloadBtn.classList.remove('btn-outline-success');
                downloadBtn.classList.add('btn-success');
            }, 2000);
            
            // Show detailed success message
            const fileSize = (pdfBytes.length / 1024 / 1024).toFixed(2);
            this.showToast('Success', `PDF downloaded successfully! File: ${filename} (${fileSize} MB, ${pageCount} pages)`, 'success');
            
        } catch (error) {
            console.error('Error downloading PDF:', error);
            this.hideLoading();
            
            // Show detailed error
            const errorMessage = error.message || 'Unknown error occurred';
            this.showToast('Error', `Failed to download PDF: ${errorMessage}`, 'error');
            
            // Reset download button on error
            const downloadBtn = document.getElementById('downloadBtn');
            downloadBtn.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Download Failed';
            downloadBtn.classList.add('btn-outline-danger');
            downloadBtn.classList.remove('btn-success');
            
            setTimeout(() => {
                downloadBtn.innerHTML = '<i class="bi bi-download"></i> Download Edited PDF';
                downloadBtn.classList.remove('btn-outline-danger');
                downloadBtn.classList.add('btn-success');
            }, 3000);
        }
    }

    resetEditor() {
        this.currentPDF = null;
        this.pdfDoc = null;
        this.pdfPages = [];
        this.selectedPages.clear();
        this.selectedForRemoval.clear();
        this.mergeFile = null;
        
        // Show help instructions again
        const helpInstructions = document.getElementById('helpInstructions');
        if (helpInstructions) helpInstructions.style.display = 'block';
        
        document.getElementById('pdfPreview').innerHTML = `
            <div class="empty-state">
                <i class="bi bi-file-earmark-pdf" style="font-size: 4rem; color: #6c757d;"></i>
                <h4 class="text-muted mt-3">Upload a PDF to get started</h4>
                <p class="text-muted">Drag & drop a PDF file here or click upload button</p>
                <button class="btn btn-primary mt-2" onclick="document.getElementById('pdfUpload').click()">
                    <i class="bi bi-upload"></i> Choose PDF File
                </button>
            </div>
        `;
        document.getElementById('pdfPreview').className = 'pdf-pages-grid';
        
        document.getElementById('pdfInfo').innerHTML = '<small class="text-muted">No PDF loaded</small>';
        document.getElementById('pdfTitle').textContent = 'PDF Pages';
        document.getElementById('pdfSizeInfo').textContent = '';
        document.getElementById('totalPagesCount').textContent = '0';
        document.getElementById('selectedPagesForRemoval').innerHTML = '<small class="text-muted">No pages selected</small>';
        document.getElementById('pageRangeInput').value = '';
        
        // Clear all inputs
        document.querySelectorAll('input[type="number"], input[type="file"]').forEach(input => {
            input.value = '';
        });
        
        this.disableControls();
        this.showToast('Info', 'Ready for a new PDF!', 'info');
    }

    zoomIn() {
        this.currentZoom = Math.min(this.currentZoom * 1.2, 3.0);
        if (this.pdfDoc) this.refreshPreview();
    }

    zoomOut() {
        this.currentZoom = Math.max(this.currentZoom / 1.2, 0.3);
        if (this.pdfDoc) this.refreshPreview();
    }

    updatePDFInfo(fileName, pageCount) {
        const fileSize = this.currentPDF ? (this.currentPDF.byteLength / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown';
        
        // Update main title
        document.getElementById('pdfTitle').textContent = fileName;
        document.getElementById('pdfSizeInfo').textContent = `${pageCount} pages • ${fileSize}`;
        
        // Update info panel
        document.getElementById('pdfInfo').innerHTML = `
            <div class="text-center">
                <div class="mb-2">
                    <i class="bi bi-file-earmark-pdf text-success" style="font-size: 2rem;"></i>
                </div>
                <div class="fw-bold text-dark">${fileName}</div>
                <small class="text-muted">${pageCount} pages • ${fileSize}</small>
                <div class="mt-2">
                    <span class="badge bg-success">Ready to Download</span>
                </div>
            </div>
        `;
        
        // Enable download button
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.disabled = false;
    }

    showLoading(message) {
        const preview = document.getElementById('pdfPreview');
        preview.innerHTML = `
            <div class="text-center">
                <div class="loading-spinner"></div>
                <h5 class="text-muted">${message}</h5>
            </div>
        `;
    }

    hideLoading() {
        // Loading will be hidden when content is rendered
    }

    showToast(title, message, type = 'info') {
        const toastContainer = document.getElementById('statusMessages');
        const toastId = 'toast-' + Date.now();
        
        const iconMap = {
            success: 'bi-check-circle-fill text-success',
            error: 'bi-exclamation-triangle-fill text-danger',
            warning: 'bi-exclamation-triangle-fill text-warning',
            info: 'bi-info-circle-fill text-info'
        };
        
        const colorMap = {
            success: 'bg-success',
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-info'
        };
        
        // Mobile-friendly toast with improved styling
        const toastHTML = `
            <div id="${toastId}" class="toast ${colorMap[type]} text-white" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="4000">
                <div class="toast-header ${colorMap[type]} text-white border-0">
                    <i class="bi ${iconMap[type]} me-2"></i>
                    <strong class="me-auto">${title}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Auto-remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
        
        // For mobile, also add a subtle vibration if available
        if (navigator.vibrate && window.innerWidth <= 768) {
            const vibrationPattern = {
                success: [100],
                error: [200, 100, 200],
                warning: [150],
                info: [50]
            };
            navigator.vibrate(vibrationPattern[type] || [50]);
        }
    }
}

// Initialize the PDF Constructor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.pdfConstructor = new PDFConstructor();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'o':
                    e.preventDefault();
                    document.getElementById('pdfUpload').click();
                    break;
                case 's':
                    e.preventDefault();
                    if (window.pdfConstructor.pdfDoc) {
                        window.pdfConstructor.downloadPDF();
                    }
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    window.pdfConstructor.zoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    window.pdfConstructor.zoomOut();
                    break;
            }
        }
    });
});
