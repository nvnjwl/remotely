var CUSTOM_TEMPLATE = `// Custom JavaScript Execution
(function() {
  'use strict';
  
  console.log('⚡ Executing custom script...');
  
  try {
    // Your custom code goes here
    
    // Example: Page information
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      performance: {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      }
    };
    
    // Example: Check for common libraries
    const libraries = {
      jquery: typeof window.$ !== 'undefined',
      react: typeof window.React !== 'undefined',
      vue: typeof window.Vue !== 'undefined',
      angular: typeof window.angular !== 'undefined',
      lodash: typeof window._ !== 'undefined'
    };
    
    const result = {
      pageInfo,
      libraries,
      message: 'Custom script executed successfully',
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Custom script completed:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Custom script failed:', error);
    return {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  }
})();`;

// Register the template
window.SCRIPT_TEMPLATES_LIST["CUSTOM_TEMPLATE"] = CUSTOM_TEMPLATE;

// Update the template definition
if (window.SCRIPT_TEMPLATES && window.SCRIPT_TEMPLATES.CUSTOM_TEMPLATE) {
    window.SCRIPT_TEMPLATES.CUSTOM_TEMPLATE.code = CUSTOM_TEMPLATE;
}