import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11.12.0/+esm";
import "https://cdn.jsdelivr.net/npm/docsify@4.13.1/+esm";

mermaid.initialize({ startOnLoad: false });

// see https://docsify.js.org/#/configuration

const footer = `____

Powered by [Docsify](https://docsify.js.org/)

[▲ Back to Top](#)
`;

window.$docsify = {
  name: 'Ghostbird \u{1faba}\u{1f4eb}\u{1f47b}',
  repo: 'exteditor/ghostbird',
  logo: 'ext/blue.svg',
  relativePath: true,
  executeScript: true,
  homepage: "homepage.md",
  coverpage: "coverpage.md",
  auto2top: true,
  maxLevel: 3,
  themeColor: '#0b9dd6',
  routes: {
    ['/README'](route) {
      let url = `https://github.com/exteditor/ghostbird/blob/main/${encodeURIComponent(route.slice(1))}.md`
      return `Redirecting to ${url}...\n\n<script>\nlocation.href = "${url}"${'</'}script>`
    },
    ['/[-._/a-zA-Z]*[.][a-zA-Z]+'](route) {
      let url = `https://github.com/exteditor/ghostbird/blob/main/${encodeURIComponent(route.slice(1))}`
      return `Redirecting to ${url}...\n\n<script>\nlocation.href = "${url}"${'</'}script>`
    },
  },
  search: [
    '/',
    '/BUILDING',
    '/CONTRIBUTING',
    '/doc/faq',
    '/doc/faq-architectural',
    '/doc/building',
    '/doc/testing',
  ],
  markdown: {
    renderer: {
      code(code, lang) {
        if (lang === "mermaid") {
          return `<pre class="mermaid">${code}</pre>`;
        }
        return this.origin.code.apply(this, arguments);
      }
    }
  },
  plugins: [
    (hook, _vm) => {
      hook.beforeEach(html => html + footer);
      hook.doneEach(() => mermaid.run());
    },
  ],
};
