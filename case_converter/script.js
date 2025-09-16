function convertCase(type) {
    const inputText = document.getElementById('inputText').value;
    const outputElement = document.getElementById('outputText');
    
    if (!inputText.trim()) {
        alert('Please enter some text to convert');
        return;
    }
    
    let convertedText = '';
    
    switch(type) {
        case 'upper':
            convertedText = inputText.toUpperCase();
            break;
            
        case 'lower':
            convertedText = inputText.toLowerCase();
            break;
            
        case 'title':
            convertedText = inputText.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
            break;
            
        case 'sentence':
            convertedText = inputText.toLowerCase().replace(/(^\w|\.\s*\w)/g, l => l.toUpperCase());
            break;
            
        case 'camel':
            convertedText = inputText
                .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                    index === 0 ? word.toLowerCase() : word.toUpperCase())
                .replace(/\s+/g, '');
            break;
            
        case 'pascal':
            convertedText = inputText
                .replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase())
                .replace(/\s+/g, '');
            break;
            
        case 'snake':
            convertedText = inputText
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^\w_]/g, '');
            break;
            
        case 'kebab':
            convertedText = inputText
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]/g, '');
            break;
            
        default:
            convertedText = inputText;
    }
    
    outputElement.value = convertedText;
}

function copyOutput() {
    const outputText = document.getElementById('outputText');
    
    if (!outputText.value.trim()) {
        alert('No converted text to copy');
        return;
    }
    
    outputText.select();
    outputText.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        
        // Visual feedback
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
        
    } catch (err) {
        alert('Failed to copy text. Please select and copy manually.');
    }
}

function clearAll() {
    if (confirm('Clear all text?')) {
        document.getElementById('inputText').value = '';
        document.getElementById('outputText').value = '';
        document.getElementById('inputText').focus();
    }
}

// Auto-focus on input when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('inputText').focus();
});
