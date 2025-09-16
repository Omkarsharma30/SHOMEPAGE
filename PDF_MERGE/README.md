# PDF Merger Application

A modern, responsive web application that allows users to combine multiple PDF files into a single document. Built with HTML, CSS, and JavaScript using the PDF-lib library.

## Features

- 🔗 **Merge Multiple PDFs**: Combine 2 or more PDF files into one document
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 📱 **Mobile Friendly**: Works perfectly on desktop, tablet, and mobile devices
- 🖱️ **Drag & Drop**: Simply drag PDF files onto the upload area
- 📂 **File Management**: Reorder files and remove unwanted ones before merging
- ⚡ **Fast Processing**: Client-side processing for privacy and speed
- 🔒 **Secure**: All processing happens in your browser - no files uploaded to servers
- 📊 **Progress Tracking**: Real-time progress indicator during merge process
- 💾 **Easy Download**: One-click download of the merged PDF

## How to Use

1. **Open the Application**: Open `index.html` in your web browser
2. **Select PDF Files**: 
   - Click "Browse Files" button to select multiple PDF files
   - Or drag and drop PDF files directly onto the upload area
3. **Arrange Files**: Use the up/down arrows to reorder files as needed
4. **Remove Files**: Click the trash icon to remove unwanted files
5. **Merge PDFs**: Click the "Merge PDFs" button to combine all files
6. **Download**: Click "Download Merged PDF" to save the combined file

## File Structure

```
PDF MERGE/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technical Details

### Dependencies
- **PDF-lib**: JavaScript library for creating and modifying PDF documents
- **Font Awesome**: Icons for the user interface

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

### File Limitations
- Only PDF files are supported
- File size depends on browser memory limitations
- All processing is done client-side

## Features Breakdown

### User Interface
- **Gradient Background**: Eye-catching purple gradient background
- **Card-based Layout**: Clean, modern card design
- **Responsive Design**: Adapts to all screen sizes
- **Smooth Animations**: Hover effects and transitions

### File Handling
- **PDF Validation**: Automatically filters non-PDF files
- **Duplicate Detection**: Prevents adding the same file twice
- **File Information**: Shows file name and size
- **Reordering**: Move files up/down to change merge order

### Merge Process
- **Progress Indicator**: Visual progress bar and status text
- **Error Handling**: Graceful error handling with user feedback
- **Memory Management**: Efficient handling of large files
- **Success Feedback**: Clear indication when merge is complete

### Download
- **Automatic Naming**: Generated filename with timestamp
- **Blob URLs**: Efficient file handling
- **One-click Download**: Simple download process

## Customization

### Colors
The color scheme can be customized by modifying the CSS variables:
- Primary gradient: `#667eea` to `#764ba2`
- Accent color: `#ff6b6b` (red)
- Success color: `#4ecdc4` (teal)

### Styling
- Fonts: Segoe UI font family
- Border radius: 15-20px for modern rounded corners
- Shadows: Consistent box-shadow throughout

## Troubleshooting

### Common Issues

1. **Files not merging**: Ensure all files are valid PDF documents
2. **Large files**: Browser may run out of memory with very large PDFs
3. **Corrupted PDFs**: Some corrupted or password-protected PDFs may not work
4. **Browser compatibility**: Use a modern browser for best performance

### Error Messages
- "Please select PDF files only": Non-PDF files were selected
- "Please select at least 2 PDF files": Need minimum 2 files to merge
- "File might be corrupted": PDF file cannot be processed

## Browser Security

This application runs entirely in your browser:
- No files are uploaded to any server
- All processing happens locally
- Your files remain private and secure
- No internet connection required after loading

## Future Enhancements

Potential features for future versions:
- Password-protected PDF support
- Page range selection
- PDF compression options
- Bookmarks preservation
- Metadata editing
- Batch processing

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues:
1. Check that you're using a modern browser
2. Ensure PDF files are not corrupted
3. Try with smaller files if experiencing memory issues
4. Refresh the page to reset the application

---

**Enjoy merging your PDFs! 📄✨**
