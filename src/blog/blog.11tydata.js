export default {
  layout: 'entrada.11ty.js',
  // Los borradores no se publican
  permalink: (data) => (data.borrador ? false : `/${data.page.fileSlug}/`),
};
