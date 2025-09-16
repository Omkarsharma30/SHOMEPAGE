# Image Merge Tool

A modern, responsive web application for merging multiple images into a single image with various layout options.

## Features

✨ **Modern UI/UX**
- Clean, intuitive interface
- Step-by-step workflow
- Responsive design for mobile and desktop
- Dark mode support
- Smooth animations and transitions

🖼️ **Image Handling**
- Drag & drop image upload
- Support for JPG, PNG, GIF formats
- Image preview with file information
- Clipboard paste support (Ctrl+V)
- Easy image removal

📐 **Merge Layouts**
- **Horizontal**: Side-by-side arrangement
- **Vertical**: Stacked arrangement  
- **Grid**: Automatic or custom grid layout (2, 3, 4 columns)

💾 **Export Options**
- High-quality PNG download
- Maintains image quality
- Automatic filename generation

## How to Use

1. **Select Images**: 
   - Drag & drop images onto the upload area
   - Or click "browse files" to select images
   - You can also paste images from clipboard (Ctrl+V)

2. **Choose Layout**:
   - Select horizontal, vertical, or grid arrangement
   - For grid layout, choose number of columns or use auto

3. **Merge Images**:
   - Click the "Merge Images" button
   - Wait for processing to complete

4. **Download Result**:
   - Preview your merged image
   - Click "Download Image" to save
   - Or click "Start Over" to merge new images

## Keyboard Shortcuts

- `Ctrl+O` (or `Cmd+O` on Mac): Open file dialog
- `Ctrl+V` (or `Cmd+V` on Mac): Paste images from clipboard
- `Enter`: Merge images (when ready)
- `Escape`: Start over (with confirmation)

## Technical Features

- **Client-side Processing**: All image processing happens in your browser
- **No Server Required**: Works completely offline
- **Canvas-based Rendering**: High-quality image merging
- **Responsive Design**: Works on all screen sizes
- **Progressive Enhancement**: Graceful fallbacks for older browsers

## Browser Compatibility

- Chrome/Chromium 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## File Structure

```
bansawali/
├── index.html      # Main HTML structure
├── styles.css      # CSS styles and responsive design
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Getting Started

1. Open `index.html` in a modern web browser
2. Start merging images immediately - no installation required!

## Image Quality Notes

- Images are processed at their original resolution
- The tool automatically handles different image sizes
- For grid layout, images are scaled to fit cells while maintaining aspect ratio
- Output format is PNG for best quality preservation

## Tips for Best Results

- Use images with similar aspect ratios for cleaner layouts
- For grid layouts, square images work best
- Larger images will take more time to process
- The tool works best with 2-20 images per merge

---

**Created with ❤️ using vanilla HTML, CSS, and JavaScript**
