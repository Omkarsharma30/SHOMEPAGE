// Enhanced Loading Screen Management
class LoadingScreenManager {
    constructor() {
        this.loadingTexts = [
            "Preparing your digital workspace...",
            "Loading educational tools...",
            "Setting up computer classes...",
            "Organizing study materials...",
            "Initializing learning environment...",
            "Getting everything ready for you..."
        ];
        this.currentTextIndex = 0;
        this.textInterval = null;
        this.progressBar = null;
        this.progress = 0;
        this.isLoaded = false;
        this.minDisplayTime = 4000; // Minimum 4 seconds display for better UX
        this.startTime = Date.now();
        this.resourcesLoaded = false;
        this.progressSteps = [
            { progress: 15, delay: 300, text: "Loading core components..." },
            { progress: 30, delay: 600, text: "Setting up interface..." },
            { progress: 45, delay: 900, text: "Loading educational tools..." },
            { progress: 60, delay: 1200, text: "Preparing workspace..." },
            { progress: 75, delay: 1500, text: "Finalizing setup..." },
            { progress: 90, delay: 1800, text: "Almost ready..." },
            { progress: 100, delay: 2100, text: "Welcome! Ready to explore." }
        ];
        
        this.init();
    }

    init() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.pageContent = document.querySelector('.page-content');
        this.progressBar = document.querySelector('.loading-progress-bar');
        this.subtitleElement = document.querySelector('.loading-subtitle');
        
        // Start the loading sequence
        this.startLoadingSequence();
        this.monitorResourceLoading();
        this.setupEventListeners();
    }

    startLoadingSequence() {
        // Start updating text
        this.updateLoadingText();
        this.textInterval = setInterval(() => {
            this.updateLoadingText();
        }, 2000); // Slower text updates for better readability

        // Start progressive loading simulation
        this.simulateProgressiveLoading();
    }

    simulateProgressiveLoading() {
        this.progressSteps.forEach((step, index) => {
            setTimeout(() => {
                this.setProgress(step.progress);
                if (this.subtitleElement && step.text) {
                    this.subtitleElement.style.opacity = '0';
                    setTimeout(() => {
                        this.subtitleElement.textContent = step.text;
                        this.subtitleElement.style.opacity = '1';
                    }, 200);
                }
                
                // If this is the last step, complete loading after additional delay
                if (step.progress === 100) {
                    setTimeout(() => {
                        this.completeLoading();
                    }, 800);
                }
            }, step.delay);
        });
    }

    updateLoadingText() {
        if (this.subtitleElement) {
            // Fade out current text
            this.subtitleElement.style.opacity = '0';
            
            setTimeout(() => {
                this.subtitleElement.textContent = this.loadingTexts[this.currentTextIndex];
                this.subtitleElement.style.opacity = '1';
                this.currentTextIndex = (this.currentTextIndex + 1) % this.loadingTexts.length;
            }, 300);
        }
    }

    setProgress(targetProgress) {
        if (!this.progressBar) return;

        const currentProgress = this.progress;
        const increment = (targetProgress - currentProgress) / 20;
        
        const animateProgress = () => {
            if (this.progress < targetProgress) {
                this.progress += increment;
                this.progressBar.style.width = Math.min(this.progress, targetProgress) + '%';
                requestAnimationFrame(animateProgress);
            }
        };
        
        animateProgress();
    }

    monitorResourceLoading() {
        const criticalResources = [
            'link[href*="font-awesome"]',
            'link[href="styles.css"]',
            'link[href="loading.css"]'
        ];

        let loadedResources = 0;
        const totalResources = criticalResources.length;

        const checkResource = (selector) => {
            return new Promise((resolve) => {
                const element = document.querySelector(selector);
                if (!element) {
                    resolve(false);
                    return;
                }

                if (element.sheet || element.complete) {
                    resolve(true);
                    return;
                }

                element.addEventListener('load', () => resolve(true));
                element.addEventListener('error', () => resolve(false));
                
                // Timeout after 3 seconds
                setTimeout(() => resolve(false), 3000);
            });
        };

        // Check all critical resources
        Promise.all(criticalResources.map(checkResource)).then((results) => {
            loadedResources = results.filter(Boolean).length;
            const resourceProgress = (loadedResources / totalResources) * 100;
            
            // Update progress based on loaded resources
            if (resourceProgress === 100) {
                this.setProgress(100);
                this.checkCompleteLoad();
            }
        });

        // Also listen for the window load event
        window.addEventListener('load', () => {
            this.resourcesLoaded = true;
        });
    }

    completeLoading() {
        const elapsedTime = Date.now() - this.startTime;
        
        // Ensure minimum display time is met
        if (elapsedTime < this.minDisplayTime) {
            setTimeout(() => {
                this.hideLoadingScreen();
            }, this.minDisplayTime - elapsedTime);
        } else {
            // Small delay for smooth transition
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 300);
        }
    }

    hideLoadingScreen() {
        if (this.isLoaded || !this.loadingScreen) return;
        
        this.isLoaded = true;
        
        // Clear intervals
        if (this.textInterval) {
            clearInterval(this.textInterval);
        }

        // Final progress update
        this.setProgress(100);
        
        // Update final text with fade effect
        if (this.subtitleElement) {
            this.subtitleElement.style.opacity = '0';
            setTimeout(() => {
                this.subtitleElement.textContent = "Welcome! Ready to explore.";
                this.subtitleElement.style.opacity = '1';
            }, 200);
        }

        // Start fade out sequence
        setTimeout(() => {
            this.loadingScreen.classList.add('fade-out');
            
            // Hide loading screen and show page content
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                
                if (this.pageContent) {
                    this.pageContent.classList.add('page-loaded');
                    this.pageContent.style.opacity = '0';
                    this.pageContent.style.animation = 'pageContentFadeIn 1s ease-out forwards';
                }
                
                // Trigger page loaded event
                document.dispatchEvent(new CustomEvent('pageFullyLoaded'));
            }, 800); // Wait for CSS fade-out transition
        }, 1200); // Show final message for 1.2 seconds
    }

    setupEventListeners() {
        // Handle errors gracefully
        window.addEventListener('error', (e) => {
            if (e.target && e.target.tagName) {
                const tagName = e.target.tagName.toLowerCase();
                if (['link', 'script', 'img'].includes(tagName)) {
                    console.warn('Resource failed to load:', e.target.src || e.target.href);
                    // Don't let resource errors block the loading screen
                    this.checkCompleteLoad();
                }
            }
        }, true);

        // Emergency fallback - hide after 8 seconds maximum
        setTimeout(() => {
            if (!this.isLoaded) {
                console.warn('Loading screen timeout - forcing hide');
                this.hideLoadingScreen();
            }
        }, 8000);
    }
}

// Legacy functions for backward compatibility
function updateLoadingText() {
    // Handled by LoadingScreenManager
}

function hideLoadingScreen() {
    if (window.loadingManager) {
        window.loadingManager.hideLoadingScreen();
    }
}

function checkCriticalResources() {
    // Handled by LoadingScreenManager
    return true;
}

function initializeLoadingScreen() {
    // Create new loading manager
    window.loadingManager = new LoadingScreenManager();
}

// Performance monitoring
function logPerformanceMetrics() {
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('Page Load Performance:', {
                        'DNS Lookup': Math.round(perfData.domainLookupEnd - perfData.domainLookupStart) + 'ms',
                        'TCP Connection': Math.round(perfData.connectEnd - perfData.connectStart) + 'ms',
                        'Request/Response': Math.round(perfData.responseEnd - perfData.requestStart) + 'ms',
                        'DOM Processing': Math.round(perfData.domComplete - perfData.domLoading) + 'ms',
                        'Total Load Time': Math.round(perfData.loadEventEnd - perfData.navigationStart) + 'ms'
                    });
                }
            }, 0);
        });
    }
}

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize loading screen
    initializeLoadingScreen();
    
    // Log performance metrics in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        logPerformanceMetrics();
    }
    
    // Initialize the page
    initializePage();
    
    // Add event listeners
    addEventListeners();
    
    // Add scroll animations
    addScrollAnimations();
    
    // Check if notification should be shown
    showNotificationIfNeeded();
});

// Close notification function
function closeNotification() {
    const notificationBar = document.getElementById('topNotificationBar');
    if (notificationBar) {
        notificationBar.style.animation = 'slideUp 0.5s ease-out forwards';
        setTimeout(() => {
            notificationBar.style.display = 'none';
            // Store in localStorage to remember user closed it
            localStorage.setItem('notificationClosed', 'true');
        }, 500);
    }
}

// Show notification if not previously closed
function showNotificationIfNeeded() {
    const notificationClosed = localStorage.getItem('notificationClosed');
    const notificationBar = document.getElementById('topNotificationBar');
    
    // Hide notification if user previously closed it (for this session)
    if (notificationClosed === 'true' && notificationBar) {
        notificationBar.style.display = 'none';
    }
}

// Initialize page functionality
function initializePage() {
    // Add current year to footer
    const currentYear = new Date().getFullYear();
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        footerYear.innerHTML = footerYear.innerHTML.replace('2025', currentYear);
    }
    
    // Add active states to navigation
    addActiveNavigation();
}

// Add event listeners for interactive elements
function addEventListeners() {
    // CTA Button functionality
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://scncc.online', '_blank');
        });
    });
    
    // Tool item click handlers
    const toolItems = document.querySelectorAll('.tool-item');
    toolItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Check if the tool item has an onclick attribute (like Image Merger)
            if (this.hasAttribute('onclick')) {
                // Let the onclick handle it, don't interfere
                return;
            }
            
            // Check if the tool item has a real link (not just #)
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // Let the browser handle the link normally
                return;
            }
            
            // For demo tools (href="#" and no onclick), prevent default and show demo
            e.preventDefault();
            const toolName = this.querySelector('span').textContent;
            handleToolClick(toolName);
        });
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Keep tools functionality, redirect others to official website
            if (targetId === 'tools') {
                smoothScrollTo(targetId);
            } else if (!this.classList.contains('official-link')) {
                window.open('https://scncc.online', '_blank');
            }
        });
    });
    
    // Add click effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
                window.open('https://scncc.online', '_blank');
            }, 150);
        });
    });
    
    // Add click functionality to stats items
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.addEventListener('click', function() {
            window.open('https://scncc.online', '_blank');
        });
    });
}

// Handle tool clicks
function handleToolClick(toolName) {
    const toolActions = {
        'Image Merger': () => window.open('image_merger/index.html', '_blank'),
        'Image Cropper': () => showToolDemo('Image Cropper', 'Crop and resize your images'),
        'Image Compressor': () => showToolDemo('Image Compressor', 'Reduce image file sizes'),
        'Format Converter': () => showToolDemo('Format Converter', 'Convert between image formats'),
        'PDF Editor': () => showToolDemo('PDF Editor', 'Edit and modify PDF documents'),
        'PDF Merger': () => showToolDemo('PDF Merger', 'Combine multiple PDFs into one'),
        'PDF Splitter': () => showToolDemo('PDF Splitter', 'Split PDF into separate pages'),
        'PDF Compressor': () => showToolDemo('PDF Compressor', 'Reduce PDF file sizes'),
        'Text Editor': () => window.open('text_editor/index.html', '_blank'),
        'Word Counter': () => window.open('word_counter/index.html', '_blank'),
        'Case Converter': () => window.open('case_converter/index.html', '_blank'),
        'Video Converter': () => showToolDemo('Video Converter', 'Convert video formats'),
        'Audio Converter': () => showToolDemo('Audio Converter', 'Convert audio formats'),
        'QR Generator': () => window.open('qr/index.html', '_blank'),
        'Color Picker': () => window.open('COLOR_PICKER/index.html', '_blank'),
        'Calculator': () => showCalculator(),
        'Password Generator': () => window.open('PASSWORD_GENERATOR/index.html', '_blank'),
        'Timer & Stopwatch': () => showTimer(),
        'Unit Converter': () => window.open('UNIT_CONVERTER/index.html', '_blank')
    };
    
    if (toolActions[toolName]) {
        toolActions[toolName]();
    } else {
        showNotification(`${toolName} - Coming Soon!`, 'info');
    }
}

// Show tool demo modal
function showToolDemo(toolName, description) {
    const modal = createModal(toolName, description);
    document.body.appendChild(modal);
    
    // Animate modal in
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
}

// Create modal element
function createModal(title, description) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        ">
            <h3 style="color: #2c3e50; margin-bottom: 1rem;">${title}</h3>
            <p style="color: #666; margin-bottom: 2rem;">${description}</p>
            <p style="color: #e74c3c; margin-bottom: 2rem;">This tool is currently under development.</p>
            <button onclick="this.closest('.modal').remove()" style="
                background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            ">Close</button>
        </div>
    `;
    
    // Close modal on backdrop click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

// Show calculator
function showCalculator() {
    const calculatorModal = createModal('Calculator', 'Basic arithmetic calculator');
    const modalContent = calculatorModal.querySelector('.modal-content');
    
    const calculatorHTML = `
        <div style="margin: 1rem 0;">
            <input type="text" id="calcDisplay" readonly style="
                width: 100%;
                padding: 10px;
                font-size: 1.2rem;
                text-align: right;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin-bottom: 1rem;
            " value="0">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px;">
                <button onclick="clearCalc()" style="background: #e74c3c; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">C</button>
                <button onclick="appendToCalc('/')" style="background: #f39c12; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">÷</button>
                <button onclick="appendToCalc('*')" style="background: #f39c12; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">×</button>
                <button onclick="deleteLast()" style="background: #e74c3c; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">←</button>
                <button onclick="appendToCalc('7')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">7</button>
                <button onclick="appendToCalc('8')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">8</button>
                <button onclick="appendToCalc('9')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">9</button>
                <button onclick="appendToCalc('-')" style="background: #f39c12; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">-</button>
                <button onclick="appendToCalc('4')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">4</button>
                <button onclick="appendToCalc('5')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">5</button>
                <button onclick="appendToCalc('6')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">6</button>
                <button onclick="appendToCalc('+')" style="background: #f39c12; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">+</button>
                <button onclick="appendToCalc('1')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">1</button>
                <button onclick="appendToCalc('2')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">2</button>
                <button onclick="appendToCalc('3')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">3</button>
                <button onclick="calculateResult()" style="background: #27ae60; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer; grid-row: span 2;">=</button>
                <button onclick="appendToCalc('0')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer; grid-column: span 2;">0</button>
                <button onclick="appendToCalc('.')" style="background: #34495e; color: white; padding: 15px; border: none; border-radius: 5px; cursor: pointer;">.</button>
            </div>
        </div>
    `;
    
    modalContent.insertAdjacentHTML('beforeend', calculatorHTML);
    document.body.appendChild(calculatorModal);
    
    setTimeout(() => {
        calculatorModal.style.opacity = '1';
        calculatorModal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
}

// Calculator functions
function appendToCalc(value) {
    const display = document.getElementById('calcDisplay');
    if (display.value === '0') {
        display.value = value;
    } else {
        display.value += value;
    }
}

function clearCalc() {
    document.getElementById('calcDisplay').value = '0';
}

function deleteLast() {
    const display = document.getElementById('calcDisplay');
    if (display.value.length > 1) {
        display.value = display.value.slice(0, -1);
    } else {
        display.value = '0';
    }
}

function calculateResult() {
    const display = document.getElementById('calcDisplay');
    try {
        const result = eval(display.value.replace('×', '*').replace('÷', '/'));
        display.value = result;
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => clearCalc(), 1000);
    }
}

// Show password generator
function showPasswordGenerator() {
    const passwordModal = createModal('Password Generator', 'Generate secure passwords');
    const modalContent = passwordModal.querySelector('.modal-content');
    
    const passwordHTML = `
        <div style="margin: 1rem 0;">
            <input type="text" id="generatedPassword" readonly style="
                width: 100%;
                padding: 10px;
                font-size: 1rem;
                border: 1px solid #ddd;
                border-radius: 5px;
                margin-bottom: 1rem;
            " placeholder="Generated password will appear here">
            <div style="margin-bottom: 1rem;">
                <label>Length: <span id="lengthValue">12</span></label>
                <input type="range" id="passwordLength" min="4" max="50" value="12" style="width: 100%; margin: 5px 0;" oninput="document.getElementById('lengthValue').textContent = this.value">
            </div>
            <div style="text-align: left; margin-bottom: 1rem;">
                <label><input type="checkbox" id="includeUpper" checked> Uppercase letters</label><br>
                <label><input type="checkbox" id="includeLower" checked> Lowercase letters</label><br>
                <label><input type="checkbox" id="includeNumbers" checked> Numbers</label><br>
                <label><input type="checkbox" id="includeSymbols"> Symbols</label>
            </div>
            <button onclick="generatePassword()" style="
                background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 10px;
            ">Generate</button>
            <button onclick="copyPassword()" style="
                background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            ">Copy</button>
        </div>
    `;
    
    modalContent.insertAdjacentHTML('beforeend', passwordHTML);
    document.body.appendChild(passwordModal);
    
    setTimeout(() => {
        passwordModal.style.opacity = '1';
        passwordModal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
}

// Generate password function
function generatePassword() {
    const length = document.getElementById('passwordLength').value;
    const includeUpper = document.getElementById('includeUpper').checked;
    const includeLower = document.getElementById('includeLower').checked;
    const includeNumbers = document.getElementById('includeNumbers').checked;
    const includeSymbols = document.getElementById('includeSymbols').checked;
    
    let characters = '';
    if (includeUpper) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) characters += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) characters += '0123456789';
    if (includeSymbols) characters += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (characters === '') {
        showNotification('Please select at least one character type', 'error');
        return;
    }
    
    let password = '';
    for (let i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    document.getElementById('generatedPassword').value = password;
}

// Copy password to clipboard
function copyPassword() {
    const passwordField = document.getElementById('generatedPassword');
    if (passwordField.value) {
        passwordField.select();
        document.execCommand('copy');
        showNotification('Password copied to clipboard!', 'success');
    } else {
        showNotification('Generate a password first', 'error');
    }
}

// Show timer
function showTimer() {
    const timerModal = createModal('Timer & Stopwatch', 'Time management tools');
    const modalContent = timerModal.querySelector('.modal-content');
    
    const timerHTML = `
        <div style="margin: 1rem 0;">
            <div style="display: flex; justify-content: center; margin-bottom: 2rem;">
                <button onclick="showTimerTab()" id="timerTabBtn" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px 0 0 5px;
                    cursor: pointer;
                ">Timer</button>
                <button onclick="showStopwatchTab()" id="stopwatchTabBtn" style="
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 0 5px 5px 0;
                    cursor: pointer;
                ">Stopwatch</button>
            </div>
            
            <div id="timerTab">
                <div style="font-size: 2rem; margin-bottom: 1rem;" id="timerDisplay">05:00</div>
                <div style="margin-bottom: 1rem;">
                    <input type="number" id="timerMinutes" value="5" min="0" max="59" style="width: 60px; padding: 5px; margin: 0 5px;"> minutes
                    <input type="number" id="timerSeconds" value="0" min="0" max="59" style="width: 60px; padding: 5px; margin: 0 5px;"> seconds
                </div>
                <button onclick="startTimer()" id="timerStartBtn" style="
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 5px;
                ">Start</button>
                <button onclick="pauseTimer()" style="
                    background: #f39c12;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 5px;
                ">Pause</button>
                <button onclick="resetTimer()" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 5px;
                ">Reset</button>
            </div>
            
            <div id="stopwatchTab" style="display: none;">
                <div style="font-size: 2rem; margin-bottom: 1rem;" id="stopwatchDisplay">00:00:00</div>
                <button onclick="startStopwatch()" id="stopwatchStartBtn" style="
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 5px;
                ">Start</button>
                <button onclick="pauseStopwatch()" style="
                    background: #f39c12;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 5px;
                ">Pause</button>
                <button onclick="resetStopwatch()" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 5px;
                ">Reset</button>
            </div>
        </div>
    `;
    
    modalContent.insertAdjacentHTML('beforeend', timerHTML);
    document.body.appendChild(timerModal);
    
    setTimeout(() => {
        timerModal.style.opacity = '1';
        timerModal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
}

// Timer and Stopwatch variables
let timerInterval;
let stopwatchInterval;
let timerTime = 300; // 5 minutes in seconds
let stopwatchTime = 0;

// Timer and Stopwatch functions
function showTimerTab() {
    document.getElementById('timerTab').style.display = 'block';
    document.getElementById('stopwatchTab').style.display = 'none';
    document.getElementById('timerTabBtn').style.background = '#3498db';
    document.getElementById('stopwatchTabBtn').style.background = '#95a5a6';
}

function showStopwatchTab() {
    document.getElementById('timerTab').style.display = 'none';
    document.getElementById('stopwatchTab').style.display = 'block';
    document.getElementById('timerTabBtn').style.background = '#95a5a6';
    document.getElementById('stopwatchTabBtn').style.background = '#3498db';
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTime / 60);
    const seconds = timerTime % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
    timerTime = minutes * 60 + seconds;
    
    if (timerTime <= 0) {
        showNotification('Please set a valid time', 'error');
        return;
    }
    
    timerInterval = setInterval(() => {
        timerTime--;
        updateTimerDisplay();
        
        if (timerTime <= 0) {
            clearInterval(timerInterval);
            showNotification('Timer finished!', 'success');
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    timerTime = 300;
    updateTimerDisplay();
}

function updateStopwatchDisplay() {
    const hours = Math.floor(stopwatchTime / 3600);
    const minutes = Math.floor((stopwatchTime % 3600) / 60);
    const seconds = stopwatchTime % 60;
    document.getElementById('stopwatchDisplay').textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startStopwatch() {
    stopwatchInterval = setInterval(() => {
        stopwatchTime++;
        updateStopwatchDisplay();
    }, 1000);
}

function pauseStopwatch() {
    clearInterval(stopwatchInterval);
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchTime = 0;
    updateStopwatchDisplay();
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 2000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = '#27ae60';
            break;
        case 'error':
            notification.style.background = '#e74c3c';
            break;
        default:
            notification.style.background = '#3498db';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Smooth scroll function
function smoothScrollTo(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Add active navigation
function addActiveNavigation() {
    const sections = ['home', 'courses', 'tools', 'about', 'contact'];
    const navLinks = document.querySelectorAll('.nav a');
    
    function updateActiveNav() {
        // This would typically check scroll position
        // For demo purposes, just highlight "Home"
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#home') {
                link.classList.add('active');
            }
        });
    }
    
    updateActiveNav();
}

// Add scroll animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .tool-category, .stat-item');
    animateElements.forEach(el => observer.observe(el));
}

// Enhanced Contact Form Handler with Web3Forms Integration
class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.result = document.getElementById('contactResult');
        this.submitBtn = this.form?.querySelector('.submit-btn');
        this.originalButtonContent = this.submitBtn?.innerHTML;
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addInputValidation();
        this.addFormAnimations();
    }

    addInputValidation() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isValid = field.checkValidity() && value !== '';
        
        if (!isValid) {
            field.style.borderColor = '#e74c3c';
            field.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
        } else {
            field.style.borderColor = '#27ae60';
            field.style.backgroundColor = 'rgba(39, 174, 96, 0.1)';
        }
        
        return isValid;
    }

    clearFieldError(field) {
        field.style.borderColor = '#e9ecef';
        field.style.backgroundColor = '#f8f9fa';
    }

    addFormAnimations() {
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            group.style.animationDelay = `${index * 0.1}s`;
            group.style.animation = 'fadeInUp 0.6s ease-out forwards';
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showResult('Please fill in all required fields correctly.', 'error');
            return;
        }

        this.setLoadingState(true);

        try {
            const formData = new FormData(this.form);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });

            const result = await response.json();

            if (response.status === 200 && result.success) {
                this.showResult(
                    '✅ Thank you! Your message has been sent successfully. We\'ll get back to you soon!',
                    'success'
                );
                this.form.reset();
                this.clearAllFieldStyles();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }

        } catch (error) {
            console.error('Contact form error:', error);
            this.showResult(
                '❌ Sorry, there was an error sending your message. Please try again or contact us directly.',
                'error'
            );
        } finally {
            this.setLoadingState(false);
        }
    }

    validateForm() {
        const requiredFields = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    clearAllFieldStyles() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => this.clearFieldError(input));
    }

    setLoadingState(loading) {
        if (loading) {
            this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending...</span>';
            this.submitBtn.disabled = true;
            this.submitBtn.style.opacity = '0.7';
        } else {
            this.submitBtn.innerHTML = this.originalButtonContent;
            this.submitBtn.disabled = false;
            this.submitBtn.style.opacity = '1';
        }
    }

    showResult(message, type) {
        this.result.textContent = message;
        this.result.className = `form-result ${type}`;
        this.result.style.display = 'block';
        
        // Smooth scroll to result
        this.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.result.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
});
