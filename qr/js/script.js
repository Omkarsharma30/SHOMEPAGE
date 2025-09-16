// QR Code Generator Script

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const dataTypeSelect = document.getElementById('dataType');
    const inputFields = document.querySelectorAll('.input-field');
    const generateBtn = document.getElementById('generateBtn');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const downloadSection = document.getElementById('downloadSection');
    const downloadPngBtn = document.getElementById('downloadPng');
    const downloadSvgBtn = document.getElementById('downloadSvg');
    const qrSizeSlider = document.getElementById('qrSize');
    const sizeValueDisplay = document.getElementById('sizeValue');
    const foregroundColorPicker = document.getElementById('foregroundColor');
    const backgroundColorPicker = document.getElementById('backgroundColor');
    const errorCorrectionSelect = document.getElementById('errorCorrectionLevel');

    // QR code instance
    let qrInstance = null;
    let currentQRValue = null;

    // Show the appropriate input fields based on data type selection
    dataTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        
        // Hide all input fields first
        inputFields.forEach(field => {
            field.classList.add('d-none');
        });
        
        // Show the selected input field
        document.getElementById(`${selectedType}Field`).classList.remove('d-none');
    });

    // Update size value display when slider changes
    qrSizeSlider.addEventListener('input', function() {
        const size = this.value;
        sizeValueDisplay.textContent = `${size} x ${size}`;
    });
    
    // Show logo options when high error correction is selected
    if (document.getElementById('errorCorrectionLevel')) {
        document.getElementById('errorCorrectionLevel').addEventListener('change', function() {
            const logoSection = document.getElementById('logoSection');
            if (this.value === 'Q' || this.value === 'H') {
                logoSection.classList.remove('d-none');
            } else {
                logoSection.classList.add('d-none');
                if (document.getElementById('addLogo')) {
                    document.getElementById('addLogo').checked = false;
                }
                document.getElementById('logoUrlGroup').classList.add('d-none');
            }
        });
        
        // Trigger the change event to initialize the state
        const event = new Event('change');
        document.getElementById('errorCorrectionLevel').dispatchEvent(event);
    }
    
    // Show logo URL input when "Add Logo" is checked
    if (document.getElementById('addLogo')) {
        document.getElementById('addLogo').addEventListener('change', function() {
            const logoUrlGroup = document.getElementById('logoUrlGroup');
            if (this.checked) {
                logoUrlGroup.classList.remove('d-none');
            } else {
                logoUrlGroup.classList.add('d-none');
            }
        });
    }

    // Generate QR code on button click
    generateBtn.addEventListener('click', function() {
        const dataType = dataTypeSelect.value;
        let qrData = '';

        // Clear previous QR code
        qrCodeContainer.innerHTML = '<div class="spinner"></div>';
        console.log("QR Generation Started for type:", dataType);
        
        // Get data based on selected type
        switch(dataType) {
            case 'text':
                qrData = document.getElementById('textInput').value.trim();
                break;
            case 'url':
                qrData = document.getElementById('urlInput').value.trim();
                // Ensure URL has protocol
                if (qrData && !qrData.startsWith('http://') && !qrData.startsWith('https://')) {
                    qrData = 'https://' + qrData;
                }
                break;
            case 'email':
                const email = document.getElementById('emailInput').value.trim();
                const subject = document.getElementById('emailSubject').value.trim();
                const body = document.getElementById('emailBody').value.trim();
                
                qrData = `mailto:${email}`;
                if (subject) qrData += `?subject=${encodeURIComponent(subject)}`;
                if (body) qrData += `${subject ? '&' : '?'}body=${encodeURIComponent(body)}`;
                break;
            case 'phone':
                qrData = `tel:${document.getElementById('phoneInput').value.trim()}`;
                break;
            case 'sms':
                const phoneNumber = document.getElementById('smsNumber').value.trim();
                const message = document.getElementById('smsMessage').value.trim();
                qrData = `smsto:${phoneNumber}:${message}`;
                break;
            case 'wifi':
                const ssid = document.getElementById('wifiSsid').value.trim();
                const type = document.getElementById('wifiType').value;
                const password = document.getElementById('wifiPassword').value;
                const hidden = document.getElementById('wifiHidden').checked;
                
                qrData = `WIFI:S:${ssid};T:${type};P:${password};${hidden ? 'H:true' : ''};`;
                break;
            case 'vcard':
                const firstName = document.getElementById('vcardFirstName').value.trim();
                const lastName = document.getElementById('vcardLastName').value.trim();
                const vcardPhone = document.getElementById('vcardPhone').value.trim();
                const vcardEmail = document.getElementById('vcardEmail').value.trim();
                const organization = document.getElementById('vcardOrg').value.trim();
                
                qrData = 'BEGIN:VCARD\nVERSION:3.0\n';
                qrData += `N:${lastName};${firstName};;;\n`;
                qrData += `FN:${firstName} ${lastName}\n`;
                if (organization) qrData += `ORG:${organization}\n`;
                if (vcardPhone) qrData += `TEL;TYPE=CELL:${vcardPhone}\n`;
                if (vcardEmail) qrData += `EMAIL:${vcardEmail}\n`;
                qrData += 'END:VCARD';
                break;
        }

        // Validate input
        if (!qrData) {
            qrCodeContainer.innerHTML = '<div class="alert alert-danger">Please enter valid data for the selected type</div>';
            downloadSection.classList.add('d-none');
            return;
        }
        
        currentQRValue = qrData;

        // Create QR Code using API (most reliable method)
        generateQRCodeUsingAPI(qrData);
    });

    // Function to generate QR code with enhanced styling
    function generateQRCodeUsingAPI(data) {
        try {
            // Clear container and add generating animation
            qrCodeContainer.innerHTML = '';
            qrCodeContainer.classList.add('generating');
            
            // Show loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'spinner';
            qrCodeContainer.appendChild(loadingDiv);
            
            // Get QR code options
            const size = parseInt(qrSizeSlider.value);
            const fgColor = foregroundColorPicker.value;
            const bgColor = backgroundColorPicker.value;
            const errorLevel = errorCorrectionSelect.value;
            const qrStyle = document.getElementById('qrStyle').value;
            const cornerStyle = document.getElementById('cornerStyle').value;
            const addLogo = document.getElementById('addLogo') && document.getElementById('addLogo').checked;
            const logoUrl = document.getElementById('logoUrl') ? document.getElementById('logoUrl').value : '';
            
            // Generate high-quality QR code
            QRStyler.generateHighQualityQR(data, {
                size: size,
                ecLevel: errorLevel,
                color: fgColor.replace('#', ''),
                bgColor: bgColor.replace('#', ''),
                margin: 2
            })
            .then(qrImg => {
                // Clear container
                qrCodeContainer.innerHTML = '';
                qrCodeContainer.classList.remove('generating');
                
                // Apply corner styling
                if (cornerStyle === 'rounded') {
                    qrCodeContainer.classList.add('qr-rounded');
                    qrImg.style.borderRadius = '12px';
                } else if (cornerStyle === 'extraRounded') {
                    qrCodeContainer.classList.add('qr-extra-rounded');
                    qrImg.style.borderRadius = '24px';
                }
                
                // Apply selected style
                let styledElement = qrImg;
                
                if (qrStyle === 'framed') {
                    // Create frame with the foreground color
                    styledElement = QRStyler.addFrame(qrImg, fgColor);
                }
                
                // Add QR to container
                qrCodeContainer.appendChild(styledElement);
                
                // Apply shadow effect if selected
                if (qrStyle === 'shadow') {
                    QRStyler.applyShadowEffect(qrCodeContainer);
                }
                
                // Apply gradient background if selected
                if (qrStyle === 'gradient') {
                    // Create subtle gradient using the background color
                    const color1 = bgColor;
                    const color2 = adjustColor(bgColor, -20); // Slightly darker
                    QRStyler.applyGradientBackground(qrCodeContainer, color1, color2);
                }
                
                // Add logo if selected and error correction is high enough
                if (addLogo && logoUrl && (errorLevel === 'Q' || errorLevel === 'H')) {
                    QRStyler.addLogoToQR(qrImg, logoUrl, 0.22)
                    .then(logoContainer => {
                        // Replace QR with logo version
                        qrCodeContainer.innerHTML = '';
                        qrCodeContainer.appendChild(logoContainer);
                    })
                    .catch(err => {
                        console.error('Error adding logo:', err);
                        // Keep the normal QR code
                    });
                }
                
                // Store the image for download
                qrInstance = qrImg;
                
                // Show download section
                downloadSection.classList.remove('d-none');
            })
            .catch(error => {
                console.error("High quality QR generation error:", error);
                // Fall back to Google Charts API
                fallbackToGoogleCharts(data);
            });
        } catch (error) {
            console.error("API QR generation error:", error);
            qrCodeContainer.innerHTML = '<div class="alert alert-danger">Error generating QR code. Please try again.</div>';
            qrCodeContainer.classList.remove('generating');
            
            // Try fallback method
            generateQRWithFallbackMethod(data);
        }
    }
    
    // Helper function to adjust a color's brightness
    function adjustColor(color, amount) {
        let usePound = false;
        
        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }
        
        const num = parseInt(color, 16);
        
        let r = (num >> 16) + amount;
        r = Math.max(Math.min(255, r), 0).toString(16).padStart(2, '0');
        
        let g = ((num >> 8) & 0xff) + amount;
        g = Math.max(Math.min(255, g), 0).toString(16).padStart(2, '0');
        
        let b = (num & 0xff) + amount;
        b = Math.max(Math.min(255, b), 0).toString(16).padStart(2, '0');
        
        return (usePound ? "#" : "") + r + g + b;
    }
    
    // Fallback to Google Charts API if the high-quality method fails
    function fallbackToGoogleCharts(data) {
        try {
            // Get QR code options
            const size = parseInt(qrSizeSlider.value);
            const fgColor = foregroundColorPicker.value.replace('#', '');
            const bgColor = backgroundColorPicker.value.replace('#', '');
            const errorLevel = errorCorrectionSelect.value;
            
            // Format the API URL with parameters
            const apiUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(data)}&chs=${size}x${size}&chld=${errorLevel}|${1}&chco=${fgColor}`;
            
            // Create image element
            const qrImg = document.createElement('img');
            qrImg.className = 'img-fluid fade-in';
            qrImg.alt = 'QR Code';
            
            // When image loads, replace loading indicator
            qrImg.onload = function() {
                qrCodeContainer.innerHTML = '';
                qrCodeContainer.classList.remove('generating');
                qrCodeContainer.appendChild(qrImg);
                
                // Store the image for download
                qrInstance = qrImg;
                
                // Show download section
                downloadSection.classList.remove('d-none');
            };
            
            // Handle errors
            qrImg.onerror = function() {
                console.error("Error loading QR code image from Google Charts");
                qrCodeContainer.innerHTML = '<div class="alert alert-danger">Error generating QR code. Please try again.</div>';
                qrCodeContainer.classList.remove('generating');
                
                // Try final fallback method
                generateQRWithFallbackMethod(data);
            };
            
            // Set source to trigger loading
            qrImg.src = apiUrl;
            
        } catch (error) {
            console.error("Google Charts fallback error:", error);
            qrCodeContainer.innerHTML = '<div class="alert alert-danger">Error generating QR code. Please try again.</div>';
            qrCodeContainer.classList.remove('generating');
            
            // Try final fallback method
            generateQRWithFallbackMethod(data);
        }
    }
    
    // Fallback method using QR Server API
    function generateQRWithFallbackMethod(data) {
        try {
            // Get QR code options
            const size = parseInt(qrSizeSlider.value);
            
            // Use QR Server as a fallback
            const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
            
            // Create image element
            const qrImg = document.createElement('img');
            qrImg.className = 'img-fluid fade-in';
            qrImg.alt = 'QR Code';
            
            // When image loads, replace error message
            qrImg.onload = function() {
                qrCodeContainer.innerHTML = '';
                qrCodeContainer.appendChild(qrImg);
                
                // Store the image for download
                qrInstance = qrImg;
                
                // Show download section
                downloadSection.classList.remove('d-none');
            };
            
            // Handle errors
            qrImg.onerror = function() {
                console.error("Error loading QR code from fallback API");
                qrCodeContainer.innerHTML = '<div class="alert alert-danger">Error generating QR code. Please try again with different data.</div>';
                downloadSection.classList.add('d-none');
            };
            
            // Set source to trigger loading
            qrImg.src = apiUrl;
            
        } catch (error) {
            console.error("Fallback QR generation error:", error);
            qrCodeContainer.innerHTML = '<div class="alert alert-danger">Error generating QR code. Please try again with different data.</div>';
            downloadSection.classList.add('d-none');
        }
    }

    // Download PNG
    downloadPngBtn.addEventListener('click', function() {
        if (!qrInstance) {
            alert('Please generate a QR code first');
            return;
        }
        
        try {
            // Create a canvas to draw the image
            const canvas = document.createElement('canvas');
            const size = parseInt(qrSizeSlider.value);
            canvas.width = size;
            canvas.height = size;
            
            const ctx = canvas.getContext('2d');
            
            // Draw the image to canvas
            ctx.drawImage(qrInstance, 0, 0, size, size);
            
            // Try to get the data URL from canvas
            try {
                const dataURL = canvas.toDataURL('image/png');
                
                // Create download link
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = dataURL;
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (e) {
                console.error("Canvas data URL error:", e);
                
                // Direct download fallback
                const link = document.createElement('a');
                link.download = 'qrcode.png';
                link.href = qrInstance.src;
                link.target = '_blank';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("PNG download error:", error);
            alert('Error downloading PNG. Please try again.');
        }
    });

    // Download SVG - Direct API call to QR Server for SVG
    downloadSvgBtn.addEventListener('click', function() {
        if (!currentQRValue) {
            alert('Please generate a QR code first');
            return;
        }
        
        try {
            // Get QR code options
            const size = parseInt(qrSizeSlider.value);
            const fgColor = foregroundColorPicker.value.replace('#', '');
            const bgColor = backgroundColorPicker.value.replace('#', '');
            const errorLevel = errorCorrectionSelect.value;
            
            // Use QR Server's SVG output format with higher quality settings
            const svgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(currentQRValue)}&format=svg&ecc=${errorLevel}&color=${fgColor}&bgcolor=${bgColor}`;
            
            // Create download link
            const link = document.createElement('a');
            link.download = 'qrcode.svg';
            link.href = svgUrl;
            link.target = '_blank';
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error("SVG download error:", error);
            alert('Error downloading SVG. Please try again.');
        }
    });
    
    // Download PDF
    if (document.getElementById('downloadPdf')) {
        document.getElementById('downloadPdf').addEventListener('click', function() {
            if (!currentQRValue || !qrInstance) {
                alert('Please generate a QR code first');
                return;
            }
            
            try {
                // Get QR code options
                const size = parseInt(qrSizeSlider.value);
                const dataType = dataTypeSelect.value;
                
                // Get more descriptive name based on data type
                let fileName = 'qrcode.pdf';
                let qrDescription = 'QR Code';
                
                switch(dataType) {
                    case 'text': 
                        qrDescription = 'Text QR Code';
                        break;
                    case 'url': 
                        qrDescription = 'URL QR Code';
                        const urlInput = document.getElementById('urlInput').value;
                        if (urlInput && urlInput.includes('.')) {
                            const domain = new URL(urlInput.startsWith('http') ? urlInput : `https://${urlInput}`).hostname;
                            fileName = `${domain}-qrcode.pdf`;
                        }
                        break;
                    case 'email': 
                        qrDescription = 'Email QR Code';
                        const email = document.getElementById('emailInput').value;
                        if (email) fileName = `email-${email}-qrcode.pdf`;
                        break;
                    case 'vcard':
                        qrDescription = 'Contact QR Code';
                        const name = document.getElementById('vcardFirstName').value;
                        if (name) fileName = `contact-${name}-qrcode.pdf`;
                        break;
                }
                
                // Use QR Server's PDF output format
                const pdfUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(currentQRValue)}&format=pdf&ecc=${errorCorrectionSelect.value}`;
                
                // Create download link
                const link = document.createElement('a');
                link.download = fileName;
                link.href = pdfUrl;
                link.target = '_blank';
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
            } catch (error) {
                console.error("PDF download error:", error);
                alert('Error downloading PDF. Please try again.');
            }
        });
    }
    
    // Share QR Code
    if (document.getElementById('shareQR')) {
        document.getElementById('shareQR').addEventListener('click', function() {
            if (!currentQRValue || !qrInstance) {
                alert('Please generate a QR code first');
                return;
            }
            
            try {
                // Check if Web Share API is supported
                if (navigator.share) {
                    // Get QR data for title
                    const dataType = dataTypeSelect.value;
                    let title = 'QR Code';
                    let text = 'Check out this QR code!';
                    
                    switch(dataType) {
                        case 'url':
                            const url = document.getElementById('urlInput').value;
                            title = 'QR Code for ' + url;
                            text = 'Scan this QR code to visit ' + url;
                            break;
                        case 'email':
                            const email = document.getElementById('emailInput').value;
                            title = 'Email QR Code';
                            text = 'Scan this QR code to email ' + email;
                            break;
                    }
                    
                    // Create a blob from the QR image
                    fetch(qrInstance.src)
                        .then(res => res.blob())
                        .then(blob => {
                            const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                            
                            navigator.share({
                                title: title,
                                text: text,
                                files: [file]
                            }).catch(err => {
                                console.error('Share error:', err);
                                alert('Could not share the QR code. Try downloading it instead.');
                            });
                        });
                } else {
                    alert('Web Share API is not supported in your browser. Please download the QR code instead.');
                }
            } catch (error) {
                console.error("Share error:", error);
                alert('Error sharing QR code. Please try downloading it instead.');
            }
        });
    }

    // Initialize with text field visible
    document.getElementById('textField').classList.remove('d-none');
});
