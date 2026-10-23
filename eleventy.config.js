export default function (eleventyConfig) {
  // Estilos, scripts e imágenes del diseño original (copiados de la copia de seguridad de WordPress)
  eleventyConfig.addPassthroughCopy({ static: '/' });
  // Imágenes del contenido y las que suba Javier desde el panel
  eleventyConfig.addPassthroughCopy('src/uploads');
  // Panel de administración (Decap CMS)
  eleventyConfig.addPassthroughCopy('src/admin');

  const porFecha = (a, b) => b.date - a.date;
  eleventyConfig.addCollection('blog', (api) => api.getFilteredByGlob('src/blog/*.md').filter((e) => !e.data.borrador).sort(porFecha));
  eleventyConfig.addCollection('noticias', (api) => api.getFilteredByGlob('src/noticias/*.md').filter((e) => !e.data.borrador).sort(porFecha));
  eleventyConfig.addCollection('articulos', (api) => api.getFilteredByGlob('src/publicaciones/articulos/*.md'));
  eleventyConfig.addCollection('congresos', (api) => api.getFilteredByGlob('src/publicaciones/congresos/*.md'));
  eleventyConfig.addCollection('libros', (api) => api.getFilteredByGlob('src/publicaciones/libros/*.md'));

  return {
    dir: { input: 'src', output: '_site', includes: '_includes' },
    markdownTemplateEngine: false,
  };
}
