function formatCode() {
    const inputCode = document.getElementById('inputCode').value;
    const language = document.getElementById('languageSelect').value;
    const indentSize = document.getElementById('indentSize').value;
    
    if (!inputCode.trim()) {
        alert('Please enter some code to format');
        return;
    }
    
    try {
        let formattedCode = '';
        
        switch(language) {
            case 'javascript':
                formattedCode = formatJavaScript(inputCode, indentSize);
                break;
            case 'html':
                formattedCode = formatHTML(inputCode, indentSize);
                break;
            case 'css':
                formattedCode = formatCSS(inputCode, indentSize);
                break;
            case 'json':
                formattedCode = formatJSON(inputCode, indentSize);
                break;
            case 'xml':
                formattedCode = formatXML(inputCode, indentSize);
                break;
            default:
                formattedCode = inputCode;
        }
        
        document.getElementById('outputCode').value = formattedCode;
    } catch (error) {
        alert('Error formatting code: ' + error.message);
    }
}

function formatJSON(code, indentSize) {
    const indent = indentSize === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize));
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, indent);
}

function formatJavaScript(code, indentSize) {
    const indent = indentSize === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize));
    let formatted = '';
    let indentLevel = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const nextChar = code[i + 1];
        
        if (!inString && (char === '"' || char === "'" || char === '`')) {
            inString = true;
            stringChar = char;
            formatted += char;
        } else if (inString && char === stringChar && code[i - 1] !== '\\') {
            inString = false;
            stringChar = '';
            formatted += char;
        } else if (!inString) {
            if (char === '{' || char === '[') {
                formatted += char + '\n';
                indentLevel++;
                formatted += indent.repeat(indentLevel);
            } else if (char === '}' || char === ']') {
                formatted = formatted.trim();
                formatted += '\n';
                indentLevel--;
                formatted += indent.repeat(indentLevel) + char;
                if (nextChar && nextChar !== ',' && nextChar !== ';') {
                    formatted += '\n' + indent.repeat(indentLevel);
                }
            } else if (char === ';') {
                formatted += char + '\n' + indent.repeat(indentLevel);
            } else if (char === ',' && nextChar !== ' ') {
                formatted += char + '\n' + indent.repeat(indentLevel);
            } else {
                formatted += char;
            }
        } else {
            formatted += char;
        }
    }
    
    return formatted.replace(/\n\s*\n/g, '\n').trim();
}

function formatHTML(code, indentSize) {
    const indent = indentSize === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize));
    let formatted = '';
    let indentLevel = 0;
    let i = 0;
    
    while (i < code.length) {
        if (code[i] === '<') {
            let tagEnd = code.indexOf('>', i);
            if (tagEnd === -1) break;
            
            let tag = code.substring(i, tagEnd + 1);
            let tagName = tag.match(/<\/?([a-zA-Z0-9-]+)/);
            
            if (tagName) {
                if (tag.startsWith('</')) {
                    indentLevel--;
                    formatted += indent.repeat(indentLevel) + tag + '\n';
                } else if (tag.endsWith('/>')) {
                    formatted += indent.repeat(indentLevel) + tag + '\n';
                } else {
                    formatted += indent.repeat(indentLevel) + tag + '\n';
                    if (!['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName[1].toLowerCase())) {
                        indentLevel++;
                    }
                }
            } else {
                formatted += tag;
            }
            
            i = tagEnd + 1;
        } else {
            let nextTag = code.indexOf('<', i);
            if (nextTag === -1) nextTag = code.length;
            
            let content = code.substring(i, nextTag).trim();
            if (content) {
                formatted += indent.repeat(indentLevel) + content + '\n';
            }
            
            i = nextTag;
        }
    }
    
    return formatted.replace(/\n\s*\n/g, '\n').trim();
}

function formatCSS(code, indentSize) {
    const indent = indentSize === 'tab' ? '\t' : ' '.repeat(parseInt(indentSize));
    let formatted = '';
    let indentLevel = 0;
    let i = 0;
    
    while (i < code.length) {
        const char = code[i];
        
        if (char === '{') {
            formatted += ' {\n';
            indentLevel++;
        } else if (char === '}') {
            formatted = formatted.trim() + '\n';
            indentLevel--;
            formatted += indent.repeat(indentLevel) + '}\n';
        } else if (char === ';') {
            formatted += ';\n' + indent.repeat(indentLevel);
        } else if (char === ',') {
            formatted += ',\n' + indent.repeat(indentLevel);
        } else {
            formatted += char;
        }
        
        i++;
    }
    
    return formatted.replace(/\n\s*\n/g, '\n').trim();
}

function formatXML(code, indentSize) {
    return formatHTML(code, indentSize); // Similar formatting logic
}

function minifyCode() {
    const inputCode = document.getElementById('inputCode').value;
    const language = document.getElementById('languageSelect').value;
    
    if (!inputCode.trim()) {
        alert('Please enter some code to minify');
        return;
    }
    
    let minified = inputCode
        .replace(/\s+/g, ' ')
        .replace(/;\s+/g, ';')
        .replace(/{\s+/g, '{')
        .replace(/\s+}/g, '}')
        .replace(/,\s+/g, ',')
        .trim();
    
    document.getElementById('outputCode').value = minified;
}

function clearInput() {
    if (confirm('Clear input code?')) {
        document.getElementById('inputCode').value = '';
        document.getElementById('outputCode').value = '';
    }
}

function copyOutput() {
    const outputCode = document.getElementById('outputCode');
    
    if (!outputCode.value.trim()) {
        alert('No formatted code to copy');
        return;
    }
    
    outputCode.select();
    outputCode.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        const button = event.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = '#28a745';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
        
    } catch (err) {
        alert('Failed to copy code. Please select and copy manually.');
    }
}
