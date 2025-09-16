class ImageMergeTool {
    constructor() {
        this.selectedImages = [];
        this.selectedLayout = '';
        this.gridColumns = 'auto';
        this.borderWidth = 5;
        this.borderColor = '#000000';
        this.outputQuality = 0.9;
        this.outputFormat = 'png';
        this.targetFileSize = null; // in KB
        this.enableFileSizeTarget = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File input
        const imageInput = document.getElementById('imageInput');
        const uploadArea = document.getElementById('uploadArea');

        if (!imageInput || !uploadArea) {
            console.error('Required DOM elements not found');
            return;
        }

        imageInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Browse text click
        document.querySelector('.browse-text').addEventListener('click', () => {
            imageInput.click();
        });

        // Layout options
        document.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', (e) => this.selectLayout(e));
        });

        // Grid settings
        const gridCols = document.getElementById('gridCols');
        if (gridCols) {
            gridCols.addEventListener('change', (e) => {
                this.gridColumns = e.target.value;
            });
        }

        // Border settings
        const borderWidth = document.getElementById('borderWidth');
        if (borderWidth) {
            borderWidth.addEventListener('input', (e) => {
                this.borderWidth = e.target.value;
                const borderWidthValue = document.getElementById('borderWidthValue');
                if (borderWidthValue) {
                    borderWidthValue.textContent = e.target.value + 'px';
                }
            });
        }

        const borderColor = document.getElementById('borderColor');
        if (borderColor) {
            borderColor.addEventListener('change', (e) => {
                this.borderColor = e.target.value;
                // Update color preview
                const preview = document.querySelector('.color-preview');
                if (preview) {
                    preview.style.setProperty('--preview-color', e.target.value);
                    preview.style.background = e.target.value;
                }
            });
        }

        // Quality settings
        const outputQuality = document.getElementById('outputQuality');
        if (outputQuality) {
            outputQuality.addEventListener('input', (e) => {
                this.outputQuality = parseFloat(e.target.value);
                const qualityValue = document.getElementById('qualityValue');
                if (qualityValue) {
                    qualityValue.textContent = Math.round(e.target.value * 100) + '%';
                }
                this.updateFileSizeEstimate();
            });
        }

        const outputFormat = document.getElementById('outputFormat');
        if (outputFormat) {
            outputFormat.addEventListener('change', (e) => {
                this.outputFormat = e.target.value;
                // Update quality slider visibility
                const qualityControl = document.querySelector('.quality-control');
                const fileSizeControl = document.querySelector('.file-size-control');
                if (e.target.value === 'jpeg' || e.target.value === 'webp') {
                    if (qualityControl) qualityControl.style.display = 'flex';
                    if (fileSizeControl) fileSizeControl.style.display = 'block';
                } else {
                    if (qualityControl) qualityControl.style.display = 'none';
                    if (fileSizeControl) fileSizeControl.style.display = 'none';
                }
            });
        }

        // File size target settings
        const enableFileSizeTarget = document.getElementById('enableFileSizeTarget');
        if (enableFileSizeTarget) {
            enableFileSizeTarget.addEventListener('change', (e) => {
                this.enableFileSizeTarget = e.target.checked;
                const targetSizeInput = document.getElementById('targetFileSize');
                const qualitySlider = document.getElementById('outputQuality');
                
                if (targetSizeInput && qualitySlider) {
                    if (e.target.checked) {
                        targetSizeInput.disabled = false;
                        qualitySlider.disabled = true;
                        targetSizeInput.style.opacity = '1';
                        qualitySlider.style.opacity = '0.5';
                    } else {
                        targetSizeInput.disabled = true;
                        qualitySlider.disabled = false;
                        targetSizeInput.style.opacity = '0.5';
                        qualitySlider.style.opacity = '1';
                    }
                }
                
                // Update opacity for preset buttons
                const presetButtons = document.querySelectorAll('.preset-btn');
                presetButtons.forEach(btn => {
                    btn.disabled = !e.target.checked;
                    btn.style.opacity = e.target.checked ? '1' : '0.5';
                });
            });
        }

        const targetFileSize = document.getElementById('targetFileSize');
        if (targetFileSize) {
            targetFileSize.addEventListener('input', (e) => {
                this.targetFileSize = parseInt(e.target.value);
                const fileSizeValue = document.getElementById('fileSizeValue');
                if (fileSizeValue) {
                    fileSizeValue.textContent = e.target.value + ' KB';
                }
            });
        }

        // Size preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(e.target.dataset.size);
                this.targetFileSize = size;
                document.getElementById('targetFileSize').value = size;
                document.getElementById('fileSizeValue').textContent = size + ' KB';
            });
        });
    }

    updateFileSizeEstimate() {
        if (!this.resultCanvas || this.outputFormat === 'png') return;
        
        try {
            const mimeType = this.outputFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
            const testDataURL = this.resultCanvas.toDataURL(mimeType, this.outputQuality);
            const estimatedSizeKB = Math.round((testDataURL.length * 0.75) / 1024);
            
            // Update display
            const sizeEstimate = document.getElementById('sizeEstimate');
            if (sizeEstimate) {
                sizeEstimate.textContent = `Estimated size: ${estimatedSizeKB} KB`;
            }
        } catch (error) {
            // Ignore errors during estimation
        }

        // Merge button
        const mergeBtn = document.getElementById('mergeBtn');
        if (mergeBtn) {
            mergeBtn.addEventListener('click', () => {
                console.log('Merge button clicked');
                this.mergeImages();
            });
        } else {
            console.error('Merge button not found');
        }

        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadImage());
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
        
        // Initialize default values
        this.initializeDefaults();
    }

    initializeDefaults() {
        try {
            // Set default border values
            const borderWidth = document.getElementById('borderWidth');
            const borderWidthValue = document.getElementById('borderWidthValue');
            const borderColor = document.getElementById('borderColor');
            
            if (borderWidth) borderWidth.value = this.borderWidth;
            if (borderWidthValue) borderWidthValue.textContent = this.borderWidth + 'px';
            if (borderColor) borderColor.value = this.borderColor;
            
            // Set default quality values
            const outputQuality = document.getElementById('outputQuality');
            const qualityValue = document.getElementById('qualityValue');
            const outputFormat = document.getElementById('outputFormat');
            const enableFileSizeTarget = document.getElementById('enableFileSizeTarget');
            const targetFileSize = document.getElementById('targetFileSize');
            const fileSizeValue = document.getElementById('fileSizeValue');
            
            if (outputQuality) outputQuality.value = this.outputQuality;
            if (qualityValue) qualityValue.textContent = Math.round(this.outputQuality * 100) + '%';
            if (outputFormat) outputFormat.value = this.outputFormat;
            if (enableFileSizeTarget) enableFileSizeTarget.checked = this.enableFileSizeTarget;
            if (targetFileSize) {
                targetFileSize.value = '500';
                targetFileSize.disabled = !this.enableFileSizeTarget;
            }
            if (fileSizeValue) fileSizeValue.textContent = '500 KB';
            
            // Update color preview
            const preview = document.querySelector('.color-preview');
            if (preview) {
                preview.style.background = this.borderColor;
            }
            
            console.log('Defaults initialized successfully');
        } catch (error) {
            console.error('Error initializing defaults:', error);
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    processFiles(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            this.showNotification('Please select valid image files', 'error');
            return;
        }

        // Process each image file
        imageFiles.forEach(file => this.addImage(file));
    }

    addImage(file) {
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            this.showNotification('File too large. Please use images smaller than 50MB.', 'error');
            return;
        }

        // Check if image already exists
        const existingImage = this.selectedImages.find(img => 
            img.name === file.name && img.size === this.formatFileSize(file.size)
        );
        
        if (existingImage) {
            this.showNotification('This image is already selected.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                id: Date.now() + Math.random(),
                file: file,
                dataURL: e.target.result,
                name: file.name,
                size: this.formatFileSize(file.size)
            };

            this.selectedImages.push(imageData);
            this.renderSelectedImages();
            this.updateUI();
            this.showNotification(`Added ${file.name}`, 'success');
        };
        
        reader.onerror = () => {
            this.showNotification('Error reading file. Please try again.', 'error');
        };
        
        reader.readAsDataURL(file);
    }

    renderSelectedImages() {
        const container = document.getElementById('selectedImages');
        container.innerHTML = '';

        this.selectedImages.forEach(image => {
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.innerHTML = `
                <img src="${image.dataURL}" alt="${image.name}">
                <button class="image-remove" onclick="imageMergeTool.removeImage('${image.id}')">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-info">${image.name} (${image.size})</div>
            `;
            container.appendChild(imageItem);
        });
    }

    removeImage(imageId) {
        this.selectedImages = this.selectedImages.filter(img => img.id != imageId);
        this.renderSelectedImages();
        this.updateUI();
    }

    selectLayout(e) {
        const option = e.currentTarget;
        const layout = option.dataset.layout;

        // Remove previous selection
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        option.classList.add('selected');
        this.selectedLayout = layout;

        // Show/hide grid settings and border settings
        const gridSettings = document.getElementById('gridSettings');
        const borderSettings = document.getElementById('borderSettings');
        const qualitySettings = document.getElementById('qualitySettings');
        
        if (layout === 'grid') {
            gridSettings.style.display = 'flex';
        } else {
            gridSettings.style.display = 'none';
        }
        
        // Always show border settings and quality settings when a layout is selected
        borderSettings.style.display = 'block';
        qualitySettings.style.display = 'block';

        this.updateUI();
    }

    updateUI() {
        console.log('updateUI called');
        const step2 = document.getElementById('step2');
        const mergeBtn = document.getElementById('mergeBtn');

        console.log('Images count:', this.selectedImages.length);
        console.log('Selected layout:', this.selectedLayout);

        // Show step 2 if we have 2+ images
        if (this.selectedImages.length >= 2) {
            if (step2 && step2.style.display === 'none') {
                step2.style.display = 'block';
                console.log('Step 2 shown');
                
                // Add smooth scrolling to step 2
                setTimeout(() => {
                    step2.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 100);
            }
        } else {
            if (step2) {
                step2.style.display = 'none';
                console.log('Step 2 hidden');
            }
        }

        // Enable merge button if we have layout selected and 2+ images
        if (this.selectedImages.length >= 2 && this.selectedLayout) {
            if (mergeBtn) {
                mergeBtn.disabled = false;
                console.log('Merge button enabled');
            }
        } else {
            if (mergeBtn) {
                mergeBtn.disabled = true;
                console.log('Merge button disabled');
            }
        }
    }

    async mergeImages() {
        console.log('=== MERGE IMAGES FUNCTION CALLED ===');
        console.log('Selected images:', this.selectedImages.length);
        console.log('Selected layout:', this.selectedLayout);
        
        // Basic validation
        if (this.selectedImages.length < 2) {
            console.log('Not enough images');
            this.showNotification('Please select at least 2 images', 'error');
            return;
        }
        
        if (!this.selectedLayout) {
            console.log('No layout selected');
            this.showNotification('Please choose a layout', 'error');
            return;
        }

        console.log('Validation passed, starting merge...');

        // Show loading overlay instead of step
        this.showLoadingOverlay('Merging your images...');

        try {
            // Add a small delay to show loading animation
            console.log('Adding delay...');
            await new Promise(resolve => setTimeout(resolve, 800));
            
            console.log('Loading images...');
            // Load all images
            const loadedImages = await this.loadImages();
            console.log('Loaded images:', loadedImages.length);
            
            if (loadedImages.length === 0) {
                throw new Error('No images were loaded successfully');
            }
            
            console.log('Creating merged canvas...');
            // Create merged canvas based on layout
            const canvas = await this.createMergedCanvas(loadedImages);
            
            if (!canvas) {
                throw new Error('Failed to create merged canvas');
            }
            
            console.log('Canvas created successfully, showing result...');
            
            // Hide loading overlay
            this.hideLoadingOverlay();
            
            // Show result
            this.showResult(canvas);
            this.showNotification('Images merged successfully!', 'success');
        } catch (error) {
            console.error('Error merging images:', error);
            this.hideLoadingOverlay();
            this.showNotification(`Error merging images: ${error.message}`, 'error');
        }
    }

    async loadImages() {
        const promises = this.selectedImages.map(imageData => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous'; // Add this to handle CORS
                img.onload = () => resolve({ img, data: imageData });
                img.onerror = (error) => {
                    console.error('Error loading image:', error);
                    reject(new Error(`Failed to load image: ${imageData.name}`));
                };
                img.src = imageData.dataURL;
            });
        });

        try {
            return await Promise.all(promises);
        } catch (error) {
            throw new Error('Failed to load one or more images');
        }
    }

    async createMergedCanvas(loadedImages) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        switch (this.selectedLayout) {
            case 'horizontal':
                return this.mergeHorizontal(canvas, ctx, loadedImages);
            case 'vertical':
                return this.mergeVertical(canvas, ctx, loadedImages);
            case 'grid':
                return this.mergeGrid(canvas, ctx, loadedImages);
            default:
                throw new Error('Invalid layout selected');
        }
    }

    mergeHorizontal(canvas, ctx, loadedImages) {
        const borderWidth = parseInt(this.borderWidth) || 0;
        const spacing = borderWidth;
        
        // Calculate dimensions
        const maxHeight = Math.max(...loadedImages.map(item => item.img.height));
        const totalWidth = loadedImages.reduce((sum, item) => {
            const ratio = maxHeight / item.img.height;
            return sum + (item.img.width * ratio);
        }, 0) + spacing * (loadedImages.length - 1);

        canvas.width = totalWidth + (borderWidth * 2);
        canvas.height = maxHeight + (borderWidth * 2);

        // Fill background
        if (borderWidth > 0) {
            ctx.fillStyle = this.borderColor || '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw images
        let currentX = borderWidth;
        loadedImages.forEach((item, index) => {
            const ratio = maxHeight / item.img.height;
            const scaledWidth = item.img.width * ratio;
            
            ctx.drawImage(item.img, currentX, borderWidth, scaledWidth, maxHeight);
            currentX += scaledWidth + spacing;
        });

        return canvas;
    }

    mergeVertical(canvas, ctx, loadedImages) {
        const borderWidth = parseInt(this.borderWidth) || 0;
        const spacing = borderWidth;
        
        // Calculate dimensions
        const maxWidth = Math.max(...loadedImages.map(item => item.img.width));
        const totalHeight = loadedImages.reduce((sum, item) => {
            const ratio = maxWidth / item.img.width;
            return sum + (item.img.height * ratio);
        }, 0) + spacing * (loadedImages.length - 1);

        canvas.width = maxWidth + (borderWidth * 2);
        canvas.height = totalHeight + (borderWidth * 2);

        // Fill background
        if (borderWidth > 0) {
            ctx.fillStyle = this.borderColor || '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw images
        let currentY = borderWidth;
        loadedImages.forEach((item, index) => {
            const ratio = maxWidth / item.img.width;
            const scaledHeight = item.img.height * ratio;
            
            ctx.drawImage(item.img, borderWidth, currentY, maxWidth, scaledHeight);
            currentY += scaledHeight + spacing;
        });

        return canvas;
    }

    mergeGrid(canvas, ctx, loadedImages) {
        const borderWidth = parseInt(this.borderWidth) || 0;
        const spacing = borderWidth;
        
        // Calculate grid dimensions
        const imageCount = loadedImages.length;
        let cols, rows;

        if (this.gridColumns === 'auto') {
            cols = Math.ceil(Math.sqrt(imageCount));
            rows = Math.ceil(imageCount / cols);
        } else {
            cols = parseInt(this.gridColumns);
            rows = Math.ceil(imageCount / cols);
        }

        // Find the maximum dimensions to maintain aspect ratios
        const maxWidth = Math.max(...loadedImages.map(item => item.img.width));
        const maxHeight = Math.max(...loadedImages.map(item => item.img.height));
        
        // Calculate cell size (we'll use the average of max dimensions for square cells)
        const cellSize = Math.min(maxWidth, maxHeight);
        
        canvas.width = cols * cellSize + spacing * (cols - 1) + (borderWidth * 2);
        canvas.height = rows * cellSize + spacing * (rows - 1) + (borderWidth * 2);

        // Fill background
        ctx.fillStyle = this.borderColor || '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw images in grid
        loadedImages.forEach((item, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = col * (cellSize + spacing) + borderWidth;
            const y = row * (cellSize + spacing) + borderWidth;
            
            // Calculate scaling to fit within cell while maintaining aspect ratio
            const imgAspect = item.img.width / item.img.height;
            const cellAspect = 1; // Square cells
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (imgAspect > cellAspect) {
                // Image is wider than cell
                drawWidth = cellSize;
                drawHeight = cellSize / imgAspect;
                drawX = x;
                drawY = y + (cellSize - drawHeight) / 2;
            } else {
                // Image is taller than cell
                drawWidth = cellSize * imgAspect;
                drawHeight = cellSize;
                drawX = x + (cellSize - drawWidth) / 2;
                drawY = y;
            }
            
            ctx.drawImage(item.img, drawX, drawY, drawWidth, drawHeight);
        });

        return canvas;
    }

    showResult(canvas) {
        const resultCanvas = document.getElementById('resultCanvas');
        const resultCtx = resultCanvas.getContext('2d');
        
        // Copy the merged canvas to the result canvas
        resultCanvas.width = canvas.width;
        resultCanvas.height = canvas.height;
        resultCtx.drawImage(canvas, 0, 0);
        
        // Store the canvas for download
        this.resultCanvas = canvas;
        
        // Show result step
        this.showStep('step3');
        
        // Add smooth scrolling to result
        setTimeout(() => {
            const resultStep = document.getElementById('step3');
            if (resultStep) {
                resultStep.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
            }
        }, 400); // Wait for step transition to complete
        
        // Update file size estimate for the first time
        setTimeout(() => this.updateFileSizeEstimate(), 100);
    }

    downloadImage() {
        if (!this.resultCanvas) {
            this.showNotification('No image to download', 'error');
            return;
        }

        // Add loading state to download button
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing Download...';
        downloadBtn.disabled = true;

        // Add a small delay for better UX
        setTimeout(() => {
            try {
                // Create download link with quality settings
                const link = document.createElement('a');
                const timestamp = Date.now();
                
                let dataURL;
                let filename;
                let finalQuality = this.outputQuality;
                
                if (this.outputFormat === 'jpeg' || this.outputFormat === 'webp') {
                    // If file size target is enabled, optimize quality for target size
                    if (this.enableFileSizeTarget && this.targetFileSize) {
                        finalQuality = this.optimizeQualityForFileSize();
                    }
                    
                    const mimeType = this.outputFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
                    dataURL = this.resultCanvas.toDataURL(mimeType, finalQuality);
                    filename = `OMERGER.${this.outputFormat === 'jpeg' ? 'jpg' : 'webp'}`;
                } else {
                    dataURL = this.resultCanvas.toDataURL('image/png');
                    filename = `OMERGER.png`;
                }
                
                link.download = filename;
                link.href = dataURL;
                
                // Calculate actual file size
                const actualSizeKB = Math.round((dataURL.length * 0.75) / 1024);
                
                // Trigger download with smooth animation
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                let sizeInfo = ` (${actualSizeKB} KB)`;
                if (this.enableFileSizeTarget && this.targetFileSize) {
                    sizeInfo += ` - Target: ${this.targetFileSize} KB`;
                } else if (this.outputFormat !== 'png') {
                    sizeInfo += ` - Quality: ${Math.round(finalQuality * 100)}%`;
                }
                
                // Add success animation
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
                downloadBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                
                setTimeout(() => {
                    downloadBtn.innerHTML = originalText;
                    downloadBtn.disabled = false;
                    downloadBtn.style.background = '';
                }, 2000);
                
                this.showNotification(`Downloaded as ${this.outputFormat.toUpperCase()}${sizeInfo}!`, 'success');
            } catch (error) {
                console.error('Download error:', error);
                downloadBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                downloadBtn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                
                setTimeout(() => {
                    downloadBtn.innerHTML = originalText;
                    downloadBtn.disabled = false;
                    downloadBtn.style.background = '';
                }, 2000);
                
                this.showNotification('Error downloading image. Please try again.', 'error');
            }
        }, 500);
    }

    optimizeQualityForFileSize() {
        if (!this.targetFileSize || this.outputFormat === 'png') {
            return this.outputQuality;
        }

        // Binary search to find optimal quality for target file size
        let minQuality = 0.1;
        let maxQuality = 1.0;
        let bestQuality = this.outputQuality;
        const tolerance = 0.05; // 5% tolerance
        const maxIterations = 10;
        
        for (let i = 0; i < maxIterations; i++) {
            const testQuality = (minQuality + maxQuality) / 2;
            const mimeType = this.outputFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
            const testDataURL = this.resultCanvas.toDataURL(mimeType, testQuality);
            const testSizeKB = Math.round((testDataURL.length * 0.75) / 1024);
            
            const sizeDiff = Math.abs(testSizeKB - this.targetFileSize) / this.targetFileSize;
            
            if (sizeDiff <= tolerance) {
                bestQuality = testQuality;
                break;
            }
            
            if (testSizeKB > this.targetFileSize) {
                maxQuality = testQuality;
            } else {
                minQuality = testQuality;
                bestQuality = testQuality; // Keep the best quality that's under target
            }
        }
        
        // Update quality display
        document.getElementById('qualityValue').textContent = Math.round(bestQuality * 100) + '% (auto)';
        
        return bestQuality;
    }

    showStep(stepId) {
        // Add smooth transition between steps
        const currentStep = document.querySelector('.step[style*="block"]');
        const targetStep = document.getElementById(stepId);
        
        if (currentStep && currentStep !== targetStep) {
            // Fade out current step
            currentStep.style.opacity = '0';
            currentStep.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                // Hide all steps
                document.querySelectorAll('.step').forEach(step => {
                    step.style.display = 'none';
                    step.style.opacity = '1';
                    step.style.transform = 'translateY(0)';
                });
                
                // Show target step with animation
                if (targetStep) {
                    targetStep.style.display = 'block';
                    targetStep.style.opacity = '0';
                    targetStep.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        targetStep.style.transition = 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)';
                        targetStep.style.opacity = '1';
                        targetStep.style.transform = 'translateY(0)';
                    }, 50);
                }
            }, 200);
        } else {
            // Hide all steps
            document.querySelectorAll('.step').forEach(step => {
                step.style.display = 'none';
            });
            
            // Show target step
            if (targetStep) {
                targetStep.style.display = 'block';
            }
        }
    }

    reset() {
        // Add confirmation dialog with smooth animation
        const resetBtn = document.getElementById('resetBtn');
        const originalText = resetBtn.innerHTML;
        
        // Create custom confirm dialog
        const confirmReset = () => {
            return new Promise((resolve) => {
                // Create modal backdrop
                const backdrop = document.createElement('div');
                backdrop.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                
                // Create modal
                const modal = document.createElement('div');
                modal.style.cssText = `
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    max-width: 400px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    transform: scale(0.8);
                    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
                `;
                
                modal.innerHTML = `
                    <h3 style="margin-bottom: 1rem; color: #333;">Start Over?</h3>
                    <p style="margin-bottom: 2rem; color: #666;">This will clear all selected images and settings. Are you sure?</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="confirmYes" style="background: #dc3545; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500;">Yes, Start Over</button>
                        <button id="confirmNo" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500;">Cancel</button>
                    </div>
                `;
                
                backdrop.appendChild(modal);
                document.body.appendChild(backdrop);
                
                // Animate in
                setTimeout(() => {
                    backdrop.style.opacity = '1';
                    modal.style.transform = 'scale(1)';
                }, 10);
                
                // Handle buttons
                document.getElementById('confirmYes').onclick = () => {
                    backdrop.style.opacity = '0';
                    modal.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        document.body.removeChild(backdrop);
                        resolve(true);
                    }, 300);
                };
                
                document.getElementById('confirmNo').onclick = () => {
                    backdrop.style.opacity = '0';
                    modal.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        document.body.removeChild(backdrop);
                        resolve(false);
                    }, 300);
                };
                
                // Close on backdrop click
                backdrop.onclick = (e) => {
                    if (e.target === backdrop) {
                        document.getElementById('confirmNo').click();
                    }
                };
            });
        };
        
        confirmReset().then((confirmed) => {
            if (!confirmed) return;
            
            // Add loading state to reset button
            resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
            resetBtn.disabled = true;
            
            setTimeout(() => {
                this.selectedImages = [];
                this.selectedLayout = '';
                this.gridColumns = 'auto';
                this.borderWidth = 5;
                this.borderColor = '#000000';
                this.outputQuality = 0.9;
                this.outputFormat = 'png';
                this.targetFileSize = null;
                this.enableFileSizeTarget = false;
                this.resultCanvas = null;
                
                // Reset UI elements
                const elementsToReset = [
                    { id: 'selectedImages', action: 'innerHTML', value: '' },
                    { id: 'gridCols', action: 'value', value: 'auto' },
                    { id: 'borderWidth', action: 'value', value: '5' },
                    { id: 'borderWidthValue', action: 'textContent', value: '5px' },
                    { id: 'borderColor', action: 'value', value: '#000000' },
                    { id: 'outputQuality', action: 'value', value: '0.9' },
                    { id: 'qualityValue', action: 'textContent', value: '90%' },
                    { id: 'outputFormat', action: 'value', value: 'png' },
                    { id: 'targetFileSize', action: 'value', value: '500' },
                    { id: 'fileSizeValue', action: 'textContent', value: '500 KB' },
                    { id: 'imageInput', action: 'value', value: '' }
                ];
                
                elementsToReset.forEach(item => {
                    const element = document.getElementById(item.id);
                    if (element) {
                        element[item.action] = item.value;
                        if (item.id === 'targetFileSize') {
                            element.disabled = true;
                        }
                    }
                });
                
                // Reset checkboxes and other elements
                const enableFileSizeTarget = document.getElementById('enableFileSizeTarget');
                if (enableFileSizeTarget) enableFileSizeTarget.checked = false;
                
                const outputQuality = document.getElementById('outputQuality');
                if (outputQuality) outputQuality.disabled = false;
                
                // Remove selections
                document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
                
                // Hide settings panels
                ['gridSettings', 'borderSettings', 'qualitySettings'].forEach(id => {
                    const element = document.getElementById(id);
                    if (element) element.style.display = 'none';
                });
                
                // Hide controls
                ['.quality-control', '.file-size-control'].forEach(selector => {
                    const element = document.querySelector(selector);
                    if (element) element.style.display = 'none';
                });
                
                // Update color preview
                const preview = document.querySelector('.color-preview');
                if (preview) preview.style.background = '#000000';
                
                // Success animation for reset button
                resetBtn.innerHTML = '<i class="fas fa-check"></i> Reset Complete!';
                resetBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                
                setTimeout(() => {
                    resetBtn.innerHTML = originalText;
                    resetBtn.disabled = false;
                    resetBtn.style.background = '';
                }, 1500);
                
                // Show first step
                this.showStep('step1');
                
                // Add smooth scrolling to top
                setTimeout(() => {
                    const step1 = document.getElementById('step1');
                    if (step1) {
                        step1.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start',
                            inline: 'nearest'
                        });
                    }
                }, 100);
                
                this.showNotification('Ready to merge new images!', 'success');
            }, 800);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add styles for notifications
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    max-width: 400px;
                    font-weight: 500;
                    animation: slideInRight 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .notification-success {
                    border-left: 4px solid #28a745;
                    color: #28a745;
                    background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);
                }
                
                .notification-error {
                    border-left: 4px solid #dc3545;
                    color: #dc3545;
                    background: linear-gradient(135deg, #fff8f8 0%, #ffe8e8 100%);
                }
                
                .notification-info {
                    border-left: 4px solid #667eea;
                    color: #667eea;
                    background: linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%);
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    opacity: 0.7;
                    transition: all 0.2s ease;
                    margin-left: auto;
                }
                
                .notification-close:hover {
                    opacity: 1;
                    background: rgba(0,0,0,0.1);
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                this.hideNotification(notification);
            }
        }, 5000);
    }

    hideNotification(notification) {
        notification.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    showLoadingOverlay(message = 'Processing...') {
        // Remove existing overlay if any
        this.hideLoadingOverlay();
        
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3>${message}</h3>
                <p>Please wait while we process your images</p>
            </div>
        `;
        
        // Add styles for loading overlay
        if (!document.querySelector('#loading-overlay-styles')) {
            const styles = document.createElement('style');
            styles.id = 'loading-overlay-styles';
            styles.textContent = `
                #loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    backdrop-filter: blur(10px);
                    animation: fadeIn 0.3s ease-out;
                }
                
                .loading-content {
                    background: white;
                    padding: 3rem;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                    max-width: 400px;
                    animation: scaleIn 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
                }
                
                .loading-spinner {
                    width: 60px;
                    height: 60px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1.5rem;
                }
                
                .loading-content h3 {
                    margin: 0 0 0.5rem;
                    color: #333;
                    font-size: 1.5rem;
                    font-weight: 600;
                }
                
                .loading-content p {
                    margin: 0;
                    color: #666;
                    font-size: 1rem;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                @keyframes scaleIn {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(overlay);
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease-in';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Image Merge Tool...');
    try {
        window.imageMergeTool = new ImageMergeTool();
        console.log('Image Merge Tool initialized successfully');
        
        // Create a global merge function as backup
        window.startMerging = function() {
            console.log('Global merge function called');
            if (window.imageMergeTool) {
                console.log('Calling mergeImages...');
                window.imageMergeTool.mergeImages();
            } else {
                console.error('Image merge tool not available');
            }
        };
        
        // Test function to verify everything is working
        window.testMerge = function() {
            console.log('Test merge function');
            alert('Merge function is accessible!');
        };
        
        // Add a test button click handler
        const mergeBtn = document.getElementById('mergeBtn');
        if (mergeBtn) {
            console.log('Merge button found');
            // Add a direct click listener as backup
            mergeBtn.onclick = function() {
                console.log('Direct onclick handler triggered');
                window.startMerging();
            };
        } else {
            console.error('Merge button not found');
        }
    } catch (error) {
        console.error('Error initializing Image Merge Tool:', error);
    }
});

// Handle window resize for responsive canvas
window.addEventListener('resize', () => {
    // Redraw result canvas if it exists
    if (window.imageMergeTool && window.imageMergeTool.resultCanvas) {
        const resultCanvas = document.getElementById('resultCanvas');
        if (resultCanvas && resultCanvas.style.display !== 'none') {
            // Canvas automatically scales with CSS, no need to redraw
        }
    }
});

// Handle paste event for images
document.addEventListener('paste', (e) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0 && window.imageMergeTool) {
        e.preventDefault();
        imageItems.forEach(item => {
            const file = item.getAsFile();
            if (file) {
                window.imageMergeTool.addImage(file);
            }
        });
        window.imageMergeTool.showNotification('Images pasted from clipboard!', 'success');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!window.imageMergeTool) return;
    
    // Ctrl/Cmd + V for paste (handled above)
    // Ctrl/Cmd + O for open files
    if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        document.getElementById('imageInput').click();
    }
    
    // Escape to reset
    if (e.key === 'Escape') {
        e.preventDefault();
        if (confirm('Are you sure you want to start over?')) {
            window.imageMergeTool.reset();
        }
    }
    
    // Enter to merge (if merge button is enabled)
    if (e.key === 'Enter') {
        const mergeBtn = document.getElementById('mergeBtn');
        if (mergeBtn && !mergeBtn.disabled) {
            e.preventDefault();
            window.imageMergeTool.mergeImages();
        }
    }
});
