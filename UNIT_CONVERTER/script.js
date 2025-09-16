// Unit Converter JavaScript
class UnitConverter {
    constructor() {
        this.initializeTabs();
        this.initializeEventListeners();
        this.currentTab = 'length';
    }

    // Initialize tab functionality
    initializeTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const panels = document.querySelectorAll('.converter-panel');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    // Switch between converter tabs
    switchTab(tabName) {
        // Remove active class from all tabs and panels
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.converter-panel').forEach(panel => panel.classList.remove('active'));

        // Add active class to selected tab and panel
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
        this.clearCurrentTab();
    }

    // Initialize event listeners for all converters
    initializeEventListeners() {
        const converters = ['length', 'weight', 'temperature', 'area', 'volume', 'speed', 'energy', 'time'];
        
        converters.forEach(converter => {
            const input = document.getElementById(`${converter}-input`);
            const fromSelect = document.getElementById(`${converter}-from`);
            const toSelect = document.getElementById(`${converter}-to`);

            if (input && fromSelect && toSelect) {
                input.addEventListener('input', () => this.convert(converter));
                fromSelect.addEventListener('change', () => this.convert(converter));
                toSelect.addEventListener('change', () => this.convert(converter));
            }
        });
    }

    // Main conversion function
    convert(type) {
        const input = document.getElementById(`${type}-input`);
        const fromUnit = document.getElementById(`${type}-from`).value;
        const toUnit = document.getElementById(`${type}-to`).value;
        const output = document.getElementById(`${type}-output`);

        const value = parseFloat(input.value);

        if (isNaN(value) || value === '') {
            output.value = '';
            return;
        }

        let result;
        switch (type) {
            case 'length':
                result = this.convertLength(value, fromUnit, toUnit);
                break;
            case 'weight':
                result = this.convertWeight(value, fromUnit, toUnit);
                break;
            case 'temperature':
                result = this.convertTemperature(value, fromUnit, toUnit);
                break;
            case 'area':
                result = this.convertArea(value, fromUnit, toUnit);
                break;
            case 'volume':
                result = this.convertVolume(value, fromUnit, toUnit);
                break;
            case 'speed':
                result = this.convertSpeed(value, fromUnit, toUnit);
                break;
            case 'energy':
                result = this.convertEnergy(value, fromUnit, toUnit);
                break;
            case 'time':
                result = this.convertTime(value, fromUnit, toUnit);
                break;
            default:
                result = 0;
        }

        output.value = this.formatResult(result);
        output.classList.add('pulse-animation');
        setTimeout(() => output.classList.remove('pulse-animation'), 300);
    }

    // Length conversion
    convertLength(value, from, to) {
        const meters = {
            meter: 1,
            kilometer: 0.001,
            centimeter: 100,
            millimeter: 1000,
            inch: 39.3701,
            foot: 3.28084,
            yard: 1.09361,
            mile: 0.000621371
        };

        const valueInMeters = value / meters[from];
        return valueInMeters * meters[to];
    }

    // Weight conversion
    convertWeight(value, from, to) {
        const grams = {
            kilogram: 0.001,
            gram: 1,
            pound: 0.00220462,
            ounce: 0.035274,
            ton: 0.000001,
            stone: 0.000157473
        };

        const valueInGrams = value / grams[from];
        return valueInGrams * grams[to];
    }

    // Temperature conversion
    convertTemperature(value, from, to) {
        let celsius;

        // Convert to Celsius first
        switch (from) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
        }

        // Convert from Celsius to target unit
        switch (to) {
            case 'celsius':
                return celsius;
            case 'fahrenheit':
                return celsius * 9/5 + 32;
            case 'kelvin':
                return celsius + 273.15;
        }
    }

    // Area conversion
    convertArea(value, from, to) {
        const squareMeters = {
            square_meter: 1,
            square_kilometer: 0.000001,
            square_centimeter: 10000,
            square_foot: 10.7639,
            square_inch: 1550.0031,
            acre: 0.000247105,
            hectare: 0.0001
        };

        const valueInSquareMeters = value / squareMeters[from];
        return valueInSquareMeters * squareMeters[to];
    }

    // Volume conversion
    convertVolume(value, from, to) {
        const liters = {
            liter: 1,
            milliliter: 1000,
            gallon: 0.264172,
            quart: 1.05669,
            pint: 2.11338,
            cup: 4.22675,
            fluid_ounce: 33.814,
            cubic_meter: 0.001
        };

        const valueInLiters = value / liters[from];
        return valueInLiters * liters[to];
    }

    // Speed conversion
    convertSpeed(value, from, to) {
        const mps = {
            mps: 1,
            kmh: 3.6,
            mph: 2.23694,
            fps: 3.28084,
            knot: 1.94384
        };

        const valueInMps = value / mps[from];
        return valueInMps * mps[to];
    }

    // Energy conversion
    convertEnergy(value, from, to) {
        const joules = {
            joule: 1,
            kilojoule: 0.001,
            calorie: 0.239006,
            kilocalorie: 0.000239006,
            watt_hour: 0.000277778,
            kilowatt_hour: 0.000000277778,
            btu: 0.000947817
        };

        const valueInJoules = value / joules[from];
        return valueInJoules * joules[to];
    }

    // Time conversion
    convertTime(value, from, to) {
        const seconds = {
            second: 1,
            minute: 1/60,
            hour: 1/3600,
            day: 1/86400,
            week: 1/604800,
            month: 1/2629746,
            year: 1/31556952,
            millisecond: 1000
        };

        const valueInSeconds = value / seconds[from];
        return valueInSeconds * seconds[to];
    }

    // Format result with appropriate precision
    formatResult(result) {
        if (Math.abs(result) >= 1000000 || (Math.abs(result) < 0.001 && result !== 0)) {
            return result.toExponential(6);
        } else if (Math.abs(result) >= 100) {
            return result.toFixed(2);
        } else if (Math.abs(result) >= 1) {
            return result.toFixed(4);
        } else {
            return result.toFixed(6);
        }
    }

    // Clear current tab
    clearCurrentTab() {
        const input = document.getElementById(`${this.currentTab}-input`);
        const output = document.getElementById(`${this.currentTab}-output`);
        if (input) input.value = '';
        if (output) output.value = '';
    }
}

// Swap units function
function swapUnits(type) {
    const fromSelect = document.getElementById(`${type}-from`);
    const toSelect = document.getElementById(`${type}-to`);
    const input = document.getElementById(`${type}-input`);
    const output = document.getElementById(`${type}-output`);

    // Swap the select values
    const tempValue = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = tempValue;

    // Swap input and output values
    const tempInputValue = input.value;
    input.value = output.value || '';
    
    // Trigger conversion with new values
    if (input.value) {
        converter.convert(type);
    } else {
        output.value = '';
    }

    // Add visual feedback
    const swapBtn = event.target.closest('.swap-btn');
    swapBtn.style.transform = 'rotate(180deg) scale(1.1)';
    setTimeout(() => {
        swapBtn.style.transform = '';
    }, 300);
}

// Clear all fields
function clearAll() {
    const activePanel = document.querySelector('.converter-panel.active');
    const inputs = activePanel.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.add('pulse-animation');
        setTimeout(() => input.classList.remove('pulse-animation'), 300);
    });
}

// Copy result to clipboard
function copyResult() {
    const activePanel = document.querySelector('.converter-panel.active');
    const output = activePanel.querySelector('input[readonly]');
    
    if (output && output.value) {
        navigator.clipboard.writeText(output.value).then(() => {
            // Visual feedback
            const copyBtn = document.querySelector('.copy-btn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.background = '#4caf50';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '#4ecdc4';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            output.select();
            document.execCommand('copy');
        });
    } else {
        // Show message if no result to copy
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-exclamation"></i> No Result';
        copyBtn.style.background = '#ff9800';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#4ecdc4';
        }, 2000);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'c':
                if (e.target.tagName !== 'INPUT') {
                    e.preventDefault();
                    copyResult();
                }
                break;
            case 'Delete':
            case 'Backspace':
                if (e.target.tagName !== 'INPUT') {
                    e.preventDefault();
                    clearAll();
                }
                break;
        }
    }
    
    // Number keys for tab switching
    if (e.key >= '1' && e.key <= '8' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT') {
        const tabIndex = parseInt(e.key) - 1;
        const tabs = document.querySelectorAll('.tab-btn');
        if (tabs[tabIndex]) {
            tabs[tabIndex].click();
        }
    }
});

// Initialize converter when page loads
let converter;
document.addEventListener('DOMContentLoaded', () => {
    converter = new UnitConverter();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.tab) {
        converter.switchTab(e.state.tab);
    }
});

// Save current tab to history
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
        const tab = e.target.getAttribute('data-tab');
        history.pushState({tab: tab}, '', `#${tab}`);
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh conversions when page becomes visible again
        const activePanel = document.querySelector('.converter-panel.active');
        if (activePanel) {
            const input = activePanel.querySelector('input[type="number"]');
            if (input && input.value) {
                const type = activePanel.id;
                converter.convert(type);
            }
        }
    }
});

// Responsive design helper
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        const span = tab.querySelector('span');
        if (span) {
            span.style.display = isMobile ? 'none' : 'inline';
        }
    });
}

window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize);