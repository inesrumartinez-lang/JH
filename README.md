# Web de Javier Horcajo

Versión estática de www.javierhorcajo.com (antes en WordPress), publicada en Netlify, con un panel de
administración en **/admin** para añadir entradas de blog, noticias y publicaciones científicas.

## Cómo funciona

- El diseño original de Elementor se conserva en `plantillas/` (HTML) y `static/` (CSS, JS, fuentes e imágenes).
- El contenido editable está en `src/`:
  - `src/blog/` y `src/noticias/`: una entrada por archivo Markdown.
  - `src/publicaciones/articulos`, `congresos` y `libros`: una publicación por archivo.
  - `src/uploads/media/`: imágenes subidas desde el panel.
- [Eleventy](https://www.11ty.dev/) monta la web en `_site/` (`lib/web.js` coloca el contenido en las plantillas).
- El panel `/admin` es [Decap CMS](https://decapcms.org/): guarda los cambios en GitHub y Netlify vuelve a publicar la web sola.

## Trabajar en el ordenador

```bash
npm install
npm start          # web en http://localhost:8080
npm run admin      # (en otra terminal) permite usar http://localhost:8080/admin sin GitHub
```

## Puesta en marcha (una sola vez)

1. Subir este proyecto a un repositorio de GitHub.
2. En `src/admin/config.yml`, cambiar `repo:` por `usuario/repositorio` de GitHub.
3. Netlify → *Add new site* → *Import from Git* → elegir el repositorio. Se usa la configuración de `netlify.toml`.
4. GitHub → *Settings* → *Developer settings* → *OAuth Apps* → *New OAuth App*:
   - Homepage URL: la dirección de la web en Netlify.
   - Authorization callback URL: `https://api.netlify.com/auth/done`
5. Netlify → *Site configuration* → *Access & security* → *OAuth* → *Install provider* → GitHub, con el Client ID y el Client Secret del paso anterior.
6. Añadir a Javier como colaborador del repositorio en GitHub (*Settings* → *Collaborators*).
7. Netlify → *Forms*: activar la detección de formularios y añadir el aviso por email para el formulario «contacto».

La carpeta `tools/` contiene los scripts que se usaron una sola vez para migrar el contenido desde WordPress.
