// Copia desde la copia de seguridad los CSS/JS/imágenes/fuentes que usan las plantillas.
import fs from 'fs'; import path from 'path';
const [LIST, BACKUP, OUT] = process.argv.slice(2);
const queue = fs.readFileSync(LIST, 'utf8').split('\n').filter((p) => p.startsWith('wp-content') || p.startsWith('wp-includes'));
const done = new Set();
while (queue.length) {
  const rel = decodeURIComponent(queue.shift());
  if (done.has(rel)) continue; done.add(rel);
  const dst = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const src = path.join(BACKUP, rel);
  if (fs.existsSync(src)) fs.copyFileSync(src, dst);
  else {
    const r = await fetch('https://www.javierhorcajo.com/' + rel);
    if (!r.ok) { console.log('NO ENCONTRADO', rel); continue; }
    fs.writeFileSync(dst, Buffer.from(await r.arrayBuffer())); console.log('descargado', rel);
  }
  if (rel.endsWith('.css')) {
    const css = fs.readFileSync(dst, 'utf8');
    for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
      let u = m[1].split(/[?#]/)[0];
      if (u.startsWith('data:')) continue;
      const abs = u.replace(/^(https?:)?\/\/(www\.)?javierhorcajo\.com\//, '/');
      if (/^(https?:)?\/\//.test(abs)) continue;
      queue.push(abs.startsWith('/') ? abs.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(rel), abs)));
    }
    // Rutas absolutas del dominio antiguo -> rutas relativas a la raíz
    fs.writeFileSync(dst, css.replace(/(https?:)?\/\/(www\.)?javierhorcajo\.com\//g, '/'));
    if (false) {
    }
  }
}
console.log('archivos', done.size);
