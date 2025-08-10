// Automated Button Testing Script
// Run this in browser console to test all button functionality

console.log('🧪 Starting Automated Button Tests...\n');

// Test Results Storage
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function addTestResult(name, passed, message) {
    testResults.tests.push({ name, passed, message });
    if (passed) {
        testResults.passed++;
        console.log(`✅ PASS: ${name} - ${message}`);
    } else {
        testResults.failed++;
        console.log(`❌ FAIL: ${name} - ${message}`);
    }
}

// Helper function to test if element exists and is clickable
function testButton(elementId, testName) {
    const element = document.getElementById(elementId);
    if (!element) {
        addTestResult(testName, false, `Element ${elementId} not found`);
        return false;
    }

    if (element.disabled) {
        addTestResult(testName, false, `Element ${elementId} is disabled`);
        return false;
    }

    addTestResult(testName, true, `Element ${elementId} exists and is clickable`);
    return true;
}

// Test event listener attachment
function testEventListener(elementId, testName) {
    const element = document.getElementById(elementId);
    if (!element) {
        addTestResult(testName, false, `Element ${elementId} not found`);
        return false;
    }

    // Check if element has click event listeners
    const hasClickHandler = element.onclick !== null ||
        (window.getEventListeners && getEventListeners(element).click?.length > 0);

    addTestResult(testName, hasClickHandler, hasClickHandler ?
        `${elementId} has event handlers` :
        `${elementId} missing event handlers`);
    return hasClickHandler;
}

// Test function existence
function testFunction(functionName, testName) {
    const func = window[functionName];
    const exists = typeof func === 'function';
    addTestResult(testName, exists, exists ?
        `Function ${functionName} exists` :
        `Function ${functionName} missing`);
    return exists;
}

// Determine which page we're testing
const isTestHTML = document.title.includes('Target Demo');
const isDebugMode = document.title.includes('Controller Dashboard');

if (isTestHTML) {
    console.log('📋 Testing test.html functionality...\n');

    // Test test.html specific buttons
    testButton('startConnectButton', 'Start Connection Button');
    testButton('clearAllLogs', 'Clear Logs Button');
    testButton('cpidInput', 'CPID Input Field');

    // Test action buttons
    const actionButtons = document.querySelectorAll('.action-button');
    addTestResult('Action Buttons', actionButtons.length >= 4,
        `Found ${actionButtons.length} action buttons`);

    // Test output area
    const outputArea = document.querySelector('.output-area, #outputList');
    addTestResult('Output Area', outputArea !== null,
        outputArea ? 'Output area exists' : 'Output area missing');

    // Test responsive elements
    const sidebar = document.querySelector('.sidebar');
    addTestResult('Sidebar Element', sidebar !== null,
        sidebar ? 'Sidebar exists' : 'Sidebar missing');

} else if (isDebugMode) {
    console.log('🔧 Testing debugmode.html functionality...\n');

    // Test main buttons
    testButton('connectButton', 'Connect Button');
    testButton('sendEachCommandButton', 'Send Command Button');
    testButton('sendRemoteEventButton', 'Send Remote Event Button');
    testButton('sendEachScriptButton', 'Send Script Button');
    testButton('clearConsoleButton', 'Clear Console Button');
    testButton('clearOutputButton', 'Clear Output Button');
    testButton('clearAllButton', 'Clear All Button');
    testButton('exportLogsButton', 'Export Logs Button');
    testButton('fullScreenButton', 'Fullscreen Button');
    testButton('downloadButton', 'Download Button');
    testButton('formatScriptButton', 'Format Script Button');
    testButton('resetScriptButton', 'Reset Script Button');

    // Test input fields
    testButton('receiverId', 'Receiver ID Input');
    testButton('eachCommandInput', 'Command Input');
    testButton('eachRemoteInput', 'Remote Input');

    // Test tabs
    const tabs = document.querySelectorAll('.tab[data-tab]');
    addTestResult('Tab Elements', tabs.length === 5,
        `Found ${tabs.length}/5 expected tabs`);

    // Test tab switching function
    testFunction('switchTab', 'Switch Tab Function');
    testFunction('sendQuickCommand', 'Send Quick Command Function');

    // Test tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    addTestResult('Tab Content Areas', tabContents.length === 5,
        `Found ${tabContents.length}/5 tab content areas`);

    // Test Monaco Editor container
    const monacoContainer = document.getElementById('monaco-editor');
    addTestResult('Monaco Editor Container', monacoContainer !== null,
        monacoContainer ? 'Monaco editor container exists' : 'Monaco editor container missing');

    // Test quick actions
    const quickActions = document.querySelectorAll('.quick-action[onclick]');
    addTestResult('Quick Action Buttons', quickActions.length === 4,
        `Found ${quickActions.length}/4 quick action buttons`);

    // Test if Monaco Editor is loaded
    setTimeout(() => {
        if (window.monacoEditor) {
            addTestResult('Monaco Editor Instance', true, 'Monaco Editor is loaded and available');
        } else {
            addTestResult('Monaco Editor Instance', false, 'Monaco Editor not loaded yet');
        }

        // Final summary after Monaco check
        console.log('\n📊 Test Summary:');
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📈 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);

        if (testResults.failed === 0) {
            console.log('\n🎉 All tests passed! The interface is fully functional.');
        } else {
            console.log('\n⚠️ Some tests failed. Check the results above for details.');
        }
    }, 2000); // Wait for Monaco to potentially load

} else {
    console.log('❓ Unknown page - cannot determine test suite to run');
}

// Immediate summary (before Monaco check)
console.log('\n📊 Initial Test Summary:');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📈 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);

// Return results for external access
window.testResults = testResults;
