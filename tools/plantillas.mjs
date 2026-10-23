// Convierte el HTML descargado de la web WordPress en plantillas limpias (sin dependencias de PHP).
import * as cheerio from 'cheerio'; import fs from 'fs'; import path from 'path';
const LIVE = process.argv[2];
const paginas = {
  inicio: 'home.html', 'sobre-mi': 'sobre-mi.html', ciencia: 'ciencia.html', deporte: 'deporte.html',
  contacto: 'contacto.html', blog: 'blog.html', 'articulos-cientificos': 'articulos-cientificos.html',
  'congresos-y-conferencias': 'congresos-y-conferencias.html', 'libros-y-capitulos': 'libros-y-capitulos.html',
  entrada: 'posts/el-pie-de-d10s.html',
};
fs.mkdirSync('plantillas', { recursive: true });
for (const [nombre, archivo] of Object.entries(paginas)) {
  let html = fs.readFileSync(path.join(LIVE, archivo), 'utf8');
  html = html.replace(/(https?:)?(\\?\/){2}(www\.)?javierhorcajo\.com(\\?\/)/g, (m, a, b, c, slash) => slash);
  html = html.replace(/(https?:)?\/\/(www\.)?javierhorcajo\.com(?=["'])/g, '/');
  const $ = cheerio.load(html, { decodeEntities: false });
  // Restos de WordPress que no sirven en una web estática
  $('link[rel="https://api.w.org/"], link[rel=EditURI], link[rel=wlwmanifest], link[rel=shortlink], link[rel=pingback], link[rel=alternate], link[rel=dns-prefetch], meta[name=generator]').remove();
  $('link#contact-form-7-css').remove();
  $('script[src*="contact-form-7"], script[src*="comment-reply"], script[src*="wp-embed"]').remove();
  $('script').filter((i, e) => /wpemojiSettings|wpcf7|wp-statistics/.test($(e).html() || '')).remove();
  $('style').filter((i, e) => /img\.wp-smiley/.test($(e).html() || '')).remove();
  $('[id^=gtx-], .gtx-trans-icon, #goog-gt-tt, .skiptranslate').remove();
  $('*').contents().filter((i, e) => e.type === 'comment').remove();
  // Comentarios de Facebook y botón "me gusta" (dependían de la URL antigua de WordPress)
  $('.elementor-widget-facebook-comments, .elementor-widget-facebook-button, .elementor-widget-post-comments').remove();
  fs.writeFileSync(`plantillas/${nombre}.html`, $.html());
  console.log(nombre, fs.statSync(`plantillas/${nombre}.html`).size);
}
