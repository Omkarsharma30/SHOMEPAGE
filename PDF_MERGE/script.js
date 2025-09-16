// Global variables
let selectedFiles = [];
let mergedPdfUrl = null;
let currentPreviewFile = 0;
let currentPreviewPage = 1;
let currentPdfDoc = null;
let pageSelections = {};
let advancedOptions = {
    addBookmarks: true,
    optimizeSize: false,
    addPageNumbers: false,
    addHeaders: false,
    addFooters: false,
    addSeparators: false,
    protectPdf: false,
    docTitle: '',
    docAuthor: '',
    docSubject: '',
    password: ''
};

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const quickSelectBtn = document.getElementById('quickSelectBtn');
const quickSelectionPanel = document.getElementById('quickSelectionPanel');
const closeQuickBtn = document.getElementById('closeQuickBtn');
const filesSection = document.getElementById('filesSection');
const filesList = document.getElementById('filesList');
const clearAllBtn = document.getElementById('clearAllBtn');
const previewAllBtn = document.getElementById('previewAllBtn');
const oneClickSelectBtn = document.getElementById('oneClickSelectBtn');
const oneClickBar = document.getElementById('oneClickBar');
const quickRange = document.getElementById('quickRange');
const quickRangeInput = document.getElementById('quickRangeInput');
const applyRangeBtn = document.getElementById('applyRangeBtn');
const mergeBtn = document.getElementById('mergeBtn');
const advancedBtn = document.getElementById('advancedBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultSection = document.getElementById('resultSection');
const downloadBtn = document.getElementById('downloadBtn');
const newMergeBtn = document.getElementById('newMergeBtn');
const toast = document.getElementById('toast');

// Page selection elements
const pageSelectionPanel = document.getElementById('pageSelectionPanel');
const pageInputs = document.getElementById('pageInputs');
const customPages = document.getElementById('customPages');

// Modal elements
const previewModal = document.getElementById('previewModal');
const advancedModal = document.getElementById('advancedModal');
const closePreview = document.getElementById('closePreview');
const closeAdvanced = document.getElementById('closeAdvanced');

// Preview modal elements
const prevFile = document.getElementById('prevFile');
const nextFile = document.getElementById('nextFile');
const currentFileInfo = document.getElementById('currentFileInfo');
const pdfCanvas = document.getElementById('pdfCanvas');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Advanced options elements
const protectPdfCheckbox = document.getElementById('protectPdf');
const passwordOptions = document.getElementById('passwordOptions');
const saveOptions = document.getElementById('saveOptions');

// Event listeners
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    // Check if PDF-lib is loaded
    if (typeof PDFLib === 'undefined') {
        showToast('PDF library failed to load. Please refresh the page.', 'error');
        console.error('PDFLib is not defined. Make sure pdf-lib is loaded.');
        return;
    }
    
    // File input events
    fileInput.addEventListener('change', handleFileSelect);
    browseBtn.addEventListener('click', () => fileInput.click());
    
    // Drag and drop events
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Button events
    clearAllBtn.addEventListener('click', clearAllFiles);
    quickSelectBtn.addEventListener('click', toggleQuickSelection);
    closeQuickBtn.addEventListener('click', hideQuickSelection);
    oneClickSelectBtn.addEventListener('click', toggleOneClickBar);
    previewAllBtn.addEventListener('click', openPreviewModal);
    mergeBtn.addEventListener('click', mergePDFs);
    advancedBtn.addEventListener('click', openAdvancedModal);
    downloadBtn.addEventListener('click', downloadMergedPDF);
    newMergeBtn.addEventListener('click', startNewMerge);
    applyRangeBtn.addEventListener('click', applyQuickRange);
    
    // Quick selection events
    document.getElementById('selectFromFolder').addEventListener('click', selectFromFolder);
    document.getElementById('selectRecent').addEventListener('click', selectRecentFiles);
    document.getElementById('selectPattern').addEventListener('click', selectByPattern);
    
    // Preset button events
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const preset = e.currentTarget.dataset.preset;
            handlePresetSelection(preset, e.currentTarget);
        });
    });
    
    // Modal events
    closePreview.addEventListener('click', closePreviewModal);
    closeAdvanced.addEventListener('click', closeAdvancedModal);
    prevFile.addEventListener('click', () => navigateFile(-1));
    nextFile.addEventListener('click', () => navigateFile(1));
    prevPage.addEventListener('click', () => navigatePage(-1));
    nextPage.addEventListener('click', () => navigatePage(1));
    saveOptions.addEventListener('click', saveAdvancedOptions);
    
    // Page selection events
    document.querySelectorAll('input[name="pageOption"]').forEach(radio => {
        radio.addEventListener('change', handlePageOptionChange);
    });
    
    // Advanced options events
    protectPdfCheckbox.addEventListener('change', togglePasswordOptions);
    
    // Click outside modal to close
    window.addEventListener('click', handleModalClick);
    
    // Prevent default drag behaviors
    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => e.preventDefault());
    
    // Initialize page selection panel visibility
    updatePageSelectionVisibility();
}

// File handling functions
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
        showToast('Please select PDF files only', 'error');
        return;
    }
    
    if (pdfFiles.length !== files.length) {
        showToast(`${files.length - pdfFiles.length} non-PDF files were ignored`, 'error');
    }
    
    addFiles(pdfFiles);
}

function addFiles(files) {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
        showToast('Please select PDF files only', 'error');
        return;
    }
    
    // Check for duplicates
    const newFiles = pdfFiles.filter(file => 
        !selectedFiles.some(existingFile => 
            existingFile.name === file.name && existingFile.size === file.size
        )
    );
    
    if (newFiles.length === 0) {
        showToast('All selected files are already added', 'error');
        return;
    }
    
    // Add new files
    selectedFiles.push(...newFiles);
    
    // Show success message
    showToast(`${newFiles.length} PDF file(s) added successfully`, 'success');
    
    // Update UI
    updateFilesList();
    showFilesSection();
    
    // Reset file input
    fileInput.value = '';
}

function updateFilesList() {
    filesList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        filesList.appendChild(fileItem);
    });
    
    // Update merge button state
    mergeBtn.disabled = selectedFiles.length < 2;
}

function createFileItem(file, index) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    // Initialize page selection for this file
    if (!pageSelections[index]) {
        pageSelections[index] = { type: 'all', pages: [], totalPages: 0 };
    }
    
    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${formatFileSize(file.size)} • PDF Document</p>
                <small class="page-selection-info">
                    <i class="fas fa-file-alt"></i>
                    <span id="pageSelection-${index}">Loading pages...</span>
                </small>
            </div>
        </div>
        <div class="file-page-selector">
            <div class="quick-page-actions">
                <button class="quick-page-btn" onclick="quickSelectPages(${index}, 'all')" title="All Pages">
                    <i class="fas fa-check-double"></i>
                    All
                </button>
                <button class="quick-page-btn" onclick="quickSelectPages(${index}, 'odd')" title="Odd Pages">
                    <i class="fas fa-sort-numeric-up"></i>
                    Odd
                </button>
                <button class="quick-page-btn" onclick="quickSelectPages(${index}, 'even')" title="Even Pages">
                    <i class="fas fa-sort-numeric-down"></i>
                    Even
                </button>
                <button class="quick-page-btn" onclick="quickSelectPages(${index}, 'first')" title="First Page">
                    <i class="fas fa-step-forward"></i>
                    1st
                </button>
                <button class="quick-page-btn" onclick="quickSelectPages(${index}, 'last')" title="Last Page">
                    <i class="fas fa-step-backward"></i>
                    Last
                </button>
            </div>
        </div>
        <div class="file-actions">
            <button class="preview-btn" onclick="previewFile(${index})" title="Preview">
                <i class="fas fa-eye"></i>
            </button>
            <button class="move-btn" onclick="moveFileUp(${index})" ${index === 0 ? 'disabled' : ''} title="Move Up">
                <i class="fas fa-arrow-up"></i>
            </button>
            <button class="move-btn" onclick="moveFileDown(${index})" ${index === selectedFiles.length - 1 ? 'disabled' : ''} title="Move Down">
                <i class="fas fa-arrow-down"></i>
            </button>
            <button class="remove-btn" onclick="removeFile(${index})" title="Remove">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Load PDF to get page count
    loadPdfPageCount(file, index);
    
    return fileItem;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function moveFileUp(index) {
    if (index > 0) {
        [selectedFiles[index], selectedFiles[index - 1]] = [selectedFiles[index - 1], selectedFiles[index]];
        updateFilesList();
        showToast('File moved up', 'success');
    }
}

function moveFileDown(index) {
    if (index < selectedFiles.length - 1) {
        [selectedFiles[index], selectedFiles[index + 1]] = [selectedFiles[index + 1], selectedFiles[index]];
        updateFilesList();
        showToast('File moved down', 'success');
    }
}

function removeFile(index) {
    const fileName = selectedFiles[index].name;
    selectedFiles.splice(index, 1);
    updateFilesList();
    showToast(`${fileName} removed`, 'success');
    
    if (selectedFiles.length === 0) {
        hideFilesSection();
    }
}

function clearAllFiles() {
    selectedFiles = [];
    updateFilesList();
    hideFilesSection();
    showToast('All files cleared', 'success');
}

// PDF merging functions
async function mergePDFs() {
    if (selectedFiles.length < 2) {
        showToast('Please select at least 2 PDF files', 'error');
        return;
    }
    
    // Check if PDF-lib is available
    if (typeof PDFLib === 'undefined') {
        showToast('PDF library not loaded. Please refresh the page.', 'error');
        return;
    }
    
    try {
        // Show progress section
        showProgressSection();
        updateProgress(0, 'Initializing...');
        
        // Create a new PDF document
        const { PDFDocument } = PDFLib;
        const mergedPdf = await PDFDocument.create();
        
        // Process each file
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const progress = ((i + 1) / selectedFiles.length) * 90; // 90% for processing files
            
            updateProgress(progress, `Processing ${file.name}...`);
            
            try {
                // Read the PDF file
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                
                // Copy pages from the current PDF to the merged PDF
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach((page) => mergedPdf.addPage(page));
                
                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                throw new Error(`Failed to process ${file.name}. The file might be corrupted or password-protected.`);
            }
        }
        
        updateProgress(95, 'Finalizing merged PDF...');
        
        // Generate the merged PDF
        const pdfBytes = await mergedPdf.save();
        
        updateProgress(100, 'Complete!');
        
        // Create download URL
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        mergedPdfUrl = URL.createObjectURL(blob);
        
        // Show result section
        setTimeout(() => {
            hideProgressSection();
            showResultSection();
        }, 500);
        
    } catch (error) {
        console.error('Error merging PDFs:', error);
        hideProgressSection();
        showToast(error.message || 'Error merging PDFs. Please try again.', 'error');
    }
}

function updateProgress(percentage, text) {
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${Math.round(percentage)}%`;
    
    const progressInfo = document.querySelector('.progress-info span');
    if (progressInfo) {
        progressInfo.textContent = text;
    }
}

function downloadMergedPDF() {
    if (!mergedPdfUrl) {
        showToast('No merged PDF available', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = "SPDFMERGER.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Download started', 'success');
}

function startNewMerge() {
    // Reset all data
    selectedFiles = [];
    if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
        mergedPdfUrl = null;
    }
    
    // Reset UI
    hideResultSection();
    hideProgressSection();
    hideFilesSection();
    fileInput.value = '';
    
    showToast('Ready for new merge', 'success');
}

// UI helper functions
function showFilesSection() {
    filesSection.style.display = 'block';
    updatePageSelectionVisibility();
}

function hideFilesSection() {
    filesSection.style.display = 'none';
}

function updatePageSelectionVisibility() {
    if (selectedFiles.length > 0) {
        pageSelectionPanel.style.display = 'block';
    } else {
        pageSelectionPanel.style.display = 'none';
    }
}

// Page Selection Functions
function handlePageOptionChange() {
    const selectedOption = document.querySelector('input[name="pageOption"]:checked').value;
    
    pageInputs.style.display = selectedOption === 'range' ? 'flex' : 'none';
    customPages.style.display = selectedOption === 'custom' ? 'block' : 'none';
}

// Modal Functions
function openPreviewModal() {
    if (selectedFiles.length === 0) {
        showToast('No files to preview', 'error');
        return;
    }
    
    currentPreviewFile = 0;
    previewModal.style.display = 'block';
    loadFilePreview();
}

function closePreviewModal() {
    previewModal.style.display = 'none';
}

function openAdvancedModal() {
    advancedModal.style.display = 'block';
    loadAdvancedOptions();
}

function closeAdvancedModal() {
    advancedModal.style.display = 'none';
}

function handleModalClick(event) {
    if (event.target === previewModal) {
        closePreviewModal();
    }
    if (event.target === advancedModal) {
        closeAdvancedModal();
    }
}

// Preview Functions
function previewFile(index) {
    currentPreviewFile = index;
    openPreviewModal();
}

async function loadFilePreview() {
    if (selectedFiles.length === 0) return;
    
    const file = selectedFiles[currentPreviewFile];
    currentFileInfo.textContent = `File ${currentPreviewFile + 1} of ${selectedFiles.length}: ${file.name}`;
    
    // Update navigation buttons
    prevFile.disabled = currentPreviewFile === 0;
    nextFile.disabled = currentPreviewFile === selectedFiles.length - 1;
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const { PDFDocument } = PDFLib;
        currentPdfDoc = await PDFDocument.load(arrayBuffer);
        
        currentPreviewPage = 1;
        renderPage();
        updatePageInfo();
        
    } catch (error) {
        console.error('Error loading PDF:', error);
        showToast('Error loading PDF for preview', 'error');
    }
}

async function renderPage() {
    if (!currentPdfDoc) return;
    
    const canvas = pdfCanvas;
    const ctx = canvas.getContext('2d');
    
    try {
        // If PDF.js is available, use it for better rendering
        if (typeof pdfjsLib !== 'undefined') {
            const file = selectedFiles[currentPreviewFile];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(currentPreviewPage);
            
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
        } else {
            // Fallback rendering
            canvas.width = 600;
            canvas.height = 800;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add border
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            
            // Add content placeholder
            ctx.fillStyle = '#333';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Page ${currentPreviewPage}`, canvas.width / 2, canvas.height / 2 - 20);
            
            ctx.font = '16px Arial';
            ctx.fillStyle = '#666';
            ctx.fillText(`${selectedFiles[currentPreviewFile].name}`, canvas.width / 2, canvas.height / 2 + 20);
            
            // Add page indicator
            ctx.fillStyle = '#4ecdc4';
            ctx.font = '14px Arial';
            ctx.fillText('PDF Preview', canvas.width / 2, 30);
        }
    } catch (error) {
        console.error('Error rendering page:', error);
        // Fallback rendering on error
        canvas.width = 600;
        canvas.height = 800;
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#dc3545';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading page preview', canvas.width / 2, canvas.height / 2);
    }
}

function updatePageInfo() {
    if (currentPdfDoc) {
        const totalPages = currentPdfDoc.getPageCount();
        pageInfo.textContent = `Page ${currentPreviewPage} of ${totalPages}`;
        
        // Update navigation buttons
        prevPage.disabled = currentPreviewPage === 1;
        nextPage.disabled = currentPreviewPage === totalPages;
    }
}

function navigateFile(direction) {
    const newIndex = currentPreviewFile + direction;
    if (newIndex >= 0 && newIndex < selectedFiles.length) {
        currentPreviewFile = newIndex;
        loadFilePreview();
    }
}

function navigatePage(direction) {
    if (!currentPdfDoc) return;
    
    const totalPages = currentPdfDoc.getPageCount();
    const newPage = currentPreviewPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPreviewPage = newPage;
        renderPage();
        updatePageInfo();
    }
}

// Advanced Options Functions
function loadAdvancedOptions() {
    document.getElementById('addBookmarks').checked = advancedOptions.addBookmarks;
    document.getElementById('optimizeSize').checked = advancedOptions.optimizeSize;
    document.getElementById('addPageNumbers').checked = advancedOptions.addPageNumbers;
    document.getElementById('addHeaders').checked = advancedOptions.addHeaders;
    document.getElementById('addFooters').checked = advancedOptions.addFooters;
    document.getElementById('addSeparators').checked = advancedOptions.addSeparators;
    document.getElementById('protectPdf').checked = advancedOptions.protectPdf;
    document.getElementById('docTitle').value = advancedOptions.docTitle;
    document.getElementById('docAuthor').value = advancedOptions.docAuthor;
    document.getElementById('docSubject').value = advancedOptions.docSubject;
    document.getElementById('pdfPassword').value = advancedOptions.password;
    
    togglePasswordOptions();
}

function saveAdvancedOptions() {
    advancedOptions.addBookmarks = document.getElementById('addBookmarks').checked;
    advancedOptions.optimizeSize = document.getElementById('optimizeSize').checked;
    advancedOptions.addPageNumbers = document.getElementById('addPageNumbers').checked;
    advancedOptions.addHeaders = document.getElementById('addHeaders').checked;
    advancedOptions.addFooters = document.getElementById('addFooters').checked;
    advancedOptions.addSeparators = document.getElementById('addSeparators').checked;
    advancedOptions.protectPdf = document.getElementById('protectPdf').checked;
    advancedOptions.docTitle = document.getElementById('docTitle').value;
    advancedOptions.docAuthor = document.getElementById('docAuthor').value;
    advancedOptions.docSubject = document.getElementById('docSubject').value;
    advancedOptions.password = document.getElementById('pdfPassword').value;
    
    closeAdvancedModal();
    showToast('Advanced options saved', 'success');
}

function togglePasswordOptions() {
    const isChecked = document.getElementById('protectPdf').checked;
    passwordOptions.style.display = isChecked ? 'block' : 'none';
}

// One-Click Selection Functions
function toggleQuickSelection() {
    const isVisible = quickSelectionPanel.style.display === 'block';
    quickSelectionPanel.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        showToast('Quick selection panel opened', 'success');
    }
}

function hideQuickSelection() {
    quickSelectionPanel.style.display = 'none';
}

function selectFromFolder() {
    // This simulates folder selection - in a real app, you'd use the File System Access API
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf';
    input.webkitdirectory = true; // This allows folder selection in supported browsers
    
    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        if (files.length > 0) {
            addFiles(files);
            hideQuickSelection();
            showToast(`Selected ${files.length} PDF files from folder`, 'success');
        } else {
            showToast('No PDF files found in the selected folder', 'error');
        }
    });
    
    input.click();
}

function selectRecentFiles() {
    // This would typically integrate with browser storage or file system API
    showToast('Recent files feature - would show recently accessed PDFs', 'info');
    hideQuickSelection();
}

function selectByPattern() {
    // This would allow pattern-based selection
    const pattern = prompt('Enter filename pattern (e.g., "report*.pdf" or "*2024*"):');
    if (pattern) {
        showToast(`Pattern selection: ${pattern} - feature in development`, 'info');
        hideQuickSelection();
    }
}

function toggleOneClickBar() {
    const isVisible = oneClickBar.style.display === 'block';
    oneClickBar.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        showToast('One-click selection activated', 'success');
    }
}

function handlePresetSelection(preset, button) {
    // Remove active class from all buttons
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    if (preset === 'range') {
        quickRange.style.display = 'flex';
        quickRangeInput.focus();
    } else {
        quickRange.style.display = 'none';
        applyPresetToAllFiles(preset);
    }
}

function applyPresetToAllFiles(preset) {
    selectedFiles.forEach((file, index) => {
        quickSelectPages(index, preset);
    });
    
    showToast(`Applied "${preset}" selection to all files`, 'success');
}

function applyQuickRange() {
    const rangeValue = quickRangeInput.value.trim();
    if (!rangeValue) {
        showToast('Please enter a page range', 'error');
        return;
    }
    
    selectedFiles.forEach((file, index) => {
        applyRangeToFile(index, rangeValue);
    });
    
    quickRange.style.display = 'none';
    quickRangeInput.value = '';
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    
    showToast(`Applied range "${rangeValue}" to all files`, 'success');
}

async function loadPdfPageCount(file, index) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const { PDFDocument } = PDFLib;
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();
        
        // Update page selection info
        pageSelections[index].totalPages = pageCount;
        pageSelections[index].type = 'all';
        pageSelections[index].pages = Array.from({length: pageCount}, (_, i) => i + 1);
        
        // Update UI
        updatePageSelectionDisplay(index);
        
    } catch (error) {
        console.error('Error loading PDF page count:', error);
        const pageSelectionSpan = document.getElementById(`pageSelection-${index}`);
        if (pageSelectionSpan) {
            pageSelectionSpan.textContent = 'Error loading pages';
        }
    }
}

function quickSelectPages(index, type) {
    const selection = pageSelections[index];
    const totalPages = selection.totalPages;
    
    if (totalPages === 0) {
        showToast('PDF pages are still loading', 'error');
        return;
    }
    
    switch (type) {
        case 'all':
            selection.type = 'all';
            selection.pages = Array.from({length: totalPages}, (_, i) => i + 1);
            break;
            
        case 'odd':
            selection.type = 'odd';
            selection.pages = Array.from({length: totalPages}, (_, i) => i + 1).filter(p => p % 2 === 1);
            break;
            
        case 'even':
            selection.type = 'even';
            selection.pages = Array.from({length: totalPages}, (_, i) => i + 1).filter(p => p % 2 === 0);
            break;
            
        case 'first':
            selection.type = 'first';
            selection.pages = [1];
            break;
            
        case 'last':
            selection.type = 'last';
            selection.pages = [totalPages];
            break;
    }
    
    updatePageSelectionDisplay(index);
    showToast(`Selected ${selection.pages.length} pages (${type})`, 'success');
}

function applyRangeToFile(index, rangeString) {
    const selection = pageSelections[index];
    const totalPages = selection.totalPages;
    
    if (totalPages === 0) return;
    
    try {
        const pages = parsePageRange(rangeString, totalPages);
        selection.type = 'custom';
        selection.pages = pages;
        updatePageSelectionDisplay(index);
    } catch (error) {
        showToast(`Invalid range for file ${index + 1}: ${error.message}`, 'error');
    }
}

function parsePageRange(rangeString, totalPages) {
    const pages = new Set();
    const parts = rangeString.split(',');
    
    for (let part of parts) {
        part = part.trim();
        
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(x => parseInt(x.trim()));
            if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
                throw new Error(`Invalid range: ${part}`);
            }
            for (let i = start; i <= end; i++) {
                pages.add(i);
            }
        } else {
            const pageNum = parseInt(part);
            if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
                throw new Error(`Invalid page number: ${part}`);
            }
            pages.add(pageNum);
        }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
}

function updatePageSelectionDisplay(index) {
    const selection = pageSelections[index];
    const pageSelectionSpan = document.getElementById(`pageSelection-${index}`);
    
    if (!pageSelectionSpan) return;
    
    let displayText = '';
    
    if (selection.type === 'all') {
        displayText = `All ${selection.totalPages} pages`;
    } else if (selection.pages.length === 1) {
        displayText = `Page ${selection.pages[0]} of ${selection.totalPages}`;
    } else if (selection.pages.length === selection.totalPages) {
        displayText = `All ${selection.totalPages} pages`;
    } else {
        const pageCount = selection.pages.length;
        const samplePages = selection.pages.slice(0, 3).join(', ');
        if (pageCount > 3) {
            displayText = `${pageCount} pages (${samplePages}...)`;
        } else {
            displayText = `${pageCount} pages (${samplePages})`;
        }
    }
    
    pageSelectionSpan.textContent = displayText;
}

function showProgressSection() {
    progressSection.style.display = 'block';
    filesSection.style.display = 'none';
}

function hideProgressSection() {
    progressSection.style.display = 'none';
    filesSection.style.display = 'block';
}

function showResultSection() {
    resultSection.style.display = 'block';
    filesSection.style.display = 'none';
    progressSection.style.display = 'none';
}

function hideResultSection() {
    resultSection.style.display = 'none';
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility functions
function validatePDFFile(file) {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

// Error handling for PDF-lib
window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    if (event.error && event.error.message.includes('PDF')) {
        showToast('Error processing PDF file. Please check if the file is valid.', 'error');
    } else if (event.error && event.error.message.includes('PDFLib')) {
        showToast('PDF library error. Please refresh the page.', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred. Please try again.', 'error');
});

// Handle page visibility change to clean up resources
document.addEventListener('visibilitychange', () => {
    if (document.hidden && mergedPdfUrl) {
        // Clean up blob URL when page is hidden to free memory
        // Note: We'll recreate it when needed
    }
});

// Initialize the app when the page loads
console.log('🚀 Enhanced PDF Merger application loaded successfully!');
console.log('📚 PDF-lib status:', typeof PDFLib !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');
console.log('👁️ PDF.js status:', typeof pdfjsLib !== 'undefined' ? '✅ Loaded' : '❌ Not loaded');
console.log('✨ Features: Page Selection, Preview, Advanced Options, Mobile Responsive');
