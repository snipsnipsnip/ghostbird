import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11.12.0/+esm";
import "https://cdn.jsdelivr.net/npm/docsify@4.13.1/+esm";

// @ts-check

mermaid.initialize({ startOnLoad: false });

/**
 * Build a URL to a GitHub resource
 * @param {string} type The type of resource ('blob' or 'tree')
 * @param {string} path Absolute path (/ points to the repository root) to the resource
 * @returns {string} The URL to the resource
 */
const urlFor = (type, path) => `https://github.com/exteditor/ghostbird/${type}/main/${encodeURIComponent(path.replace(/^[/]+/, ''))}`;

/**
 * Build a Markdown text that redirects to a URL
 * @param {string} url The URL to redirect to
 * @returns {string} a Markdown text
 */
const redirectTo = (url) => `Redirecting to ${url}...\n\n<script>\nlocation.href = "${url}"${'</'}script>`;

/**
 * Add a footer to the Markdown text
 * @param {string} text The Markdown text
 * @returns {string} Markdown text with footer added
 */
const addFooter = (text, vm) => `${text}

____

[▲ Back to Top](#top)
<div align="right">

Last Update: [{docsify-updated}](${urlFor('blob', vm.route.file)})<br>
Powered by [Docsify](https://docsify.js.org/)

</div>
`;

// see https://docsify.js.org/#/configuration

window.$docsify = {
  name: 'Ghostbird \u{1faba}\u{1f4eb}\u{1f47b}',
  repo: 'exteditor/ghostbird',
  logo: 'ext/blue.svg',
  formatUpdated: '{YYYY}-{MM}-{DD}',
  relativePath: true,
  executeScript: true,
  homepage: "homepage.md",
  coverpage: "coverpage.md",
  loadNavbar: "navbar.md",
  mergeNavbar: true,
  auto2top: true,
  maxLevel: 3,
  themeColor: '#0b9dd6',
  routes: {
    '/README': (route) => redirectTo(urlFor('blob', `${route}.md`)),
    '/[-._/a-zA-Z]*[.][a-zA-Z]+$': (route) => redirectTo(urlFor('blob', route)),
    '/[-._/a-zA-Z]+/$': (route) => redirectTo(urlFor('tree', route)),
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
    (hook, vm) => {
      hook.beforeEach((text) => addFooter(text, vm));
      hook.doneEach(() => mermaid.run());
    },
  ],
};
