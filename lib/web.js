// Monta las páginas a partir de las plantillas originales (HTML de Elementor)
// sustituyendo las partes dinámicas por el contenido editable desde /admin.
import * as cheerio from 'cheerio';
import fs from 'node:fs';
import markdownIt from 'markdown-it';

export const SITIO = 'https://www.javierhorcajo.com';
export const md = markdownIt({ html: true, linkify: true });
const mdLinea = (s = '') => md.renderInline(s);

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'octubre', 'noviembre', 'diciembre'];
const enMadrid = (d) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(d)).map((x) => [x.type, x.value]));
  return { dia: +p.day, mes: +p.month, anio: +p.year, hora: `${p.hour}:${p.minute}` };
};
export const fechaLarga = (d) => { const f = enMadrid(d); return `${f.dia} ${MESES[f.mes - 1]}, ${f.anio}`; };
export const fechaCorta = (d) => { const f = enMadrid(d); return `${String(f.dia).padStart(2, '0')}/${String(f.mes).padStart(2, '0')}/${f.anio}`; };
export const hora = (d) => enMadrid(d).hora;

export function cargar(nombre) {
  return cheerio.load(fs.readFileSync(`plantillas/${nombre}.html`, 'utf8'), { decodeEntities: false });
}

const escapar = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Título, descripción, enlaces canónicos y menú (con la sección nueva de Noticias)
export function comun($, { titulo, descripcion = '', url, imagen, entradas = [] }) {
  $('title').text(titulo);
  $('meta[name=description]').remove();
  $('meta[property^="article:"]').remove();
  $('title').after(`\n<meta name="description" content="${escapar(descripcion)}" />`);
  $('meta[property="og:title"], meta[name="twitter:title"]').attr('content', titulo);
  $('meta[property="og:description"], meta[name="twitter:description"]').attr('content', descripcion);
  $('meta[property="og:url"]').attr('content', SITIO + url);
  $('link[rel=canonical]').attr('href', SITIO + url);
  if (imagen) $('meta[property="og:image"], meta[property="og:image:secure_url"], meta[name="twitter:image"]').attr('content', SITIO + imagen);

  $('ul.elementor-nav-menu').each((i, ul) => {
    const U = $(ul);
    if (!U.find('a[href="/noticias/"]').length) {
      const blog = U.children('li').filter((j, li) => $(li).children('a').attr('href') === '/blog/');
      const noticias = blog.clone();
      noticias.children('a').attr('href', '/noticias/').text('Noticias');
      blog.before(noticias).before('\n');
    }
    U.find('li').removeClass('current-menu-item current_page_item current-menu-ancestor current-menu-parent current_page_parent');
    U.find('a').removeClass('elementor-item-active');
    const seccion = url === '/' ? '/' : '/' + url.split('/')[1] + '/';
    U.find('a').filter((j, a) => $(a).attr('href') === seccion).each((j, a) => {
      $(a).addClass('elementor-item-active').parent().addClass('current-menu-item');
      $(a).parents('li').addClass('current-menu-ancestor');
    });
  });

  // Bloques "Blog | Entradas recientes" que no haya rellenado ya la propia página
  $('.elementor-widget-posts:not([data-relleno])').each((i, w) => rellenarEntradas($, $(w), entradas, { excluir: url }));
  $('footer, .elementor-heading-title').filter((i, e) => /©\s*2019/.test($(e).text())).each((i, e) => {
    $(e).html($(e).html().replace(/©\s*2019/, `© ${new Date().getFullYear()}`));
  });
  return $;
}

// Rellena un widget "Entradas" de Elementor con las entradas indicadas
// (por defecto, tantas como tenía la plantilla original).
export function rellenarEntradas($, widget, entradas, { todas = false, excluir } = {}) {
  const cont = widget.find('.elementor-posts-container');
  const modelo = cont.children('article').first().clone();
  widget.attr('data-relleno', '1');
  if (!modelo.length) return;
  const n = todas ? Infinity : cont.children('article').length;
  cont.children('article').remove();
  widget.find('nav.elementor-pagination').remove();
  const lista = entradas.filter((e) => e.url !== excluir).slice(0, n);
  for (const e of lista) {
    const art = modelo.clone();
    art.attr('class', 'elementor-post elementor-grid-item post type-post status-publish has-post-thumbnail');
    art.find('a').attr('href', e.url);
    const img = art.find('.elementor-post__thumbnail img');
    if (e.data.image) {
      img.attr({ src: e.data.image, alt: e.data.title, loading: 'lazy' });
      img.removeAttr('srcset').removeAttr('sizes').removeAttr('width').removeAttr('height');
    } else art.find('.elementor-post__thumbnail__link').remove();
    art.find('.elementor-post__title a').text(e.data.title);
    art.find('.elementor-post-date').text(fechaLarga(e.date));
    art.find('.elementor-post-avatar').remove();
    art.find('.elementor-post__excerpt').html(`<p>${escapar(e.data.excerpt || '')}</p>`);
    cont.append('\n', art);
  }
  if (!lista.length) cont.append('<p class="sin-entradas">Todavía no hay publicaciones en esta sección.</p>');
}

// ---------- Publicaciones (artículos y congresos) agrupadas por años ----------
const ordenar = (lista) => [...lista].sort((a, b) => (b.data.anio || 0) - (a.data.anio || 0) || (a.data.orden || 0) - (b.data.orden || 0));

export function rellenarPublicaciones($, publicaciones) {
  // Cada bloque de años es una sección superior con un ancla (#2020, #2019, #2013, #2007)
  const bloques = $('section.elementor-top-section').filter((i, s) => $(s).children().find('.elementor-menu-anchor').length > 0
    && !$(s).parents('section').length).toArray();
  const rangos = [[2020, 9999], [2014, 2019], [2008, 2013], [0, 2007]];
  const items = ordenar(publicaciones);
  const maxAnio = Math.max(2025, ...items.map((p) => p.data.anio || 0));

  bloques.forEach((b, i) => {
    const B = $(b);
    const internas = B.find('section.elementor-inner-section');
    const cabecera = internas.filter((j, s) => $(s).find('.elementor-menu-anchor').length > 0).first();
    const modelo = internas.filter((j, s) => $(s).find('.elementor-text-editor').length >= 2).first().clone();
    if (i === 0) {
      cabecera.find('.elementor-text-editor').html(`<p>${maxAnio} – 2020</p>`);
      $(`a[href="#2020"]`).each((j, a) => { $(a).html($(a).html().replace(/\d{4}\s*-\s*2020/, `${maxAnio} - 2020`)); });
    }
    const contenedor = cabecera.parent();
    internas.not(cabecera).remove();
    const [desde, hasta] = rangos[i] || [0, 0];
    for (const p of items.filter((x) => (x.data.anio || 0) >= desde && (x.data.anio || 0) <= hasta)) {
      const s = modelo.clone();
      const textos = s.find('.elementor-text-editor');
      textos.eq(0).html(`<p>${mdLinea(p.data.titulo)}</p>`);
      textos.eq(1).html(md.render(p.data.referencia || ''));
      const icono = s.find('.elementor-widget-icon');
      if (p.data.enlace) icono.find('a').attr({ href: p.data.enlace, target: '_blank', rel: 'noopener' });
      else icono.remove();
      contenedor.append('\n', s);
    }
  });
}

// ---------- Libros y capítulos ----------
export function rellenarLibros($, libros) {
  // Cada libro/capítulo es una sección sin subsecciones cuyo primer titular es el año
  const hojas = $('section.elementor-section').filter((i, s) => !$(s).find('section').length
    && /^\d{4}$/.test($(s).find('.elementor-heading-title').first().text().trim()));
  const libroSecs = hojas.filter((i, s) => $(s).hasClass('elementor-top-section'));
  const capSecs = hojas.filter((i, s) => $(s).hasClass('elementor-inner-section'));
  const modelos = {
    Libro: [libroSecs.eq(0).clone(), libroSecs.eq(1).clone()],
    Capítulo: [capSecs.eq(0).clone(), capSecs.eq(1).clone()],
  };
  const ancla = { Libro: libroSecs.last(), Capítulo: capSecs.last() };
  const nuevos = { Libro: [], Capítulo: [] };
  for (const tipo of ['Libro', 'Capítulo']) {
    ordenar(libros.filter((l) => (l.data.tipo || 'Capítulo') === tipo)).forEach((l, i) => {
      const s = modelos[tipo][i % 2].clone();
      const h = s.find('.elementor-heading-title');
      h.eq(0).text(String(l.data.anio || ''));
      h.eq(1).text(l.data.titulo);
      s.find('.elementor-text-editor').html(md.render(l.data.referencia || ''));
      const img = s.find('.elementor-widget-image img');
      if (l.data.portada) {
        img.attr({ src: l.data.portada, alt: l.data.titulo, loading: 'lazy' }).removeAttr('srcset').removeAttr('sizes').removeAttr('width').removeAttr('height');
        s.find('.elementor-widget-image a').attr('href', l.data.portada);
      } else s.find('.elementor-widget-image img').remove();
      nuevos[tipo].push(s);
    });
    const ref = ancla[tipo];
    nuevos[tipo].forEach((s) => ref.before(s).before('\n'));
  }
  libroSecs.remove();
  capSecs.remove();
}

// ---------- Formulario de contacto con Netlify Forms ----------
export function formularioNetlify($) {
  const w = $('.elementor-widget-form');
  w.attr('data-element_type', 'form.netlify'); // evita que el JS de Elementor intente enviarlo por AJAX a WordPress
  const f = w.find('form');
  f.attr({ name: 'contacto', method: 'POST', action: '/contacto/?enviado=1', 'data-netlify': 'true', 'netlify-honeypot': 'bot-field' });
  f.find('input[name=post_id], input[name=form_id]').remove();
  f.prepend('<input type="hidden" name="form-name" value="contacto"><p hidden><label>No rellenar: <input name="bot-field"></label></p>');
  const nombres = { 'form-field-name': 'nombre', 'form-field-email': 'email', 'form-field-01cfe91': 'telefono', 'form-field-message': 'mensaje' };
  for (const [id, n] of Object.entries(nombres)) f.find(`#${id}`).attr('name', n);
  f.find('#form-field-01cfe91').removeAttr('pattern').attr('title', 'Solo números y símbolos de teléfono');
  f.after(`<div class="elementor-message elementor-message-success" role="alert" id="aviso-enviado" hidden>Gracias, tu mensaje se ha enviado correctamente. Te responderé lo antes posible.</div>
<script>if (location.search.indexOf('enviado') > -1) document.getElementById('aviso-enviado').hidden = false;</script>`);
}
