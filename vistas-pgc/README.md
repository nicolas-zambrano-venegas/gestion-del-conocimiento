# Cambios y estructura (modo bro)

Bro mira, dejé el proyecto, así:

## Estructura
- **src/app/**: acá vive el entry de la app. El `main.js` monta Vue y carga estilos globales.
- **src/views/**: aquí dejé las vistas principales. Por ahora está `CharacterizationForm.vue` en la raíz de views.
- **src/components/**: aquí van componentes reutilizables como `ProjectsTable.vue` y `ProjectForm.vue`.
- **src/composables/**: aquí guardo la lógica reutilizable (por ejemplo: `useProjectForm.js`).
- **src/data/**: datos estáticos en un solo archivo `catalogs.js`.
- **src/styles/**: todos los estilos en una sola carpeta, sin subcarpetas raras, por el momento mientras creamos las vistas para admins, profes, etc................... xd

## Lo que moví y por qué
- **Unifiqué data**: junté `topics` y `universityPrograms` en `src/data/catalogs.js`. Así todo queda central y limpio.
- **Dividí la vista grande**: saqué la tabla y el formulario en componentes (`ProjectsTable` y `ProjectForm`) para que no sea un archivo grande ya que me tildaba el ojo jajahahjhj.
- **Saqué estilos del .vue**: todo el CSS está en `src/styles/app.css` y `src/styles/characterization-form.css`. Más tin.
- **Hice un composable**: `useProjectForm.js` maneja toda la lógica del formulario. Así la vista se ve más limpia.
- **Moví vistas y componentes a raíz**: para no tener subcarpetas innecesarias mientras el proyecto está pequeño.

## SDK (cliente de API) bro
**NO LO TOQUES**