// Button Test Script for Remote Debugger
// Run this in the browser console to test button functionality

function testButtons() {
    console.log('🧪 Testing Remote Debugger Buttons...\n');

    const buttonsToTest = [
        'connectButton',
        'sendEachCommandButton',
        'sendRemoteEventButton',
        'sendEachScriptButton',
        'clearConsoleButton',
        'clearOutputButton',
        'clearAllButton',
        'exportLogsButton',
        'fullScreenButton',
        'downloadButton',
        'formatScriptButton',
        'resetScriptButton'
    ];

    const results = [];

    buttonsToTest.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            // Test if button exists and has event listeners
            const hasListeners = getEventListeners(button).click?.length > 0;
            results.push({
                id: buttonId,
                found: true,
                hasEventListeners: hasListeners,
                disabled: button.disabled,
                visible: !button.classList.contains('hidden')
            });
        } else {
            results.push({
                id: buttonId,
                found: false,
                hasEventListeners: false,
                disabled: false,
                visible: false
            });
        }
    });

    // Test tabs
    const tabs = document.querySelectorAll('.tab[data-tab]');
    console.log(`📋 Found ${tabs.length} tabs:`);
    tabs.forEach(tab => {
        const tabName = tab.getAttribute('data-tab');
        const hasListener = getEventListeners(tab).click?.length > 0;
        console.log(`  - ${tabName}: ${hasListener ? '✅' : '❌'} event listener`);
    });

    // Test quick actions
    const quickActions = document.querySelectorAll('.quick-action[onclick]');
    console.log(`⚡ Found ${quickActions.length} quick action buttons with onclick`);

    // Display results
    console.log('\n📝 Button Test Results:');
    console.table(results);

    // Test tab switching
    console.log('\n🔄 Testing tab switching...');
    if (typeof window.switchTab === 'function') {
        console.log('✅ switchTab function available');
        try {
            window.switchTab('console');
            console.log('✅ Tab switching to console works');
        } catch (e) {
            console.log('❌ Tab switching error:', e.message);
        }
    } else {
        console.log('❌ switchTab function not found');
    }

    // Test sendQuickCommand
    if (typeof window.sendQuickCommand === 'function') {
        console.log('✅ sendQuickCommand function available');
    } else {
        console.log('❌ sendQuickCommand function not found');
    }

    return results;
}

// Add button test function to window for easy access
window.testButtons = testButtons;

console.log('🔧 Button test script loaded! Run testButtons() to check functionality.');
