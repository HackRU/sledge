"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStaticHtmlFiles = exports.generateHtml = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const directory_1 = require("../client/directory");
/**
 * The HTML template for all pages with placeholders for the name and path
 */
const HTMLTemplate = `
<!DOCTYPE html>
  <head>
    <meta charset="utf-8">
    <title>Sledge | %NAME%</title>

    <script>window.CURRENT_PAGE="%PATH%";</script>
    <script type="text/javascript" src="/bundle.js"></script>
  </head>

  <body>
    <div id="app"><p>Loading...</p></div>
    <noscript><em>Please enable Javascript to use Sledge.</em></noscript>
  </body>
</html>
`;
/**
 * Returns the html for a page with the specified name and path
 */
function generateHtml(name, path) {
    return HTMLTemplate.replace("%PATH%", path).replace("%NAME%", name);
}
exports.generateHtml = generateHtml;
/**
 * Goes through all pages and outputs the html in the provided path
 */
function generateStaticHtmlFiles(path) {
    for (let page of directory_1.pages) {
        const html = generateHtml(page.name, page.path);
        const dir = path_1.resolve(path, page.path);
        const file = path_1.resolve(dir, "index.html");
        if (!fs_1.existsSync(dir)) {
            fs_1.mkdirSync(dir);
        }
        fs_1.writeFileSync(file, html);
    }
}
exports.generateStaticHtmlFiles = generateStaticHtmlFiles;
//# sourceMappingURL=HTMLGenerator.js.map