// Plantilla de una entrada del blog o de una noticia (basada en la entrada original de WordPress).
import { cargar, comun, rellenarEntradas, fechaCorta, hora } from '../../lib/web.js';

const IMAGEN_PLANTILLA = '/wp-content/uploads/2020/11/D10s-existe-Maradona.jpg';
const IMAGEN_POR_DEFECTO = '/wp-content/uploads/2018/12/typewriter-1227357_1280.jpg';

export function render(data) {
  const { title, excerpt, image, page, collections, content } = data;
  const esNoticia = page.url.startsWith('/noticias/');
  const $ = cargar('entrada');

  $('.elementor-widget-theme-post-title .elementor-heading-title').text(title);
  $('.elementor-post-info__item--type-date').text(` ${fechaCorta(page.date)} `);
  $('.elementor-post-info__item--type-time').text(` ${hora(page.date)} `);
  $('.elementor-widget-theme-post-content .elementor-widget-container').html(`\n<div class="elementor-text-editor elementor-clearfix">${content}</div>\n`);

  // Imagen de cabecera
  $('style').each((i, s) => {
    const css = $(s).html();
    if (css.includes(IMAGEN_PLANTILLA)) $(s).html(css.split(IMAGEN_PLANTILLA).join(image || IMAGEN_POR_DEFECTO));
  });

  // "Otras entradas" bajo el artículo: de la misma sección
  const relacionadas = $('.elementor-widget-posts').filter((i, w) => $(w).find('.elementor-post__excerpt').length).first();
  const otras = (esNoticia ? collections.noticias : collections.blog).filter((e) => e.url !== page.url);
  if (otras.length) {
    rellenarEntradas($, relacionadas, otras);
    if (esNoticia) relacionadas.prevAll('.elementor-widget-heading').first().find('.elementor-heading-title').text('Otras noticias');
  } else {
    relacionadas.prevAll('.elementor-widget-heading, .elementor-widget-divider').slice(0, 2).remove();
    relacionadas.remove();
  }

  comun($, {
    titulo: `${title} | Javier Horcajo`, descripcion: excerpt, url: page.url, imagen: image,
    entradas: collections.blog,
  });
  $('body').removeClass((i, c) => (c.match(/postid-\d+/g) || []).join(' '));
  return $.html();
}
