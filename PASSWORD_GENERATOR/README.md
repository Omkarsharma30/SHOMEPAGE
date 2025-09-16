# Password Generator Tool

A comprehensive, secure password generator web application with advanced customization options, strength analysis, and modern responsive design.

## 🔐 Features

### Password Generation Options
- **Length Control**: Generate passwords from 4 to 128 characters
- **Character Types**:
  - Uppercase Letters (A-Z)
  - Lowercase Letters (a-z)
  - Numbers (0-9)
  - Symbols (!@#$%^&*)
- **Advanced Options**:
  - Exclude similar characters (0, O, l, I, 1)
  - Exclude ambiguous characters ({}[]()\/~,;.<>)
  - No duplicate characters
  - Cryptographically secure random generation

### Security Features
- 🔒 **Password Strength Meter**: Real-time strength analysis with visual feedback
- 🛡️ **Secure Generation**: Optional cryptographically secure random number generation
- 📋 **Secure Copy**: Copy passwords to clipboard with visual confirmation
- 👁️ **Visibility Toggle**: Show/hide passwords for verification
- 🚫 **No Server Communication**: All generation happens locally in your browser
- 🧹 **Auto-clear**: Passwords cleared on page unload for security

### User Experience
- 🎨 **Modern Design**: Beautiful gradient background with glassmorphism effects
- 📱 **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- ⚡ **Real-time Generation**: Passwords update automatically as you change settings
- 📚 **Quick Presets**: One-click presets for different security levels
- 📝 **Password History**: Keep track of recently generated passwords
- ⌨️ **Keyboard Shortcuts**: Power user features for quick access

### Quick Presets
- **Simple**: 8 characters, letters & numbers only
- **Standard**: 12 characters, mixed case & symbols, excludes ambiguous
- **Strong**: 16 characters, all types, excludes similar & ambiguous, secure random
- **Ultra Secure**: 32 characters, maximum security settings

## 🛠️ Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Advanced styling with:
  - CSS Grid and Flexbox layouts
  - Custom properties and animations
  - Responsive design with media queries
  - Glassmorphism effects with backdrop-filter
  - Smooth transitions and hover effects
- **Vanilla JavaScript**: Modern ES6+ features including:
  - Class-based architecture
  - Cryptographic API integration
  - Local storage for history
  - Clipboard API with fallbacks
  - Event delegation and optimization

## 📁 File Structure

```
PASSWORD_GENERATOR/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and animations
├── script.js           # JavaScript functionality
└── README.md           # Documentation (this file)
```

## 🚀 Getting Started

### Quick Start
1. **Open**: Simply open `index.html` in any modern web browser
2. **Generate**: Click "Generate Password" or use the default settings
3. **Copy**: Click the copy button to copy your password
4. **Customize**: Adjust settings as needed for your requirements

### Browser Requirements
- **Modern Browser**: Chrome 63+, Firefox 53+, Safari 13+, Edge 79+
- **HTTPS Recommended**: For cryptographically secure random generation
- **JavaScript Enabled**: Required for all functionality

### Hosting Options
- Local file system (file:// protocol)
- Any web server (Apache, Nginx, etc.)
- Static hosting (GitHub Pages, Netlify, Vercel)
- CDN or cloud storage

## 💡 Usage Guide

### Basic Usage
1. **Set Length**: Use the slider to choose password length (4-128 characters)
2. **Select Character Types**: Check boxes for desired character types
3. **Generate**: Password generates automatically or click the generate button
4. **Copy**: Use the copy button to copy to your clipboard

### Advanced Features

#### Strength Meter
The strength meter evaluates passwords based on:
- Length (minimum 8 characters recommended)
- Character variety (uppercase, lowercase, numbers, symbols)
- Entropy and unpredictability
- Length bonuses for longer passwords

#### Security Options
- **Exclude Similar**: Removes visually similar characters (0/O, 1/l/I)
- **Exclude Ambiguous**: Removes characters that can cause confusion
- **No Duplicates**: Ensures each character appears only once
- **Secure Random**: Uses cryptographically secure random generation

#### Password History
- Automatically saves last 10 generated passwords
- Click eye icon to show/hide passwords
- Copy any password from history
- Clear individual passwords or entire history

### Keyboard Shortcuts
- `Ctrl+Enter` or `Cmd+Enter`: Generate new password
- `Ctrl+C` or `Cmd+C`: Copy current password (when not in input field)
- `Space`: Generate new password (when not in input field)

## 🔒 Security Information

### Local Generation
- All passwords are generated locally in your browser
- No data is transmitted to any server
- No passwords are stored remotely

### Cryptographic Security
- Uses Web Crypto API when available for secure random generation
- Fallback to Math.random() for compatibility
- True randomness is dependent on browser implementation

### Best Practices
- Use unique passwords for each account
- Enable two-factor authentication when available
- Use a password manager to store passwords securely
- Regularly update passwords for important accounts
- Never share passwords or store them in plain text

### Privacy
- Password history is stored locally in browser storage
- History can be cleared at any time
- No analytics or tracking
- No network requests made

## 🎨 Customization

### Modifying Character Sets
Edit the `getCharacterSets()` method in `script.js`:

```javascript
getCharacterSets() {
    return {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
        // Add custom character sets here
    };
}
```

### Adding New Presets
Add new presets in the `applyPreset()` method:

```javascript
const presets = {
    yourPreset: {
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        // ... other options
    }
};
```

### Styling Changes
Modify `styles.css` to customize:
- Color schemes (update CSS custom properties)
- Layout and spacing
- Animations and transitions
- Responsive breakpoints

## 🧮 Password Strength Calculation

The strength meter uses a comprehensive scoring system:

### Basic Criteria (10-15 points each)
- Minimum length (8+ characters)
- Lowercase letters present
- Uppercase letters present
- Numbers present
- Symbols present (15 points)

### Length Bonuses
- 12+ characters: +15 points
- 16+ characters: +15 points
- 20+ characters: +10 points

### Variety Bonus
- +5 points per character type used
- Maximum variety bonus: 20 points

### Final Score
- **0-25**: Weak (Red)
- **26-50**: Fair (Orange)
- **51-75**: Good (Blue)
- **76-100**: Strong (Green)

## 📱 Mobile Optimization

### Responsive Design
- Touch-friendly interface elements
- Optimized button sizes and spacing
- Readable text at all screen sizes
- Efficient use of screen real estate

### Mobile-Specific Features
- Touch gestures for showing/hiding passwords
- Optimized keyboard input
- Prevent zoom on input focus
- Swipe-friendly history navigation

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with comprehensive password generation
- Real-time strength analysis
- Password history with local storage
- Mobile-responsive design
- Security-focused features
- Keyboard shortcuts
- Multiple character set options

## 🤝 Contributing

Contributions and suggestions are welcome! Areas for improvement:

### Potential Features
- Custom character set definitions
- Password pattern templates
- Pronounceable password generation
- Password complexity rules
- Export/import functionality
- Dark/light theme toggle

### Code Improvements
- Additional security auditing
- Performance optimizations
- Accessibility enhancements
- Browser compatibility testing

## 📞 Support

For questions, issues, or suggestions:
- **Contact**: Study Care & Computer Classes
- **Email**: studycareandcomputerclasses@gmail.com
- **Website**: https://scncc.online

## 🔗 Related Tools

Part of the Study Care & Computer Classes tool collection:
- Unit Converter
- PDF Tools (Merger, Splitter, Page Remover)
- Image Tools (Merger, Compressor)
- Text Tools

## 📄 License

This project is part of the Study Care & Computer Classes educational tools collection.
Created by Omkar Sharma for educational and practical use.

## 🙏 Credits

- **Font Awesome**: Icons for the user interface
- **Web Crypto API**: Secure random number generation
- **Study Care & Computer Classes**: Project development and sponsorship

## ⚠️ Disclaimer

While this tool uses secure generation methods, the security of generated passwords also depends on:
- Browser security implementation
- Device security
- How passwords are stored and used
- Network security when transmitting passwords

Always follow security best practices and use reputable password managers for sensitive accounts.

---

**Built with 🔐 for maximum security and ease of use!**