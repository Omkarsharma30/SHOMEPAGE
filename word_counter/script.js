document.addEventListener('DOMContentLoaded', function() {
    const textInput = document.getElementById('textInput');
    textInput.addEventListener('input', updateStats);
    textInput.addEventListener('paste', function() {
        setTimeout(updateStats, 10);
    });
});

function updateStats() {
    const text = document.getElementById('textInput').value;
    
    // Word count
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    document.getElementById('wordCount').textContent = words;
    
    // Character count (with spaces)
    document.getElementById('charCount').textContent = text.length;
    
    // Character count (without spaces)
    const charNoSpaces = text.replace(/\s/g, '').length;
    document.getElementById('charNoSpaceCount').textContent = charNoSpaces;
    
    // Paragraph count
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim() !== '').length;
    document.getElementById('paragraphCount').textContent = paragraphs;
    
    // Sentence count
    const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim() !== '').length;
    document.getElementById('sentenceCount').textContent = sentences;
    
    // Reading time (assuming 200 words per minute)
    const readingTime = Math.ceil(words / 200);
    document.getElementById('readingTime').textContent = readingTime;
}

function clearText() {
    if (confirm('Are you sure you want to clear all text?')) {
        document.getElementById('textInput').value = '';
        updateStats();
    }
}

function exportStats() {
    const text = document.getElementById('textInput').value;
    if (text.trim() === '') {
        alert('Please enter some text first');
        return;
    }
    
    const stats = {
        words: document.getElementById('wordCount').textContent,
        characters: document.getElementById('charCount').textContent,
        charactersNoSpaces: document.getElementById('charNoSpaceCount').textContent,
        paragraphs: document.getElementById('paragraphCount').textContent,
        sentences: document.getElementById('sentenceCount').textContent,
        readingTime: document.getElementById('readingTime').textContent
    };
    
    const statsText = `Text Statistics Report
Generated on: ${new Date().toLocaleString()}

Words: ${stats.words}
Characters (with spaces): ${stats.characters}
Characters (without spaces): ${stats.charactersNoSpaces}
Paragraphs: ${stats.paragraphs}
Sentences: ${stats.sentences}
Reading Time: ${stats.readingTime} minutes

Original Text:
${text}`;
    
    const blob = new Blob([statsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-stats.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
