// Universal Bug Reporting System
// Enhanced bug reporting functionality for all tools

class BugReportSystem {
    constructor() {
        this.modal = null;
        this.currentTool = this.detectCurrentTool();
        this.init();
    }

    detectCurrentTool() {
        const path = window.location.pathname;
        const toolMap = {
            '/PDF_MERGE/': 'PDF Merge Tool',
            '/PDF_SPLIT/': 'PDF Split Tool',
            '/PASSWORD_GENERATOR/': 'Password Generator',
            '/qr/': 'QR Code Generator',
            '/COLOR_PICKER/': 'Color Picker',
            '/UNIT_CONVERTER/': 'Unit Converter',
            '/text_editor/': 'Text Editor',
            '/word_counter/': 'Word Counter',
            '/case_converter/': 'Case Converter',
            '/code_formatter/': 'Code Formatter',
            '/image_merger/': 'Image Merger',
            '/IMG_TO_PDF/': 'Image to PDF',
            '/PDF_PAGE_REMOVER/': 'PDF Page Remover',
            '/PDF CONSTRUCTION/': 'PDF Construction'
        };

        for (const [path_key, tool_name] of Object.entries(toolMap)) {
            if (path.includes(path_key)) {
                return tool_name;
            }
        }
        
        return 'Study Care & Computer Classes - Main Site';
    }

    init() {
        this.createBugReportButton();
        this.createBugReportModal();
        this.attachEventListeners();
    }

    createBugReportButton() {
        const container = document.createElement('div');
        container.className = 'bug-report-container';
        container.innerHTML = `
            <button class="bug-report-button" id="bugReportBtn" title="Report a bug">
                <i class="fas fa-bug"></i>
                Report Bug
            </button>
        `;
        document.body.appendChild(container);
    }

    createBugReportModal() {
        const modal = document.createElement('div');
        modal.className = 'bug-report-modal';
        modal.id = 'bugReportModal';
        modal.innerHTML = `
            <div class="bug-report-form">
                <div class="bug-report-header">
                    <h3 class="bug-report-title">
                        <i class="fas fa-bug"></i>
                        Report a Bug
                    </h3>
                    <button class="close-modal" id="closeBugModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <form id="bugReportForm">
                    <div class="form-group">
                        <label class="form-label">Tool/Page</label>
                        <input type="text" class="form-input" id="toolName" value="${this.currentTool}" readonly>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Your Name *</label>
                            <input type="text" class="form-input" id="reporterName" placeholder="Enter your full name" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" class="form-input" id="reporterEmail" placeholder="your@email.com (for follow-up)">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Bug Category *</label>
                        <div class="bug-category-chips">
                            <div class="category-chip" data-category="ui">
                                <i class="fas fa-palette"></i>
                                UI/Visual Issue
                            </div>
                            <div class="category-chip" data-category="functionality">
                                <i class="fas fa-cogs"></i>
                                Functionality
                            </div>
                            <div class="category-chip" data-category="performance">
                                <i class="fas fa-tachometer-alt"></i>
                                Performance
                            </div>
                            <div class="category-chip" data-category="compatibility">
                                <i class="fas fa-globe"></i>
                                Browser/Device
                            </div>
                            <div class="category-chip" data-category="data">
                                <i class="fas fa-database"></i>
                                Data Loss
                            </div>
                            <div class="category-chip" data-category="security">
                                <i class="fas fa-shield-alt"></i>
                                Security
                            </div>
                            <div class="category-chip" data-category="other">
                                <i class="fas fa-question-circle"></i>
                                Other
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Priority Level *</label>
                        <div class="priority-options">
                            <div class="priority-option low" data-priority="low">
                                <i class="fas fa-arrow-down"></i>
                                <strong>Low</strong><br>
                                <small>Minor cosmetic issue</small>
                            </div>
                            <div class="priority-option medium" data-priority="medium">
                                <i class="fas fa-minus"></i>
                                <strong>Medium</strong><br>
                                <small>Affects functionality</small>
                            </div>
                            <div class="priority-option high" data-priority="high">
                                <i class="fas fa-arrow-up"></i>
                                <strong>High</strong><br>
                                <small>Critical/Blocking issue</small>
                            </div>
                            <div class="priority-option urgent" data-priority="urgent">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>Urgent</strong><br>
                                <small>Security/Data loss</small>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Bug Title *</label>
                        <input type="text" class="form-input" id="bugTitle" placeholder="Brief, descriptive title of the issue" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Detailed Description *</label>
                        <textarea class="form-textarea" id="bugDescription" placeholder="Please provide a detailed description:&#10;• What were you trying to do?&#10;• What actually happened?&#10;• What did you expect to happen?&#10;• How does this impact your work?" required rows="6"></textarea>
                        <div class="form-hint">
                            <i class="fas fa-lightbulb"></i>
                            Tip: The more details you provide, the faster we can fix the issue!
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Browser Information</label>
                            <input type="text" class="form-input" id="browserInfo" readonly>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Screen Resolution</label>
                            <input type="text" class="form-input" id="screenInfo" readonly>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Steps to Reproduce</label>
                        <textarea class="form-textarea" id="stepsToReproduce" placeholder="1. Go to [specific page/section]&#10;2. Click on [specific button/link]&#10;3. Enter [specific data]&#10;4. Observe the error/issue" rows="4"></textarea>
                        <div class="form-hint">
                            <i class="fas fa-info-circle"></i>
                            Help us reproduce the issue by providing step-by-step instructions
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Additional Information</label>
                        <textarea class="form-textarea" id="additionalInfo" placeholder="• Error messages you saw&#10;• Files or data involved&#10;• Frequency of the issue&#10;• Any workarounds you found" rows="3"></textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-cancel" id="cancelReport">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button type="submit" class="btn-submit" id="submitReport">
                            <i class="fas fa-paper-plane"></i> Submit Bug Report
                        </button>
                    </div>
                </form>

                <div class="success-message" id="successMessage">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h4 class="success-title">Bug Report Submitted!</h4>
                    <p class="success-text">
                        Thank you for helping us improve! We've received your bug report and will investigate it as soon as possible.
                    </p>
                    <button class="btn-submit" onclick="bugReportSystem.closeModal()" style="margin-top: 20px;">
                        Close
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
        this.populateSystemInfo();
    }

    populateSystemInfo() {
        // Browser information
        const browserInfo = this.getBrowserInfo();
        document.getElementById('browserInfo').value = browserInfo;

        // Screen information
        const screenInfo = `${screen.width}x${screen.height}`;
        document.getElementById('screenInfo').value = screenInfo;
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = "Unknown";
        
        if (ua.includes("Firefox")) {
            browser = "Firefox";
        } else if (ua.includes("Chrome")) {
            browser = "Chrome";
        } else if (ua.includes("Safari")) {
            browser = "Safari";
        } else if (ua.includes("Edge")) {
            browser = "Edge";
        } else if (ua.includes("Opera")) {
            browser = "Opera";
        }
        
        return `${browser} on ${navigator.platform}`;
    }

    attachEventListeners() {
        // Open modal
        document.getElementById('bugReportBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Close modal
        document.getElementById('closeBugModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelReport').addEventListener('click', () => {
            this.closeModal();
        });

        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Category chips
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('selected'));
                chip.classList.add('selected');
            });
        });

        // Priority options
        document.querySelectorAll('.priority-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.priority-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Form submission
        document.getElementById('bugReportForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBugReport();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + B to open bug report
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                this.openModal();
            }
            
            // Escape to close modal
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('reporterName').focus();
        }, 300);
        
        // Reset form
        this.resetForm();
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.resetForm();
    }

    resetForm() {
        document.getElementById('bugReportForm').reset();
        document.getElementById('toolName').value = this.currentTool;
        this.populateSystemInfo();
        
        // Reset selections
        document.querySelectorAll('.category-chip.selected').forEach(chip => {
            chip.classList.remove('selected');
        });
        document.querySelectorAll('.priority-option.selected').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Hide success message
        document.getElementById('successMessage').classList.remove('show');
        document.getElementById('bugReportForm').style.display = 'block';
    }

    async submitBugReport() {
        const submitBtn = document.getElementById('submitReport');
        const originalText = submitBtn.innerHTML;
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Simulate API call (replace with actual endpoint)
            await this.sendBugReport(formData);
            
            // Show success message
            document.getElementById('bugReportForm').style.display = 'none';
            document.getElementById('successMessage').classList.add('show');
            
            // Auto-close after 5 seconds
            setTimeout(() => {
                this.closeModal();
            }, 5000);
            
        } catch (error) {
            console.error('Error submitting bug report:', error);
            this.showErrorMessage('Failed to submit bug report. Please try again.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm() {
        const requiredFields = ['reporterName', 'bugTitle', 'bugDescription'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                field.style.borderColor = '#e9ecef';
            }
        });

        // Check if category is selected
        const selectedCategory = document.querySelector('.category-chip.selected');
        if (!selectedCategory) {
            this.showErrorMessage('Please select a bug category.');
            isValid = false;
        }

        // Check if priority is selected
        const selectedPriority = document.querySelector('.priority-option.selected');
        if (!selectedPriority) {
            this.showErrorMessage('Please select a priority level.');
            isValid = false;
        }

        return isValid;
    }

    collectFormData() {
        const selectedCategory = document.querySelector('.category-chip.selected')?.dataset.category;
        const selectedPriority = document.querySelector('.priority-option.selected')?.dataset.priority;

        return {
            tool: document.getElementById('toolName').value,
            reporter: {
                name: document.getElementById('reporterName').value,
                email: document.getElementById('reporterEmail').value
            },
            bug: {
                title: document.getElementById('bugTitle').value,
                description: document.getElementById('bugDescription').value,
                category: selectedCategory,
                priority: selectedPriority,
                stepsToReproduce: document.getElementById('stepsToReproduce').value,
                additionalInfo: document.getElementById('additionalInfo').value
            },
            system: {
                browser: document.getElementById('browserInfo').value,
                screen: document.getElementById('screenInfo').value,
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            }
        };
    }

    async sendBugReport(data) {
        // Use Web3Forms API for bug reports
        const web3FormsData = {
            access_key: "b98071bf-4719-412a-8980-4908d1be0f07",
            name: data.reporter.name,
            email: data.reporter.email || "noreply@studycarencomputerclasses.space",
            subject: `[BUG REPORT] ${data.bug.title} - ${data.tool}`,
            message: this.formatBugReportMessage(data),
            from_name: "Study Care Bug Report System",
            botcheck: ""
        };

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(web3FormsData)
            });

            const result = await response.json();
            
            if (response.status === 200 && result.success) {
                return result;
            } else {
                throw new Error(result.message || 'Failed to submit bug report');
            }
        } catch (error) {
            console.error('Web3Forms submission error:', error);
            throw error;
        }
    }

    formatBugReportMessage(data) {
        return `
🐛 BUG REPORT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━

📍 Tool/Page: ${data.tool}
👤 Reporter: ${data.reporter.name}
📧 Email: ${data.reporter.email || 'Not provided'}

🔹 ISSUE SUMMARY
Title: ${data.bug.title}
Category: ${data.bug.category?.toUpperCase() || 'Not specified'}
Priority: ${data.bug.priority?.toUpperCase() || 'Not specified'}

📝 DESCRIPTION
${data.bug.description}

${data.bug.stepsToReproduce ? `🔄 STEPS TO REPRODUCE
${data.bug.stepsToReproduce}` : ''}

${data.bug.additionalInfo ? `ℹ️ ADDITIONAL INFORMATION
${data.bug.additionalInfo}` : ''}

💻 SYSTEM INFORMATION
Browser: ${data.system.browser}
Screen: ${data.system.screen}
URL: ${data.system.url}
Timestamp: ${data.system.timestamp}
User Agent: ${data.system.userAgent}

━━━━━━━━━━━━━━━━━━━━━━━━
This report was generated automatically by the Study Care Bug Report System.
For urgent issues, please contact: studycareandcomputerclasses@gmail.com
        `.trim();
    }

    showErrorMessage(message) {
        // Create temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10001;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
            animation: slideInRight 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 4000);
    }
}

// Initialize bug reporting system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../bug-report.css';
    document.head.appendChild(link);

    // Initialize system
    window.bugReportSystem = new BugReportSystem();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BugReportSystem;
}