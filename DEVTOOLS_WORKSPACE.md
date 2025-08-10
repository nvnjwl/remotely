# Chrome DevTools Automatic Workspace Folders

This project is configured to work with Chrome DevTools' **Automatic Workspace Folders** feature, which allows seamless debugging and editing of source files directly from DevTools.

## What is Automatic Workspace Folders?

Automatic Workspace Folders eliminates the need to manually set up workspace mappings in Chrome DevTools. When enabled, DevTools automatically:
- Connects to your project folder during debugging
- Allows you to edit and save files directly from DevTools
- Persists changes to your actual source files
- Automatically disconnects when you navigate away

## Requirements

- **Chrome M-135 or later** (M-136+ has this enabled by default)
- **localhost origin** (DevTools only loads the configuration from localhost)

## Setup Instructions

### 1. Enable Feature Flags (M-135 only)

If you're using Chrome M-135, enable these flags in `chrome://flags`:
- `chrome://flags#devtools-project-settings`
- `chrome://flags#devtools-automatic-workspace-folders`

Alternatively, start Chrome with command line flags:
```bash
google-chrome --enable-features=DevToolsWellKnown,DevToolsAutomaticFileSystems
```

### 2. Start the Development Server

```bash
cd "C:\GIT\HTML_REPO\dashboard\assets\remotely"
python -m http.server 8000
```

### 3. Open DevTools

1. Navigate to `http://localhost:8000/debugmode.html`
2. Open Chrome DevTools (F12)
3. Look for workspace notifications or check the **Sources** > **Workspace** tab

## Configuration

The project includes a `.well-known/appspecific/com.chrome.devtools.json` file with:

```json
{
  "workspace": {
    "root": "C:\\GIT\\HTML_REPO\\dashboard\\assets\\remotely",
    "uuid": "2a435def-e33b-4c69-980b-c86780d8be0a"
  }
}
```

## How to Use

1. **Open DevTools** on `http://localhost:8000/debugmode.html`
2. **Navigate to Sources tab**
3. **Edit files directly** in DevTools
4. **Save changes** (Ctrl+S) - they'll be written to your actual source files
5. **Debug with live editing** - set breakpoints, modify code, and save changes in real-time

## Benefits

✅ **No manual workspace setup** - Automatic connection to project folder  
✅ **Live editing** - Edit and save files directly from DevTools  
✅ **Seamless debugging** - Set breakpoints and modify code in real-time  
✅ **Automatic cleanup** - Workspace disconnects when you navigate away  
✅ **Project isolation** - Each project has its own UUID for proper identification  

## Troubleshooting

### DevTools Configuration Not Loading
- Ensure you're accessing via `localhost:8000` (not `127.0.0.1:8000`)
- Check that `.well-known/appspecific/com.chrome.devtools.json` is accessible
- Verify Chrome version is M-135 or later
- Enable feature flags if using M-135

### Workspace Not Appearing
- Check DevTools Console for error messages
- Verify the JSON configuration file is valid
- Ensure the `root` path exists and is accessible
- Try refreshing the page after enabling feature flags

### File Permissions
- Ensure Chrome has write permissions to the project directory
- On Windows, you may need to run Chrome as Administrator for some directories

## Testing the Setup

You can verify the configuration is working by:

1. **Check the configuration endpoint**: `http://localhost:8000/.well-known/appspecific/com.chrome.devtools.json`
2. **Look for DevTools requests** in the server logs
3. **Check Sources > Workspace tab** in DevTools for automatic workspace entry

## Development Workflow

With Automatic Workspace Folders enabled, your debugging workflow becomes:

1. **Start server**: `python -m http.server 8000`
2. **Open localhost page**: Navigate to your debugging interface
3. **Open DevTools**: Press F12
4. **Edit directly**: Modify files in Sources tab and save with Ctrl+S
5. **Debug live**: Set breakpoints, inspect variables, modify code in real-time

The workspace automatically connects when you open DevTools and disconnects when you navigate away or close the tab.
