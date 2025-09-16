# PDF Split Pro - Advanced PDF Splitter

A modern, feature-rich web application for splitting PDF files with multiple splitting options and an intuitive user interface.

## Features

### 🎯 **Multiple Split Options**
- **Split by Pages**: Specify individual pages or page ranges (e.g., 1-5, 7, 10-15)
- **Equal Parts**: Split PDF into equal number of parts
- **Split by Size**: Split based on maximum file size per part
- **Split by Bookmarks**: Split at bookmark locations (when available)

### 🎨 **Modern UI/UX**
- Responsive design that works on all devices
- Drag & drop file upload
- Real-time progress indicators
- Beautiful gradient design with smooth animations
- Interactive file preview and validation

### ⚡ **Advanced Features**
- **Quality Preservation**: Maintain original PDF quality
- **Watermark Support**: Add custom watermarks to split files
- **Batch Download**: Download all split files as a ZIP
- **Real-time Validation**: Instant feedback on page ranges and settings
- **Error Handling**: Comprehensive error messages and recovery

### 🔒 **Privacy & Security**
- **Client-side Processing**: All PDF processing happens in your browser
- **No Server Upload**: Files never leave your device
- **Zero Data Collection**: No tracking or data storage

## How to Use

1. **Upload PDF**: Drag and drop your PDF file or click to browse
2. **Choose Split Method**: Select from four different splitting options
3. **Configure Settings**: Set your preferences based on the chosen method
4. **Split PDF**: Click the split button to process your file
5. **Download Results**: Download individual files or all as a ZIP

## Split Options Explained

### 📄 Split by Pages
Perfect for extracting specific sections or chapters:
- Enter page ranges like `1-5, 7, 10-15`
- Extract individual pages like `3, 8, 12`
- Mix ranges and individual pages
- Real-time preview of selected ranges

### ⚖️ Equal Parts
Ideal for dividing content evenly:
- Specify number of parts (2-50)
- Automatically calculates pages per part
- Handles remainder pages intelligently

### 📏 Split by Size
Great for email attachments or storage limits:
- Set maximum size per file (MB)
- Automatically determines split points
- Maintains page integrity

### 🔖 Split by Bookmarks
Perfect for documents with clear sections:
- Automatically detects PDF bookmarks
- Split at each bookmark location
- Preserves document structure

## Technical Specifications

### **Browser Compatibility**
- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

### **File Support**
- PDF format only
- Maximum file size: 100MB (browser dependent)
- Password-protected PDFs not supported

### **Performance**
- Client-side processing using PDF-lib
- No server dependencies
- Fast processing even for large files

## Installation

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No additional setup required!

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **PDF Processing**: PDF-lib library
- **File Compression**: JSZip library
- **Icons**: Font Awesome
- **Styling**: Custom CSS with CSS Grid and Flexbox

## Browser Security Note

Due to browser security restrictions, this application works entirely client-side. Your PDF files are processed locally in your browser and never uploaded to any server.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

---

**PDF Split Pro** - Making PDF splitting simple, fast, and secure! 🚀
