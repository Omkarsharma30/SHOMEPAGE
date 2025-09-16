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

    // Function to generate QR code using Google Charts API (most reliable)
    function generateQRCodeUsingAPI(data) {
        try {
            // Clear container
            qrCodeContainer.innerHTML = '';
            
            // Get QR code options
            const size = parseInt(qrSizeSlider.value);
            const fgColor = foregroundColorPicker.value.replace('#', '');
            const bgColor = backgroundColorPicker.value.replace('#', '');
            const errorLevel = errorCorrectionSelect.value;
            
            // Error correction mapping
            const errorMapping = {
                'L': 'L',
                'M': 'M',
                'Q': 'Q', 
                'H': 'H'
            };
            
            // Format the API URL with parameters
            const apiUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(data)}&chs=${size}x${size}&chld=${errorMapping[errorLevel]}|${1}&chco=${fgColor}`;
            
            // Create image element
            const qrImg = document.createElement('img');
            qrImg.className = 'img-fluid fade-in';
            qrImg.alt = 'QR Code';
            
            // Show loading indicator
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'spinner';
            qrCodeContainer.appendChild(loadingDiv);
            
            // When image loads, replace loading indicator
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
                console.error("Error loading QR code image");
                qrCodeContainer.innerHTML = '<div class="alert alert-danger">Error generating QR code. Please try again.</div>';
                
                // Try fallback method
                generateQRWithFallbackMethod(data);
            };
            
            // Set source to trigger loading
            qrImg.src = apiUrl;
            
        } catch (error) {
            console.error("API QR generation error:", error);
            qrCodeContainer.innerHTML = '<div class="alert alert-danger">Error generating QR code. Please try again.</div>';
            
            // Try fallback method
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
            
            // Use QR Server's SVG output format
            const svgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(currentQRValue)}&format=svg`;
            
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

    // Initialize with text field visible
    document.getElementById('textField').classList.remove('d-none');
});
