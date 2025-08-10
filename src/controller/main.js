import { mountController } from './ui/root.js';
import { initTransport } from './runtime/transportInstance.js';

// Entry point for controller bundle
window.addEventListener('DOMContentLoaded', () => {
  mountController();
  const params = new URLSearchParams(location.search);
  const secret = params.get('secret');
  if(secret) {
    // store will be updated when user connects; secret kept in closure by transport init
  }
});
