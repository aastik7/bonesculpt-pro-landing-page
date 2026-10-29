import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = new URL('./dist/', import.meta.url);
const [html, css, js, interfaceImage] = await Promise.all([
  readFile(new URL('index.html', dist), 'utf8'),
  readFile(new URL('styles.css', dist), 'utf8'),
  readFile(new URL('app.js', dist), 'utf8'),
  readFile(new URL('media/interface.webp', dist)),
]);
const cssTag = '<link rel="stylesheet" href="./styles.css">';
const jsTag = '<script src="./app.js" defer></script>';
if (!html.includes(cssTag) || !html.includes(jsTag)) throw new Error('Expected page stylesheet/script tags were not found.');
const interfaceData = `data:image/webp;base64,${interfaceImage.toString('base64')}`;
const safeJS = js.replace(/<\/script/gi, '<\\/script').replaceAll('./media/interface.webp', interfaceData);
let standalone = html
  .replace(cssTag, () => `<style>\n${css}\n</style>`)
  .replace(jsTag, '')
  .replaceAll('./media/interface.webp', interfaceData)
  .replace('</body>', () => `<script>\n${safeJS}\n</script>\n</body>`);

for (const path of new Set([...html.matchAll(/poster="(\.\/media\/[^"]+)"/g)].map((match) => match[1]))) {
  let posterData = interfaceData;
  try { posterData = `data:image/webp;base64,${(await readFile(new URL(path, dist))).toString('base64')}`; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  standalone = standalone.replaceAll(path, posterData);
}

// Videos stay relative to this file's location in dist/; page CSS, JavaScript,
// the interface still and available video posters are embedded in the HTML.
if (process.argv.includes('--check')) {
  console.log(`Standalone export validated (${Buffer.byteLength(standalone)} bytes); no file written.`);
} else {
  const output = new URL('bonesculpt-pro-standalone.html', dist);
  await writeFile(output, standalone);
  console.log(`Built ${fileURLToPath(output)}`);
}
