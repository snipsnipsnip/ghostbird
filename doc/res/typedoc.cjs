"use strict";

let nodes = document.querySelectorAll('code.mermaid');
let mermaidPromise = nodes.length ? import('https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs') : null;

mermaidPromise?.then(({ default: mermaid }) => {
  mermaid.run({ nodes });
}).catch((error) => {
  console.warn('Failed to load or run Mermaid:', error);
});
