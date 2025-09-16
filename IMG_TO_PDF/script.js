// SIMGTOPDF Pro v2.0 - Enhanced JavaScript Functionality
// Advanced Image to PDF Converter with Premium Features

class ImageToPDFConverter {
    constructor() {
        this.images = [];
        this.currentSort = 'default';
        this.sortDirection = 'asc';
        this.isConverting = false;
        this.startTime = null;
        this.conversionHistory = [];
        this.settings = this.getDefaultSettings();
        this.compressionWorker = null;
        this.maxConcurrentOperations = 3;
        this.operationQueue = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.initializeSettings();
        this.updateUI();
        this.loadUserPreferences();
        this.initializeCompressionWorker();
        this.setupPerformanceMonitoring();
    }

    getDefaultSettings() {
        return {
            pageSize: 'a4',
            orientation: 'portrait',
            imageQuality: 80,
            imagesPerPage: 1,
            margins: { top: 10, bottom: 10, left: 10, right: 10 },
            backgroundColor: '#ffffff',
            maintainAspectRatio: true,
            addBorder: false,
            imageAlignment: 'center',
            compressionLevel: 'medium',
            autoOptimize: true,
            preserveMetadata: false,
            theme: 'auto'
        };
    }

    setupEventListeners() {
        // Enhanced image input change with multiple file support
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Enhanced quality slider with real-time preview
        const qualitySlider = document.getElementById('imageQuality');
        const qualityValue = document.getElementById('qualityValue');
        if (qualitySlider && qualityValue) {
            qualitySlider.addEventListener('input', this.debounce((e) => {
                qualityValue.textContent = e.target.value + '%';
                this.updateImagePreviews();
            }, 300));
        }

        // Enhanced page size change with validation
        const pageSize = document.getElementById('pageSize');
        if (pageSize) {
            pageSize.addEventListener('change', (e) => this.handlePageSizeChange(e));
        }

        // Enhanced convert button with progress tracking
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.addEventListener('click', () => this.convertToPDF());
        }

        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Enhanced window resize with throttling
        window.addEventListener('resize', this.throttle(this.updateLayout.bind(this), 100));

        // Settings auto-save
        this.setupSettingsAutoSave();

        // Paste support for images
        document.addEventListener('paste', (e) => this.handlePaste(e));

        // Visibility change handling
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;

        // Enhanced drag and drop with multiple zones
        const dragZones = [uploadArea, document.body];

        dragZones.forEach(zone => {
            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, this.preventDefaults, false);
            });

            // Enhanced highlight effects
            ['dragenter', 'dragover'].forEach(eventName => {
                zone.addEventListener(eventName, (e) => {
                    this.highlight(uploadArea);
                    this.showDropZoneHelper(e);
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                zone.addEventListener(eventName, () => {
                    this.unhighlight(uploadArea);
                    this.hideDropZoneHelper();
                }, false);
            });

            // Enhanced file drop handling
            zone.addEventListener('drop', (e) => this.handleDrop(e), false);
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight(element) {
        element.classList.add('drag-over');
        element.style.transform = 'scale(1.02)';
        element.style.borderColor = 'var(--primary-color)';
    }

    unhighlight(element) {
        element.classList.remove('drag-over');
        element.style.transform = '';
        element.style.borderColor = '';
    }

    showDropZoneHelper(e) {
        // Create visual helper for drop zones
        if (!this.dropHelper) {
            this.dropHelper = document.createElement('div');
            this.dropHelper.className = 'drop-helper';
            this.dropHelper.innerHTML = `
                <div class="drop-helper-content">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Drop images here</span>
                </div>
            `;
            document.body.appendChild(this.dropHelper);
        }
        
        this.dropHelper.style.display = 'flex';
        this.dropHelper.style.left = e.clientX - 100 + 'px';
        this.dropHelper.style.top = e.clientY - 50 + 'px';
    }

    hideDropZoneHelper() {
        if (this.dropHelper) {
            this.dropHelper.style.display = 'none';
        }
    }

    async handleDrop(e) {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files);
        const items = Array.from(dt.items);
        
        // Handle both files and directories
        const allFiles = [];
        
        for (const item of items) {
            if (item.kind === 'file') {
                if (item.webkitGetAsEntry) {
                    const entry = item.webkitGetAsEntry();
                    if (entry.isDirectory) {
                        const dirFiles = await this.readDirectory(entry);
                        allFiles.push(...dirFiles);
                    } else {
                        allFiles.push(item.getAsFile());
                    }
                } else {
                    allFiles.push(item.getAsFile());
                }
            }
        }
        
        this.handleFiles(allFiles.length > 0 ? allFiles : files);
    }

    async readDirectory(dirEntry) {
        const files = [];
        const reader = dirEntry.createReader();
        
        return new Promise((resolve) => {
            const readEntries = () => {
                reader.readEntries(async (entries) => {
                    if (entries.length === 0) {
                        resolve(files);
                        return;
                    }
                    
                    for (const entry of entries) {
                        if (entry.isFile && this.isImageFile(entry.name)) {
                            const file = await this.getFileFromEntry(entry);
                            files.push(file);
                        } else if (entry.isDirectory) {
                            const subFiles = await this.readDirectory(entry);
                            files.push(...subFiles);
                        }
                    }
                    
                    readEntries();
                });
            };
            
            readEntries();
        });
    }

    getFileFromEntry(fileEntry) {
        return new Promise((resolve) => {
            fileEntry.file(resolve);
        });
    }

    isImageFile(filename) {
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
        return imageExtensions.test(filename);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.handleFiles(files);
    }

    async handleFiles(files) {
        if (!files || files.length === 0) return;
        
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) {
            this.showNotification('No valid image files selected.', 'error');
            return;
        }

        // Check total limit
        if (this.images.length + validFiles.length > 100) {
            this.showNotification('Maximum 100 images allowed. Some files were skipped.', 'warning');
            validFiles.splice(100 - this.images.length);
        }

        this.showLoadingState(true);
        
        try {
            // Process files in batches for better performance
            const batchSize = 5;
            for (let i = 0; i < validFiles.length; i += batchSize) {
                const batch = validFiles.slice(i, i + batchSize);
                await Promise.all(batch.map(file => this.processFile(file)));
                
                // Update progress
                const progress = ((i + batch.length) / validFiles.length) * 100;
                this.updateLoadingProgress(progress);
            }
            
            this.updateUI();
            this.showNotification(`${validFiles.length} image(s) added successfully.`, 'success');
            this.saveUserPreferences();
        } catch (error) {
            console.error('Error processing files:', error);
            this.showNotification('Error processing some files.', 'error');
            this.logError('File processing failed', error);
        } finally {
            this.showLoadingState(false);
        }
    }

    validateFile(file) {
        // Enhanced validation with detailed error messages
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        const maxSize = 50 * 1024 * 1024; // 50MB
        const minSize = 1024; // 1KB
        
        if (!allowedTypes.includes(file.type)) {
            this.showNotification(`${file.name}: Unsupported file type. Please use JPG, PNG, GIF, WebP, or BMP.`, 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showNotification(`${file.name}: File too large (max 50MB).`, 'error');
            return false;
        }

        if (file.size < minSize) {
            this.showNotification(`${file.name}: File too small (min 1KB).`, 'error');
            return false;
        }

        // Check for corrupted files
        if (file.size === 0) {
            this.showNotification(`${file.name}: Empty file detected.`, 'error');
            return false;
        }

        return true;
    }

    async processFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const img = new Image();
                    
                    img.onload = async () => {
                        // Enhanced image processing with optimization
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // Apply auto-optimization if enabled
                        let { width, height } = img;
                        if (this.settings.autoOptimize) {
                            const optimized = this.calculateOptimalDimensions(width, height);
                            width = optimized.width;
                            height = optimized.height;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Apply image enhancement
                        if (this.settings.autoOptimize) {
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = 'high';
                        }
                        
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Get optimized data URL
                        const dataUrl = canvas.toDataURL(file.type, this.settings.imageQuality / 100);
                        
                        const imageData = {
                            id: this.generateId(),
                            file: file,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            lastModified: file.lastModified,
                            dataUrl: dataUrl,
                            originalWidth: img.width,
                            originalHeight: img.height,
                            width: width,
                            height: height,
                            selected: true,
                            processed: Date.now(),
                            metadata: await this.extractMetadata(file)
                        };
                        
                        this.images.push(imageData);
                        resolve(imageData);
                    };
                    
                    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
                    img.src = e.target.result;
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsDataURL(file);
        });
    }

    calculateOptimalDimensions(width, height) {
        const maxDimension = 2048;
        const ratio = Math.min(maxDimension / width, maxDimension / height, 1);
        
        return {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio)
        };
    }

    async extractMetadata(file) {
        // Enhanced metadata extraction
        return {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified),
            // Add EXIF data extraction here if needed
        };
    }

    generateId() {
        return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Enhanced utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Enhanced user preferences
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('simgtopdf_preferences');
            if (saved) {
                const prefs = JSON.parse(saved);
                this.settings = { ...this.settings, ...prefs };
                this.applySettings();
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }

    saveUserPreferences() {
        try {
            localStorage.setItem('simgtopdf_preferences', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }

    applySettings() {
        // Apply saved settings to UI elements
        const elements = {
            pageSize: document.getElementById('pageSize'),
            orientation: document.getElementById('orientation'),
            imageQuality: document.getElementById('imageQuality'),
            imagesPerPage: document.getElementById('imagesPerPage'),
            marginTop: document.getElementById('marginTop'),
            marginBottom: document.getElementById('marginBottom'),
            marginLeft: document.getElementById('marginLeft'),
            marginRight: document.getElementById('marginRight'),
            backgroundColor: document.getElementById('backgroundColor'),
            maintainAspectRatio: document.getElementById('maintainAspectRatio'),
            addBorder: document.getElementById('addBorder'),
            imageAlignment: document.getElementById('imageAlignment')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element && this.settings[key] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });

        // Update quality display
        const qualityValue = document.getElementById('qualityValue');
        if (qualityValue) {
            qualityValue.textContent = this.settings.imageQuality + '%';
        }
    }

    setupSettingsAutoSave() {
        const settingsElements = [
            'pageSize', 'orientation', 'imageQuality', 'imagesPerPage',
            'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
            'backgroundColor', 'maintainAspectRatio', 'addBorder', 'imageAlignment'
        ];

        settingsElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateSettings();
                    this.saveUserPreferences();
                });
            }
        });
    }

    updateSettings() {
        const elements = {
            pageSize: document.getElementById('pageSize'),
            orientation: document.getElementById('orientation'),
            imageQuality: document.getElementById('imageQuality'),
            imagesPerPage: document.getElementById('imagesPerPage'),
            marginTop: document.getElementById('marginTop'),
            marginBottom: document.getElementById('marginBottom'),
            marginLeft: document.getElementById('marginLeft'),
            marginRight: document.getElementById('marginRight'),
            backgroundColor: document.getElementById('backgroundColor'),
            maintainAspectRatio: document.getElementById('maintainAspectRatio'),
            addBorder: document.getElementById('addBorder'),
            imageAlignment: document.getElementById('imageAlignment')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element) {
                if (element.type === 'checkbox') {
                    this.settings[key] = element.checked;
                } else if (element.type === 'number') {
                    this.settings[key] = parseFloat(element.value) || 0;
                } else {
                    this.settings[key] = element.value;
                }
            }
        });

        // Update margins object
        this.settings.margins = {
            top: this.settings.marginTop || 10,
            bottom: this.settings.marginBottom || 10,
            left: this.settings.marginLeft || 10,
            right: this.settings.marginRight || 10
        };
    }

    // Enhanced paste support
    handlePaste(e) {
        const items = Array.from(e.clipboardData.items);
        const imageItems = items.filter(item => item.type.startsWith('image/'));
        
        if (imageItems.length > 0) {
            e.preventDefault();
            
            const files = imageItems.map(item => item.getAsFile()).filter(file => file);
            if (files.length > 0) {
                this.handleFiles(files);
                this.showNotification(`${files.length} image(s) pasted from clipboard.`, 'success');
            }
        }
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        this.performanceMetrics = {
            processingTimes: [],
            memoryUsage: [],
            conversionTimes: []
        };
    }

    logPerformanceMetric(type, value) {
        if (this.performanceMetrics[type]) {
            this.performanceMetrics[type].push({
                value,
                timestamp: Date.now()
            });
            
            // Keep only last 100 metrics
            if (this.performanceMetrics[type].length > 100) {
                this.performanceMetrics[type].shift();
            }
        }
    }

    // Error logging
    logError(context, error) {
        const errorLog = {
            context,
            error: error.message,
            stack: error.stack,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Error logged:', errorLog);
        
        // Could send to error tracking service here
        // this.sendErrorToService(errorLog);
    }

    // Enhanced visibility change handling
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause any ongoing operations when tab is hidden
            this.pauseOperations();
        } else {
            // Resume operations when tab becomes visible
            this.resumeOperations();
        }
    }

    pauseOperations() {
        // Implement pause logic for ongoing operations
        if (this.compressionWorker) {
            this.compressionWorker.postMessage({ type: 'pause' });
        }
    }

    resumeOperations() {
        // Implement resume logic
        if (this.compressionWorker) {
            this.compressionWorker.postMessage({ type: 'resume' });
        }
    }

    // Enhanced compression worker
    initializeCompressionWorker() {
        if (typeof Worker !== 'undefined') {
            try {
                // Create worker for image compression
                const workerCode = `
                    self.onmessage = function(e) {
                        const { type, imageData, quality } = e.data;
                        
                        if (type === 'compress') {
                            // Implement image compression logic
                            // This is a simplified example
                            self.postMessage({
                                type: 'compressed',
                                data: imageData,
                                originalSize: imageData.length,
                                compressedSize: Math.floor(imageData.length * (quality / 100))
                            });
                        }
                    };
                `;
                
                const blob = new Blob([workerCode], { type: 'application/javascript' });
                this.compressionWorker = new Worker(URL.createObjectURL(blob));
                
                this.compressionWorker.onmessage = (e) => {
                    this.handleWorkerMessage(e.data);
                };
                
                this.compressionWorker.onerror = (error) => {
                    console.warn('Compression worker error:', error);
                    this.compressionWorker = null;
                };
                
            } catch (error) {
                console.warn('Failed to initialize compression worker:', error);
            }
        }
    }

    handleWorkerMessage(data) {
        const { type } = data;
        
        switch (type) {
            case 'compressed':
                this.handleCompressedImage(data);
                break;
            default:
                console.warn('Unknown worker message type:', type);
        }
    }

    handleCompressedImage(data) {
        // Handle compressed image data
        const savings = ((data.originalSize - data.compressedSize) / data.originalSize * 100).toFixed(1);
        this.showNotification(`Image compressed: ${savings}% size reduction`, 'info');
    }

    // Enhanced loading states
    showLoadingState(show) {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;
        
        if (show) {
            uploadArea.classList.add('loading');
            uploadArea.style.opacity = '0.6';
            uploadArea.style.pointerEvents = 'none';
            
            // Add loading spinner
            if (!uploadArea.querySelector('.loading-spinner')) {
                const spinner = document.createElement('div');
                spinner.className = 'loading-spinner';
                spinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                uploadArea.appendChild(spinner);
            }
        } else {
            uploadArea.classList.remove('loading');
            uploadArea.style.opacity = '1';
            uploadArea.style.pointerEvents = 'auto';
            
            // Remove loading spinner
            const spinner = uploadArea.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    updateLoadingProgress(progress) {
        const uploadArea = document.getElementById('uploadArea');
        const progressBar = uploadArea.querySelector('.loading-progress');
        
        if (!progressBar) {
            const bar = document.createElement('div');
            bar.className = 'loading-progress';
            bar.innerHTML = '<div class="loading-progress-fill"></div>';
            uploadArea.appendChild(bar);
        }
        
        const fill = uploadArea.querySelector('.loading-progress-fill');
        if (fill) {
            fill.style.width = `${progress}%`;
        }
    }

    // Enhanced image preview updates
    updateImagePreviews() {
        // Update image previews when quality changes
        this.images.forEach(image => {
            const element = document.querySelector(`[data-id="${image.id}"] .image-preview`);
            if (element) {
                // Apply quality preview (simplified)
                element.style.filter = `contrast(${100 + (this.settings.imageQuality - 80)}%)`;
            }
        });
    }

    updateUI() {
        this.updateImageGrid();
        this.updateConversionInfo();
        this.updateSectionVisibility();
        this.updateConvertButton();
    }

    updateImageGrid() {
        const imageGrid = document.getElementById('imageGrid');
        if (!imageGrid) return;

        imageGrid.innerHTML = '';

        if (this.images.length === 0) {
            imageGrid.innerHTML = `
                <div class="no-images">
                    <i class="fas fa-images"></i>
                    <p>No images selected yet</p>
                </div>
            `;
            return;
        }

        this.images.forEach(image => {
            const imageItem = this.createImageItem(image);
            imageGrid.appendChild(imageItem);
        });
    }

    createImageItem(image) {
        const div = document.createElement('div');
        div.className = `image-item ${image.selected ? 'selected' : ''}`;
        div.dataset.id = image.id;
        
        div.innerHTML = `
            <img src="${image.dataUrl}" alt="${image.name}" class="image-preview" loading="lazy">
            <div class="image-info">
                <div class="image-name" title="${image.name}">${image.name}</div>
                <div class="image-size">${this.formatFileSize(image.size)} • ${image.width}×${image.height}</div>
            </div>
            <div class="image-checkbox">
                <i class="fas ${image.selected ? 'fa-check-square' : 'fa-square'}"></i>
            </div>
            <button class="image-remove" onclick="converter.removeImage('${image.id}')" title="Remove image">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add click event for selection toggle
        div.addEventListener('click', (e) => {
            if (e.target.closest('.image-remove')) return;
            this.toggleImageSelection(image.id);
        });

        return div;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    toggleImageSelection(id) {
        const image = this.images.find(img => img.id === id);
        if (image) {
            image.selected = !image.selected;
            this.updateUI();
        }
    }

    removeImage(id) {
        this.images = this.images.filter(img => img.id !== id);
        this.updateUI();
        this.showNotification('Image removed.', 'info');
    }

    selectAllImages() {
        this.images.forEach(img => img.selected = true);
        this.updateUI();
    }

    deselectAllImages() {
        this.images.forEach(img => img.selected = false);
        this.updateUI();
    }

    removeSelectedImages() {
        const selectedCount = this.images.filter(img => img.selected).length;
        this.images = this.images.filter(img => !img.selected);
        this.updateUI();
        this.showNotification(`${selectedCount} image(s) removed.`, 'info');
    }

    addMoreImages() {
        document.getElementById('imageInput').click();
    }

    sortImages() {
        const sortBy = document.getElementById('sortBy').value;
        const direction = this.sortDirection === 'asc' ? 1 : -1;

        this.images.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'size':
                    aValue = a.size;
                    bValue = b.size;
                    break;
                case 'date':
                    aValue = a.lastModified;
                    bValue = b.lastModified;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return -1 * direction;
            if (aValue > bValue) return 1 * direction;
            return 0;
        });

        this.currentSort = sortBy;
        this.updateUI();
    }

    toggleSortDirection() {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        const sortIcon = document.getElementById('sortIcon');
        if (sortIcon) {
            sortIcon.className = this.sortDirection === 'asc' ? 'fas fa-sort-amount-down' : 'fas fa-sort-amount-up';
        }
        if (this.currentSort !== 'default') {
            this.sortImages();
        }
    }

    updateConversionInfo() {
        const selectedImages = this.images.filter(img => img.selected);
        const imageCount = document.getElementById('imageCount');
        const estimatedSize = document.getElementById('estimatedSize');

        if (imageCount) {
            imageCount.textContent = `${selectedImages.length} image(s) selected`;
        }

        if (estimatedSize) {
            const totalSize = selectedImages.reduce((sum, img) => sum + img.size, 0);
            const estimatedPdfSize = totalSize * 0.7; // Rough estimation
            estimatedSize.textContent = `Estimated PDF size: ${this.formatFileSize(estimatedPdfSize)}`;
        }
    }

    updateSectionVisibility() {
        const uploadSection = document.getElementById('uploadSection');
        const settingsPanel = document.getElementById('settingsPanel');
        const previewSection = document.getElementById('previewSection');

        if (this.images.length > 0) {
            if (settingsPanel) settingsPanel.style.display = 'block';
            if (previewSection) previewSection.style.display = 'block';
        } else {
            if (settingsPanel) settingsPanel.style.display = 'none';
            if (previewSection) previewSection.style.display = 'none';
        }
    }

    updateConvertButton() {
        const convertBtn = document.getElementById('convertBtn');
        if (!convertBtn) return;

        const selectedImages = this.images.filter(img => img.selected);
        convertBtn.disabled = selectedImages.length === 0 || this.isConverting;
    }

    handlePageSizeChange(e) {
        const customSizeSettings = document.getElementById('customSizeSettings');
        if (customSizeSettings) {
            customSizeSettings.style.display = e.target.value === 'custom' ? 'block' : 'none';
        }
    }

    toggleAdvancedSettings() {
        const advancedSettings = document.getElementById('advancedSettings');
        const toggleButton = document.querySelector('.toggle-settings');
        
        if (advancedSettings && toggleButton) {
            const isVisible = advancedSettings.style.display !== 'none';
            advancedSettings.style.display = isVisible ? 'none' : 'block';
            
            const icon = toggleButton.querySelector('i');
            if (icon) {
                icon.className = isVisible ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
            }
        }
    }

    initializeSettings() {
        // Initialize quality slider
        const qualitySlider = document.getElementById('imageQuality');
        const qualityValue = document.getElementById('qualityValue');
        if (qualitySlider && qualityValue) {
            qualityValue.textContent = qualitySlider.value + '%';
        }
    }

    async convertToPDF() {
        if (this.isConverting) return;

        const selectedImages = this.images.filter(img => img.selected);
        if (selectedImages.length === 0) {
            this.showNotification('Please select at least one image.', 'error');
            return;
        }

        this.isConverting = true;
        this.startTime = Date.now();
        this.showProgressSection();
        this.updateConvertButton();

        try {
            const pdfBytes = await this.generatePDF(selectedImages);
            this.downloadPDF(pdfBytes);
            this.showResultSection(true, selectedImages.length, pdfBytes.length);
        } catch (error) {
            console.error('PDF generation failed:', error);
            this.showNotification('Failed to generate PDF. Please try again.', 'error');
            this.hideProgressSection();
        } finally {
            this.isConverting = false;
            this.updateConvertButton();
        }
    }

    async generatePDF(images) {
        const { PDFDocument, rgb, StandardFonts } = PDFLib;
        
        // Create a new PDF document with enhanced metadata
        const pdfDoc = await PDFDocument.create();
        
        // Set PDF metadata
        pdfDoc.setTitle('Images converted by SIMGTOPDF Pro');
        pdfDoc.setAuthor('SIMGTOPDF Pro v2.0');
        pdfDoc.setSubject('Image to PDF Conversion');
        pdfDoc.setCreator('SIMGTOPDF Pro v2.0');
        pdfDoc.setProducer('SIMGTOPDF Pro v2.0');
        pdfDoc.setCreationDate(new Date());
        pdfDoc.setModificationDate(new Date());
        
        // Get enhanced settings
        const settings = this.getEnhancedSettings();
        
        this.updateProgress(0, 'Initializing PDF document...');
        
        let currentPage = null;
        let imagesOnCurrentPage = 0;
        const imagesPerPage = parseInt(settings.imagesPerPage);
        const totalOperations = images.length + 2; // +2 for init and finalize
        let completedOperations = 1;
        
        // Enhanced error handling and progress tracking
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            this.updateProgress(
                (completedOperations / totalOperations) * 90,
                `Processing image ${i + 1} of ${images.length}: ${image.name}`
            );
            
            try {
                // Create new page if needed
                if (!currentPage || imagesOnCurrentPage >= imagesPerPage) {
                    currentPage = pdfDoc.addPage([settings.pageWidth, settings.pageHeight]);
                    
                    // Add background color if specified
                    if (settings.backgroundColor !== '#ffffff') {
                        const color = this.hexToRgb(settings.backgroundColor);
                        currentPage.drawRectangle({
                            x: 0,
                            y: 0,
                            width: settings.pageWidth,
                            height: settings.pageHeight,
                            color: rgb(color.r / 255, color.g / 255, color.b / 255),
                        });
                    }
                    
                    imagesOnCurrentPage = 0;
                }
                
                // Enhanced image embedding with error handling
                let embeddedImage;
                try {
                    const imageBytes = await this.getOptimizedImageBytes(image, settings);
                    
                    if (image.type === 'image/jpeg' || image.type === 'image/jpg') {
                        embeddedImage = await pdfDoc.embedJpg(imageBytes);
                    } else {
                        embeddedImage = await pdfDoc.embedPng(imageBytes);
                    }
                } catch (embedError) {
                    console.warn(`Failed to embed image ${image.name}:`, embedError);
                    this.showNotification(`Skipped corrupted image: ${image.name}`, 'warning');
                    continue;
                }
                
                // Enhanced image dimensions and positioning
                const imageDims = this.calculateEnhancedImageDimensions(
                    embeddedImage,
                    settings,
                    imagesPerPage,
                    imagesOnCurrentPage
                );
                
                // Apply image effects and transformations
                const drawOptions = {
                    x: imageDims.x,
                    y: imageDims.y,
                    width: imageDims.width,
                    height: imageDims.height,
                };
                
                // Add rotation if needed
                if (settings.autoRotate && this.shouldRotateImage(image)) {
                    drawOptions.rotate = this.getOptimalRotation(image);
                }
                
                // Draw image with enhanced options
                currentPage.drawImage(embeddedImage, drawOptions);
                
                // Add border if enabled
                if (settings.addBorder) {
                    this.addImageBorder(currentPage, imageDims, settings);
                }
                
                // Add watermark if enabled
                if (settings.addWatermark) {
                    await this.addWatermark(currentPage, pdfDoc, settings, imageDims);
                }
                
                // Add image metadata as annotation if enabled
                if (settings.preserveMetadata && image.metadata) {
                    this.addImageAnnotation(currentPage, image, imageDims);
                }
                
                imagesOnCurrentPage++;
                completedOperations++;
                
            } catch (error) {
                console.error(`Error processing image ${image.name}:`, error);
                this.logError(`PDF generation - image ${image.name}`, error);
                // Continue with next image
                completedOperations++;
            }
        }
        
        // Add page numbers if enabled
        if (settings.addPageNumbers) {
            await this.addPageNumbers(pdfDoc, settings);
        }
        
        this.updateProgress(95, 'Finalizing PDF...');
        
        // Enhanced PDF optimization
        const pdfBytes = await this.optimizePDF(pdfDoc, settings);
        
        this.updateProgress(100, 'PDF generated successfully!');
        
        // Log performance metrics
        this.logPerformanceMetric('conversionTimes', Date.now() - this.startTime);
        
        return pdfBytes;
    }

    async getOptimizedImageBytes(image, settings) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Enhanced image optimization
                let { width, height } = this.calculateOptimalImageSize(img, settings);
                
                canvas.width = width;
                canvas.height = height;
                
                // Apply enhanced rendering settings
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Apply image enhancements
                if (settings.enhanceImages) {
                    this.applyImageEnhancements(ctx, settings);
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert with optimized quality
                const quality = this.calculateOptimalQuality(settings.imageQuality, image.size);
                
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Failed to convert image to blob'));
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = () => {
                        const arrayBuffer = reader.result;
                        const uint8Array = new Uint8Array(arrayBuffer);
                        resolve(uint8Array);
                    };
                    reader.onerror = () => reject(new Error('Failed to read blob'));
                    reader.readAsArrayBuffer(blob);
                }, image.type, quality);
            };
            
            img.onerror = () => reject(new Error(`Failed to load image: ${image.name}`));
            img.src = image.dataUrl;
        });
    }

    calculateOptimalImageSize(img, settings) {
        let { width, height } = img;
        
        // Apply size optimization based on settings
        if (settings.autoOptimize) {
            const maxDimension = settings.maxImageDimension || 2048;
            const ratio = Math.min(maxDimension / width, maxDimension / height, 1);
            
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
        }
        
        return { width, height };
    }

    calculateOptimalQuality(baseQuality, fileSize) {
        // Adjust quality based on file size to optimize PDF size
        const sizeMB = fileSize / (1024 * 1024);
        
        if (sizeMB > 10) return Math.min(baseQuality * 0.8, 80);
        if (sizeMB > 5) return Math.min(baseQuality * 0.9, 90);
        
        return baseQuality / 100;
    }

    applyImageEnhancements(ctx, settings) {
        // Apply various image enhancements
        if (settings.adjustBrightness) {
            ctx.filter = `brightness(${settings.brightness || 100}%)`;
        }
        
        if (settings.adjustContrast) {
            ctx.filter += ` contrast(${settings.contrast || 100}%)`;
        }
        
        if (settings.adjustSaturation) {
            ctx.filter += ` saturate(${settings.saturation || 100}%)`;
        }
    }

    calculateEnhancedImageDimensions(embeddedImage, settings, imagesPerPage, imageIndex) {
        const pageWidth = settings.pageWidth;
        const pageHeight = settings.pageHeight;
        const margins = settings.margins;
        
        const availableWidth = pageWidth - margins.left - margins.right;
        const availableHeight = pageHeight - margins.top - margins.bottom;
        
        let imageWidth, imageHeight, x, y;
        
        if (imagesPerPage === 1) {
            // Enhanced single image layout
            const padding = settings.imagePadding || 0;
            const maxWidth = availableWidth - (padding * 2);
            const maxHeight = availableHeight - (padding * 2);
            
            if (settings.maintainAspectRatio) {
                const scale = Math.min(maxWidth / embeddedImage.width, maxHeight / embeddedImage.height);
                imageWidth = embeddedImage.width * scale;
                imageHeight = embeddedImage.height * scale;
            } else {
                imageWidth = maxWidth;
                imageHeight = maxHeight;
            }
            
            // Enhanced alignment options
            switch (settings.imageAlignment) {
                case 'left':
                    x = margins.left + padding;
                    y = margins.bottom + (availableHeight - imageHeight) / 2;
                    break;
                case 'right':
                    x = pageWidth - margins.right - imageWidth - padding;
                    y = margins.bottom + (availableHeight - imageHeight) / 2;
                    break;
                case 'top':
                    x = margins.left + (availableWidth - imageWidth) / 2;
                    y = pageHeight - margins.top - imageHeight - padding;
                    break;
                case 'bottom':
                    x = margins.left + (availableWidth - imageWidth) / 2;
                    y = margins.bottom + padding;
                    break;
                default: // center
                    x = margins.left + (availableWidth - imageWidth) / 2;
                    y = margins.bottom + (availableHeight - imageHeight) / 2;
            }
        } else {
            // Enhanced multi-image layout with better spacing
            const cols = Math.ceil(Math.sqrt(imagesPerPage));
            const rows = Math.ceil(imagesPerPage / cols);
            
            const cellWidth = availableWidth / cols;
            const cellHeight = availableHeight / rows;
            
            const imagePadding = settings.imagePadding || 10;
            const maxCellWidth = cellWidth - (imagePadding * 2);
            const maxCellHeight = cellHeight - (imagePadding * 2);
            
            const col = imageIndex % cols;
            const row = Math.floor(imageIndex / cols);
            
            if (settings.maintainAspectRatio) {
                const scale = Math.min(maxCellWidth / embeddedImage.width, maxCellHeight / embeddedImage.height);
                imageWidth = embeddedImage.width * scale;
                imageHeight = embeddedImage.height * scale;
            } else {
                imageWidth = maxCellWidth;
                imageHeight = maxCellHeight;
            }
            
            x = margins.left + col * cellWidth + (cellWidth - imageWidth) / 2;
            y = pageHeight - margins.top - (row + 1) * cellHeight + (cellHeight - imageHeight) / 2;
        }
        
        return { x, y, width: imageWidth, height: imageHeight };
    }

    addImageBorder(page, imageDims, settings) {
        const borderWidth = settings.borderWidth || 1;
        const borderColor = settings.borderColor || '#000000';
        const color = this.hexToRgb(borderColor);
        
        page.drawRectangle({
            x: imageDims.x - borderWidth,
            y: imageDims.y - borderWidth,
            width: imageDims.width + (borderWidth * 2),
            height: imageDims.height + (borderWidth * 2),
            borderColor: rgb(color.r / 255, color.g / 255, color.b / 255),
            borderWidth: borderWidth,
        });
    }

    async addWatermark(page, pdfDoc, settings, imageDims) {
        if (!settings.watermarkText && !settings.watermarkImage) return;
        
        try {
            if (settings.watermarkText) {
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const fontSize = settings.watermarkFontSize || 12;
                const opacity = settings.watermarkOpacity || 0.5;
                
                page.drawText(settings.watermarkText, {
                    x: imageDims.x + 10,
                    y: imageDims.y + 10,
                    size: fontSize,
                    font: font,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: opacity,
                });
            }
        } catch (error) {
            console.warn('Failed to add watermark:', error);
        }
    }

    async addPageNumbers(pdfDoc, settings) {
        try {
            const pages = pdfDoc.getPages();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            pages.forEach((page, index) => {
                const pageNum = index + 1;
                const pageCount = pages.length;
                const text = settings.pageNumberFormat === 'simple' 
                    ? `${pageNum}` 
                    : `${pageNum} / ${pageCount}`;
                
                const { width, height } = page.getSize();
                const fontSize = settings.pageNumberFontSize || 10;
                
                page.drawText(text, {
                    x: width - 50,
                    y: 20,
                    size: fontSize,
                    font: font,
                    color: rgb(0.5, 0.5, 0.5),
                });
            });
        } catch (error) {
            console.warn('Failed to add page numbers:', error);
        }
    }

    async optimizePDF(pdfDoc, settings) {
        try {
            // Apply PDF optimization based on settings
            const pdfBytes = await pdfDoc.save({
                useObjectStreams: settings.optimizeSize,
                addDefaultPage: false,
                objectStreamsInCode: settings.optimizeSize
            });
            
            return pdfBytes;
        } catch (error) {
            console.error('PDF optimization failed:', error);
            // Fallback to basic save
            return await pdfDoc.save();
        }
    }

    getEnhancedSettings() {
        const basicSettings = this.getSettings();
        
        // Add enhanced settings
        return {
            ...basicSettings,
            maxImageDimension: 2048,
            imagePadding: 5,
            borderWidth: 1,
            borderColor: '#000000',
            optimizeSize: true,
            enhanceImages: false,
            autoRotate: false,
            addWatermark: false,
            watermarkText: '',
            watermarkOpacity: 0.5,
            watermarkFontSize: 12,
            addPageNumbers: false,
            pageNumberFormat: 'simple',
            pageNumberFontSize: 10,
            brightness: 100,
            contrast: 100,
            saturation: 100
        };
    }

    // Utility methods for enhanced features
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    shouldRotateImage(image) {
        // Determine if image should be auto-rotated
        return image.originalWidth > image.originalHeight && 
               this.settings.orientation === 'portrait';
    }

    getOptimalRotation(image) {
        // Calculate optimal rotation angle
        return image.originalWidth > image.originalHeight ? 90 : 0;
    }

    addImageAnnotation(page, image, imageDims) {
        // Add metadata annotation (simplified)
        try {
            // This would typically use PDF annotation features
            // For now, we'll just log the metadata
            console.log(`Image metadata for ${image.name}:`, image.metadata);
        } catch (error) {
            console.warn('Failed to add image annotation:', error);
        }
    }

    async getImageBytes(image) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const quality = document.getElementById('imageQuality').value / 100;
                canvas.toBlob((blob) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const arrayBuffer = reader.result;
                        const uint8Array = new Uint8Array(arrayBuffer);
                        resolve(uint8Array);
                    };
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(blob);
                }, image.type, quality);
            };
            
            img.onerror = reject;
            img.src = image.dataUrl;
        });
    }

    calculateImageDimensions(embeddedImage, settings, imagesPerPage, imageIndex) {
        const pageWidth = settings.pageWidth;
        const pageHeight = settings.pageHeight;
        const margins = settings.margins;
        
        const availableWidth = pageWidth - margins.left - margins.right;
        const availableHeight = pageHeight - margins.top - margins.bottom;
        
        let imageWidth, imageHeight, x, y;
        
        if (imagesPerPage === 1) {
            // Single image per page
            const scale = Math.min(
                availableWidth / embeddedImage.width,
                availableHeight / embeddedImage.height
            );
            
            imageWidth = embeddedImage.width * scale;
            imageHeight = embeddedImage.height * scale;
            
            // Center the image
            x = margins.left + (availableWidth - imageWidth) / 2;
            y = margins.bottom + (availableHeight - imageHeight) / 2;
        } else {
            // Multiple images per page
            const cols = Math.ceil(Math.sqrt(imagesPerPage));
            const rows = Math.ceil(imagesPerPage / cols);
            
            const cellWidth = availableWidth / cols;
            const cellHeight = availableHeight / rows;
            
            const col = imageIndex % cols;
            const row = Math.floor(imageIndex / cols);
            
            const scale = Math.min(
                (cellWidth * 0.9) / embeddedImage.width,
                (cellHeight * 0.9) / embeddedImage.height
            );
            
            imageWidth = embeddedImage.width * scale;
            imageHeight = embeddedImage.height * scale;
            
            x = margins.left + col * cellWidth + (cellWidth - imageWidth) / 2;
            y = pageHeight - margins.top - (row + 1) * cellHeight + (cellHeight - imageHeight) / 2;
        }
        
        return { x, y, width: imageWidth, height: imageHeight };
    }

    getSettings() {
        const pageSize = document.getElementById('pageSize').value;
        const orientation = document.getElementById('orientation').value;
        const imagesPerPage = document.getElementById('imagesPerPage').value;
        
        // Page dimensions in points (1 point = 1/72 inch)
        let pageWidth, pageHeight;
        
        switch (pageSize) {
            case 'a4':
                pageWidth = 595; pageHeight = 842; break;
            case 'letter':
                pageWidth = 612; pageHeight = 792; break;
            case 'a3':
                pageWidth = 842; pageHeight = 1191; break;
            case 'a5':
                pageWidth = 420; pageHeight = 595; break;
            case 'legal':
                pageWidth = 612; pageHeight = 1008; break;
            case 'custom':
                const customWidth = parseFloat(document.getElementById('customWidth').value) * 2.83465; // mm to points
                const customHeight = parseFloat(document.getElementById('customHeight').value) * 2.83465;
                pageWidth = customWidth;
                pageHeight = customHeight;
                break;
            default:
                pageWidth = 595; pageHeight = 842;
        }
        
        // Handle orientation
        if (orientation === 'landscape') {
            [pageWidth, pageHeight] = [pageHeight, pageWidth];
        }
        
        // Margins in points
        const margins = {
            top: parseFloat(document.getElementById('marginTop')?.value || 10) * 2.83465,
            bottom: parseFloat(document.getElementById('marginBottom')?.value || 10) * 2.83465,
            left: parseFloat(document.getElementById('marginLeft')?.value || 10) * 2.83465,
            right: parseFloat(document.getElementById('marginRight')?.value || 10) * 2.83465
        };
        
        return {
            pageWidth,
            pageHeight,
            imagesPerPage,
            margins,
            imageQuality: parseFloat(document.getElementById('imageQuality').value) / 100,
            backgroundColor: document.getElementById('backgroundColor')?.value || '#ffffff',
            maintainAspectRatio: document.getElementById('maintainAspectRatio')?.checked !== false,
            addBorder: document.getElementById('addBorder')?.checked === true,
            imageAlignment: document.getElementById('imageAlignment')?.value || 'center'
        };
    }

    showProgressSection() {
        const progressSection = document.getElementById('progressSection');
        const uploadSection = document.getElementById('uploadSection');
        const settingsPanel = document.getElementById('settingsPanel');
        const previewSection = document.getElementById('previewSection');
        
        if (progressSection) progressSection.style.display = 'block';
        if (uploadSection) uploadSection.style.display = 'none';
        if (settingsPanel) settingsPanel.style.display = 'none';
        if (previewSection) previewSection.style.display = 'none';
        
        // Scroll to progress section
        progressSection?.scrollIntoView({ behavior: 'smooth' });
    }

    hideProgressSection() {
        const progressSection = document.getElementById('progressSection');
        if (progressSection) progressSection.style.display = 'none';
        
        this.updateSectionVisibility();
    }

    updateProgress(percentage, message) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const currentOperation = document.getElementById('currentOperation');
        const timeRemaining = document.getElementById('timeRemaining');
        
        if (progressFill) progressFill.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
        if (currentOperation) currentOperation.textContent = message;
        
        if (timeRemaining && this.startTime && percentage > 0) {
            const elapsed = Date.now() - this.startTime;
            const estimated = (elapsed / percentage) * 100;
            const remaining = Math.max(0, estimated - elapsed);
            
            if (remaining > 1000) {
                timeRemaining.textContent = `Est. ${Math.round(remaining / 1000)}s remaining`;
            } else {
                timeRemaining.textContent = 'Almost done...';
            }
        }
    }

    downloadPDF(pdfBytes) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.href = url;
            downloadBtn.download = 'SIMGTOPDF.pdf';
        }
        
        // Auto-download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'SIMGTOPDF.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    showResultSection(success, imageCount, pdfSize) {
        const resultSection = document.getElementById('resultSection');
        const progressSection = document.getElementById('progressSection');
        
        if (progressSection) progressSection.style.display = 'none';
        if (resultSection) resultSection.style.display = 'block';
        
        // Update result information
        const totalImages = document.getElementById('totalImages');
        const pdfSizeElement = document.getElementById('pdfSize');
        const processingTime = document.getElementById('processingTime');
        
        if (totalImages) totalImages.textContent = imageCount;
        if (pdfSizeElement) pdfSizeElement.textContent = this.formatFileSize(pdfSize);
        if (processingTime && this.startTime) {
            const time = Math.round((Date.now() - this.startTime) / 1000);
            processingTime.textContent = `${time} second${time !== 1 ? 's' : ''}`;
        }
        
        // Scroll to result section
        resultSection?.scrollIntoView({ behavior: 'smooth' });
    }

    resetConverter() {
        this.images = [];
        this.isConverting = false;
        this.startTime = null;
        
        // Reset file input
        const imageInput = document.getElementById('imageInput');
        if (imageInput) imageInput.value = '';
        
        // Hide sections
        const resultSection = document.getElementById('resultSection');
        const progressSection = document.getElementById('progressSection');
        
        if (resultSection) resultSection.style.display = 'none';
        if (progressSection) progressSection.style.display = 'none';
        
        // Show upload section
        const uploadSection = document.getElementById('uploadSection');
        if (uploadSection) uploadSection.style.display = 'block';
        
        this.updateUI();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showLoadingState(show) {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;
        
        if (show) {
            uploadArea.style.opacity = '0.6';
            uploadArea.style.pointerEvents = 'none';
        } else {
            uploadArea.style.opacity = '1';
            uploadArea.style.pointerEvents = 'auto';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + A: Select all images
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && this.images.length > 0) {
            e.preventDefault();
            this.selectAllImages();
        }
        
        // Delete: Remove selected images
        if (e.key === 'Delete' && this.images.some(img => img.selected)) {
            e.preventDefault();
            this.removeSelectedImages();
        }
        
        // Enter: Convert to PDF
        if (e.key === 'Enter' && this.images.some(img => img.selected) && !this.isConverting) {
            e.preventDefault();
            this.convertToPDF();
        }
        
        // Escape: Reset/cancel
        if (e.key === 'Escape') {
            if (this.isConverting) {
                // Could implement cancellation logic here
            } else {
                this.resetConverter();
            }
        }
    }

    updateLayout() {
        // Handle responsive layout updates if needed
        this.updateUI();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Settings Export/Import functionality
    exportSettings() {
        try {
            const currentSettings = this.getSettings();
            const exportData = {
                settings: currentSettings,
                version: '2.0',
                timestamp: new Date().toISOString(),
                appName: 'SIMGTOPDF'
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'SIMGTOPDF-settings.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
            this.showNotification('Settings exported successfully!', 'success');
        } catch (error) {
            console.error('Failed to export settings:', error);
            this.showNotification('Failed to export settings', 'error');
        }
    }

    importSettings() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importData = JSON.parse(event.target.result);
                        
                        // Validate import data
                        if (!importData.settings || importData.appName !== 'SIMGTOPDF') {
                            throw new Error('Invalid settings file format');
                        }

                        // Apply imported settings
                        this.settings = { ...this.settings, ...importData.settings };
                        this.applySettings();
                        this.saveUserPreferences();

                        this.showNotification(`Settings imported successfully! (Version: ${importData.version || 'Unknown'})`, 'success');
                    } catch (error) {
                        console.error('Failed to import settings:', error);
                        this.showNotification('Failed to import settings. Please check the file format.', 'error');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        } catch (error) {
            console.error('Failed to create import dialog:', error);
            this.showNotification('Failed to open import dialog', 'error');
        }
    }

    // Theme toggle functionality
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-mode');
        
        if (isDark) {
            body.classList.remove('dark-mode');
            localStorage.setItem('simgtopdf_theme', 'light');
            this.showNotification('Switched to light theme', 'info');
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('simgtopdf_theme', 'dark');
            this.showNotification('Switched to dark theme', 'info');
        }
    }
}

// Global functions for HTML onclick handlers
function toggleAdvancedSettings() {
    if (window.converter) {
        window.converter.toggleAdvancedSettings();
    }
}

function selectAllImages() {
    if (window.converter) {
        window.converter.selectAllImages();
    }
}

function deselectAllImages() {
    if (window.converter) {
        window.converter.deselectAllImages();
    }
}

function removeSelectedImages() {
    if (window.converter) {
        window.converter.removeSelectedImages();
    }
}

function addMoreImages() {
    if (window.converter) {
        window.converter.addMoreImages();
    }
}

function sortImages() {
    if (window.converter) {
        window.converter.sortImages();
    }
}

function toggleSortDirection() {
    if (window.converter) {
        window.converter.toggleSortDirection();
    }
}

function convertToPDF() {
    if (window.converter) {
        window.converter.convertToPDF();
    }
}

function previewPDF() {
    if (window.converter) {
        window.converter.previewPDF();
    }
}

function resetConverter() {
    if (window.converter) {
        window.converter.resetConverter();
    }
}

// Enhanced utility functions
function exportSettings() {
    if (window.converter) {
        window.converter.exportSettings();
    }
}

function importSettings() {
    if (window.converter) {
        window.converter.importSettings();
    }
}

function toggleTheme() {
    if (window.converter) {
        window.converter.toggleTheme();
    }
}

// Advanced features
class PDFPreviewManager {
    constructor(converter) {
        this.converter = converter;
        this.previewModal = null;
    }

    async createPreview() {
        // Generate a quick preview of the PDF
        const selectedImages = this.converter.images.filter(img => img.selected);
        if (selectedImages.length === 0) return;

        this.showPreviewModal();
        // Implementation for PDF preview
    }

    showPreviewModal() {
        if (!this.previewModal) {
            this.previewModal = document.createElement('div');
            this.previewModal.className = 'preview-modal';
            this.previewModal.innerHTML = `
                <div class="preview-modal-content">
                    <div class="preview-header">
                        <h3>PDF Preview</h3>
                        <button class="close-preview" onclick="this.closest('.preview-modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="preview-content">
                        <div class="preview-loading">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Generating preview...</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(this.previewModal);
        }

        this.previewModal.style.display = 'flex';
    }
}

// Performance monitoring utilities
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            conversionTimes: [],
            imageProcessingTimes: [],
            memoryUsage: []
        };
    }

    startTiming(operation) {
        return {
            operation,
            startTime: performance.now(),
            startMemory: this.getMemoryUsage()
        };
    }

    endTiming(timer) {
        const endTime = performance.now();
        const endMemory = this.getMemoryUsage();
        
        const metric = {
            operation: timer.operation,
            duration: endTime - timer.startTime,
            memoryDelta: endMemory - timer.startMemory,
            timestamp: Date.now()
        };

        this.recordMetric(timer.operation, metric);
        return metric;
    }

    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }

    recordMetric(type, metric) {
        const key = type + 'Times';
        if (!this.metrics[key]) {
            this.metrics[key] = [];
        }
        
        this.metrics[key].push(metric);
        
        // Keep only last 50 metrics
        if (this.metrics[key].length > 50) {
            this.metrics[key].shift();
        }
    }

    getAverageTime(operation) {
        const key = operation + 'Times';
        const times = this.metrics[key];
        if (!times || times.length === 0) return 0;
        
        const total = times.reduce((sum, metric) => sum + metric.duration, 0);
        return total / times.length;
    }

    getReport() {
        return {
            averageConversionTime: this.getAverageTime('conversion'),
            averageImageProcessingTime: this.getAverageTime('imageProcessing'),
            currentMemoryUsage: this.getMemoryUsage(),
            totalOperations: Object.values(this.metrics).reduce((sum, arr) => sum + arr.length, 0)
        };
    }
}

// Initialize enhanced components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.converter = new ImageToPDFConverter();
    window.previewManager = new PDFPreviewManager(window.converter);
    window.performanceMonitor = new PerformanceMonitor();
    
    // Add performance info updates
    setInterval(() => {
        const performanceInfo = document.getElementById('performanceInfo');
        if (performanceInfo && window.performanceMonitor) {
            const report = window.performanceMonitor.getReport();
            performanceInfo.textContent = `Memory: ${report.currentMemoryUsage.toFixed(1)}MB | Ops: ${report.totalOperations}`;
        }
    }, 2000);
});

// Add notification styles to head
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 300px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    z-index: 10000;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s ease;
    border-left: 4px solid var(--primary-color);
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.notification-content i {
    font-size: 18px;
}

.notification-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    opacity: 0.6;
    transition: opacity 0.2s;
}

.notification-close:hover {
    opacity: 1;
}

.notification-info {
    border-left-color: var(--primary-color);
}

.notification-info .notification-content i {
    color: var(--primary-color);
}

.notification-success {
    border-left-color: var(--success-color);
}

.notification-success .notification-content i {
    color: var(--success-color);
}

.notification-error {
    border-left-color: var(--danger-color);
}

.notification-error .notification-content i {
    color: var(--danger-color);
}

.notification-warning {
    border-left-color: var(--warning-color);
}

.notification-warning .notification-content i {
    color: var(--warning-color);
}

.no-images {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    color: var(--text-light);
}

.no-images i {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.no-images p {
    font-size: 18px;
    margin: 0;
}

@media (max-width: 480px) {
    .notification {
        right: 10px;
        left: 10px;
        min-width: auto;
        transform: translateY(-100px);
    }
    
    .notification.show {
        transform: translateY(0);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);