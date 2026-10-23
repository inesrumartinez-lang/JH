// Extrae el contenido de la web WordPress (HTML guardado) a archivos Markdown para Eleventy/Decap.
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';

const [LIVE, UPLOADS] = process.argv.slice(2);
const OUT = 'src';
const td = new TurndownService({ headingStyle: 'atx', emDelimiter: '*', bulletListMarker: '-' });
const usedImages = new Set();

const localImg = (url) => {
  if (!url) return '';
  const m = url.match(/wp-content\/uploads\/(.+?)(\?.*)?$/);
  if (!m) return url;
  usedImages.add(decodeURIComponent(m[1]));
  return '/uploads/' + decodeURIComponent(m[1]);
};
const clean = (s) => s.replace(/ /g, ' ').replace(/[ \t]+/g, ' ').trim();
const md = (html) => clean(td.turndown(html || '')).replace(/\*\*\s*\*\*/g, '').replace(/\*\s*\*/g, '');
const yaml = (obj) => '---\n' + Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')
  .map(([k, v]) => `${k}: ${typeof v === 'string' ? JSON.stringify(v) : v}`).join('\n') + '\n---\n';
const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
const write = (dir, name, front, body = '') => {
  fs.mkdirSync(path.join(OUT, dir), { recursive: true });
  let file = path.join(OUT, dir, name + '.md'), n = 2;
  while (fs.existsSync(file)) file = path.join(OUT, dir, `${name}-${n++}.md`);
  fs.writeFileSync(file, yaml(front) + body + (body ? '\n' : ''));
};
const load = (f) => cheerio.load(fs.readFileSync(path.join(LIVE, f), 'utf8'));
const yearOf = (s) => { const m = s.match(/\((?:[^()]*?,\s*)?((?:19|20)\d{2})[a-z]?\)/) || s.match(/((?:19|20)\d{2})/); return m ? Number(m[1]) : undefined; };

// ---------- Blog ----------
for (const f of fs.readdirSync(path.join(LIVE, 'posts'))) {
  const $ = load('posts/' + f);
  const slug = f.replace(/\.html$/, '');
  const content = $('.elementor-widget-theme-post-content .elementor-widget-container').first();
  content.find('img').each((i, e) => {
    const src = $(e).attr('src'); $(e).attr('src', localImg(src));
    ['srcset', 'sizes', 'width', 'height', 'class'].forEach((a) => $(e).removeAttr(a));
  });
  content.find('a').each((i, e) => {
    const h = $(e).attr('href') || '';
    if (h.includes('wp-content/uploads')) $(e).attr('href', localImg(h));
    else $(e).attr('href', h.replace(/^https?:\/\/(www\.)?javierhorcajo\.com/, '') || '/');
  });
  const body = td.turndown(content.html() || '').replace(/ /g, ' ').trim();
  write('blog', slug, {
    title: clean($('.elementor-widget-theme-post-title .elementor-heading-title').text() || $('title').text().split('|')[0]),
    date: $('meta[property="article:published_time"]').attr('content'),
    image: localImg($('meta[property="og:image"]').attr('content')),
    excerpt: clean($('meta[property="og:description"]').attr('content') || ''),
  
  }, body);
}

// ---------- Artículos y congresos ----------
function pubList(file, dir) {
  const $ = load(file);
  let orden = 0;
  $('section.elementor-inner-section').each((i, s) => {
    const S = $(s);
    if (S.find('.elementor-menu-anchor').length) return;
    const t = S.find('.elementor-text-editor').map((j, e) => $(e).html()).get();
    if (t.length < 2) return;
    const titulo = clean(cheerio.load(t[0]).text());
    const referencia = md(t.slice(1).join(' '));
    const enlace = S.find('a.elementor-icon, a').map((j, e) => $(e).attr('href')).get().find((h) => /^https?:/.test(h)) || '';
    write(dir, slugify(titulo), { titulo, anio: yearOf(referencia), referencia, enlace, orden: ++orden });
  });
  return orden;
}
console.log('articulos', pubList('articulos-cientificos.html', 'publicaciones/articulos'));
console.log('congresos', pubList('congresos-y-conferencias.html', 'publicaciones/congresos'));

// ---------- Libros y capítulos ----------
{
  const $ = load('libros-y-capitulos.html');
  const seen = new Set(); let orden = 0;
  $('section.elementor-section').each((i, s) => {
    const S = $(s);
    if (S.find('section.elementor-section').length) return; // solo secciones hoja
    const heads = S.find('.elementor-heading-title').map((j, e) => clean($(e).text())).get();
    const ref = S.find('.elementor-text-editor').map((j, e) => $(e).html()).get().join(' ');
    if (heads.length < 2 || !/^\d{4}$/.test(heads[0]) || !ref) return;
    const key = heads[1] + ref;
    if (seen.has(key)) return; seen.add(key);
    const referencia = md(ref).replace(/^\*\s*\\?\*?\s*/, '').replace(/^\\\*\s*/, '');
    write('publicaciones/libros', slugify(heads[1]), {
      titulo: heads[1], anio: Number(heads[0]),
      tipo: /\b(En|In)\s+[A-Z]/.test(referencia) ? 'Capítulo' : 'Libro',
      referencia, portada: localImg(S.find('img').first().attr('src')), orden: ++orden,
    });
  });
  console.log('libros', orden);
}

// ---------- Copiar imágenes usadas ----------
let copied = 0, missing = [];
for (const rel of usedImages) {
  const src = path.join(UPLOADS, rel), dst = path.join(OUT, 'uploads', rel);
  if (!fs.existsSync(src)) { missing.push(rel); continue; }
  fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); copied++;
}
console.log('imágenes copiadas', copied, 'faltan', missing);
