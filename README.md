# Remote Debug Tool

A powerful real-time remote debugging and monitoring solution that enables developers to remotely debug web applications, capture network requests, monitor console logs, record DOM interactions, and execute commands on target devices.

## 🚀 Features

### Core Functionality
- **Real-time Peer-to-Peer Connection**: Uses PeerJS for direct browser-to-browser communication
- **Remote Command Execution**: Execute JavaScript commands on target devices
- **Network Request Monitoring**: Capture and display XHR/Fetch requests in real-time
- **Console Log Capture**: Monitor console.log, console.error, console.warn, and console.info
- **DOM Recording & Playback**: Record user interactions and replay them using rrweb
- **Script Injection**: Inject and execute custom JavaScript on target devices
- **Local Storage Inspection**: View and monitor localStorage data

### Advanced Features
- **Visual DOM Interaction**: Click on replayed DOM elements to trigger actions on the target
- **Network Traffic Modification**: Modify API requests and responses (via realTime.js)
- **Multi-tab Interface**: Organized tabs for Network, Console, and Application data
- **Fullscreen Mode**: Enhanced debugging experience with fullscreen capabilities
- **Log Export**: Download debug logs for offline analysis
- **Secret Key Activation**: Hidden key sequence activation (987654321 to enter, 123456789 to exit)

## 📁 File Structure

```
├── debugmode.html          # Main debugger interface (controller)
├── debugmode.js           # Controller logic and UI management
├── debugmodesdk.js        # Target-side SDK for instrumentation
├── test.html              # Demo page with debug tool integration
├── realTime.js            # Network request modification rules
├── rrweb.js               # DOM recording and playback library
├── style.css              # Basic styling
├── debugmodestyle.css     # Debug UI specific styles
```

## 🛠️ Setup & Usage

### For Target Application (Being Debugged)

1. **Include the SDK** in your target webpage:
```html
<script src="https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js"></script>
<script src="debugmodesdk.js"></script>
```

2. **Set CPID** (Connection Peer ID):
```javascript
localStorage.setItem("CPID", "your-unique-id");
// or
localStorage.setItem("cpcustomerId", "your-unique-id");
```

3. **Activate Debug Mode**:
   - **Method 1**: Type the key sequence `987654321` (using number keys)
   - **Method 2**: Call programmatically:
   ```javascript
   if (window.DEBUG_MODE) {
       window.DEBUG_MODE.startDebugSession();
   }
   ```

4. **Enable Network Monitoring** (optional):
```javascript
window.CAPTURE_NETWORK = true;
window.DEBUG_MODE.CAPTURE_NETWORK_MODE();
```

### For Debug Controller

1. **Open** `debugmode.html` in your browser
2. **Enter the CPID** of the target device in the "Receiver ID" field
3. **Click "Connect"** to establish connection
4. **Start debugging** using the various tabs and tools

## 🔧 Core Components

### debugmodesdk.js (Target-Side)
- **Purpose**: Instrumentation SDK that gets embedded in target applications
- **Key Features**:
  - Console hijacking and forwarding
  - Network request interception
  - DOM recording with rrweb
  - Command execution engine
  - Peer connection management

**Key Methods**:
```javascript
DEBUG_MODE.startDebugSession()    // Start debug session
DEBUG_MODE.CAPTURE_NETWORK_MODE() // Enable network capture
```

### debugmode.js (Controller-Side)
- **Purpose**: Main controller interface for remote debugging
- **Key Features**:
  - Multi-tab interface (Network/Console/Application)
  - Real-time log display
  - Command input and execution
  - DOM playback with click-through functionality
  - Network request visualization

### realTime.js (Network Modification)
- **Purpose**: Modify network requests/responses on the fly
- **Use Case**: API mocking, request redirection, response manipulation
- **Example**: Redirect `/WEB/` endpoints to `/IOS/` endpoints for testing

## 📊 Interface Overview

### Network Tab
- Real-time network request monitoring
- Chrome DevTools-like interface
- Request/response inspection
- Status code color coding
- JSON response formatting

### Console Tab
- Live console output from target device
- Error, warning, info, and log level support
- Formatted message display

### Application Tab
- localStorage inspection
- Key-value pair visualization
- Real-time updates

### Command Panel
- Execute arbitrary JavaScript on target
- Script injection with Monaco Editor
- Response logging and export

## 🔐 Security Considerations

- **Peer-to-Peer**: No data passes through external servers
- **Secret Activation**: Hidden key sequence prevents accidental activation
- **Production Safety**: Easy to disable in production builds
- **Controlled Access**: Only works with known CPID connections

## 🎯 Use Cases

1. **Mobile Device Debugging**: Debug mobile browsers where DevTools aren't easily accessible
2. **Cross-Browser Testing**: Monitor behavior across different browsers simultaneously
3. **Remote Customer Support**: Debug issues on customer devices in real-time
4. **API Testing**: Modify network requests for testing different scenarios
5. **Performance Monitoring**: Track network requests and console errors in production
6. **User Session Recording**: Record and replay user interactions for bug analysis

## 📚 Dependencies

- **PeerJS**: Peer-to-peer WebRTC communication
- **rrweb**: DOM recording and playback
- **LZ-String**: Data compression for efficient transmission
- **Monaco Editor**: Advanced code editor for script injection
- **Font Awesome**: Icons for the interface

## 🚀 Getting Started

1. **Host the files** on a web server
2. **Open test.html** in a browser to see the demo
3. **Click "Start Connection"** to initialize debug mode
4. **Open debugmode.html** in another tab/browser
5. **Enter the CPID** and connect
6. **Start debugging** with the various tools available

## 🔧 Configuration

### Network Capture Configuration
```javascript
// Enable specific types of network monitoring
window.CAPTURE_NETWORK = true;

// Modify which endpoints to monitor
function __shouldModify() {
    return {
        routeMatch: ["api.example.com"],
        endpointMatch: ["DATA"],
        keywordMatch: ["token"]
    };
}
```

### Console Override Configuration
```javascript
// Configure which console methods to capture
overRideConsole(["info", "error", "warn", "log"]);
```

## 🐛 Troubleshooting

- **Connection Issues**: Ensure both devices are on the same network or use STUN/TURN servers
- **CPID Conflicts**: Use unique CPIDs for each target device
- **Missing Dependencies**: Verify all external scripts are loaded
- **CORS Issues**: Serve files from a proper web server, not file:// protocol

## 📄 License

This project appears to be a proprietary debugging tool. Please check with your organization's policies before use in production environments.
