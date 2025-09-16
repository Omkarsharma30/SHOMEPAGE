class ColorPicker {
    constructor() {
        this.canvas = document.getElementById('colorCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasSize = 300;
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        
        // Image canvas for color extraction
        this.imageCanvas = document.getElementById('imageCanvas');
        this.imageCtx = this.imageCanvas.getContext('2d');
        this.uploadedImage = null;
        this.eyedropperActive = false;
        
        this.currentColor = { r: 255, g: 0, b: 0 };
        this.brightness = 1;
        this.saturation = 1;
        this.hue = 0;
        
        this.colorHistory = [];
        this.savedPalettes = JSON.parse(localStorage.getItem('colorPalettes')) || [];
        this.currentPalette = [];
        
        // Color name database
        this.colorNames = this.initColorDatabase();
        
        // ColorHunt-style palettes
        this.colorHuntPalettes = this.initColorHuntPalettes();
        this.currentFilter = 'all';
        this.currentSort = 'popular';
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupImageUpload();
        this.setupColorHuntInterface();
        this.updateColorDisplay();
        this.loadSavedPalettes();
        this.generatePresetColors();
        this.displayColorHuntPalettes();
    }

    initColorHuntPalettes() {
        return [
            {
                id: 1,
                name: "Sunset Vibes",
                colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#F9CA24"],
                tags: ["warm", "sunset", "vibrant"],
                category: "trending",
                likes: 342,
                date: "2025-09-15"
            },
            {
                id: 2,
                name: "Ocean Breeze",
                colors: ["#006BA6", "#0496FF", "#FFBC42", "#D81159"],
                tags: ["cool", "ocean", "fresh"],
                category: "popular",
                likes: 287,
                date: "2025-09-14"
            },
            {
                id: 3,
                name: "Forest Dreams",
                colors: ["#2D5016", "#61A844", "#B4D455", "#F2F5EA"],
                tags: ["nature", "green", "calm"],
                category: "trending",
                likes: 195,
                date: "2025-09-13"
            },
            {
                id: 4,
                name: "Purple Haze",
                colors: ["#6C5CE7", "#A29BFE", "#FD79A8", "#FDCB6E"],
                tags: ["purple", "dreamy", "gradient"],
                category: "gradient",
                likes: 421,
                date: "2025-09-12"
            },
            {
                id: 5,
                name: "Minimal Dark",
                colors: ["#2C3E50", "#34495E", "#95A5A6", "#ECF0F1"],
                tags: ["dark", "minimal", "professional"],
                category: "dark",
                likes: 156,
                date: "2025-09-11"
            },
            {
                id: 6,
                name: "Candy Pop",
                colors: ["#FF9FF3", "#F368E0", "#3742FA", "#2F3542"],
                tags: ["bright", "candy", "pop"],
                category: "bright",
                likes: 298,
                date: "2025-09-10"
            },
            {
                id: 7,
                name: "Autumn Leaves",
                colors: ["#E17055", "#FDCB6E", "#E84393", "#6C5CE7"],
                tags: ["autumn", "warm", "seasonal"],
                category: "trending",
                likes: 223,
                date: "2025-09-09"
            },
            {
                id: 8,
                name: "Pastel Dream",
                colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9"],
                tags: ["pastel", "soft", "dreamy"],
                category: "pastel",
                likes: 189,
                date: "2025-09-08"
            },
            {
                id: 9,
                name: "Neon City",
                colors: ["#FF073A", "#39FF14", "#00FFFF", "#FF00FF"],
                tags: ["neon", "city", "electric"],
                category: "bright",
                likes: 445,
                date: "2025-09-07"
            },
            {
                id: 10,
                name: "Monochrome Classic",
                colors: ["#000000", "#404040", "#808080", "#FFFFFF"],
                tags: ["monochrome", "classic", "simple"],
                category: "monochrome",
                likes: 167,
                date: "2025-09-06"
            },
            {
                id: 11,
                name: "Spring Fresh",
                colors: ["#98FB98", "#90EE90", "#00FA9A", "#00FF7F"],
                tags: ["spring", "fresh", "green"],
                category: "trending",
                likes: 276,
                date: "2025-09-05"
            },
            {
                id: 12,
                name: "Fire Gradient",
                colors: ["#FF0000", "#FF4500", "#FF8C00", "#FFD700"],
                tags: ["fire", "gradient", "warm"],
                category: "gradient",
                likes: 334,
                date: "2025-09-04"
            },
            {
                id: 13,
                name: "Cool Blues",
                colors: ["#1E3A8A", "#3B82F6", "#60A5FA", "#DBEAFE"],
                tags: ["blue", "cool", "professional"],
                category: "popular",
                likes: 201,
                date: "2025-09-03"
            },
            {
                id: 14,
                name: "Vintage Rose",
                colors: ["#F8BBD9", "#E4C1F9", "#A9DEF9", "#FCF6BD"],
                tags: ["vintage", "rose", "soft"],
                category: "pastel",
                likes: 312,
                date: "2025-09-02"
            },
            {
                id: 15,
                name: "Dark Mode",
                colors: ["#0F0F23", "#16213E", "#1A1A2E", "#E94560"],
                tags: ["dark", "mode", "ui"],
                category: "dark",
                likes: 389,
                date: "2025-09-01"
            }
        ];
    }

    setupColorHuntInterface() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.displayColorHuntPalettes();
            });
        });

        // Sort dropdown
        const sortSelect = document.getElementById('sortPalettes');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.currentSort = sortSelect.value;
                this.displayColorHuntPalettes();
            });
        }

        // Search input
        const searchInput = document.getElementById('paletteSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.searchPalettes(searchInput.value);
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMorePalettes');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.generateMorePalettes();
            });
        }

        // Custom palette creator
        this.setupPaletteCreator();
    }

    setupPaletteCreator() {
        // Generate random palette
        const generateBtn = document.getElementById('generateRandomPalette');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateRandomCustomPalette();
            });
        }

        // Color slot inputs
        const colorSlots = document.querySelectorAll('.color-slot');
        colorSlots.forEach(slot => {
            const colorInput = slot.querySelector('input[type="color"]');
            const colorDisplay = slot.querySelector('.color-display');
            const removeBtn = slot.querySelector('.remove-color');

            if (colorInput && colorDisplay) {
                colorInput.addEventListener('change', () => {
                    colorDisplay.style.backgroundColor = colorInput.value;
                });

                colorDisplay.addEventListener('click', () => {
                    colorInput.click();
                });
            }

            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    slot.remove();
                });
            }
        });

        // Add color slot
        const addColorBtn = document.getElementById('addColorSlot');
        if (addColorBtn) {
            addColorBtn.addEventListener('click', () => {
                this.addNewColorSlot();
            });
        }

        // Palette actions
        document.getElementById('saveCustomPalette')?.addEventListener('click', () => {
            this.saveCustomPalette();
        });

        document.getElementById('exportPalette')?.addEventListener('click', () => {
            this.exportCustomPalette();
        });

        document.getElementById('sharePalette')?.addEventListener('click', () => {
            this.shareCustomPalette();
        });
    }

    displayColorHuntPalettes() {
        const grid = document.getElementById('colorhuntGrid');
        if (!grid) return;

        let palettes = [...this.colorHuntPalettes];

        // Filter palettes
        if (this.currentFilter !== 'all') {
            palettes = palettes.filter(palette => palette.category === this.currentFilter);
        }

        // Sort palettes
        switch (this.currentSort) {
            case 'popular':
                palettes.sort((a, b) => b.likes - a.likes);
                break;
            case 'newest':
                palettes.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'trending':
                palettes = palettes.filter(p => p.category === 'trending').concat(
                    palettes.filter(p => p.category !== 'trending')
                );
                break;
            case 'random':
                palettes = this.shuffleArray(palettes);
                break;
        }

        // Clear and populate grid
        grid.innerHTML = '';
        palettes.forEach(palette => {
            const paletteCard = this.createPaletteCard(palette);
            grid.appendChild(paletteCard);
        });
    }

    createPaletteCard(palette) {
        const card = document.createElement('div');
        card.className = 'palette-card';
        card.setAttribute('data-palette-id', palette.id);

        const colorsStrip = document.createElement('div');
        colorsStrip.className = 'palette-colors-strip';

        palette.colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'palette-color';
            colorDiv.style.backgroundColor = color;
            colorDiv.setAttribute('data-color', color);
            
            colorDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                const rgb = this.hexToRgb(color);
                if (rgb) {
                    this.setColor(rgb.r, rgb.g, rgb.b);
                    this.showNotification(`Selected color: ${color}`);
                }
            });

            colorsStrip.appendChild(colorDiv);
        });

        const info = document.createElement('div');
        info.className = 'palette-info';

        const title = document.createElement('div');
        title.className = 'palette-title';
        title.textContent = palette.name;

        const tags = document.createElement('div');
        tags.className = 'palette-tags';
        palette.tags.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'palette-tag';
            tagSpan.textContent = tag;
            tags.appendChild(tagSpan);
        });

        const stats = document.createElement('div');
        stats.className = 'palette-stats';
        stats.innerHTML = `
            <div class="palette-likes">
                <i class="fas fa-heart"></i>
                <span>${palette.likes}</span>
            </div>
            <div class="palette-date">${new Date(palette.date).toLocaleDateString()}</div>
        `;

        info.appendChild(title);
        info.appendChild(tags);
        info.appendChild(stats);

        card.appendChild(colorsStrip);
        card.appendChild(info);

        // Add click event to copy entire palette
        card.addEventListener('click', () => {
            this.copyPaletteToClipboard(palette);
        });

        return card;
    }

    searchPalettes(query) {
        if (!query.trim()) {
            this.displayColorHuntPalettes();
            return;
        }

        const filtered = this.colorHuntPalettes.filter(palette => 
            palette.name.toLowerCase().includes(query.toLowerCase()) ||
            palette.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        const grid = document.getElementById('colorhuntGrid');
        if (grid) {
            grid.innerHTML = '';
            filtered.forEach(palette => {
                const paletteCard = this.createPaletteCard(palette);
                grid.appendChild(paletteCard);
            });
        }
    }

    generateMorePalettes() {
        // Generate additional random palettes
        const newPalettes = [];
        const paletteNames = [
            "Digital Sunset", "Arctic Glow", "Tropical Paradise", "Urban Night",
            "Coral Reef", "Mountain Mist", "Desert Storm", "Northern Lights",
            "Vintage Film", "Neon Dreams", "Earth Tones", "Cosmic Dust"
        ];

        for (let i = 0; i < 6; i++) {
            const colors = [];
            for (let j = 0; j < 4; j++) {
                colors.push(this.generateRandomHex());
            }

            newPalettes.push({
                id: this.colorHuntPalettes.length + i + 1,
                name: paletteNames[Math.floor(Math.random() * paletteNames.length)],
                colors: colors,
                tags: ["generated", "random", "new"],
                category: "trending",
                likes: Math.floor(Math.random() * 100) + 50,
                date: new Date().toISOString().split('T')[0]
            });
        }

        this.colorHuntPalettes.push(...newPalettes);
        this.displayColorHuntPalettes();
        this.showNotification('6 new palettes loaded!');
    }

    generateRandomCustomPalette() {
        const slots = document.querySelectorAll('.color-slot');
        slots.forEach(slot => {
            const colorInput = slot.querySelector('input[type="color"]');
            const colorDisplay = slot.querySelector('.color-display');
            if (colorInput && colorDisplay) {
                const randomColor = this.generateRandomHex();
                colorInput.value = randomColor;
                colorDisplay.style.backgroundColor = randomColor;
            }
        });
        this.showNotification('Random palette generated!');
    }

    generateRandomHex() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    addNewColorSlot() {
        const colorSlots = document.querySelector('.color-slots');
        const slotCount = document.querySelectorAll('.color-slot').length;
        
        if (slotCount >= 8) {
            this.showNotification('Maximum 8 colors per palette');
            return;
        }

        const newSlot = document.createElement('div');
        newSlot.className = 'color-slot';
        newSlot.setAttribute('data-slot', slotCount);
        
        const randomColor = this.generateRandomHex();
        newSlot.innerHTML = `
            <div class="color-display" style="background: ${randomColor};"></div>
            <input type="color" value="${randomColor}">
            <button class="remove-color"><i class="fas fa-times"></i></button>
        `;

        // Add event listeners to new slot
        const colorInput = newSlot.querySelector('input[type="color"]');
        const colorDisplay = newSlot.querySelector('.color-display');
        const removeBtn = newSlot.querySelector('.remove-color');

        colorInput.addEventListener('change', () => {
            colorDisplay.style.backgroundColor = colorInput.value;
        });

        colorDisplay.addEventListener('click', () => {
            colorInput.click();
        });

        removeBtn.addEventListener('click', () => {
            newSlot.remove();
        });

        const addSlot = document.querySelector('.add-color-slot');
        colorSlots.insertBefore(newSlot, addSlot);
    }

    saveCustomPalette() {
        const slots = document.querySelectorAll('.color-slot');
        const colors = Array.from(slots).map(slot => {
            return slot.querySelector('input[type="color"]').value.toUpperCase();
        });

        if (colors.length < 2) {
            this.showNotification('Add at least 2 colors to save palette');
            return;
        }

        const name = prompt('Enter palette name:') || `Custom Palette ${Date.now()}`;
        
        const newPalette = {
            id: this.colorHuntPalettes.length + 1,
            name: name,
            colors: colors,
            tags: ["custom", "user-created"],
            category: "popular",
            likes: 0,
            date: new Date().toISOString().split('T')[0]
        };

        this.colorHuntPalettes.unshift(newPalette);
        this.displayColorHuntPalettes();
        this.showNotification('Custom palette saved!');
    }

    exportCustomPalette() {
        const slots = document.querySelectorAll('.color-slot');
        const colors = Array.from(slots).map(slot => {
            return slot.querySelector('input[type="color"]').value.toUpperCase();
        });

        const paletteData = {
            name: "Custom Palette",
            colors: colors,
            created: new Date().toISOString()
        };

        const dataStr = JSON.stringify(paletteData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'color-palette.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Palette exported as JSON!');
    }

    shareCustomPalette() {
        const slots = document.querySelectorAll('.color-slot');
        const colors = Array.from(slots).map(slot => {
            return slot.querySelector('input[type="color"]').value.toUpperCase();
        });

        const paletteText = `Check out this color palette: ${colors.join(', ')}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Custom Color Palette',
                text: paletteText
            });
        } else {
            navigator.clipboard.writeText(paletteText).then(() => {
                this.showNotification('Palette link copied to clipboard!');
            });
        }
    }

    copyPaletteToClipboard(palette) {
        const colorsText = palette.colors.join(', ');
        navigator.clipboard.writeText(colorsText).then(() => {
            this.showNotification(`Copied "${palette.name}" palette: ${colorsText}`);
        });
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    initColorDatabase() {
        return {
            '#FF0000': 'Red',
            '#00FF00': 'Lime',
            '#0000FF': 'Blue',
            '#FFFF00': 'Yellow',
            '#FF00FF': 'Magenta',
            '#00FFFF': 'Cyan',
            '#000000': 'Black',
            '#FFFFFF': 'White',
            '#808080': 'Gray',
            '#800000': 'Maroon',
            '#808000': 'Olive',
            '#008000': 'Green',
            '#800080': 'Purple',
            '#008080': 'Teal',
            '#000080': 'Navy',
            '#C0C0C0': 'Silver',
            '#FFA500': 'Orange',
            '#FFC0CB': 'Pink',
            '#A52A2A': 'Brown',
            '#FFFFE0': 'Light Yellow',
            '#F0E68C': 'Khaki',
            '#E6E6FA': 'Lavender',
            '#FFE4E1': 'Misty Rose',
            '#DCDCDC': 'Gainsboro',
            '#FF6347': 'Tomato',
            '#40E0D0': 'Turquoise',
            '#EE82EE': 'Violet',
            '#F5DEB3': 'Wheat',
            '#FFFFFF': 'White',
            '#9ACD32': 'Yellow Green',
            '#FF1493': 'Deep Pink',
            '#1E90FF': 'Dodger Blue',
            '#32CD32': 'Lime Green',
            '#FFD700': 'Gold',
            '#DC143C': 'Crimson',
            '#00CED1': 'Dark Turquoise',
            '#9370DB': 'Medium Purple',
            '#20B2AA': 'Light Sea Green',
            '#87CEEB': 'Sky Blue',
            '#F4A460': 'Sandy Brown',
            '#DA70D6': 'Orchid',
            '#87CEFA': 'Light Sky Blue',
            '#FF7F50': 'Coral',
            '#6495ED': 'Cornflower Blue',
            '#DDA0DD': 'Plum',
            '#98FB98': 'Pale Green',
            '#F0E68C': 'Khaki',
            '#FF69B4': 'Hot Pink',
            '#CD853F': 'Peru',
            '#FFDAB9': 'Peach Puff'
        };
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        
        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files[0] && files[0].type.startsWith('image/')) {
                this.handleImageUpload(files[0]);
            }
        });
        
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });
        
        imageInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleImageUpload(e.target.files[0]);
            }
        });
        
        // Image tools event listeners
        document.getElementById('extractDominantColors').addEventListener('click', () => {
            this.extractDominantColors();
        });
        
        document.getElementById('extractPalette').addEventListener('click', () => {
            this.extractColorPalette();
        });
        
        document.getElementById('enableEyedropper').addEventListener('click', () => {
            this.toggleEyedropper();
        });
    }

    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.uploadedImage = img;
                this.displayUploadedImage();
                document.getElementById('uploadArea').style.display = 'none';
                document.getElementById('imagePreviewContainer').style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayUploadedImage() {
        const canvas = this.imageCanvas;
        const ctx = this.imageCtx;
        const img = this.uploadedImage;
        
        // Calculate display size maintaining aspect ratio
        const maxWidth = 600;
        const maxHeight = 400;
        let { width, height } = img;
        
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Add click event for color picking
        canvas.addEventListener('click', (e) => {
            if (this.eyedropperActive) {
                this.pickColorFromImage(e);
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (this.eyedropperActive) {
                this.updateEyedropperCursor(e);
            }
        });
    }

    toggleEyedropper() {
        this.eyedropperActive = !this.eyedropperActive;
        const btn = document.getElementById('enableEyedropper');
        const cursor = document.getElementById('eyedropperCursor');
        
        if (this.eyedropperActive) {
            btn.innerHTML = '<i class="fas fa-times"></i> Disable Eyedropper';
            btn.classList.add('active');
            this.imageCanvas.style.cursor = 'none';
            cursor.style.display = 'block';
        } else {
            btn.innerHTML = '<i class="fas fa-eye-dropper"></i> Eyedropper Tool';
            btn.classList.remove('active');
            this.imageCanvas.style.cursor = 'crosshair';
            cursor.style.display = 'none';
        }
    }

    updateEyedropperCursor(e) {
        const cursor = document.getElementById('eyedropperCursor');
        const rect = this.imageCanvas.getBoundingClientRect();
        cursor.style.left = (e.clientX - rect.left - 10) + 'px';
        cursor.style.top = (e.clientY - rect.top - 10) + 'px';
    }

    pickColorFromImage(e) {
        const rect = this.imageCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const imageData = this.imageCtx.getImageData(x, y, 1, 1);
        const [r, g, b] = imageData.data;
        
        this.setColor(r, g, b);
        this.showNotification(`Picked color: rgb(${r}, ${g}, ${b})`);
    }

    extractDominantColors() {
        if (!this.uploadedImage) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.uploadedImage.width;
        canvas.height = this.uploadedImage.height;
        ctx.drawImage(this.uploadedImage, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = this.analyzeDominantColors(imageData.data);
        
        this.displayExtractedColors(colors, 'Dominant Colors');
    }

    extractColorPalette() {
        if (!this.uploadedImage) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.uploadedImage.width;
        canvas.height = this.uploadedImage.height;
        ctx.drawImage(this.uploadedImage, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const palette = this.generateColorPalette(imageData.data);
        
        this.displayExtractedColors(palette, 'Color Palette');
    }

    analyzeDominantColors(pixelData) {
        const colorMap = new Map();
        const step = 4; // Skip some pixels for performance
        
        for (let i = 0; i < pixelData.length; i += step * 4) {
            const r = pixelData[i];
            const g = pixelData[i + 1];
            const b = pixelData[i + 2];
            const a = pixelData[i + 3];
            
            if (a < 128) continue; // Skip transparent pixels
            
            // Group similar colors
            const colorKey = `${Math.floor(r/20)*20},${Math.floor(g/20)*20},${Math.floor(b/20)*20}`;
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
        }
        
        // Sort by frequency and get top colors
        const sortedColors = [...colorMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([color]) => {
                const [r, g, b] = color.split(',').map(Number);
                return { r, g, b };
            });
        
        return sortedColors;
    }

    generateColorPalette(pixelData) {
        const colors = this.analyzeDominantColors(pixelData);
        const palette = [];
        
        // Add original colors
        palette.push(...colors.slice(0, 4));
        
        // Generate harmony colors from dominant color
        if (colors.length > 0) {
            const baseColor = colors[0];
            const hsl = this.rgbToHsl(baseColor.r, baseColor.g, baseColor.b);
            
            // Add complementary
            const compHue = (hsl.h + 180) % 360;
            palette.push(this.hslToRgb(compHue, hsl.s, hsl.l));
            
            // Add triadic
            const tri1Hue = (hsl.h + 120) % 360;
            const tri2Hue = (hsl.h + 240) % 360;
            palette.push(this.hslToRgb(tri1Hue, hsl.s, hsl.l));
            palette.push(this.hslToRgb(tri2Hue, hsl.s, hsl.l));
            
            // Add lighter and darker versions
            palette.push(this.hslToRgb(hsl.h, hsl.s, Math.min(hsl.l + 0.2, 1)));
        }
        
        return palette.slice(0, 8);
    }

    displayExtractedColors(colors, title) {
        const container = document.getElementById('extractedColors');
        container.innerHTML = `<h4>${title}</h4>`;
        
        colors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'extracted-color';
            const hex = this.rgbToHex(color.r, color.g, color.b);
            colorDiv.style.backgroundColor = hex;
            colorDiv.setAttribute('data-color', hex);
            colorDiv.title = `${hex} - Click to use`;
            
            colorDiv.addEventListener('click', () => {
                this.setColor(color.r, color.g, color.b);
                this.showNotification(`Selected: ${hex}`);
            });
            
            container.appendChild(colorDiv);
        });
    }

    findClosestColorName(r, g, b) {
        const targetHex = this.rgbToHex(r, g, b);
        
        if (this.colorNames[targetHex]) {
            return this.colorNames[targetHex];
        }
        
        // Find closest match by color distance
        let closestColor = 'Unknown';
        let minDistance = Infinity;
        
        for (const [hex, name] of Object.entries(this.colorNames)) {
            const color = this.hexToRgb(hex);
            if (color) {
                const distance = Math.sqrt(
                    Math.pow(r - color.r, 2) +
                    Math.pow(g - color.g, 2) +
                    Math.pow(b - color.b, 2)
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = name;
                }
            }
        }
        
        return closestColor;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    analyzeColorTemperature(r, g, b) {
        // Simple color temperature analysis
        const warmColors = r + g * 0.5;
        const coolColors = b + g * 0.3;
        
        if (warmColors > coolColors * 1.3) {
            return { temp: 'Warm', position: 75 };
        } else if (coolColors > warmColors * 1.3) {
            return { temp: 'Cool', position: 25 };
        } else {
            return { temp: 'Neutral', position: 50 };
        }
    }

    analyzeColorPsychology(r, g, b) {
        const hsl = this.rgbToHsl(r, g, b);
        const hue = hsl.h;
        const saturation = hsl.s;
        const lightness = hsl.l;
        
        let mood = [];
        
        // Hue-based psychology
        if (hue >= 0 && hue < 30) mood.push('Energetic', 'Passionate');
        else if (hue >= 30 && hue < 60) mood.push('Optimistic', 'Creative');
        else if (hue >= 60 && hue < 120) mood.push('Natural', 'Calming');
        else if (hue >= 120 && hue < 180) mood.push('Fresh', 'Harmonious');
        else if (hue >= 180 && hue < 240) mood.push('Trustworthy', 'Peaceful');
        else if (hue >= 240 && hue < 300) mood.push('Luxurious', 'Creative');
        else mood.push('Romantic', 'Imaginative');
        
        // Saturation influence
        if (saturation > 0.7) mood.push('Vibrant');
        else if (saturation < 0.3) mood.push('Subtle');
        
        // Lightness influence
        if (lightness > 0.7) mood.push('Light', 'Airy');
        else if (lightness < 0.3) mood.push('Dark', 'Dramatic');
        
        return mood.slice(0, 3).join(', ');
    }

    calculateContrastRatio(r, g, b) {
        // Calculate contrast against white and black
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        const contrastWhite = (1 + 0.05) / (luminance + 0.05);
        const contrastBlack = (luminance + 0.05) / (0 + 0.05);
        
        const contrast = Math.max(contrastWhite, contrastBlack);
        
        const aaPass = contrast >= 4.5;
        const aaaPass = contrast >= 7;
        
        return `AA: ${aaPass ? '✓' : '✗'} | AAA: ${aaaPass ? '✓' : '✗'}`;
    }

    setupCanvas() {
        // Create color wheel
        this.drawColorWheel();
        
        // Setup canvas click event
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const imageData = this.ctx.getImageData(x, y, 1, 1);
            const [r, g, b] = imageData.data;
            
            if (r || g || b) { // Ensure it's not transparent
                this.setColor(r, g, b);
            }
        });
    }

    drawColorWheel() {
        const centerX = this.canvasSize / 2;
        const centerY = this.canvasSize / 2;
        const radius = this.canvasSize / 2 - 10;
        
        // Draw color wheel
        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 1) * Math.PI / 180;
            const endAngle = angle * Math.PI / 180;
            
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = `hsl(${angle}, 100%, 50%)`;
            this.ctx.stroke();
        }
        
        // Draw saturation/brightness gradient
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius - 20);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius - 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    setupEventListeners() {
        // Format input listeners
        document.getElementById('hexInput').addEventListener('input', (e) => {
            this.setColorFromHex(e.target.value);
        });

        document.getElementById('rgbR').addEventListener('input', () => this.setColorFromRGB());
        document.getElementById('rgbG').addEventListener('input', () => this.setColorFromRGB());
        document.getElementById('rgbB').addEventListener('input', () => this.setColorFromRGB());

        document.getElementById('hslH').addEventListener('input', () => this.setColorFromHSL());
        document.getElementById('hslS').addEventListener('input', () => this.setColorFromHSL());
        document.getElementById('hslL').addEventListener('input', () => this.setColorFromHSL());

        // Action button listeners
        document.getElementById('copyHex').addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('hexInput').value);
        });

        document.getElementById('copyRgb').addEventListener('click', () => {
            const r = document.getElementById('rgbR').value;
            const g = document.getElementById('rgbG').value;
            const b = document.getElementById('rgbB').value;
            this.copyToClipboard(`rgb(${r}, ${g}, ${b})`);
        });

        document.getElementById('addToHistory').addEventListener('click', () => {
            this.addToColorHistory();
        });

        document.getElementById('generateHarmony').addEventListener('click', () => {
            this.generateColorHarmony();
        });

        document.getElementById('savePalette').addEventListener('click', () => {
            this.savePalette();
        });

        document.getElementById('clearPalette').addEventListener('click', () => {
            this.clearCurrentPalette();
        });

        // Add color analysis button listener
        const analyzeColorBtn = document.getElementById('analyzeColor');
        if (analyzeColorBtn) {
            analyzeColorBtn.addEventListener('click', () => {
                this.updateColorAnalysis();
                this.showNotification('Color analysis updated!');
            });
        }
    }

    setColor(r, g, b) {
        this.currentColor = { r, g, b };
        this.updateColorDisplay();
        this.updateFormatInputs();
        this.updateColorName();
        this.updateColorAnalysis();
    }

    setColorFromHex(hex) {
        if (hex.length === 7 && hex[0] === '#') {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            this.setColor(r, g, b);
        }
    }

    setColorFromRGB() {
        const r = parseInt(document.getElementById('rgbR').value);
        const g = parseInt(document.getElementById('rgbG').value);
        const b = parseInt(document.getElementById('rgbB').value);
        this.setColor(r, g, b);
    }

    setColorFromHSL() {
        const h = parseInt(document.getElementById('hslH').value);
        const s = parseInt(document.getElementById('hslS').value);
        const l = parseInt(document.getElementById('hslL').value);
        
        const rgb = this.hslToRgb(h, s / 100, l / 100);
        this.setColor(rgb.r, rgb.g, rgb.b);
    }

    updateColorDisplay() {
        const { r, g, b } = this.currentColor;
        const colorString = `rgb(${r}, ${g}, ${b})`;
        
        document.getElementById('selectedColor').style.backgroundColor = colorString;
        const colorPreview = document.querySelector('.color-preview');
        if (colorPreview) {
            colorPreview.style.backgroundColor = colorString;
        }
    }

    updateColorName() {
        const { r, g, b } = this.currentColor;
        const colorName = this.findClosestColorName(r, g, b);
        const colorNameElement = document.getElementById('colorNameValue');
        if (colorNameElement) {
            colorNameElement.textContent = colorName;
        }
    }

    updateColorAnalysis() {
        const { r, g, b } = this.currentColor;
        
        // Update temperature analysis
        const tempAnalysis = this.analyzeColorTemperature(r, g, b);
        const tempValue = document.getElementById('tempValue');
        if (tempValue) {
            tempValue.textContent = tempAnalysis.temp;
        }
        
        // Update accessibility
        const contrastInfo = this.calculateContrastRatio(r, g, b);
        const contrastRatio = document.getElementById('contrastRatio');
        if (contrastRatio) {
            contrastRatio.textContent = contrastInfo;
        }
        
        // Update psychology
        const psychology = this.analyzeColorPsychology(r, g, b);
        const colorMood = document.getElementById('colorMood');
        if (colorMood) {
            colorMood.textContent = psychology;
        }
    }

    updateFormatInputs() {
        const { r, g, b } = this.currentColor;
        
        // Update HEX
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        document.getElementById('hexInput').value = hex;
        
        // Update RGB
        document.getElementById('rgbR').value = r;
        document.getElementById('rgbG').value = g;
        document.getElementById('rgbB').value = b;
        
        // Update HSL
        const hsl = this.rgbToHsl(r, g, b);
        document.getElementById('hslH').value = Math.round(hsl.h);
        document.getElementById('hslS').value = Math.round(hsl.s * 100);
        document.getElementById('hslL').value = Math.round(hsl.l * 100);
        
        // Update HSV
        const hsv = this.rgbToHsv(r, g, b);
        document.getElementById('hsvH').value = Math.round(hsv.h);
        document.getElementById('hsvS').value = Math.round(hsv.s * 100);
        document.getElementById('hsvV').value = Math.round(hsv.v * 100);
        
        // Update CMYK
        const cmyk = this.rgbToCmyk(r, g, b);
        document.getElementById('cmykC').value = Math.round(cmyk.c * 100);
        document.getElementById('cmykM').value = Math.round(cmyk.m * 100);
        document.getElementById('cmykY').value = Math.round(cmyk.y * 100);
        document.getElementById('cmykK').value = Math.round(cmyk.k * 100);
    }

    // Color conversion functions
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s, l };
    }

    hslToRgb(h, s, l) {
        h /= 360;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        if (s === 0) {
            return { r: l * 255, g: l * 255, b: l * 255 };
        }
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        return {
            r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
            g: Math.round(hue2rgb(p, q, h) * 255),
            b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
        };
    }

    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        
        const v = max;
        const s = max === 0 ? 0 : d / max;
        
        let h;
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s, v };
    }

    rgbToCmyk(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const k = 1 - Math.max(r, g, b);
        const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
        const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
        const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
        
        return { c, m, y, k };
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Copied to clipboard!');
        });
    }

    addToColorHistory() {
        const { r, g, b } = this.currentColor;
        const colorString = `rgb(${r}, ${g}, ${b})`;
        
        if (!this.colorHistory.includes(colorString)) {
            this.colorHistory.unshift(colorString);
            if (this.colorHistory.length > 20) {
                this.colorHistory.pop();
            }
            this.updateColorHistory();
        }
    }

    updateColorHistory() {
        const historyContainer = document.getElementById('colorHistory');
        historyContainer.innerHTML = '';
        
        this.colorHistory.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = color;
            colorItem.title = color;
            
            colorItem.addEventListener('click', () => {
                const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
                if (match) {
                    this.setColor(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
                }
            });
            
            historyContainer.appendChild(colorItem);
        });
    }

    generateColorHarmony() {
        const { r, g, b } = this.currentColor;
        const hsl = this.rgbToHsl(r, g, b);
        const harmonyContainer = document.getElementById('harmonyColors');
        harmonyContainer.innerHTML = '';
        
        const harmonies = [
            { name: 'Complementary', offset: 180 },
            { name: 'Triadic 1', offset: 120 },
            { name: 'Triadic 2', offset: 240 },
            { name: 'Analogous 1', offset: 30 },
            { name: 'Analogous 2', offset: -30 },
            { name: 'Split Comp 1', offset: 150 },
            { name: 'Split Comp 2', offset: 210 }
        ];
        
        harmonies.forEach(harmony => {
            const newHue = (hsl.h + harmony.offset + 360) % 360;
            const harmonyRgb = this.hslToRgb(newHue, hsl.s, hsl.l);
            const colorString = `rgb(${harmonyRgb.r}, ${harmonyRgb.g}, ${harmonyRgb.b})`;
            
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = colorString;
            colorItem.title = `${harmony.name}: ${colorString}`;
            
            colorItem.addEventListener('click', () => {
                this.setColor(harmonyRgb.r, harmonyRgb.g, harmonyRgb.b);
            });
            
            harmonyContainer.appendChild(colorItem);
        });
    }

    savePalette() {
        if (this.currentPalette.length === 0) {
            this.showNotification('Add colors to palette first!');
            return;
        }
        
        const name = prompt('Enter palette name:');
        if (name) {
            const palette = {
                name,
                colors: [...this.currentPalette],
                date: new Date().toISOString()
            };
            
            this.savedPalettes.push(palette);
            localStorage.setItem('colorPalettes', JSON.stringify(this.savedPalettes));
            this.loadSavedPalettes();
            this.showNotification('Palette saved!');
        }
    }

    loadSavedPalettes() {
        const palettesContainer = document.getElementById('savedPalettes');
        palettesContainer.innerHTML = '';
        
        this.savedPalettes.forEach((palette, index) => {
            const paletteItem = document.createElement('div');
            paletteItem.className = 'palette-item';
            
            const paletteHeader = document.createElement('div');
            paletteHeader.className = 'palette-header';
            paletteHeader.innerHTML = `
                <span>${palette.name}</span>
                <button onclick="colorPicker.deletePalette(${index})" class="delete-btn">×</button>
            `;
            
            const paletteColors = document.createElement('div');
            paletteColors.className = 'palette-colors';
            
            palette.colors.forEach(color => {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'color-item small';
                colorDiv.style.backgroundColor = color;
                colorDiv.addEventListener('click', () => {
                    const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
                    if (match) {
                        this.setColor(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
                    }
                });
                paletteColors.appendChild(colorDiv);
            });
            
            paletteItem.appendChild(paletteHeader);
            paletteItem.appendChild(paletteColors);
            palettesContainer.appendChild(paletteItem);
        });
    }

    deletePalette(index) {
        this.savedPalettes.splice(index, 1);
        localStorage.setItem('colorPalettes', JSON.stringify(this.savedPalettes));
        this.loadSavedPalettes();
        this.showNotification('Palette deleted!');
    }

    clearCurrentPalette() {
        this.currentPalette = [];
        this.updateCurrentPalette();
        this.showNotification('Current palette cleared!');
    }

    addToCurrentPalette() {
        const { r, g, b } = this.currentColor;
        const colorString = `rgb(${r}, ${g}, ${b})`;
        
        if (!this.currentPalette.includes(colorString)) {
            this.currentPalette.push(colorString);
            this.updateCurrentPalette();
            this.showNotification('Color added to palette!');
        }
    }

    updateCurrentPalette() {
        const paletteContainer = document.getElementById('currentPalette');
        paletteContainer.innerHTML = '';
        
        this.currentPalette.forEach((color, index) => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = color;
            colorItem.title = color;
            
            colorItem.addEventListener('click', () => {
                const match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
                if (match) {
                    this.setColor(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
                }
            });
            
            colorItem.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.currentPalette.splice(index, 1);
                this.updateCurrentPalette();
            });
            
            paletteContainer.appendChild(colorItem);
        });
    }

    generatePresetColors() {
        const presetContainer = document.getElementById('presetColors');
        const presets = [
            '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
            '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
            '#800000', '#804000', '#808000', '#408000', '#008000', '#008040',
            '#008080', '#004080', '#000080', '#400080', '#800080', '#800040',
            '#400000', '#402000', '#404000', '#204000', '#004000', '#004020',
            '#004040', '#002040', '#000040', '#200040', '#400040', '#400020',
            '#FFFFFF', '#E0E0E0', '#C0C0C0', '#A0A0A0', '#808080', '#606060',
            '#404040', '#202020', '#000000', '#FFE0E0', '#E0FFE0', '#E0E0FF'
        ];
        
        presets.forEach(color => {
            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';
            colorItem.style.backgroundColor = color;
            colorItem.title = color;
            
            colorItem.addEventListener('click', () => {
                this.setColorFromHex(color);
            });
            
            presetContainer.appendChild(colorItem);
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
}

// Initialize the color picker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.colorPicker = new ColorPicker();
    
    // Add event listener for adding current color to palette
    document.getElementById('addToPalette').addEventListener('click', () => {
        colorPicker.addToCurrentPalette();
    });
    
    // Random color button
    document.getElementById('randomColor').addEventListener('click', () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        colorPicker.setColor(r, g, b);
    });
});

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 12px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1000;
        font-weight: 500;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .notification.show {
        transform: translateX(0);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);