function formatText(command) {
    const editor = document.getElementById('textEditor');
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    
    if (selectedText) {
        let formattedText = selectedText;
        switch(command) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                break;
        }
        
        editor.value = editor.value.substring(0, start) + formattedText + editor.value.substring(end);
    }
}

function clearText() {
    if (confirm('Are you sure you want to clear all text?')) {
        document.getElementById('textEditor').value = '';
    }
}

function downloadText() {
    const text = document.getElementById('textEditor').value;
    if (text.trim() === '') {
        alert('Please enter some text to download');
        return;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
