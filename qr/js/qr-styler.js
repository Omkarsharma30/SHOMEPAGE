// QR Code Styling Module

const QRStyler = {
    // Apply a shadow effect to the QR code
    applyShadowEffect: function(container, color = 'rgba(0, 0, 0, 0.3)') {
        container.style.boxShadow = `0 10px 20px ${color}`;
        container.style.borderRadius = '8px';
        container.style.overflow = 'hidden';
        container.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        
        // Add hover effects
        container.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = `0 15px 30px ${color}`;
        });
        
        container.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = `0 10px 20px ${color}`;
        });
    },
    
    // Add a custom frame around the QR code
    addFrame: function(imgElement, frameColor = '#0d6efd', padding = 16) {
        const wrapper = document.createElement('div');
        wrapper.className = 'qr-frame';
        wrapper.style.padding = `${padding}px`;
        wrapper.style.backgroundColor = frameColor;
        wrapper.style.borderRadius = '8px';
        wrapper.style.display = 'inline-block';
        
        // Add the image to the frame
        if (imgElement.parentNode) {
            imgElement.parentNode.insertBefore(wrapper, imgElement);
        }
        wrapper.appendChild(imgElement);
        
        // Apply some styling to the image
        imgElement.style.backgroundColor = 'white';
        imgElement.style.borderRadius = '4px';
        imgElement.style.display = 'block';
        
        return wrapper;
    },
    
    // Add a custom logo to the center of the QR code
    addLogoToQR: function(qrImg, logoUrl, size = 0.2) {
        return new Promise((resolve, reject) => {
            try {
                // Create a container
                const container = document.createElement('div');
                container.style.position = 'relative';
                container.style.display = 'inline-block';
                
                // Add the QR image
                const qrImage = qrImg.cloneNode(true);
                container.appendChild(qrImage);
                
                // Create logo element
                const logo = document.createElement('img');
                logo.style.position = 'absolute';
                logo.style.top = '50%';
                logo.style.left = '50%';
                logo.style.transform = 'translate(-50%, -50%)';
                logo.style.width = `${size * 100}%`;
                logo.style.height = 'auto';
                logo.style.borderRadius = '50%';
                logo.style.backgroundColor = 'white';
                logo.style.padding = '2px';
                logo.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
                
                // When logo loads, add it to container
                logo.onload = function() {
                    container.appendChild(logo);
                    resolve(container);
                };
                
                // Handle errors
                logo.onerror = function() {
                    reject(new Error('Failed to load logo'));
                };
                
                // Set logo source
                logo.src = logoUrl;
            } catch (error) {
                reject(error);
            }
        });
    },
    
    // Apply gradient background to container
    applyGradientBackground: function(container, startColor = '#f8f9fa', endColor = '#e9ecef') {
        container.style.background = `linear-gradient(135deg, ${startColor}, ${endColor})`;
        container.style.padding = '20px';
        container.style.borderRadius = '10px';
    },
    
    // Create a download button with enhanced styling
    createStyledButton: function(text, btnClass, iconClass) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn ${btnClass} mb-2`;
        btn.innerHTML = `<i class="bi ${iconClass}"></i> ${text}`;
        btn.style.transition = 'all 0.3s ease';
        btn.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        
        // Add hover effects
        btn.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        });
        
        btn.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        });
        
        return btn;
    },
    
    // Generate a high-quality QR code with custom styling
    generateHighQualityQR: function(data, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                // Set default options
                const settings = {
                    size: options.size || 300,
                    margin: options.margin || 4,
                    qrType: options.qrType || 'png',
                    ecLevel: options.ecLevel || 'M',
                    color: options.color || '000000',
                    bgColor: options.bgColor || 'ffffff',
                };
                
                // Use QRServer.com API which provides higher quality QR codes
                const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${settings.size}x${settings.size}&data=${encodeURIComponent(data)}&margin=${settings.margin}&ecc=${settings.ecLevel}&color=${settings.color.replace('#', '')}&bgcolor=${settings.bgColor.replace('#', '')}&format=${settings.qrType}`;
                
                // Create image element
                const qrImg = document.createElement('img');
                qrImg.className = 'img-fluid fade-in high-quality-qr';
                qrImg.alt = 'QR Code';
                qrImg.style.maxWidth = '100%';
                
                // When image loads
                qrImg.onload = function() {
                    resolve(qrImg);
                };
                
                // Handle errors
                qrImg.onerror = function() {
                    reject(new Error('Failed to generate high-quality QR code'));
                };
                
                // Set source to trigger loading
                qrImg.src = apiUrl;
            } catch (error) {
                reject(error);
            }
        });
    }
};
