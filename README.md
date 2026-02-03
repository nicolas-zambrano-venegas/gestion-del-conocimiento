# Guía para crear una nueva vista

Este README explica **qué crear, dónde crearlo y cómo crearlo** para añadir una nueva vista en el frontend usando el SDK.

---

## 1) Dónde crear la vista

- **Vistas:** `src/views/<modulo>/MiVista.vue`
- **Componentes reutilizables (opcional):** `src/components/<Nombre>.vue`
- **Composables (opcional):** `src/composables/useMiVista.js`
- **Estilos (opcional):** `src/styles/mi-vista.css`

> Regla práctica: si un bloque se usa en más de una vista, conviértelo en componente o composable.

---

## 1.1) Qué es un componente y qué es un composable

**Componente:** archivo `.vue` reutilizable que contiene template + lógica + estilos. Úsalo para UI repetida (tablas, cards, formularios, etc.).

**Ejemplo de componente (tabla de usuarios):** `src/components/UsuariosTable.vue`

```vue
<template>
	<ul class="list">
		<li v-for="u in items" :key="u.id">
			<strong>{{ u.nombre }}</strong> · {{ u.cedula }}
			<button @click="$emit('edit', u)">Editar</button>
		</li>
	</ul>
</template>

<script setup>
defineProps({ items: { type: Array, default: () => [] } });
defineEmits(["edit"]);
</script>
```

**Composable:** función en `src/composables` que encapsula lógica reutilizable (estado, llamadas al SDK, validaciones). Úsalo cuando la misma lógica se repite en varias vistas.

**Ejemplo de composable (cargar usuarios):** `src/composables/useUsuarios.js`

```js
import { ref } from "vue";
import client from "../sdk";

export const useUsuarios = () => {
	const items = ref([]);
	const error = ref("");

	const load = async () => {
		error.value = "";
		try {
			const { items: usuarios } = await client.usuarios.list();
			items.value = usuarios;
		} catch (err) {
			error.value = err?.data?.detail || err.message || "Error cargando usuarios";
		}
	};

	return { items, error, load };
};
```

---

## 2) Qué archivos crear (ejemplo)

Vamos a crear una vista administrativa para **listar, crear y actualizar usuarios.**

**Archivos a crear/modificar:**
- Crear: `src/views/admin/UsuariosView.vue`
- (Opcional) Crear: `src/components/UsuariosTable.vue`
- (Opcional) Crear: `src/composables/useUsuarios.js`
- (Opcional) Crear: `src/styles/usuarios.css`
- Modificar: `src/router/index.js`

---

## 3) Crear la vista (`UsuariosView.vue`)

```vue
<template>
	<section class="usuarios-view">
		<header>
			<h1>Usuarios</h1>
			<button @click="toggleForm">
				{{ showForm ? "Cerrar" : "Nuevo usuario" }}
			</button>
		</header>

		<div v-if="error" class="error">{{ error }}</div>

		<form v-if="showForm" @submit.prevent="onSubmit">
			<input v-model="form.nombre" placeholder="Nombre" required />
			<input v-model="form.cedula" placeholder="Cédula" required />
			<input v-model="form.password" placeholder="Contraseña" type="password" required />
			<select v-model.number="form.rol_id" required>
				<option :value="1">ADMIN</option>
				<option :value="2">DOCENTE</option>
				<option :value="3">ESTUDIANTE</option>
			</select>
			<label>
				<input type="checkbox" v-model="form.activo" /> Activo
			</label>
			<button type="submit">Guardar</button>
		</form>

		<ul class="list">
			<li v-for="u in items" :key="u.id">
				<div class="row">
					<strong>{{ u.nombre }}</strong> · {{ u.cedula }} · Rol: {{ u.rol_id }}
				</div>
				<button @click="edit(u)">Editar</button>
			</li>
		</ul>
	</section>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import client from "../../sdk";

const items = ref([]);
const error = ref("");
const showForm = ref(false);
const editingId = ref(null);

const form = reactive({
	nombre: "",
	cedula: "",
	password: "",
	rol_id: 1,
	activo: true,
});

const toggleForm = () => {
	showForm.value = !showForm.value;
	if (!showForm.value) resetForm();
};

const resetForm = () => {
	editingId.value = null;
	form.nombre = "";
	form.cedula = "";
	form.password = "";
	form.rol_id = 1;
	form.activo = true;
};

const load = async () => {
	error.value = "";
	try {
		const { items: usuarios } = await client.usuarios.list();
		items.value = usuarios;
	} catch (err) {
		error.value = err?.data?.detail || err.message || "Error cargando usuarios";
	}
};

const edit = (u) => {
	showForm.value = true;
	editingId.value = u.id;
	form.nombre = u.nombre;
	form.cedula = u.cedula;
	form.password = "";
	form.rol_id = u.rol_id;
	form.activo = u.activo;
};

const onSubmit = async () => {
	error.value = "";

	// Condición simple: si no hay password al editar, no lo enviamos
	const payload = {
		nombre: form.nombre,
		cedula: form.cedula,
		rol_id: form.rol_id,
		activo: form.activo,
	};
	if (!editingId.value) payload.password = form.password;
	if (editingId.value && form.password) payload.password = form.password;

	try {
		if (!editingId.value) {
			await client.usuarios.create(payload);
		} else {
			await client.usuarios.update(editingId.value, payload);
		}
		await load();
		toggleForm();
	} catch (err) {
		error.value = err?.data?.detail || err.message || "Error guardando usuario";
	}
};

onMounted(load);
</script>

<style scoped>
.usuarios-view { display: grid; gap: 16px; }
.error { color: #b00020; }
.list { list-style: none; padding: 0; display: grid; gap: 8px; }
.row { display: flex; gap: 8px; align-items: center; }
</style>
```

---

## 4) Registrar la ruta en el router

Editar `src/router/index.js` y agregar la ruta:

```js
import UsuariosView from "../views/admin/UsuariosView.vue";

// Dentro de routes
{
	path: "/admin/usuarios",
	name: "admin-usuarios",
	component: UsuariosView,
	meta: { requiresAuth: true, role: "ADMIN" }
}
```

---

## 5) Ejemplo con condiciones y actualización de proyecto

Si necesitas una vista que actualice un proyecto **solo si cumple una condición**:

```js
const proyecto = await client.proyectos.get(7);

// Condición: solo actualiza si está activo
if (proyecto.activo) {
	await client.proyectos.update(proyecto.codigo, {
		titulo: "Proyecto Demo 2",
		estado_id: 2,
	});
}
```

---

## 6) Usuarios de prueba (ya cargados en la base de datos de prueba)

```js
const usuariosDePrueba = {
	estudiante: { cedula: "20000011", password: "1234", rol: "ESTUDIANTE" },
	profesor: { cedula: "20000012", password: "1234", rol: "PROFESOR" },
	admin: { cedula: "20000013", password: "1234", rol: "ADMIN" },
	superadmin: { cedula: "20000014", password: "1234", rol: "SUPERADMIN" }
};
```

> Nota: la contraseña está **hasheada** en la base. El frontend envía el hash al hacer login.

---

## 7) Buenas prácticas

- Prefiere **colecciones del SDK** (`client.usuarios`, `client.proyectos`, etc.).
- Maneja errores con `try/catch` y muestra el porque xdd.
- Si se comparte lógica, usa composables.
- Evita lógica pesada dentro del template (por ejemplo: cálculos largos, filtros grandes o llamadas al SDK; eso mejor en el script/composable).
- Actualiza la lista después de `create`/`update`.

---

## 8) resumen rápido xd

- [ ] Crear la vista en `src/views/<modulo>/`.
- [ ] Crear componentes/composables si aplica.
- [ ] Registrar la ruta en `src/router/index.js`.
- [ ] Usar el SDK para listar/crear/actualizar.
- [ ] Probar errores y estados vacíos.
