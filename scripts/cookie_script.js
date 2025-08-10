var COOKIE_TEMPLATE = `// Cookie Management Script
(function() {
  'use strict';
  
  console.log('🍪 Starting Cookie Management...');
  
  try {
    // Get all cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name) {
        acc[name] = decodeURIComponent(value || '');
      }
      return acc;
    }, {});
    
    // Get localStorage data
    const localStorage = Object.keys(window.localStorage).reduce((acc, key) => {
      acc[key] = window.localStorage.getItem(key);
      return acc;
    }, {});
    
    // Get sessionStorage data
    const sessionStorage = Object.keys(window.sessionStorage).reduce((acc, key) => {
      acc[key] = window.sessionStorage.getItem(key);
      return acc;
    }, {});
    
    const result = {
      url: window.location.href,
      domain: window.location.hostname,
      cookies: cookies,
      localStorage: localStorage,
      sessionStorage: sessionStorage,
      cookieCount: Object.keys(cookies).length,
      localStorageCount: Object.keys(localStorage).length,
      sessionStorageCount: Object.keys(sessionStorage).length,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Cookie data collected:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Cookie collection failed:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
})();`;

// Register the template
window.SCRIPT_TEMPLATES_LIST["COOKIE_TEMPLATE"] = COOKIE_TEMPLATE;

// Update the template definition
if (window.SCRIPT_TEMPLATES && window.SCRIPT_TEMPLATES.COOKIE_TEMPLATE) {
    window.SCRIPT_TEMPLATES.COOKIE_TEMPLATE.code = COOKIE_TEMPLATE;
}