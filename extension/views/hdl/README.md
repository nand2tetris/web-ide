# HDL webview

React app shown in the VS Code extension's HDL view. `npm run build -w extension/views/hdl` bundles it with Vite into `extension/out/views/hdl/main.js` and `main.css`, which `extension/src/views/hdl.ts` loads, and also copies `public/styles.css` there.
