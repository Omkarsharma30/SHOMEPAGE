// Password Generator JavaScript
class PasswordGenerator {
    constructor() {
        this.initializeEventListeners();
        this.initializeSlider();
        this.passwordHistory = this.loadHistory();
        this.updateHistoryDisplay();
        this.generatePassword(); // Generate initial password
    }

    // Character sets for password generation
    getCharacterSets() {
        return {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
            similar: '0O1lI',
            ambiguous: '{}[]()\/~,;.<>'
        };
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Length slider
        const lengthSlider = document.getElementById('length-slider');
        lengthSlider.addEventListener('input', () => this.updateLengthDisplay());

        // Checkboxes
        const checkboxes = ['uppercase', 'lowercase', 'numbers', 'symbols', 
                           'exclude-similar', 'exclude-ambiguous', 'no-duplicate', 'secure-random'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.validateOptions());
            }
        });

        // Auto-generate on option change
        const autoGenerateElements = [...checkboxes, 'length-slider'];
        autoGenerateElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    setTimeout(() => this.generatePassword(), 100);
                });
                element.addEventListener('input', () => {
                    setTimeout(() => this.generatePassword(), 100);
                });
            }
        });
    }

    // Initialize length slider
    initializeSlider() {
        this.updateLengthDisplay();
    }

    // Update length display
    updateLengthDisplay() {
        const lengthSlider = document.getElementById('length-slider');
        const lengthValue = document.getElementById('length-value');
        lengthValue.textContent = lengthSlider.value;
    }

    // Validate options to ensure at least one character type is selected
    validateOptions() {
        const characterTypes = ['uppercase', 'lowercase', 'numbers', 'symbols'];
        const anySelected = characterTypes.some(type => 
            document.getElementById(type).checked
        );

        if (!anySelected) {
            // If no character types selected, select lowercase by default
            document.getElementById('lowercase').checked = true;
            this.showMessage('At least one character type must be selected. Lowercase letters enabled.', 'warning');
        }
    }

    // Apply preset configurations
    applyPreset(preset) {
        const presets = {
            simple: {
                length: 8,
                uppercase: true,
                lowercase: true,
                numbers: true,
                symbols: false,
                excludeSimilar: false,
                excludeAmbiguous: false,
                noDuplicate: false,
                secureRandom: false
            },
            standard: {
                length: 12,
                uppercase: true,
                lowercase: true,
                numbers: true,
                symbols: true,
                excludeSimilar: false,
                excludeAmbiguous: true,
                noDuplicate: false,
                secureRandom: false
            },
            strong: {
                length: 16,
                uppercase: true,
                lowercase: true,
                numbers: true,
                symbols: true,
                excludeSimilar: true,
                excludeAmbiguous: true,
                noDuplicate: false,
                secureRandom: true
            },
            ultra: {
                length: 32,
                uppercase: true,
                lowercase: true,
                numbers: true,
                symbols: true,
                excludeSimilar: true,
                excludeAmbiguous: true,
                noDuplicate: false,
                secureRandom: true
            }
        };

        const config = presets[preset];
        if (!config) return;

        // Apply configuration
        document.getElementById('length-slider').value = config.length;
        document.getElementById('uppercase').checked = config.uppercase;
        document.getElementById('lowercase').checked = config.lowercase;
        document.getElementById('numbers').checked = config.numbers;
        document.getElementById('symbols').checked = config.symbols;
        document.getElementById('exclude-similar').checked = config.excludeSimilar;
        document.getElementById('exclude-ambiguous').checked = config.excludeAmbiguous;
        document.getElementById('no-duplicate').checked = config.noDuplicate;
        document.getElementById('secure-random').checked = config.secureRandom;

        this.updateLengthDisplay();
        this.generatePassword();

        // Visual feedback
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => btn.classList.remove('active'));
        event.target.closest('.preset-btn').classList.add('active');
        setTimeout(() => {
            event.target.closest('.preset-btn').classList.remove('active');
        }, 2000);
    }

    // Generate password based on current settings
    generatePassword() {
        try {
            const length = parseInt(document.getElementById('length-slider').value);
            const options = this.getSelectedOptions();
            
            if (!this.validateGenerationOptions(options)) {
                return;
            }

            const charset = this.buildCharacterSet(options);
            if (charset.length === 0) {
                this.showMessage('No valid characters available for generation.', 'error');
                return;
            }

            let password;
            if (options.noDuplicate && length > charset.length) {
                this.showMessage(`Cannot generate ${length} character password without duplicates. Maximum length: ${charset.length}`, 'warning');
                document.getElementById('length-slider').value = charset.length;
                this.updateLengthDisplay();
                password = this.generateUniquePassword(charset, charset.length, options.secureRandom);
            } else {
                password = this.generateRandomPassword(charset, length, options.secureRandom, options.noDuplicate);
            }

            this.displayPassword(password);
            this.updatePasswordStrength(password);
            this.addToHistory(password);

        } catch (error) {
            console.error('Password generation error:', error);
            this.showMessage('Error generating password. Please try again.', 'error');
        }
    }

    // Get selected options
    getSelectedOptions() {
        return {
            uppercase: document.getElementById('uppercase').checked,
            lowercase: document.getElementById('lowercase').checked,
            numbers: document.getElementById('numbers').checked,
            symbols: document.getElementById('symbols').checked,
            excludeSimilar: document.getElementById('exclude-similar').checked,
            excludeAmbiguous: document.getElementById('exclude-ambiguous').checked,
            noDuplicate: document.getElementById('no-duplicate').checked,
            secureRandom: document.getElementById('secure-random').checked
        };
    }

    // Validate generation options
    validateGenerationOptions(options) {
        const hasCharacterType = options.uppercase || options.lowercase || 
                                options.numbers || options.symbols;
        
        if (!hasCharacterType) {
            this.showMessage('Please select at least one character type.', 'warning');
            return false;
        }
        
        return true;
    }

    // Build character set based on options
    buildCharacterSet(options) {
        const sets = this.getCharacterSets();
        let charset = '';

        if (options.uppercase) charset += sets.uppercase;
        if (options.lowercase) charset += sets.lowercase;
        if (options.numbers) charset += sets.numbers;
        if (options.symbols) charset += sets.symbols;

        // Remove similar characters if requested
        if (options.excludeSimilar) {
            charset = charset.split('').filter(char => 
                !sets.similar.includes(char)
            ).join('');
        }

        // Remove ambiguous characters if requested
        if (options.excludeAmbiguous) {
            charset = charset.split('').filter(char => 
                !sets.ambiguous.includes(char)
            ).join('');
        }

        return charset;
    }

    // Generate random password
    generateRandomPassword(charset, length, useSecureRandom, noDuplicate) {
        let password = '';
        const usedChars = new Set();

        for (let i = 0; i < length; i++) {
            let randomChar;
            let attempts = 0;
            const maxAttempts = charset.length * 2;

            do {
                const randomIndex = useSecureRandom ? 
                    this.getSecureRandomInt(charset.length) : 
                    Math.floor(Math.random() * charset.length);
                randomChar = charset[randomIndex];
                attempts++;

                if (attempts > maxAttempts) {
                    // Fallback if we can't find unused character
                    randomChar = charset[Math.floor(Math.random() * charset.length)];
                    break;
                }
            } while (noDuplicate && usedChars.has(randomChar));

            password += randomChar;
            if (noDuplicate) {
                usedChars.add(randomChar);
            }
        }

        return password;
    }

    // Generate unique password (no duplicate characters)
    generateUniquePassword(charset, length, useSecureRandom) {
        const chars = charset.split('');
        
        // Shuffle the character array
        for (let i = chars.length - 1; i > 0; i--) {
            const j = useSecureRandom ? 
                this.getSecureRandomInt(i + 1) : 
                Math.floor(Math.random() * (i + 1));
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }

        return chars.slice(0, length).join('');
    }

    // Get cryptographically secure random integer
    getSecureRandomInt(max) {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            return array[0] % max;
        }
        // Fallback to Math.random
        return Math.floor(Math.random() * max);
    }

    // Display generated password
    displayPassword(password) {
        const passwordField = document.getElementById('generated-password');
        passwordField.value = password;
        passwordField.classList.add('pulse-animation');
        setTimeout(() => passwordField.classList.remove('pulse-animation'), 300);
    }

    // Calculate and update password strength
    updatePasswordStrength(password) {
        const strength = this.calculatePasswordStrength(password);
        const strengthText = document.getElementById('strength-text');
        const strengthFill = document.getElementById('strength-fill');

        // Remove existing strength classes
        strengthFill.className = 'strength-fill';

        if (strength.score <= 25) {
            strengthText.textContent = 'Weak';
            strengthFill.classList.add('weak');
        } else if (strength.score <= 50) {
            strengthText.textContent = 'Fair';
            strengthFill.classList.add('fair');
        } else if (strength.score <= 75) {
            strengthText.textContent = 'Good';
            strengthFill.classList.add('good');
        } else {
            strengthText.textContent = 'Strong';
            strengthFill.classList.add('strong');
        }
    }

    // Calculate password strength score
    calculatePasswordStrength(password) {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
            longLength: password.length >= 12,
            veryLongLength: password.length >= 16
        };

        // Basic criteria (10 points each)
        if (checks.length) score += 10;
        if (checks.lowercase) score += 10;
        if (checks.uppercase) score += 10;
        if (checks.numbers) score += 10;
        if (checks.symbols) score += 15;

        // Length bonuses
        if (checks.longLength) score += 15;
        if (checks.veryLongLength) score += 15;

        // Character variety bonus
        const varietyCount = [
            checks.lowercase, checks.uppercase, 
            checks.numbers, checks.symbols
        ].filter(Boolean).length;
        score += varietyCount * 5;

        // Entropy bonus for very long passwords
        if (password.length >= 20) score += 10;

        return {
            score: Math.min(score, 100),
            checks: checks
        };
    }

    // Add password to history
    addToHistory(password) {
        const timestamp = new Date().toLocaleString();
        const historyItem = {
            password: password,
            timestamp: timestamp,
            strength: this.calculatePasswordStrength(password).score
        };

        this.passwordHistory.unshift(historyItem);
        
        // Keep only last 10 passwords
        if (this.passwordHistory.length > 10) {
            this.passwordHistory = this.passwordHistory.slice(0, 10);
        }

        this.saveHistory();
        this.updateHistoryDisplay();
    }

    // Update history display
    updateHistoryDisplay() {
        const historyContainer = document.getElementById('password-history');
        
        if (this.passwordHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="history-empty">
                    <i class="fas fa-info-circle"></i>
                    <p>No passwords generated yet. Create your first secure password!</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = this.passwordHistory.map((item, index) => `
            <div class="history-item" data-index="${index}">
                <div class="history-password">${this.maskPassword(item.password)}</div>
                <div class="history-actions">
                    <button class="history-btn" onclick="passwordGenerator.togglePasswordVisibility(${index})" title="Show/Hide">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="history-btn" onclick="passwordGenerator.copyFromHistory(${index})" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="history-btn" onclick="passwordGenerator.removeFromHistory(${index})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Mask password for display
    maskPassword(password) {
        return '•'.repeat(password.length);
    }

    // Toggle password visibility in history
    togglePasswordVisibility(index) {
        const historyItem = document.querySelector(`[data-index="${index}"] .history-password`);
        const icon = document.querySelector(`[data-index="${index}"] .fa-eye, [data-index="${index}"] .fa-eye-slash`);
        
        if (historyItem.textContent.includes('•')) {
            historyItem.textContent = this.passwordHistory[index].password;
            icon.className = 'fas fa-eye-slash';
        } else {
            historyItem.textContent = this.maskPassword(this.passwordHistory[index].password);
            icon.className = 'fas fa-eye';
        }
    }

    // Copy password from history
    copyFromHistory(index) {
        const password = this.passwordHistory[index].password;
        this.copyToClipboard(password);
    }

    // Remove password from history
    removeFromHistory(index) {
        this.passwordHistory.splice(index, 1);
        this.saveHistory();
        this.updateHistoryDisplay();
        this.showMessage('Password removed from history.', 'info');
    }

    // Clear all history
    clearHistory() {
        this.passwordHistory = [];
        this.saveHistory();
        this.updateHistoryDisplay();
        this.showMessage('Password history cleared.', 'info');
    }

    // Save history to localStorage
    saveHistory() {
        try {
            localStorage.setItem('passwordHistory', JSON.stringify(this.passwordHistory));
        } catch (error) {
            console.warn('Could not save password history:', error);
        }
    }

    // Load history from localStorage
    loadHistory() {
        try {
            const history = localStorage.getItem('passwordHistory');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.warn('Could not load password history:', error);
            return [];
        }
    }

    // Copy to clipboard
    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                this.showCopySuccess();
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    // Fallback copy method
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (error) {
            this.showMessage('Copy failed. Please select and copy manually.', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // Show copy success feedback
    showCopySuccess() {
        const copyBtn = document.querySelector('.copy-btn');
        const originalHTML = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.background = '#4caf50';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = '';
        }, 2000);
        
        this.showMessage('Password copied to clipboard!', 'success');
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.getElementById('message-display');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'message-display';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                transition: all 0.3s ease;
                max-width: 300px;
            `;
            document.body.appendChild(messageEl);
        }

        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };

        messageEl.style.background = colors[type] || colors.info;
        messageEl.textContent = message;
        messageEl.style.transform = 'translateX(0)';
        messageEl.style.opacity = '1';

        // Auto hide after 3 seconds
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            messageEl.style.opacity = '0';
        }, 3000);
    }
}

// Global functions for HTML onclick events
function copyPassword() {
    const passwordField = document.getElementById('generated-password');
    if (passwordField.value) {
        passwordGenerator.copyToClipboard(passwordField.value);
    } else {
        passwordGenerator.showMessage('No password to copy. Generate one first!', 'warning');
    }
}

function toggleVisibility() {
    const passwordField = document.getElementById('generated-password');
    const visibilityIcon = document.getElementById('visibility-icon');
    
    if (passwordField.type === 'password' || passwordField.classList.contains('password-hidden')) {
        passwordField.type = 'text';
        passwordField.classList.remove('password-hidden');
        visibilityIcon.className = 'fas fa-eye-slash';
    } else {
        passwordField.type = 'text';
        passwordField.classList.add('password-hidden');
        visibilityIcon.className = 'fas fa-eye';
    }
}

function generatePassword() {
    passwordGenerator.generatePassword();
}

function applyPreset(preset) {
    passwordGenerator.applyPreset(preset);
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all password history?')) {
        passwordGenerator.clearHistory();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                generatePassword();
                break;
            case 'c':
                if (e.target.tagName !== 'INPUT') {
                    e.preventDefault();
                    copyPassword();
                }
                break;
        }
    }
    
    // Spacebar to generate
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        generatePassword();
    }
});

// Initialize password generator when page loads
let passwordGenerator;
document.addEventListener('DOMContentLoaded', () => {
    passwordGenerator = new PasswordGenerator();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Clear clipboard for security when page becomes visible again
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText('').catch(() => {});
        }
    }
});

// Security: Clear form data on page unload
window.addEventListener('beforeunload', () => {
    const passwordField = document.getElementById('generated-password');
    if (passwordField) {
        passwordField.value = '';
    }
});