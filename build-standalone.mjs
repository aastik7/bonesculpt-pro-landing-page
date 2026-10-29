import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = new URL('./dist/', import.meta.url);
const guides = ['stroke', 'collision', 'onion'].map(name => `./media/bonesculpt-${name}-guide`);
const guideAnimations = new Map();
for (const stem of guides) {
  for (const suffix of ['.mp4', '.webp', '-poster.webp']) {
    const path = stem + suffix;
    const data = await readFile(new URL(path, dist));
    if (!data.length) throw new Error(`Guided media is empty: ${path}`);
    if (suffix === '.webp') guideAnimations.set(path, `data:image/webp;base64,${data.toString('base64')}`);
  }
}
const [html, css, js, interfaceImage] = await Promise.all([
  readFile(new URL('index.html', dist), 'utf8'),
  readFile(new URL('styles.css', dist), 'utf8'),
  readFile(new URL('app.js', dist), 'utf8'),
  readFile(new URL('media/interface.webp', dist)),
]);
const cssTag = '<link rel="stylesheet" href="./styles.css">';
const jsTag = '<script src="./app.js" defer></script>';
if (!html.includes(cssTag) || !html.includes(jsTag)) throw new Error('Expected page stylesheet/script tags were not found.');
for (const stem of guides) {
  for (const suffix of ['.mp4', '.webp', '-poster.webp']) {
    if (!html.includes(stem + suffix)) throw new Error(`Guided media is not referenced by the page: ${stem + suffix}`);
  }
}
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
for (const [path, data] of guideAnimations) standalone = standalone.replaceAll(path, data);

// Videos stay relative to this file's location in dist/; page CSS, JavaScript,
// the interface still and available video posters are embedded in the HTML.
if (process.argv.includes('--check')) {
  console.log(`Standalone export validated (${Buffer.byteLength(standalone)} bytes); no file written.`);
} else {
  const output = new URL('bonesculpt-pro-standalone.html', dist);
  await writeFile(output, standalone);
  console.log(`Built ${fileURLToPath(output)}`);
}
