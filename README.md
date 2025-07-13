# URL Pattern Opener - Brave Extension

A Brave/Chrome extension that allows you to find and open all URLs on a webpage that match a specified pattern.

## Features

- **Smart Domain Memory**: Remembers patterns for each domain you visit
- **Quick Actions**: Instantly run saved patterns with one click
- **Pattern Management**: Save, name, and organize patterns per domain
- **Intelligent Toolbar**: 
  - Single pattern: Runs immediately on click
  - Multiple patterns: Shows quick action buttons
  - No patterns: Opens configuration dialog
- **Pattern Matching**: Support for both wildcard (*) and regex patterns
- **Duplicate Prevention**: Each URL is only opened once per session
- **Keyboard Shortcut**: Ctrl+Shift+U to run default pattern
- **Smart URL Detection**: Finds URLs in both HTML links and plain text
- **Batch Opening**: Opens all matching URLs with a small delay to prevent browser blocking

## Installation

1. Open Brave browser
2. Go to `brave://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select this folder
5. The extension will appear in your extensions bar

## Usage

### Smart Workflow
1. **First Visit**: Navigate to any webpage and click the extension icon
2. **Configure Pattern**: Enter a pattern and optional name, then click "Save Pattern"
3. **Quick Access**: Next time you visit the same domain, click the extension icon for instant action:
   - **Single saved pattern**: Runs immediately
   - **Multiple patterns**: Shows quick action buttons
   - **No patterns**: Opens configuration dialog

### Manual Usage
1. Navigate to any webpage
2. Click the extension icon in your toolbar
3. Enter a pattern to match URLs:
   - **Wildcard examples:**
     - `*.pdf` - All PDF files
     - `*github.com*` - Any GitHub URLs
     - `https://*.example.com/*` - Subdomains of example.com
   - **RegEx examples:**
     - `.*\.(pdf|doc|docx)$` - Document files
     - `https://.*\.github\.io/.*` - GitHub Pages sites
4. Click "Test Pattern" to search the page
5. Click "Save Pattern" to remember it for this domain
6. Click "Open All" to open all matching URLs in new tabs

### Keyboard Shortcuts
- **Ctrl+Shift+U**: Run the default pattern for the current domain

## Pattern Types

### Wildcard Patterns
- Use `*` to match any characters
- Case-insensitive matching
- Simple and intuitive

### Regular Expressions
- Full regex support
- Case-insensitive by default
- More powerful pattern matching

## Examples

### Common Use Cases
- **Download all PDFs**: `*.pdf`
- **Open all GitHub repos**: `*github.com*`
- **Find all images**: `*\.(jpg|jpeg|png|gif)$` (regex)
- **External links only**: `https://(?!yoursite\.com).*` (regex)

## Privacy

This extension:
- Only accesses the current active tab when you click "Find URLs"
- Stores your last used pattern locally for convenience
- Does not send any data to external servers
- Only requests necessary permissions (activeTab, tabs, storage)

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `popup.html/js` - User interface
- `content.js` - Page content analysis
- `background.js` - Extension background tasks

## Permissions

- `activeTab` - Access current tab content
- `tabs` - Open new tabs
- `storage` - Remember last pattern

## License

MIT License - feel free to modify and distribute.
