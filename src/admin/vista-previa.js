/* Vistas previas del editor: muestran cada contenido con el aspecto de la web. */
/* global CMS, h, createClass */
(function () {
  CMS.registerPreviewStyle('/admin/vista-previa.css');

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  function fecha(valor) {
    if (!valor) return '';
    var d = new Date(valor);
    if (isNaN(d)) return '';
    return d.getDate() + ' ' + MESES[d.getMonth()] + ', ' + d.getFullYear();
  }

  var Entrada = createClass({
    render: function () {
      var e = this.props.entry;
      var imagen = e.getIn(['data', 'image']);
      var url = imagen ? this.props.getAsset(imagen).toString() : '/wp-content/uploads/2018/12/typewriter-1227357_1280.jpg';
      return h('div', {},
        h('div', { className: 'vp-cabecera', style: { backgroundImage: 'url("' + url + '")' } },
          h('h1', {}, e.getIn(['data', 'title']) || 'Título')),
        h('div', { className: 'vp-cuerpo' },
          e.getIn(['data', 'borrador']) ? h('div', { className: 'vp-borrador' }, 'BORRADOR — no se publicará') : null,
          h('div', { className: 'vp-fecha' }, '📅 ' + fecha(e.getIn(['data', 'date']))),
          this.props.widgetFor('body')));
    },
  });

  var Publicacion = createClass({
    render: function () {
      var e = this.props.entry;
      var enlace = e.getIn(['data', 'enlace']);
      return h('div', { className: 'vp-publicacion' },
        h('div', { className: 'vp-anio' }, e.getIn(['data', 'anio']) || 'Año'),
        h('div', { className: 'vp-item' },
          h('div', { className: 'vp-item-texto' },
            h('p', { className: 'vp-titulo-pub' }, e.getIn(['data', 'titulo']) || 'Título'),
            h('div', { className: 'vp-referencia' }, this.props.widgetFor('referencia'))),
          enlace ? h('a', { className: 'vp-enlace', href: enlace, target: '_blank' }, '↗') : null));
    },
  });

  var Libro = createClass({
    render: function () {
      var e = this.props.entry;
      var portada = e.getIn(['data', 'portada']);
      var esLibro = e.getIn(['data', 'tipo']) === 'Libro';
      return h('div', { className: 'vp-publicacion' },
        h('div', { className: 'vp-item' + (esLibro ? ' vp-libro' : '') },
          portada ? h('img', { className: 'vp-portada', src: this.props.getAsset(portada).toString() }) : null,
          h('div', { className: 'vp-item-texto' },
            h('div', { className: 'vp-tipo' }, String(e.getIn(['data', 'anio']) || '')),
            h('p', { className: 'vp-titulo-pub' }, e.getIn(['data', 'titulo']) || 'Título'),
            h('div', { className: 'vp-referencia' }, this.props.widgetFor('referencia')))));
    },
  });

  CMS.registerPreviewTemplate('blog', Entrada);
  CMS.registerPreviewTemplate('noticias', Entrada);
  CMS.registerPreviewTemplate('articulos', Publicacion);
  CMS.registerPreviewTemplate('congresos', Publicacion);
  CMS.registerPreviewTemplate('libros', Libro);
})();
