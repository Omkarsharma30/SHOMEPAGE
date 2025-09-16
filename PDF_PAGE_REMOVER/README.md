# PDF Page Remover

A modern, user-friendly web application for removing pages from PDF documents. Built with vanilla JavaScript and modern CSS, this tool provides an intuitive interface for PDF page management.

## Features

- **Drag & Drop Upload**: Simply drag and drop PDF files or click to browse
- **Visual Page Preview**: See thumbnail previews of all PDF pages
- **Multiple Selection Methods**:
  - Click individual pages to select/deselect
  - Use Shift+Click for range selection
  - Type page numbers manually (e.g., "1,3,5-8")
- **Real-time Preview**: Selected pages are highlighted with a red X
- **File Information**: Display file name and size
- **Progress Indication**: Loading overlay during processing
- **Instant Download**: Download the processed PDF immediately
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## How to Use

1. **Upload PDF**: 
   - Drag and drop a PDF file onto the upload area, or
   - Click "Choose PDF File" to browse and select a file

2. **Select Pages to Remove**:
   - Click on page thumbnails to select them for removal
   - Hold Shift and click to select a range of pages
   - Or type page numbers in the input field (e.g., "2,4,6-9")

3. **Remove Pages**:
   - Click the "Remove pages" button
   - Wait for processing to complete

4. **Download Result**:
   - Click "Download PDF" to save the processed document

## Technical Features

- **Client-Side Processing**: All PDF processing happens in your browser - no server required
- **Modern Libraries**: 
  - PDF-lib for PDF manipulation
  - PDF.js for rendering page previews
- **Responsive Design**: Adapts to different screen sizes
- **Error Handling**: Comprehensive error messages and validation
- **Progress Feedback**: Loading indicators and success notifications

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## File Size Limits

- Maximum file size: 50MB (can be adjusted if needed)
- Supports standard PDF files

## Installation

1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. Start removing pages from your PDFs!

## Security

- All processing happens locally in your browser
- No files are uploaded to any server
- Your PDF documents remain private and secure

## License

This project is open source and available under the MIT License.
