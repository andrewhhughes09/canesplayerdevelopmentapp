// Bridge to the CommonJS config so PostCSS tooling that expects a .js file
// still works when package.json sets "type": "module".
const cfg = await import('./postcss.config.cjs');
export default (cfg && cfg.default) ? cfg.default : cfg;