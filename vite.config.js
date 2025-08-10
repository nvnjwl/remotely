import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'chrome100',
    rollupOptions: {
      input: {
        controller: 'src/controller/main.js',
        sdk: 'src/sdk/index.js'
      },
      output: {
        entryFileNames: asset => asset.name === 'sdk' ? 'sdk.js' : 'controller.[hash].js'
      }
    }
  }
});
