export default {
  layout: 'entrada.11ty.js',
  // Los borradores no se publican
  permalink: (data) => (data.borrador ? false : `/noticias/${data.page.fileSlug}/`),
};
