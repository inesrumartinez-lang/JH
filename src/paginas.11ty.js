// Genera las páginas fijas y los listados a partir de las plantillas originales.
import { cargar, comun, rellenarEntradas, rellenarPublicaciones, rellenarLibros, formularioNetlify } from '../lib/web.js';

const PAGINAS = [
  { plantilla: 'inicio', url: '/', titulo: 'Inicio | Javier Horcajo', descripcion: 'Donde ciencia y deporte se encuentran. Psicología del deporte.' },
  { plantilla: 'sobre-mi', url: '/sobre-mi/', titulo: 'Bío | Javier Horcajo', descripcion: 'Curriculum vitae de Javier Horcajo relacionado con la ciencia y el deporte.' },
  { plantilla: 'ciencia', url: '/ciencia/', titulo: 'Ciencia | Javier Horcajo', descripcion: 'Hipótesis. Método. Evidencias. Libros, artículos científicos y congresos.' },
  { plantilla: 'deporte', url: '/deporte/', titulo: 'Deporte | Javier Horcajo', descripcion: 'Sensaciones. Aprendizaje. Superación. Psicología del deporte.' },
  { plantilla: 'contacto', url: '/contacto/', titulo: 'Contacto | Javier Horcajo', descripcion: 'Escríbeme: dime en qué puedo ayudarte.', extra: formularioNetlify },
  {
    plantilla: 'blog', url: '/blog/', titulo: 'Blog | Javier Horcajo', descripcion: 'Blog de Javier Horcajo: #Deporte #Psicología #Lifestyle',
    extra: ($, c) => rellenarEntradas($, $('.elementor-widget-posts').first(), c.blog, { todas: true }),
  },
  {
    plantilla: 'blog', url: '/noticias/', titulo: 'Noticias | Javier Horcajo', descripcion: 'Noticias y novedades de Javier Horcajo.',
    extra: ($, c) => {
      const titulo = $('.elementor-heading-title').filter((i, h) => $(h).text().trim() === 'Blog').first();
      titulo.text('Noticias');
      titulo.closest('section').find('.elementor-text-editor').first().html('<p>Novedades, actividades y apariciones en medios.</p>');
      const lista = $('.elementor-widget-posts').first();
      rellenarEntradas($, lista, c.noticias, { todas: true });
      lista.find('.elementor-post__read-more').text(' Leer noticia » ');
    },
  },
  { plantilla: 'articulos-cientificos', url: '/articulos-cientificos/', titulo: 'Artículos científicos | Javier Horcajo', descripcion: 'Publicaciones en revistas científicas con factor de impacto (Journal Citation Reports – JCR).', extra: ($, c) => rellenarPublicaciones($, c.articulos) },
  { plantilla: 'congresos-y-conferencias', url: '/congresos-y-conferencias/', titulo: 'Congresos y conferencias | Javier Horcajo', descripcion: 'Trabajos científicos presentados en congresos y conferencias.', extra: ($, c) => rellenarPublicaciones($, c.congresos) },
  { plantilla: 'libros-y-capitulos', url: '/libros-y-capitulos/', titulo: 'Libros y capítulos | Javier Horcajo', descripcion: 'Publicaciones de libros y capítulos.', extra: ($, c) => rellenarLibros($, c.libros) },
];

export const data = {
  pagination: { data: 'paginas', size: 1, alias: 'p' },
  paginas: PAGINAS,
  permalink: (data) => data.p.url,
  eleventyExcludeFromCollections: true,
};

export function render({ p, collections }) {
  // Primero cada página sustituye sus propias partes; después se rellenan
  // los bloques "Blog | Entradas recientes" con las últimas entradas del blog.
  const $ = cargar(p.plantilla);
  if (p.extra) p.extra($, collections);
  comun($, { titulo: p.titulo, descripcion: p.descripcion, url: p.url, entradas: collections.blog });
  return $.html();
}
