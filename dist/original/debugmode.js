/* global Peer */
(function () {
  'use strict';

  // Debug: Check what rrweb objects are available
  console.log('🔍 Debugging rrweb availability:');
  console.log('typeof rrweb:', typeof rrweb);
  console.log('typeof rrwebPlayer:', typeof rrwebPlayer);
  console.log('typeof window.rrweb:', typeof window.rrweb);
  console.log('typeof window.rrwebPlayer:', typeof window.rrwebPlayer);

  if (typeof rrweb !== 'undefined') {
    console.log('rrweb keys:', Object.keys(rrweb));
  }
  if (typeof window.rrweb !== 'undefined') {
    console.log('window.rrweb keys:', Object.keys(window.rrweb));
  }

  var MESSAGE_TYPE = {
    COMMAND_INPUT: 'COMMAND_INPUT',
    COMMAND_OUPUT: 'COMMAND_OUPUT',
    REMOTE_KEY: 'REMOTE_KEY',
    CONSOLE_LOG: 'CONSOLE_LOG',
    CONSOLE_ERROR: 'CONSOLE_ERROR',
    CONSOLE_INFO: 'CONSOLE_INFO',
    CONSOLE_WARN: 'CONSOLE_WARN',
    SCRIPT_INPUT: 'SCRIPT_INPUT',
  };

  // Script Templates
  var SCRIPT_TEMPLATES = window.SCRIPT_TEMPLATES || {};

  // Script Editor State
  var currentTemplate = 'API_BASE_TEMPLATE';
  var validationState = {
    isValid: true,
    errors: [],
    warnings: [],
    lastValidated: null
  };

  var connectionStatus = null;
  var receiverIdInput = null;
  var connectButton = null;
  var eachCommandInput = null;
  var eachRemoteInput = null;
  var sendEachCommandButton = null;
  var sendEachScriptButton = null;
  var sendRemoteEventButton = null;
  var clearMessageButton = null;
  var fullScreenButton = null;
  var downloadButton = null;
  var eachCommandResponse = null;

  var lastPeerId = null;
  var peer = null;
  var conn = null;
  var statusDot = null;

  // Monaco Editor compatibility layer
  function getMonacoEditor() {
    if (window.MonacoManager && window.MonacoManager.isReady()) {
      return window.MonacoManager.getEditor();
    }
    return window.monacoEditor || null;
  }

  function setMonacoValue(value) {
    if (window.MonacoManager && window.MonacoManager.isReady()) {
      window.MonacoManager.setValue(value);
    } else if (window.monacoEditor) {
      window.monacoEditor.setValue(value);
    }
  }

  function getMonacoValue() {
    if (window.MonacoManager && window.MonacoManager.isReady()) {
      return window.MonacoManager.getValue();
    }
    return window.monacoEditor ? window.monacoEditor.getValue() : '';
  }

  function isMonacoReady() {
    return (window.MonacoManager && window.MonacoManager.isReady()) || window.monacoEditor;
  }

  // Update script info when Monaco is ready
  function waitForMonaco(callback, maxAttempts = 50) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (isMonacoReady()) {
        clearInterval(checkInterval);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn('Monaco Editor not ready after maximum attempts');
      }
    }, 100);
  }

  // Script Template Management
  function loadTemplate(templateKey) {
    currentTemplate = templateKey;
    const template = SCRIPT_TEMPLATES[templateKey];

    if (template) {
      setMonacoValue(template.code);

      // Update UI
      const templateNameEl = document.getElementById('currentTemplateName');
      if (templateNameEl) {
        templateNameEl.textContent = template.name;
      }

      // Update tab active state
      document.querySelectorAll('.script-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      const activeTab = document.querySelector(`[data-template="${templateKey}"]`);
      if (activeTab) {
        activeTab.classList.add('active');
      }

      // Reset validation state
      resetValidation();
      updateScriptInfo();
    }
  }

  function validateScript() {
    const code = getMonacoValue();
    const results = { isValid: true, errors: [], warnings: [] };

    try {
      // Basic syntax validation using Function constructor
      new Function(code);

      // Additional checks
      if (code.trim().length === 0) {
        results.warnings.push({
          type: 'warning',
          title: 'Empty Script',
          description: 'Script is empty and will not execute',
          line: 1
        });
      }

      // Check for common issues
      if (code.includes('eval(')) {
        results.warnings.push({
          type: 'warning',
          title: 'eval() Usage',
          description: 'Using eval() can be a security risk',
          line: getLineNumber(code, 'eval(')
        });
      }

      if (code.includes('document.write')) {
        results.warnings.push({
          type: 'warning',
          title: 'document.write Usage',
          description: 'document.write can interfere with page loading',
          line: getLineNumber(code, 'document.write')
        });
      }

      // Check for console usage (good practice)
      if (!code.includes('console.') && code.trim().length > 0) {
        results.warnings.push({
          type: 'info',
          title: 'No Console Output',
          description: 'Consider adding console.log for debugging output',
          line: 1
        });
      }

    } catch (error) {
      results.isValid = false;
      results.errors.push({
        type: 'error',
        title: 'Syntax Error',
        description: error.message,
        line: extractLineNumber(error.message)
      });
    }

    validationState = {
      ...results,
      lastValidated: new Date()
    };

    updateValidationUI(results);
    updateScriptInfo();

    return results.isValid;
  }

  function getLineNumber(code, searchText) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return 1;
  }

  function extractLineNumber(errorMessage) {
    const match = errorMessage.match(/line (\d+)/i);
    return match ? parseInt(match[1]) : 1;
  }

  function updateValidationUI(results) {
    const statusEl = document.getElementById('syntaxStatus');
    const summaryEl = document.getElementById('validationSummary');
    const resultsEl = document.getElementById('validationResults');
    const sendBtn = document.getElementById('sendValidatedScriptButton');

    // Update status indicator
    if (statusEl) {
      statusEl.className = 'syntax-status';
      if (results.errors.length > 0) {
        statusEl.classList.add('error');
        statusEl.innerHTML = '<div class="status-indicator"></div><span>Syntax Error</span>';
      } else if (results.warnings.length > 0) {
        statusEl.classList.add('warning');
        statusEl.innerHTML = '<div class="status-indicator"></div><span>Has Warnings</span>';
      } else {
        statusEl.innerHTML = '<div class="status-indicator"></div><span>Syntax Valid</span>';
      }
    }

    // Update summary badge
    if (summaryEl) {
      let badgeClass = 'valid';
      let badgeText = 'Valid';

      if (results.errors.length > 0) {
        badgeClass = 'error';
        badgeText = `${results.errors.length} Error${results.errors.length > 1 ? 's' : ''}`;
      } else if (results.warnings.length > 0) {
        badgeClass = 'warning';
        badgeText = `${results.warnings.length} Warning${results.warnings.length > 1 ? 's' : ''}`;
      }

      summaryEl.innerHTML = `<span class="status-badge ${badgeClass}">${badgeText}</span>`;
    }

    // Update results display
    if (resultsEl) {
      if (results.errors.length === 0 && results.warnings.length === 0) {
        resultsEl.innerHTML = `
          <div class="validation-success">
            <i class="fas fa-check-circle"></i>
            <div class="validation-message">
              <div class="title">Validation Successful</div>
              <div class="description">No syntax errors or warnings found. Script is ready to send.</div>
            </div>
          </div>
        `;
      } else {
        let html = '';

        results.errors.forEach(error => {
          html += `
            <div class="validation-error">
              <i class="fas fa-times-circle"></i>
              <div class="validation-message">
                <div class="title">${error.title}</div>
                <div class="description">${error.description}</div>
                <div class="location">Line ${error.line}</div>
              </div>
            </div>
          `;
        });

        results.warnings.forEach(warning => {
          html += `
            <div class="validation-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <div class="validation-message">
                <div class="title">${warning.title}</div>
                <div class="description">${warning.description}</div>
                <div class="location">Line ${warning.line}</div>
              </div>
            </div>
          `;
        });

        resultsEl.innerHTML = html;
      }
    }

    // Enable/disable send button
    if (sendBtn) {
      sendBtn.disabled = !results.isValid;
    }
  }

  function resetValidation() {
    validationState = {
      isValid: true,
      errors: [],
      warnings: [],
      lastValidated: null
    };

    const summaryEl = document.getElementById('validationSummary');
    const resultsEl = document.getElementById('validationResults');
    const sendBtn = document.getElementById('sendValidatedScriptButton');

    if (summaryEl) {
      summaryEl.innerHTML = '<span class="status-badge ready">Ready for validation</span>';
    }

    if (resultsEl) {
      resultsEl.innerHTML = `
        <div class="validation-placeholder">
          <i class="fas fa-code"></i>
          <h3>Syntax Validation</h3>
          <p>Click "Validate Syntax" to check your JavaScript code for syntax errors and warnings.</p>
          <div class="validation-features">
            <div class="feature-item">
              <i class="fas fa-check"></i>
              <span>ES6+ Syntax Support</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Warning Detection</span>
            </div>
            <div class="feature-item">
              <i class="fas fa-times-circle"></i>
              <span>Error Highlighting</span>
            </div>
          </div>
        </div>
      `;
    }

    if (sendBtn) {
      sendBtn.disabled = true;
    }
  }

  function updateScriptInfo() {
    const code = getMonacoValue();
    const lineCountEl = document.getElementById('lineCount');
    const lastValidatedEl = document.getElementById('lastValidated');

    if (lineCountEl) {
      const lineCount = code.split('\n').length;
      lineCountEl.textContent = `${lineCount} line${lineCount !== 1 ? 's' : ''}`;
    }

    if (lastValidatedEl) {
      if (validationState.lastValidated) {
        const timeAgo = getTimeAgo(validationState.lastValidated);
        lastValidatedEl.textContent = `Validated ${timeAgo}`;
      } else {
        lastValidatedEl.textContent = 'Not validated';
      }
    }
  }

  // Make updateScriptInfo globally available
  window.updateScriptInfo = updateScriptInfo;

  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  function initializeScriptEditor() {
    console.log('🎯 Initializing Script Editor...');

    // Wait for Monaco to be ready before setting up handlers
    waitForMonaco(() => {
      console.log('✅ Monaco ready, setting up script editor');

      // Load initial template
      if (window.SCRIPT_TEMPLATES && window.SCRIPT_TEMPLATES.API_BASE_TEMPLATE) {
        loadTemplate('API_BASE_TEMPLATE');
      }

      // Update script info initially
      updateScriptInfo();
    });

    // Initialize tab click handlers
    document.querySelectorAll('.script-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const templateKey = e.currentTarget.dataset.template;
        if (templateKey) {
          loadTemplate(templateKey);
        }
      });
    });

    // Initialize validation button
    const validateBtn = document.getElementById('validateSyntaxButton');
    if (validateBtn) {
      validateBtn.addEventListener('click', validateScript);
    }

    // Initialize send button
    const sendBtn = document.getElementById('sendValidatedScriptButton');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        if (validationState.isValid) {
          sendValidatedScript();
        }
      });
    }

    // Initialize reset button
    const resetBtn = document.getElementById('resetScriptButton');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        loadTemplate(currentTemplate);
      });
    }

    // Load default template
    setTimeout(() => {
      loadTemplate('API_BASE_TEMPLATE');
    }, 1000);
  }

  function sendValidatedScript() {
    if (!validationState.isValid) {
      alert('Please validate the script before sending.');
      return;
    }

    const code = getMonacoValue();
    if (conn && code.trim()) {
      const messageObj = {
        type: MESSAGE_TYPE.SCRIPT_INPUT,
        value: code
      };
      sendMessage(messageObj);

      // Update UI to show script was sent
      const summaryEl = document.getElementById('validationSummary');
      if (summaryEl) {
        summaryEl.innerHTML = '<span class="status-badge valid">Script Sent</span>';
      }
    }
  }

  function updateStatus(newStatus, state = 'disconnected') {
    if (connectionStatus) {
      connectionStatus.innerHTML = newStatus;
    }

    // Update status dot visual indicator
    if (statusDot) {
      // Remove all existing state classes
      statusDot.classList.remove('disconnected', 'connecting', 'connected', 'error');

      // Add appropriate state class
      if (state === 'connected') {
        statusDot.classList.add('connected');
      } else if (state === 'connecting') {
        statusDot.classList.add('connecting');
      } else if (state === 'error') {
        statusDot.classList.add('error');
      } else {
        statusDot.classList.add('disconnected');
      }
    }
  }

  function updateCommandOutput(commandOutput, type) {
    if (typeof commandOutput === 'object') {
      commandOutput = JSON.stringify(commandOutput, null, 2);
    }
    if (!eachCommandResponse) return;
    if (type === MESSAGE_TYPE.CONSOLE_ERROR) {
      eachCommandResponse.innerHTML += '<p class="log-error"><i class="fas fa-times-circle log-icon"></i> ' +
        commandOutput + '</p>';
    } else if (type === MESSAGE_TYPE.CONSOLE_WARN) {
      eachCommandResponse.innerHTML += '<p class="log-warn"><i class="fas fa-exclamation-triangle log-icon"></i> ' +
        commandOutput + '</p>';
    } else {
      eachCommandResponse.innerHTML += '<p class="log-default">' + commandOutput + ' </p>';
    }
  }
  let replayer;
  let isInitialized = false;
  let buffer = [];

  // Show/hide replay placeholder
  function toggleReplayPlaceholder(show) {
    const placeholder = document.querySelector('.replay-placeholder');
    const progress = document.getElementById('replayProgress');
    const overlay = document.getElementById('replayOverlay');

    if (placeholder) {
      placeholder.style.display = show ? 'flex' : 'none';
    }

    // replay-container stays visible all time, no need to hide it

    // Show progress and overlay when replay is active
    if (progress) {
      if (show) {
        progress.classList.add('hidden');
      } else {
        progress.classList.remove('hidden');
      }
    }

    if (overlay) {
      if (show) {
        overlay.classList.add('hidden');
      } else {
        overlay.classList.remove('hidden');
      }
    }
  }

  // DOM Replay state management
  let replayState = {
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    speed: 1,
    status: 'waiting' // waiting, recording, playing, paused, error
  };

  // Update replay controls - with caching to prevent excessive DOM updates
  function updateReplayControls() {
    // Cache previous state to avoid unnecessary DOM updates
    if (!window.lastReplayState) {
      window.lastReplayState = {};
    }

    const lastState = window.lastReplayState;

    const playBtn = document.getElementById('replay-play-btn');
    const pauseBtn = document.getElementById('replay-pause-btn');
    const progress = document.getElementById('replay-progress');
    const currentTimeEl = document.getElementById('replay-current-time');
    const totalTimeEl = document.getElementById('replay-total-time');
    const statusEl = document.getElementById('replay-status');
    const speedEl = document.getElementById('replay-speed');

    // Only update play/pause buttons if state changed
    if (lastState.isPlaying !== replayState.isPlaying) {
      if (playBtn) playBtn.style.display = replayState.isPlaying ? 'none' : 'inline-block';
      if (pauseBtn) pauseBtn.style.display = replayState.isPlaying ? 'inline-block' : 'none';
      lastState.isPlaying = replayState.isPlaying;
    }

    // Throttle progress updates
    if (progress && Math.abs(lastState.currentTime - replayState.currentTime) > 0.5) {
      const percentage = replayState.totalTime > 0 ? (replayState.currentTime / replayState.totalTime) * 100 : 0;
      progress.value = percentage;
      lastState.currentTime = replayState.currentTime;
    }

    // Update time displays only when changed significantly
    if (currentTimeEl && Math.abs(lastState.displayCurrentTime - replayState.currentTime) > 1) {
      currentTimeEl.textContent = formatTime(replayState.currentTime);
      lastState.displayCurrentTime = replayState.currentTime;
    }
    if (totalTimeEl && lastState.totalTime !== replayState.totalTime) {
      totalTimeEl.textContent = formatTime(replayState.totalTime);
      lastState.totalTime = replayState.totalTime;
    }
    if (statusEl && lastState.status !== replayState.status) {
      statusEl.textContent = replayState.status;
      lastState.status = replayState.status;
    }
    if (speedEl && lastState.speed !== replayState.speed) {
      speedEl.textContent = `${replayState.speed}x`;
      lastState.speed = replayState.speed;
    }
  }

  // Format time for display
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Initialize replay controls
  function initializeReplayControls() {
    // replay-container is always visible, no need to hide it initially

    const playBtn = document.getElementById('replay-play-btn');
    const pauseBtn = document.getElementById('replay-pause-btn');
    const stopBtn = document.getElementById('replay-stop-btn');
    const speedBtn = document.getElementById('replay-speed-btn');
    const progress = document.getElementById('replay-progress');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (replayer && typeof replayer.play === 'function') {
          replayer.play();
          replayState.isPlaying = true;
          replayState.status = 'playing';
          updateReplayControls();
        }
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (replayer && typeof replayer.pause === 'function') {
          replayer.pause();
          replayState.isPlaying = false;
          replayState.status = 'paused';
          updateReplayControls();
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (replayer && typeof replayer.pause === 'function') {
          replayer.pause();
          replayState.isPlaying = false;
          replayState.currentTime = 0;
          replayState.status = 'stopped';
          updateReplayControls();
        }
      });
    }

    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        const speeds = [0.5, 1, 1.5, 2];
        const currentIndex = speeds.indexOf(replayState.speed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        replayState.speed = speeds[nextIndex];

        if (replayer && typeof replayer.setSpeed === 'function') {
          replayer.setSpeed(replayState.speed);
        }
        updateReplayControls();
      });
    }

    if (progress) {
      progress.addEventListener('input', (e) => {
        const percentage = parseFloat(e.target.value);
        const targetTime = (percentage / 100) * replayState.totalTime;

        if (replayer && typeof replayer.goto === 'function') {
          replayer.goto(targetTime * 1000); // Convert to milliseconds
          replayState.currentTime = targetTime;
          updateReplayControls();
        }
      });
    }

    // Initial update
    updateReplayControls();
  }

  function onDomEvent(domData) {
    try {
      if (typeof LZString === 'undefined') {
        throw new Error('LZString is not loaded.');
      }

      if (typeof rrwebPlayer === 'undefined') {
        throw new Error('rrwebPlayer is not available.');
      }

      // Decompress and parse event
      var decompressed = LZString.decompressFromUTF16(domData);
      if (!decompressed) {
        throw new Error('Failed to decompress DOM data.');
      }

      var event = JSON.parse(decompressed);
      if (!event || typeof event !== 'object') {
        throw new Error('Invalid event data.');
      }

      // Ensure container exists
      var container = document.getElementById('replay-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'replay-container';
        container.style.height = '100vh';
        container.style.overflow = 'hidden';
        document.body.appendChild(container);
      }

      // Require first event to be full snapshot (type 0)
      if (!isInitialized) {
        // if (buffer.length === 0 && !event.type !== 5) {
        //   console.warn('Waiting for full snapshot event (type 0) to begin playback.', event.type);
        //   return;
        // }

        buffer.push(event);

        if (buffer.length >= 2) {
          replayer = new rrwebPlayer({
            target: container,
            props: {
              events: buffer,
              autoPlay: true,
              controls: true,
              liveMode: true,
              showDebug: true,
              showWarning: true,
              showError: true,
              showInfo: true,
              showConsole: true,
            }
          });

          isInitialized = true;
          setTimeout(() => {
            registerClick();
          }, 2000);
          console.info('rrwebPlayer initialized with', buffer.length, 'events');
        }
      } else {
        // After init, just push new events
        if (replayer && typeof replayer.addEvent === 'function') {
          replayer.addEvent(event);
        } else {
          console.warn('Replayer is not ready to add events.');
        }
      }
    } catch (error) {
      console.error('onDomEvent error:', error);
    }
  };


  function registerClick() {
    if (!replayer) {
      console.warn('Replayer is not initialized yet. Cannot register click events.');
      return;
    }
    var iframe = null;
    if (replayer.iframe) {
      console.info('Replayer iframe already exists. Registering click event listener.');
      iframe = replayer.iframe;
    } else {
      console.info('Registering click event listener on replayer iframe.');
      let replayContainer = document.getElementById('replay-container');
      iframe = replayContainer.querySelector('iframe');
      if (!iframe) {
        console.warn('Replayer iframe not found. Cannot register click events.');
        return;
      }
    }
    if (!iframe) {
      return;
    }
    iframe.contentDocument.addEventListener('click', function (e) {
      var el = e.target;

      // Traverse up to find any element with id
      while (el && !el.id && el !== iframe.contentDocument.body) {
        el = el.parentNode;
      }

      if (el && el.id) {
        console.log('Sending click command for id:', el.id);

        // Broadcast command back to sender
        sendMessage({
          type: 'CLICK_ELEMENT_ID',
          value: el.id
        });

      }
    });
    // pointer-events to allow clicks through the replayer
    iframe.style.pointerEvents = 'auto';
  }

  // Renders a network log entry using the new Chrome DevTools-like NetworkPanel
  function updateNetworkOutput(log, type) {
    // Check if networkPanel is available (from debugmode.html)
    if (typeof networkPanel !== 'undefined' && networkPanel) {
      // Transform the incoming log data to match our NetworkPanel format
      var requestData = {
        name: extractFileName(log.url) || 'Unknown',
        path: extractPath(log.url) || '',
        url: log.url || '',
        method: log.method || 'GET',
        status: log.status || 200,
        type: determineRequestType(log.url, type),
        size: calculateSize(log.response),
        time: log.duration || Math.floor(Math.random() * 1000),
        requestHeaders: log.requestHeaders || {
          'Content-Type': 'application/json',
          'User-Agent': 'RemoteDebugger/1.0'
        },
        responseHeaders: log.responseHeaders || {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        response: formatResponse(log.response),
        requestData: log.requestData || null
      };

      // Add to NetworkPanel
      console.log('Adding network request to panel:', requestData);
      networkPanel.addRequest(requestData);
    } else {
      // Fallback to old method if NetworkPanel is not available
      console.warn('NetworkPanel not available, using fallback method');
      updateNetworkOutputFallback(log, type);
    }
  }

  // Helper functions for data transformation
  function extractFileName(url) {
    if (!url) return 'Unknown';
    try {
      var path = new URL(url).pathname;
      return path.split('/').pop() || 'index';
    } catch (e) {
      return url.split('/').pop() || 'Unknown';
    }
  }

  function extractPath(url) {
    if (!url) return '';
    try {
      return new URL(url).pathname;
    } catch (e) {
      return url;
    }
  }

  function determineRequestType(url, type) {
    if (type) return type.toLowerCase();
    if (!url) return 'doc';

    var ext = url.split('.').pop().toLowerCase();
    if (['js', 'mjs'].includes(ext)) return 'js';
    if (['css'].includes(ext)) return 'css';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'img';
    if (['woff', 'woff2', 'ttf', 'otf'].includes(ext)) return 'font';
    if (['json', 'xml'].includes(ext)) return 'xhr';
    return 'doc';
  }

  function calculateSize(response) {
    if (!response) return 0;
    if (typeof response === 'string') return response.length;
    return JSON.stringify(response).length;
  }

  function formatResponse(response) {
    if (!response) return 'No response data';
    if (typeof response === 'object') {
      return JSON.stringify(response, null, 2);
    }
    return response.toString();
  }

  // Fallback method for old-style network output (kept for compatibility)
  function updateNetworkOutputFallback(log, type) {
    var tbody = document.getElementById('network-body');
    if (!tbody) return;

    // Create row
    var tr = document.createElement('tr');
    tr.className = 'network-row';

    // URL cell (with ellipsis and tooltip)
    var urlTd = document.createElement('td');
    urlTd.className = 'network-url';
    urlTd.title = log.url || '';
    urlTd.textContent = log.url || '';
    urlTd.style.maxWidth = '260px';
    urlTd.style.overflow = 'hidden';
    urlTd.style.textOverflow = 'ellipsis';
    urlTd.style.whiteSpace = 'nowrap';

    // Method cell
    var methodTd = document.createElement('td');
    methodTd.className = 'network-method';
    methodTd.textContent = log.method || '';
    methodTd.style.fontWeight = 'bold';
    methodTd.style.color = '#1565c0';

    // Status cell (color-coded)
    var statusTd = document.createElement('td');
    statusTd.className = 'network-status status-' + log.status;
    statusTd.textContent = log.status || '';
    if (log.status >= 200 && log.status < 300) {
      statusTd.style.color = '#388e3c';
    } else if (log.status >= 400) {
      statusTd.style.color = '#d32f2f';
    } else {
      statusTd.style.color = '#fbc02d';
    }

    // Type cell
    var typeTd = document.createElement('td');
    typeTd.className = 'network-type';
    typeTd.textContent = type || '';

    // Response cell (show preview, tooltip for full)
    var responseTd = document.createElement('td');
    responseTd.className = 'network-response';
    var resp = log.response;


    try {
      if (typeof resp === 'string') {
        // Try to parse as JSON
        resp = JSON.parse(resp);
      }
    } catch (error) {
      // do nothing
    }
    if (typeof resp === 'object' && resp !== null) {
      // Beautify JSON object
      var pretty = JSON.stringify(resp, null, 2);
      responseTd.title = pretty;

      // Create a collapsible preview for large JSON
      var previewDiv = document.createElement('div');
      previewDiv.className = 'network-response-preview';
      previewDiv.style.whiteSpace = 'pre';
      previewDiv.style.maxHeight = '80px';
      previewDiv.style.overflow = 'auto';
      previewDiv.style.cursor = 'pointer';
      previewDiv.textContent = pretty.length > 600 ? pretty.slice(0, 600) + '…' : pretty;

      // If too long, allow expand/collapse
      if (pretty.length > 600) {
        var expandBtn = document.createElement('span');
        expandBtn.textContent = 'Show more';
        expandBtn.style.color = '#1976d2';
        expandBtn.style.marginLeft = '8px';
        expandBtn.style.cursor = 'pointer';
        expandBtn.style.fontSize = '12px';

        var expanded = false;
        expandBtn.onclick = function () {
          expanded = !expanded;
          if (expanded) {
            previewDiv.textContent = pretty;
            expandBtn.textContent = 'Show less';
            previewDiv.style.maxHeight = '300px';
          } else {
            previewDiv.textContent = pretty.slice(0, 600) + '…';
            expandBtn.textContent = 'Show more';
            previewDiv.style.maxHeight = '80px';
          }
        };

        responseTd.appendChild(previewDiv);
        responseTd.appendChild(expandBtn);
      } else {
        responseTd.appendChild(previewDiv);
      }
    } else {
      resp = resp || '';
      responseTd.title = resp;
      responseTd.textContent = resp.length > 120 ? resp.slice(0, 120) + '…' : resp;
      responseTd.style.whiteSpace = 'pre-line';
      // If too long, allow expand/collapse for string too
      if (resp.length > 120) {
        var expandBtnStr = document.createElement('span');
        expandBtnStr.textContent = 'Show more';
        expandBtnStr.style.color = '#1976d2';
        expandBtnStr.style.marginLeft = '8px';
        expandBtnStr.style.cursor = 'pointer';
        expandBtnStr.style.fontSize = '12px';

        var expandedStr = false;
        expandBtnStr.onclick = function () {
          expandedStr = !expandedStr;
          if (expandedStr) {
            responseTd.textContent = resp;
            expandBtnStr.textContent = 'Show less';
            responseTd.appendChild(expandBtnStr);
          } else {
            responseTd.textContent = resp.slice(0, 120) + '…';
            expandBtnStr.textContent = 'Show more';
            responseTd.appendChild(expandBtnStr);
          }
        };
        responseTd.textContent = resp.slice(0, 120) + '…';
        responseTd.appendChild(expandBtnStr);
      }
    }
    responseTd.style.maxWidth = '220px';
    responseTd.style.overflow = 'hidden';
    responseTd.style.textOverflow = 'ellipsis';

    // Duration cell
    var durationTd = document.createElement('td');
    durationTd.className = 'network-duration';
    durationTd.textContent = log.duration !== undefined ? log.duration + ' ms' : '';

    // Append all cells
    tr.appendChild(urlTd);
    tr.appendChild(methodTd);
    tr.appendChild(statusTd);
    tr.appendChild(typeTd);
    tr.appendChild(responseTd);
    tr.appendChild(durationTd);

    // Add to table body
    tbody.appendChild(tr);
  }

  function updateConsoleOutput(message, type) {
    console.log('updateConsoleOutput called with:', message, type); // Debug log
    var log = {
      message: message,
      level: 'log'
    };
    if (type === MESSAGE_TYPE.CONSOLE_LOG) {
      log.level = 'log';
    } else if (type === MESSAGE_TYPE.CONSOLE_INFO) {
      log.level = 'log';
    } else if (type === MESSAGE_TYPE.CONSOLE_WARN) {
      log.level = 'warn';
    } else if (type === MESSAGE_TYPE.CONSOLE_ERROR) {
      log.level = 'error';
    }
    var consoleDiv = document.getElementById('eachCommandResponse');
    console.log('consoleDiv found:', !!consoleDiv); // Debug log
    if (!consoleDiv) return;

    // Remove placeholder if it exists
    var placeholder = consoleDiv.querySelector('.placeholder');
    if (placeholder) {
      placeholder.remove();
    }

    var div = document.createElement('div');
    div.className = 'console-' + log.level;
    div.textContent = '[' + log.level.toUpperCase() + '] ' + log.message;
    consoleDiv.appendChild(div);

    // Auto-scroll to bottom
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
  }

  function updateStorageOutput(data) {
    var tableBody = document.getElementById('storage-table-body');
    if (!tableBody) return;

    // Clear existing content
    tableBody.innerHTML = '';

    // Check if data is empty
    if (!data || Object.keys(data).length === 0) {
      var emptyRow = document.createElement('tr');
      emptyRow.className = 'empty-storage';
      emptyRow.innerHTML = '<td colspan="3" class="empty-message">No data available</td>';
      tableBody.appendChild(emptyRow);
      return;
    }

    // Add data rows
    Object.keys(data).forEach(function (key) {
      var row = document.createElement('tr');

      // Key cell
      var keyCell = document.createElement('td');
      keyCell.className = 'storage-key-cell';

      // Handle long keys with scrolling
      if (key && key.length > 50) {
        var keyContent = document.createElement('div');
        keyContent.style.maxWidth = '200px';
        keyContent.style.overflow = 'auto';
        keyContent.style.wordBreak = 'break-all';
        keyContent.style.padding = '2px';
        keyContent.style.background = '#f0f6fc';
        keyContent.style.borderRadius = '4px';
        keyContent.style.fontSize = '11px';
        keyContent.textContent = key;
        keyCell.appendChild(keyContent);
      } else {
        keyCell.textContent = key;
      }

      keyCell.title = key; // Tooltip for long keys

      // Value cell
      var valueCell = document.createElement('td');
      valueCell.className = 'storage-value-cell';
      var value = data[key];

      // Create value content container
      var valueContent = document.createElement('div');

      // Determine if value needs scrolling (long or multiline)
      var needsScrolling = value && (value.length > 200 || value.includes('\n'));

      if (needsScrolling) {
        // Use scrollable container for long/multiline values
        valueContent.className = 'storage-value-content';
        valueContent.textContent = value;

        // Add expand/collapse button
        var expandBtn = document.createElement('button');
        expandBtn.className = 'storage-expand-btn';
        expandBtn.textContent = '⤢';
        expandBtn.title = 'Expand value';
        expandBtn.onclick = function () {
          if (valueContent.classList.contains('expanded')) {
            valueContent.classList.remove('expanded');
            expandBtn.textContent = '⤢';
            expandBtn.title = 'Expand value';
          } else {
            valueContent.classList.add('expanded');
            expandBtn.textContent = '⤡';
            expandBtn.title = 'Collapse value';
          }
        };

        valueCell.appendChild(valueContent);
        valueCell.appendChild(expandBtn);
      } else {
        // Use simple display for short values
        valueContent.className = 'storage-value-short';
        valueContent.textContent = value || '';
        valueCell.appendChild(valueContent);
      }

      valueCell.title = value; // Tooltip for full value

      // Actions cell
      var actionsCell = document.createElement('td');
      actionsCell.className = 'storage-actions-cell';
      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'storage-delete-btn';
      deleteBtn.innerHTML = '🗑';
      deleteBtn.title = 'Delete item';
      deleteBtn.onclick = function () {
        if (confirm('Delete "' + key + '"?')) {
          // Send delete command to remote
          if (conn) {
            var messageObj = {
              type: MESSAGE_TYPE.COMMAND_INPUT,
              value: 'localStorage.removeItem("' + key.replace(/"/g, '\\"') + '")'
            };
            sendMessage(messageObj);
            // Refresh storage after delete
            setTimeout(function () {
              var refreshBtn = document.getElementById('refreshStorageButton');
              if (refreshBtn) refreshBtn.click();
            }, 100);
          }
        }
      };
      actionsCell.appendChild(deleteBtn);

      row.appendChild(keyCell);
      row.appendChild(valueCell);
      row.appendChild(actionsCell);
      tableBody.appendChild(row);
    });
  }

  function updateScriptOutput(scriptOutput, type) {
    var scriptResponse = document.getElementById('eachScriptResponse');
    if (!scriptResponse) return;

    if (typeof scriptOutput === 'object') {
      scriptOutput = JSON.stringify(scriptOutput, null, 2);
    }

    var timestamp = new Date().toLocaleTimeString();
    var outputHtml = '<div class="script-result">' +
      '<div class="script-timestamp">' + timestamp + '</div>' +
      '<div class="script-output"><pre>' + scriptOutput + '</pre></div>' +
      '</div>';

    scriptResponse.innerHTML += outputHtml;
    scriptResponse.scrollTop = scriptResponse.scrollHeight;
  }

  function sendMessage(messageObj) {
    if (conn && conn.open) {
      var msg = JSON.stringify(messageObj);
      conn.send(msg);
    }
  }

  function sendEachRemoteEvent() {
    var remoteKeyCode = eachRemoteInput && eachRemoteInput.value;
    if (!remoteKeyCode) return;
    var messageObj = {
      type: MESSAGE_TYPE.REMOTE_KEY,
      value: remoteKeyCode
    };
    sendMessage(messageObj);
  }

  function sendEachCommand() {
    var commandName = eachCommandInput && eachCommandInput.value;
    if (!commandName) return;
    var messageObj = {
      type: MESSAGE_TYPE.COMMAND_INPUT,
      value: commandName
    };
    sendMessage(messageObj);
  }

  function clearPastMessage() {
    if (eachCommandResponse) {
      eachCommandResponse.innerHTML = "<span class='response-placeholder'>Response Should Come here</span>";
    }
  }

  function toggleFullScreen() {
    var fullScreenDiv = document.getElementById('fullscreenDiv');
    if (!fullScreenDiv) return;
    var doc = document;
    if (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    ) {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else {
      if (fullScreenDiv.requestFullscreen) {
        fullScreenDiv.requestFullscreen();
      } else if (fullScreenDiv.webkitRequestFullscreen) {
        fullScreenDiv.webkitRequestFullscreen();
      } else if (fullScreenDiv.mozRequestFullScreen) {
        fullScreenDiv.mozRequestFullScreen();
      } else if (fullScreenDiv.msRequestFullscreen) {
        fullScreenDiv.msRequestFullscreen();
      }
    }
  }

  // Clean fullscreen function for replay container
  function toggleReplayFullscreen() {
    var replayContainer = document.getElementById('replay-container');
    if (!replayContainer) {
      console.warn('Replay container not found');
      return;
    }

    var doc = document;
    var isFullscreen = !!(doc.fullscreenElement || doc.webkitFullscreenElement ||
      doc.mozFullScreenElement || doc.msFullscreenElement);

    if (isFullscreen) {
      // Exit fullscreen
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else {
      // Enter fullscreen
      if (replayContainer.requestFullscreen) {
        replayContainer.requestFullscreen();
      } else if (replayContainer.webkitRequestFullscreen) {
        replayContainer.webkitRequestFullscreen();
      } else if (replayContainer.mozRequestFullScreen) {
        replayContainer.mozRequestFullScreen();
      } else if (replayContainer.msRequestFullscreen) {
        replayContainer.msRequestFullscreen();
      }
    }
  }

  // Clean screenshot function for replay container
  function takeReplayScreenshot() {
    var replayContainer = document.getElementById('replay-container');
    if (!replayContainer) {
      console.warn('Replay container not found');
      return;
    }

    // Look for the iframe containing the replayed content
    var iframe = replayContainer.querySelector('iframe');
    if (!iframe) {
      console.warn('No replay iframe found for screenshot');
      return;
    }

    try {
      // Try to access iframe content for screenshot
      var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      // Set canvas size to match iframe
      canvas.width = iframe.offsetWidth || 800;
      canvas.height = iframe.offsetHeight || 600;

      // Use html2canvas if available, otherwise fallback
      if (typeof html2canvas !== 'undefined') {
        html2canvas(iframeDoc.body).then(function (canvas) {
          downloadScreenshot(canvas);
        });
      } else {
        // Simple fallback - capture the iframe element itself
        html2canvas(iframe).then(function (canvas) {
          downloadScreenshot(canvas);
        }).catch(function () {
          // Final fallback - manual notification
          alert('Screenshot feature requires additional libraries. Please ensure html2canvas is loaded.');
        });
      }
    } catch (e) {
      console.warn('Screenshot capture failed:', e);
      alert('Unable to capture screenshot due to security restrictions.');
    }
  }

  // Helper function to download screenshot
  function downloadScreenshot(canvas) {
    var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    var filename = 'replay-screenshot-' + timestamp + '.png';

    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  function downloadLogs() {
    var pageTitle = document.title;
    var pageUrl = window.location.href;
    var currentTime = new Date().toLocaleString();
    var currentTimeFormatted = currentTime.replace(/\s/g, '_');
    var fileName = pageUrl + '__' + pageTitle + '__' + currentTimeFormatted + '.txt';
    fileName = fileName.replace(/\//g, '_');
    var respponseDiv = document.getElementById('eachCommandResponse');
    var respponseText = respponseDiv && respponseDiv.innerHTML;
    respponseText = respponseText ? respponseText.replace(/<br>/g, '\n') : '';
    respponseText = fileName + '\n' + respponseText;
    var link = document.createElement('a');
    var mimeType = 'text/plain';
    link.setAttribute('download', fileName);
    link.setAttribute(
      'href',
      'data:' + mimeType + ';charset=utf-8,' + encodeURIComponent(respponseText)
    );
    link.click();
  }

  function attachEvents() {
    if (sendEachCommandButton) {
      sendEachCommandButton.addEventListener('click', sendEachCommand);
    }
    if (sendRemoteEventButton) {
      sendRemoteEventButton.addEventListener('click', sendEachRemoteEvent);
    }
    if (connectButton) {
      connectButton.addEventListener('click', startConnection);
    }
    if (clearMessageButton) {
      clearMessageButton.addEventListener('click', clearPastMessage);
    }
    if (fullScreenButton) {
      fullScreenButton.addEventListener('click', toggleFullScreen);
    }
    if (downloadButton) {
      downloadButton.addEventListener('click', downloadLogs);
    }
    if (sendEachScriptButton) {
      // Legacy script button - now handled by validation system
      sendEachScriptButton.style.display = 'none';
    }

    // Add missing event handlers
    var clearConsoleButton = document.getElementById('clearConsoleButton');
    if (clearConsoleButton) {
      clearConsoleButton.addEventListener('click', clearPastMessage);
    }

    var testConsoleButton = document.getElementById('testConsoleButton');
    if (testConsoleButton) {
      testConsoleButton.addEventListener('click', function () {
        console.log('Testing console output display...');
        updateConsoleOutput('Test log message', MESSAGE_TYPE.CONSOLE_LOG);
        updateConsoleOutput('Test info message', MESSAGE_TYPE.CONSOLE_INFO);
        updateConsoleOutput('Test warning message', MESSAGE_TYPE.CONSOLE_WARN);
        updateConsoleOutput('Test error message', MESSAGE_TYPE.CONSOLE_ERROR);
      });
    }

    var testMonacoButton = document.getElementById('testMonacoButton');
    if (testMonacoButton) {
      testMonacoButton.addEventListener('click', function () {
        console.log('Testing Monaco Editor...');
        if (window.MonacoManager) {
          console.log('MonacoManager available:', window.MonacoManager.isReady());
          if (window.MonacoManager.isReady()) {
            const testCode = `// Monaco Editor Scroll Test
console.log("Monaco is working with optimized scroll!");

// Generate a lot of content to test vertical scrolling
function testScrolling() {
  console.log("Line 1 - Testing vertical scroll");
  console.log("Line 2 - Testing vertical scroll");
  console.log("Line 3 - Testing vertical scroll");
  console.log("Line 4 - Testing vertical scroll");
  console.log("Line 5 - Testing vertical scroll");
  console.log("Line 6 - Testing vertical scroll");
  console.log("Line 7 - Testing vertical scroll");
  console.log("Line 8 - Testing vertical scroll");
  console.log("Line 9 - Testing vertical scroll");
  console.log("Line 10 - Testing vertical scroll");
  console.log("Line 11 - Testing vertical scroll");
  console.log("Line 12 - Testing vertical scroll");
  console.log("Line 13 - Testing vertical scroll");
  console.log("Line 14 - Testing vertical scroll");
  console.log("Line 15 - Testing vertical scroll");
  console.log("Line 16 - Testing vertical scroll");
  console.log("Line 17 - Testing vertical scroll");
  console.log("Line 18 - Testing vertical scroll");
  console.log("Line 19 - Testing vertical scroll");
  console.log("Line 20 - Testing vertical scroll");
  
  // Long line to test horizontal scrolling
  console.log("This is a very long line to test horizontal scrolling in Monaco Editor. It should extend beyond the visible area and require horizontal scrolling to see the full content. This line is intentionally made very long to test the horizontal scroll functionality.");
  
  // More lines for vertical scrolling
  for (let i = 21; i <= 50; i++) {
    console.log(\`Line \${i} - Testing vertical scroll with dynamic content\`);
  }
}

testScrolling();`;

            window.MonacoManager.setValue(testCode);
            updateConsoleOutput('Monaco Editor scroll test loaded - check Script tab and try scrolling', MESSAGE_TYPE.CONSOLE_LOG);
          } else {
            updateConsoleOutput('Monaco Editor not ready yet', MESSAGE_TYPE.CONSOLE_WARN);
          }
        } else {
          updateConsoleOutput('MonacoManager not available', MESSAGE_TYPE.CONSOLE_ERROR);
        }
      });
    }

    var clearOutputButton = document.getElementById('clearOutputButton');
    if (clearOutputButton) {
      clearOutputButton.addEventListener('click', clearPastMessage);
    }

    var clearAllButton = document.getElementById('clearAllButton');
    if (clearAllButton) {
      clearAllButton.addEventListener('click', clearPastMessage);
    }

    var exportLogsButton = document.getElementById('exportLogsButton');
    if (exportLogsButton) {
      exportLogsButton.addEventListener('click', downloadLogs);
    }

    // Storage refresh button
    var refreshStorageButton = document.getElementById('refreshStorageButton');
    if (refreshStorageButton) {
      refreshStorageButton.addEventListener('click', function () {
        if (conn) {
          var messageObj = {
            type: MESSAGE_TYPE.COMMAND_INPUT,
            value: 'JSON.stringify(localStorage)'
          };
          sendMessage(messageObj);
        }
      });
    }

    // Tab switching functionality
    var tabs = document.querySelectorAll('.tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var tabName = this.getAttribute('data-tab');
        switchTab(tabName);
      });
    });

    // Replay control buttons
    var fullscreenReplayButton = document.getElementById('fullscreenReplayButton');
    if (fullscreenReplayButton) {
      fullscreenReplayButton.addEventListener('click', toggleReplayFullscreen);
    }

    var screenshotReplayButton = document.getElementById('screenshotReplayButton');
    if (screenshotReplayButton) {
      screenshotReplayButton.addEventListener('click', takeReplayScreenshot);
    }

    // Monaco Editor buttons
    var formatScriptButton = document.getElementById('formatScriptButton');
    if (formatScriptButton) {
      formatScriptButton.addEventListener('click', async function () {
        if (window.MonacoManager && window.MonacoManager.isReady()) {
          await window.MonacoManager.formatCode();
        } else if (window.monacoEditor) {
          window.monacoEditor.getAction('editor.action.formatDocument').run();
        }
      });
    }

    var resetScriptButton = document.getElementById('resetScriptButton');
    if (resetScriptButton) {
      resetScriptButton.addEventListener('click', function () {
        if (window.MonacoManager && window.MonacoManager.isReady()) {
          window.MonacoManager.setValue(window.defaultScript || '// Default script');
        } else if (window.monacoEditor && window.defaultScript) {
          window.monacoEditor.setValue(window.defaultScript);
        }
      });
    }

    // Enter key handlers
    if (eachCommandInput) {
      eachCommandInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          sendEachCommand();
        }
      });
    }

    if (eachRemoteInput) {
      eachRemoteInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          sendEachRemoteEvent();
        }
      });
    }

    // Initialize DOM Replay controls
    initializeReplayControls();

    // Initialize Script Editor
    initializeScriptEditor();
  }

  function initialize() {
    peer = new Peer(undefined, {
      debug: 2
    });

    peer.on('open', function (id) {
      if (peer.id === null) {
        peer.id = lastPeerId;
      } else {
        lastPeerId = peer.id;
      }
      var newStatus = 'Status:  ' + (peer.open ? 'Open for connection' : 'Connecting...');
      updateStatus(newStatus);
    });

    peer.on('connection', function (c) {
      c.on('open', function () {
        c.send('Sender does not accept incoming connections');
        setTimeout(function () {
          c.close();
        }, 500);
      });
    });

    peer.on('disconnected', function () {
      var newStatus = 'Connection lost. Please reconnect';
      updateStatus(newStatus);
      peer.id = lastPeerId;
      peer._lastServerId = lastPeerId;
      peer.reconnect();
    });

    peer.on('close', function () {
      conn = null;
      var newStatus = 'Connection destroyed. Please refresh';
      updateStatus(newStatus);
    });

    peer.on('error', function (err) {
      // eslint-disable-next-line no-console
      console.error('Error :: ', err);
    });
  }

  function startConnection() {
    if (conn) {
      conn.close();
    }
    if (!peer || !receiverIdInput) {
      alert('Please enter a valid receiver ID (CPID)');
      return;
    }
    try {
      conn = peer.connect(receiverIdInput.value, {
        reliable: true
      });

      conn.on('open', function () {
        var newStatus = 'Connected to: ' + conn.peer;
        updateStatus(newStatus);
      });

      conn.on('data', onConnectData);

      conn.on('close', function () {
        var newStatus = 'Connection closed';
        updateStatus(newStatus);
      });
      window.conn = conn;
    } catch (error) {
      console.error('Error starting connection:', error);
    }
  }


  function onConnectData(data) {
    try {
      var outputObj = JSON.parse(data);
      var outputType = outputObj.type;
      var outputValue = outputObj.value;
      switch (outputType) {
        case MESSAGE_TYPE.COMMAND_OUPUT:
          if (typeof outputValue === 'string') {
            try {
              outputValue = JSON.parse(outputValue);
            } catch (error) {
              // ignore
            }
          }
          if (outputValue && outputValue.CPID || outputValue.cpid || outputValue.cpCustomerId) {
            updateStorageOutput(outputValue);
          } else {
            updateCommandOutput(outputValue, outputType);
          }
          break;
        case 'SCRIPT_OUTPUT':
          updateScriptOutput(outputValue, outputType);
          break;
        case 'NETWORK_LOG':
          try {
            var networkObj = JSON.parse(outputValue);
            updateNetworkOutput(networkObj, outputType);
          } catch (error) {
            updateCommandOutput('Invalid network log format: ' + error.message, MESSAGE_TYPE.CONSOLE_ERROR);
          }
          break;
        case MESSAGE_TYPE.CONSOLE_LOG:
        case MESSAGE_TYPE.CONSOLE_ERROR:
        case MESSAGE_TYPE.CONSOLE_INFO:
        case MESSAGE_TYPE.CONSOLE_WARN:
          updateConsoleOutput(outputValue, outputType);
          break;
        case 'DOM_EVENT':
          onDomEvent(outputValue);
          break;
        default:
          updateCommandOutput(outputValue, outputType);
          break;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error :: ', err.message);
    }
  }

  function bodyOnload() {
    connectionStatus = document.getElementById('connectionStatus');
    statusDot = document.getElementById('statusDot');
    receiverIdInput = document.getElementById('receiverId');
    connectButton = document.getElementById('connectButton');
    eachCommandInput = document.getElementById('eachCommandInput');
    eachRemoteInput = document.getElementById('eachRemoteInput');
    sendRemoteEventButton = document.getElementById('sendRemoteEventButton');
    sendEachCommandButton = document.getElementById('sendEachCommandButton');
    sendEachScriptButton = document.getElementById('sendEachScriptButton');
    clearMessageButton = document.getElementById('clearConsoleButton'); // Use clearConsoleButton as fallback
    fullScreenButton = document.getElementById('fullScreenButton');
    downloadButton = document.getElementById('downloadButton');
    eachCommandResponse = document.getElementById('eachCommandResponse');

    // Set initial status
    updateStatus('Disconnected', 'disconnected');

    attachEvents();
    initialize();
    setTimeout(() => {
      if (window.PEER_AUTO_CONNECT) {
        startConnection();
      }
    }, 2000);
  }

  function registerBodyOnload() {
    if (document.body) {
      bodyOnload();
    } else {
      window.addEventListener('DOMContentLoaded', bodyOnload);
    }
  }

  registerBodyOnload();

  window.APPLICATION = {};

  window.switchTab = function switchTab(tabName) {
    // Hide all tab contents
    var tabContents = document.querySelectorAll('.tab-content');
    var tabs = document.querySelectorAll('.tab');

    tabContents.forEach(function (content) {
      content.classList.remove('active');
    });

    tabs.forEach(function (tab) {
      tab.classList.remove('active');
    });

    // Show selected tab content
    var selectedContent = document.getElementById(tabName);
    if (selectedContent) {
      selectedContent.classList.add('active');
    }

    // Activate the tab button
    var selectedTab = document.querySelector('.tab[data-tab="' + tabName + '"]');
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
  };

  // Add quick command functionality
  window.sendQuickCommand = function (command) {
    if (command && conn) {
      var messageObj = {
        type: MESSAGE_TYPE.COMMAND_INPUT,
        value: command
      };
      sendMessage(messageObj);
    }
  };

  // Cleanup function for memory management
  window.cleanupDomReplay = function () {
    console.log('🧹 Cleaning up DOM Replay resources...');

    // Clear event buffers
    if (window.domEvents) {
      window.domEvents.length = 0;
    }

    // Destroy existing replayer
    if (window.replayer) {
      try {
        if (typeof window.replayer.destroy === 'function') {
          window.replayer.destroy();
        }
        window.replayer = null;
      } catch (e) {
        console.warn('Error destroying replayer:', e);
      }
    }

    // Clear DOM containers
    var replayContainer = document.getElementById('domReplayContainer');
    if (replayContainer) {
      replayContainer.innerHTML = '';
    }

    // Reset state flags
    replayState.lastProgressUpdate = 0;
    replayState.domUpdateCache = '';
    replayState.isCreatingReplayer = false;
    replayState.status = 'stopped';

    // Clear any pending timeouts
    if (window.domEventTimeout) {
      clearTimeout(window.domEventTimeout);
      window.domEventTimeout = null;
    }

    // Update UI
    updateReplayControls();
    toggleReplayPlaceholder(true);

    console.log('✅ DOM Replay cleanup completed');
  };

  // Footer Functions
  window.showHelp = function () {
    const helpContent = `
      <div style="color: var(--text-primary); line-height: 1.6;">
        <h3 style="margin-top: 0; color: var(--accent);">🛠️ Remote Debug Console Help</h3>
        <p><strong>Getting Started:</strong></p>
        <ul>
          <li>Enter a Receiver ID to connect to a remote debugging session</li>
          <li>Use the Console tab to execute commands and view output</li>
          <li>Monitor Local Storage data in the Storage tab</li>
          <li>Replay DOM interactions in the Replay tab</li>
        </ul>
        <p><strong>Keyboard Shortcuts:</strong></p>
        <ul>
          <li><code>Ctrl+Enter</code> - Execute command</li>
          <li><code>Ctrl+L</code> - Clear console</li>
          <li><code>Tab</code> - Switch between tabs</li>
        </ul>
        <p><strong>Features:</strong></p>
        <ul>
          <li>Real-time console forwarding</li>
          <li>Local Storage monitoring</li>
          <li>DOM session replay</li>
          <li>Script template validation</li>
        </ul>
      </div>
    `;

    showModal('Help', helpContent);
  };

  window.showAbout = function () {
    const aboutContent = `
      <div style="color: var(--text-primary); line-height: 1.6; text-align: center;">
        <div style="font-size: 2em; margin-bottom: 16px;">⚡</div>
        <h3 style="margin: 0; color: var(--accent);">Remote Debug Console</h3>
        <p style="color: var(--text-secondary); margin: 8px 0 20px;">Version 1.0.0</p>
        
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>Built with:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li>🌐 PeerJS for WebRTC communication</li>
            <li>🎬 rrweb for DOM recording & replay</li>
            <li>💻 Monaco Editor for code editing</li>
            <li>🎨 Chrome DevTools styling</li>
          </ul>
        </div>
        
        <div style="padding: 16px; background: rgba(var(--accent-rgb), 0.1); border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 0.9em; color: var(--text-secondary);">
            A powerful remote debugging tool for real-time web application monitoring and debugging.
          </p>
        </div>
      </div>
    `;

    showModal('About', aboutContent);
  };

  function showModal(title, content) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--background-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 24px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      position: relative;
    `;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 16px;
      background: none;
      border: none;
      font-size: 24px;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    closeBtn.onmouseover = () => closeBtn.style.color = 'var(--accent)';
    closeBtn.onmouseout = () => closeBtn.style.color = 'var(--text-secondary)';

    modal.innerHTML = `<h2 style="margin: 0 0 16px 0; color: var(--text-primary);">${title}</h2>${content}`;
    modal.appendChild(closeBtn);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close modal function
    const closeModal = () => document.body.removeChild(overlay);

    closeBtn.onclick = closeModal;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeModal();
    };

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  // Update footer status based on connection - Minimal Design
  function updateFooterStatus() {
    const connectionStatusElement = document.getElementById('connectionStatus');
    const footerStatusElement = document.getElementById('footerStatus');

    if (connectionStatusElement && footerStatusElement) {
      if (window.peer && window.peer.open) {
        connectionStatusElement.textContent = 'Connected';
        footerStatusElement.className = 'footer-status connected';
      } else {
        connectionStatusElement.textContent = 'Ready';
        footerStatusElement.className = 'footer-status';
      }
    }
  }

  // Optimized footer initialization with throttling
  let footerUpdateTimeout;
  function throttledFooterUpdate() {
    clearTimeout(footerUpdateTimeout);
    footerUpdateTimeout = setTimeout(updateFooterStatus, 200);
  }

  // Update footer when connection status changes - Optimized
  const originalConnect = window.connectToReceiver;
  if (originalConnect) {
    window.connectToReceiver = function (...args) {
      const result = originalConnect.apply(this, args);
      throttledFooterUpdate();
      return result;
    };
  }

  // Initialize footer status with optimized updates
  document.addEventListener('DOMContentLoaded', function () {
    updateFooterStatus();
    // Update footer status less frequently to reduce overhead
    setInterval(updateFooterStatus, 10000); // Reduced from 5s to 10s
  });

  // Listen for peer connection events for immediate updates
  if (window.addEventListener) {
    window.addEventListener('peer-connected', throttledFooterUpdate);
    window.addEventListener('peer-disconnected', throttledFooterUpdate);
  }

}());
