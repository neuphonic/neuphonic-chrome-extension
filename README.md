# Neuphonic Chrome Extension

A Chrome extension that uses Neuphonic to read aloud highlighted text, or allows users to converse with a page using Neuphonic Agents.

## Development Setup

### Prerequisites
- Node.js
- pnpm
- Chrome browser

### Installation Steps
1. Clone the repository:
   ```bash
   git clone git@github.com:neuphonic/neuphonic-chrome-extension.git
   cd neuphonic-chrome-extension
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the extension:
   ```bash
   pnpm build
   ```
   This creates a `/build` folder with the compiled extension.

   Alternatively, for development:
   ```bash
   pnpm dev
   ```
   This starts a watch mode that rebuilds the extension on file changes.

### Loading the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer Mode" (toggle in the top right)
3. Click "Load Unpacked"
4. Select the `/build` folder from your project directory

### Development Workflow
See [Hello World Tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world) for details on how to develop with chrome extensions.
- The extension will be loaded into Chrome and ready to use
- Any changes made to the source code will require a re-build.
- Therefore, when developing, use `pnpm dev` to handle the building. The changes automatically become available in the widget.

### Using the Extension
1. Click the extension icon in Chrome's toolbar
2. If it's your first time:
   - Go to Settings
   - Add your Neuphonic API key
   - Select your preferred language and voice
3. To use Read Aloud:
   - Highlight any text on a webpage
   - Click the extension icon
   - Click "Read Aloud"
4. The text will be read aloud using your selected voice

### Project Structure
```
neuphonic-chrome-extension/
├── src/                    # Source code
│   ├── App.tsx            # Main application component
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
│   ├── manifest.json      # Extension manifest
│   └── logo.png          # Extension icon
└── build/                # Compiled extension (generated)
```

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.