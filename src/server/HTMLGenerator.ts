import {resolve} from "path";
import {existsSync, mkdirSync, writeFileSync} from "fs";
import {pages} from "../client/directory";

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
export function generateHtml(name: string, path: string) {
  return HTMLTemplate.replace("%PATH%", path).replace("%NAME%", name);
}

/**
 * Goes through all pages and outputs the html in the provided path
 */
export function generateStaticHtmlFiles(path: string) {
  for (let page of pages) {
    const html = generateHtml(page.name, page.path);
    const dir = resolve(path, page.path);
    const file = resolve(dir, "index.html");

    if (!existsSync(dir)) {
      mkdirSync(dir);
    }
    writeFileSync(file, html);
  }
}
