# PDF Constructor - Complete PDF Editor

A powerful, frontend-only PDF editing web application built with HTML, CSS, JavaScript, and Bootstrap. No backend required - all PDF manipulation happens directly in your browser!

## 🚀 Features

### Core PDF Operations
- **Upload PDF** - Load any PDF file from your computer
- **Add Pages** - Insert blank pages at any position
- **Remove Pages** - Delete specific pages from the document
- **Rotate Pages** - Rotate individual pages by 90°, 180°, or 270°
- **Move Pages** - Reorder pages by moving them to different positions
- **Merge PDFs** - Combine multiple PDF files into one document

### Advanced Features
- **Real-time Preview** - See changes instantly as you edit
- **Zoom Controls** - Zoom in, zoom out, or fit to width
- **Page Selection** - Click on pages to select them for operations
- **Drag & Drop** - Simply drag PDF files into the preview area
- **Keyboard Shortcuts** - Quick access to common operations
- **Download Edited PDF** - Save your modified PDF with one click

## 🎯 How to Use

### Getting Started
1. Open `index.html` in your web browser
2. Upload a PDF file using the file input or drag & drop
3. Use the sidebar tools to edit your PDF
4. Download the modified PDF when you're done

### PDF Operations

#### Adding Pages
1. Enter the position where you want to add a page (or leave blank for end)
2. Click the "Add" button
3. A blank page will be inserted at the specified position

#### Removing Pages
1. Enter the page number you want to remove
2. Click the "Remove" button
3. The page will be deleted from the document

#### Rotating Pages
1. Enter the page number to rotate
2. Select the rotation angle (90°, 180°, or 270°)
3. Click the "Rotate" button

#### Moving Pages
1. Enter the source page number in "From"
2. Enter the destination position in "To"
3. Click the "Move" button

#### Merging PDFs
1. Upload the main PDF first
2. Select another PDF file to merge
3. Click the "Merge" button to combine them

### Keyboard Shortcuts
- `Ctrl+O` - Open file dialog
- `Ctrl+S` - Download PDF
- `Ctrl++` - Zoom in
- `Ctrl+-` - Zoom out

## 🛠️ Technical Details

### Libraries Used
- **Bootstrap 5.3** - UI framework and styling
- **PDF-lib** - PDF manipulation and editing
- **PDF.js** - PDF rendering and display
- **Bootstrap Icons** - Icon library

### Browser Compatibility
- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

### File Support
- Supports all standard PDF files
- Maximum file size depends on browser memory limits
- Works entirely offline after initial load

## 📁 Project Structure

```
PDF CONSTRUCTION/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles
├── script.js           # JavaScript functionality
├── README.md           # This file
└── .github/
    └── copilot-instructions.md
```

## 🎨 Features in Detail

### User Interface
- **Responsive Design** - Works on desktop and mobile devices
- **Modern UI** - Clean, professional interface with Bootstrap
- **Visual Feedback** - Toast notifications for all operations
- **Loading States** - Progress indicators for file operations
- **Page Selection** - Visual highlighting of selected pages

### PDF Editing Capabilities
- **Non-destructive Editing** - Original file remains unchanged
- **Real-time Updates** - See changes immediately
- **Error Handling** - Graceful handling of invalid operations
- **Undo/Reset** - Reset to original state at any time

### Performance
- **Client-side Processing** - No server required
- **Memory Efficient** - Optimized for large PDF files
- **Fast Rendering** - Smooth zooming and page navigation

## 🔧 Development

### Running Locally
1. Clone or download the project
2. Open `index.html` in a web browser
3. No build process or dependencies required!

### Adding Features
The codebase is modular and well-commented:
- `PDFConstructor` class handles all PDF operations
- Event-driven architecture for easy extension
- Bootstrap components for consistent UI

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 🎉 Enjoy Your PDF Editing!

This tool provides everything you need to edit PDFs directly in your browser. No installations, no accounts, no servers - just pure client-side PDF editing power!
