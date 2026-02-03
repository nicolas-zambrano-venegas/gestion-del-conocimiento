# Documentación del SDK

Este documento describe **todo lo que realmente existe** en el SDK ubicado en `src/sdk/`, basado en el backend. Incluye configuración, métodos, modelos, colecciones, caché, eventos, manejo de errores y ejemplos **con título y explicación**.

> Este SDK está pensado para ser la puerta de entrada a la API **para las colecciones implementadas**. El backend tiene más endpoints (ver el Backend bro); para esos casos usa `client.http`.

---

## Índice

- [1) Configuración general](#1-configuración-general)
- [2) Cliente principal (Client)](#2-cliente-principal-client)
- [3) HTTP Client (HttpClient)](#3-http-client-httpclient)
- [4) Colecciones (Collection)](#4-colecciones-collection)
- [5) Colecciones disponibles en el SDK](#5-colecciones-disponibles-en-el-sdk)
- [5.10) Propiedades por entidad](#510-propiedades-por-entidad-creación-filtros-actualización)
- [5.11) Endpoints del backend sin colección en el SDK](#511-endpoints-del-backend-sin-colección-en-el-sdk)
- [6) Métodos adicionales por colección](#6-métodos-adicionales-por-colección)
- [7) Modelos y métodos específicos](#7-modelos-y-métodos-específicos)
- [8) Cache y rendimiento](#8-cache-y-rendimiento)
- [9) Eventos (EventEmitter)](#9-eventos-eventemitter)
- [10) Filtrado, búsqueda y ordenamiento](#10-filtrado-búsqueda-y-ordenamiento)
- [11) Manejo de sesión](#11-manejo-de-sesión)
- [12) Seguridad de contraseñas (SDK)](#12-seguridad-de-contraseñas-sdk)
- [13) Ejemplos completos (end-to-end)](#13-ejemplos-completos-end-to-end)
- [14) Buenas prácticas](#14-buenas-prácticas)
- [15) Resumen rápido de “todo lo que se puede usar”](#15-resumen-rápido-de-todo-lo-que-se-puede-usar)

---

## 1) Configuración general

### 1.1 Base URL
**Qué hace:** define la URL del backend.

**Cómo funciona:** la instancia toma `VITE_API_URL` y, si no existe, usa `http://127.0.0.1:8000`.

**Ejemplo (conceptual):**
```env
VITE_API_URL=http://localhost:8000
```

**Explicación:** cualquier llamada HTTP del SDK se resolverá contra esa URL.

---

### 1.2 Token de autenticación
**Qué hace:** agrega el token `Bearer` en cada request.

**Cómo funciona:** el SDK **lee** el token desde `localStorage` al inicializar la instancia (si existe), pero **no lo guarda** automáticamente. Puedes persistirlo manualmente y/o actualizarlo con `client.setToken(token)`.

**Ejemplo:**
```js
import client from "../../sdk";

client.setToken("mi-token");
```

**Explicación:** una vez configurado, el SDK agrega automáticamente `Authorization: Bearer <token>` a todas las peticiones.

---

### 1.3 Opciones avanzadas del `Client`
**Qué hace:** permite ajustar reintentos, caché y el `fetch` interno.

**Opciones disponibles:**
- `retries` (number): cantidad de reintentos por request. En la instancia global se usa `1`.
- `retryDelay` (ms): espera base entre reintentos. En la instancia global se usa `400`.
- `cacheTtl` (ms): TTL por defecto de la caché. Por defecto `30000`. Usa `null` para no expirar.
- `fetcher` (function): `fetch` personalizado (tests o SSR).

**Ejemplo:**
```js
import { Client } from "../../sdk";

const client = new Client({
	baseUrl: "http://127.0.0.1:8000",
	token: localStorage.getItem("token"),
	retries: 1,
	retryDelay: 400,
	cacheTtl: 30000
});
```

**Explicación:** estas opciones afectan el comportamiento global del SDK.

---

## 2) Cliente principal (`Client`)

### 2.1 Instancia global
**Qué hace:** provee un cliente listo para usar en toda la app.

**Ejemplo:**
```js
import client from "../../sdk";
```

**Explicación:** esta instancia ya tiene base URL, token, caché y colecciones configuradas.

---

### 2.2 `client.setBaseUrl(url)`
**Qué hace:** cambia la URL base del backend en runtime.

**Ejemplo:**
```js
client.setBaseUrl("https://api.mi-servidor.com");
```

**Explicación:** útil si hay cambios de entorno (dev, staging, prod).

---

### 2.3 `client.setToken(token)`
**Qué hace:** actualiza el token y lo propaga al HTTP client.

**Ejemplo:**
```js
client.setToken("nuevo-token");
```

**Explicación:** desde ese momento el SDK usará el nuevo token.

---

### 2.4 `client.login({ cedula, password })`
**Qué hace:** autentica un usuario.

**Ejemplo:**
```js
const data = await client.login({ cedula: "123", password: "0000" });
console.log(data.access_token, data.role);
```

**Explicación:** hace `POST /login`, recibe `access_token` y `role`, y actualiza el token del cliente en memoria. Si quieres persistirlo, guarda el token en `localStorage` manualmente.

---

### 2.5 `client.role`
**Qué hace:** guarda el rol actual.

**Ejemplo:**
```js
if (client.role === "ADMIN") {
	// ...
}
```

**Explicación:** se obtiene desde el token JWT (claim `role`) o desde la respuesta de `login()`. El backend puede devolver roles como `ADMIN`, `SUPERADMIN`, `DOCENTE`, `ESTUDIANTE` (y algunos datos históricos podrían usar `PROFESOR`).

---

### 2.6 `client.usuario`
**Qué hace:** obtiene el usuario actual basado en la cédula del token.

**Ejemplo:**
```js
const usuario = await client.usuario;
```

**Explicación:** busca en `client.usuarios.list()` y guarda el usuario en caché interna. El endpoint `/usuarios` devuelve una lista completa (sin paginación), por lo que este método recorre todos los usuarios.

---

### 2.7 `client.estudiante`
**Qué hace:** obtiene el estudiante asociado al usuario actual.

**Ejemplo:**
```js
const estudiante = await client.estudiante;
```

**Explicación:** consulta estudiantes y relaciona con el usuario actual. Este método lista todos los estudiantes y busca el que coincide con el usuario.

---

### 2.8 `client.getEstudianteProyecto(estudianteId)`
**Qué hace:** obtiene el proyecto de un estudiante.

**Ejemplo:**
```js
const proyecto = await client.getEstudianteProyecto(10);
```

**Explicación:** llama a `/estudiantes/:id/proyecto` y retorna un modelo `Proyecto`.

---

## 2.9 Autenticación y autorización (backend actual)

- **Token requerido:** todos los endpoints, excepto `/login` y `/usuarios`, requieren `Authorization: Bearer <token>`.
- **Estudiantes** (`/estudiantes`):
	- `GET /estudiantes` y `GET /estudiantes/:id` requieren token.
	- `POST`, `PUT`, `DELETE` requieren roles `DOCENTE`, `ADMIN` o `SUPERADMIN`.
	- Todos los roles autenticados pueden ver **todos** los estudiantes y sus proyectos.
- **Proyectos** (`/proyectos`):
	- `GET /proyectos` y `GET /proyectos/:id` requieren token.
	- `POST` requiere roles `DOCENTE`, `ADMIN` o `SUPERADMIN`.
	- `PUT` permite actualizar; si el rol es `ESTUDIANTE`, solo puede editar su propio proyecto.
	- `DELETE` requiere roles `ADMIN` o `SUPERADMIN`.
	- Endpoints de relación (`/proyectos/:id/estudiantes`, `/proyectos/:id/estudiantes/:estudiante_id`, `/proyectos/:id/programas/:programa_id`, `/proyectos/:id/temas/:tema_id`) requieren token y, en el caso de asignaciones, roles `DOCENTE`, `ADMIN` o `SUPERADMIN`.
- **Calificaciones** (`/calificaciones`): todas las operaciones requieren rol distinto de `ESTUDIANTE`.

---

## 3) HTTP Client (`HttpClient`)

### 3.1 `client.http.get(path, options)`
**Qué hace:** ejecuta un GET.

**Ejemplo:**
```js
const data = await client.http.get("/proyectos", { params: { page: 1, page_size: 20, q: "sostenibilidad" } });
```

**Explicación:** construye la URL con query params y retorna JSON.

---

### 3.2 `client.http.post(path, body, options)`
**Qué hace:** ejecuta un POST.

**Ejemplo:**
```js
const data = await client.http.post("/login", { cedula: "123", password: "0000" });
```

**Explicación:** envía JSON en el body y retorna la respuesta parseada.

---

### 3.3 `client.http.put(path, body, options)`
**Qué hace:** ejecuta un PUT.

**Ejemplo:**
```js
const data = await client.http.put("/proyectos/10", { titulo: "Proyecto actualizado" });
```

**Explicación:** actualiza datos y retorna el recurso actualizado.

---

### 3.4 `client.http.delete(path, options)`
**Qué hace:** ejecuta un DELETE.

**Ejemplo:**
```js
await client.http.delete("/usuarios/10");
```

**Explicación:** elimina el recurso y retorna el resultado de la API.

---

### 3.5 Manejo de errores
**Qué hace:** si la respuesta no es OK, lanza error con `status` y `data`.

**Ejemplo:**
```js
try {
	await client.http.get("/ruta-inexistente");
} catch (error) {
	console.log(error.status, error.data);
}
```

**Explicación:** el SDK lanza errores consistentes para manejar fallos en la UI.

---

### 3.6 Reintentos
**Qué hace:** reintenta automáticamente cuando hay errores de red o códigos HTTP configurados.

**Opciones por request:**
- `retries` (number): número de reintentos para esa llamada.
- `retryDelay` (ms): base de espera entre reintentos.
- `retryOn` (array): códigos HTTP que disparan reintento (por defecto `408, 429, 500, 502, 503, 504`).

**Ejemplo:**
```js
await client.http.get("/proyectos", { retries: 2, retryDelay: 500 });
```

**Explicación:** estos valores sobrescriben la configuración global del `Client` solo para esa request.

---

## 4) Colecciones (`Collection`)

Las colecciones representan endpoints REST y son el uso recomendado.

### 4.1 `list(params, options)`
**Qué hace:** lista recursos; la paginación y los filtros dependen del endpoint.

**Ejemplo (paginación):**
```js
const { items, meta } = await client.estudiantes.list({ page: 1, pageSize: 20 });
```

**Explicación:** `pageSize` se traduce automáticamente a `page_size` para el backend. Solo `/estudiantes` y `/proyectos` soportan paginación y devuelven `meta`. En endpoints que responden un array simple (`/usuarios`, `/roles`, `/programas`, `/estados`, `/temas`, `/evidencias`, `/calificaciones`), `meta` será `null`.

**Ejemplo (filtros):**
```js
const { items } = await client.proyectos.list({ q: "sostenibilidad", estado: 1, sort: "-titulo" });
```

**Explicación:** cualquier propiedad en `params` se envía como query param. Úsalo solo con parámetros que el backend soporte (por ejemplo, `q`, `estado`, `programa`, `sort` en estudiantes/proyectos).

**Opciones adicionales:**
- `withMeta` (default `true`): retorna `{ items, meta }`.
- `invalidateCache` (default `true`): limpia cache antes de listar.
- `cache` (default `true`): guarda resultados en cache.

---

### 4.2 `get(id, options)`
**Qué hace:** obtiene un recurso por ID.

**Ejemplo:**
```js
const usuario = await client.usuarios.get(5);
```

**Explicación:** si el recurso ya está en cache, lo devuelve sin llamar a la API (a menos que `cache: false`).

---

### 4.3 `create(payload)`
**Qué hace:** crea un recurso.

**Ejemplo:**
```js
const nuevo = await client.usuarios.create({
	nombre: "Ana",
	cedula: "123456",
	password: "secreto",
	activo: true,
	rol_id: 1
});
```

**Explicación:** hace `POST` y retorna un modelo con los datos creados.

---

### 4.4 `update(id, payload)`
**Qué hace:** actualiza un recurso por ID.

**Ejemplo:**
```js
const actualizado = await client.estudiantes.update(3, { programa_id: 4 });
```

**Explicación:** hace `PUT` y actualiza el cache con la nueva respuesta.

---

### 4.5 `delete(id)`
**Qué hace:** elimina un recurso.

**Ejemplo:**
```js
await client.usuarios.delete(10);
```

**Explicación:** borra el recurso y limpia el cache asociado.

---

## 5) Colecciones disponibles en el SDK

### 5.1 `client.usuarios`
**Qué hace:** opera sobre `/usuarios`.

**Ejemplos:**
```js
const { items } = await client.usuarios.list();
const usuario = await client.usuarios.get(1);
const nuevo = await client.usuarios.create({
	nombre: "Ana",
	cedula: "123456",
	password: "secreto",
	activo: true,
	rol_id: 1
});
const actualizado = await client.usuarios.update(1, {
	nombre: "Ana Gómez",
	cedula: "123456",
	rol_id: 1
});
await client.usuarios.delete(1);
```

**Explicación:** maneja creación, consulta, actualización y eliminación de usuarios.

**Nota:** en `update()` no necesitas enviar todos los parámetros; puedes enviar solo los que cambian.

---

### 5.2 `client.roles`
**Qué hace:** opera sobre `/roles`.

**Ejemplos:**
```js
const { items } = await client.roles.list();
const rol = await client.roles.get(1);
const nuevo = await client.roles.create({ nombre: "ESTUDIANTE" });
const actualizado = await client.roles.update(1, { nombre: "DOCENTE" });
await client.roles.delete(3);
```

**Explicación:** maneja creación, consulta, actualización y eliminación de roles.

---

### 5.3 `client.programas`
**Qué hace:** opera sobre `/programas`.

**Ejemplos:**
```js
const { items } = await client.programas.list();
const programa = await client.programas.get(1);
const nuevo = await client.programas.create({ nombre: "SIN PROGRAMA" });
const actualizado = await client.programas.update(1, { nombre: "NUEVO" });
await client.programas.delete(2);
```

**Explicación:** maneja creación, consulta, actualización y eliminación de programas.

---

### 5.4 `client.estados`
**Qué hace:** opera sobre `/estados`.

**Ejemplos:**
```js
const { items } = await client.estados.list();
const estado = await client.estados.get(1);
const nuevo = await client.estados.create({ nombre: "ACTIVO" });
const actualizado = await client.estados.update(1, { nombre: "INACTIVO" });
await client.estados.delete(2);
```

**Explicación:** maneja creación, consulta, actualización y eliminación de estados.

---

### 5.5 `client.temas`
**Qué hace:** opera sobre `/temas`.

**Ejemplos:**
```js
const { items } = await client.temas.list();
const tema = await client.temas.get(1);
const nuevo = await client.temas.create({ nombre: "Tema X" });
const actualizado = await client.temas.update(1, { nombre: "Tema Y" });
await client.temas.delete(2);
```

**Explicación:** maneja creación, consulta, actualización y eliminación de temas.

---

### 5.6 `client.evidencias`
**Qué hace:** opera sobre `/evidencias`.

**Ejemplos:**
```js
const { items } = await client.evidencias.list();
const evidencia = await client.evidencias.get(1);
const nuevo = await client.evidencias.create({
	proyecto_id: 1,
	descripcion: "Evidencia inicial",
	url_pdf: "https://ejemplo.com/doc.pdf"
});
const actualizado = await client.evidencias.update(1, { descripcion: "Evidencia actualizada" });
await client.evidencias.delete(2);
```

**Explicación:** maneja creación, consulta, actualización y eliminación de evidencias.

---

### 5.7 `client.estudiantes`
**Qué hace:** opera sobre `/estudiantes`.

**Ejemplos:**
```js
const { items } = await client.estudiantes.list();
const estudiante = await client.estudiantes.get(5);
const nuevo = await client.estudiantes.create({
	usuario_id: 12,
	programa_id: 3
});
const actualizado = await client.estudiantes.update(5, {
	usuario_id: 12,
	programa_id: 4
});
```

**Explicación:** lista y consulta estudiantes. Usa métodos del modelo para proyectos.

**Nota:** en `update()` no necesitas enviar todos los parámetros; puedes enviar solo los que cambian.

---

### 5.8 `client.proyectos`
**Qué hace:** opera sobre `/proyectos`.

**Ejemplos:**
```js
const { items } = await client.proyectos.list();
const proyecto = await client.proyectos.get(7);
const nuevo = await client.proyectos.create({
	titulo: "Proyecto Demo",
	nivel: 6,
	estado_id: 1,
	activo: true
});
const actualizado = await client.proyectos.update(7, {
	titulo: "Proyecto Demo 2",
	nivel: 6,
	estado_id: 2,
	activo: true
});
```

**Explicación:** lista y consulta proyectos. Incluye métodos para estudiantes.

**Nota:** el identificador de proyecto en el backend es `codigo`.

**Nota:** en `update()` no necesitas enviar todos los parámetros; puedes enviar solo los que cambian.

---

### 5.9 `client.calificaciones`
**Qué hace:** opera sobre `/calificaciones`.

**Ejemplos:**
```js
const { items } = await client.calificaciones.list();
const calificacion = await client.calificaciones.get(10);
const nuevo = await client.calificaciones.create({
	evidencia_id: 7,
	nota: 4.5,
	observaciones: "Buen trabajo",
	estado_id: 1
});
const actualizado = await client.calificaciones.update(10, {
	nota: 4.8,
	observaciones: "Excelente trabajo"
});
```

**Explicación:** maneja la entidad de calificaciones.

**Nota:** en `update()` no necesitas enviar todos los parámetros; puedes enviar solo los que cambian.

---

## 5.10 Propiedades por entidad (creación, filtros, actualización)

> **Importante:** el SDK **no valida** esquemas. En otras palabras, **acepta cualquier propiedad** que el backend soporte. A continuación se documentan **las propiedades reales del backend actual** y cómo se usan. Si el backend admite más campos, se pueden enviar sin problema.

### 5.10.1 Usuarios (`/usuarios`)

**Creación (POST /usuarios)**
- **Campos reales en el backend:**
	- `nombre` (string): nombre completo.
	- `cedula` (string): identificación.
	- `foto` (string | null): URL o ruta de foto.
	- `password` (string): contraseña.
	- `activo` (boolean): estado del usuario.
	- `rol_id` (number): id del rol.

**Ejemplo de creación:**
```js
await client.usuarios.create({
	nombre: "Ana Pérez",
	cedula: "123456",
	password: "secreto",
	activo: true,
	rol_id: 1
});
```

**Filtros (GET /usuarios)**
- El endpoint `/usuarios` **no tiene paginación ni filtros** en el backend actual. Cualquier parámetro extra será ignorado.

**Ejemplo de filtros:**
```js
await client.usuarios.list();
```

**Actualización (PUT /usuarios/:id)**
- **Nota:** NO necesitas enviar todas las propiedades. Envía solo las que cambian.
- **Campos comunes a actualizar:** `nombre`, `cedula`, `foto`, `password`, `activo`, `rol_id`.

**Ejemplo de actualización parcial:**
```js
await client.usuarios.update(1, { nombre: "Ana Gómez", rol_id: 2 });
```

---

### 5.10.2 Roles (`/roles`)

**Creación (POST /roles)**
- **Campos reales en el backend:**
	- `nombre` (string)

**Ejemplo de creación:**
```js
await client.roles.create({ nombre: "ESTUDIANTE" });
```

**Filtros (GET /roles)**
- El endpoint `/roles` **no tiene paginación ni filtros** en el backend actual. Cualquier parámetro extra será ignorado.

**Ejemplo de filtros:**
```js
await client.roles.list();
```

**Actualización (PUT /roles/:id)**
- **Nota:** NO necesitas enviar todas las propiedades. Envía solo las que cambian.
- **Campos comunes a actualizar:** `nombre`.

**Ejemplo de actualización parcial:**
```js
await client.roles.update(1, { nombre: "DOCENTE" });
```

---

### 5.10.3 Programas (`/programas`)

**Creación (POST /programas)**
- **Campos reales en el backend:**
	- `nombre` (string)

**Ejemplo de creación:**
```js
await client.programas.create({ nombre: "SIN PROGRAMA" });
```

**Filtros (GET /programas)**
- El endpoint `/programas` **no tiene paginación ni filtros** en el backend actual. Cualquier parámetro extra será ignorado.

**Ejemplo de filtros:**
```js
await client.programas.list();
```

**Actualización (PUT /programas/:id)**
- **Nota:** NO necesitas enviar todas las propiedades. Envía solo las que cambian.
- **Campos comunes a actualizar:** `nombre`.

**Ejemplo de actualización parcial:**
```js
await client.programas.update(1, { nombre: "NUEVO" });
```

---

### 5.10.4 Estados (`/estados`)

**Creación (POST /estados)**
- **Campos reales en el backend:**
	- `nombre` (string)

**Ejemplo de creación:**
```js
await client.estados.create({ nombre: "ACTIVO" });
```

**Filtros (GET /estados)**
- El endpoint `/estados` **no tiene paginación ni filtros** en el backend actual. Cualquier parámetro extra será ignorado.

**Ejemplo de filtros:**
```js
await client.estados.list();
```

**Actualización (PUT /estados/:id)**
- **Nota:** NO necesitas enviar todas las propiedades. Envía solo las que cambian.
- **Campos comunes a actualizar:** `nombre`.

**Ejemplo de actualización parcial:**
```js
await client.estados.update(1, { nombre: "INACTIVO" });
```

---

### 5.10.5 Temas (`/temas`)

**Creación (POST /temas)**
- **Campos reales en el backend:**
	- `nombre` (string)

**Ejemplo de creación:**
```js
await client.temas.create({ nombre: "Tema X" });
```

**Filtros (GET /temas)**
- El endpoint `/temas` **no tiene paginación ni filtros** en el backend actual. Cualquier parámetro extra será ignorado.

**Ejemplo de filtros:**
```js
await client.temas.list();
```

**Actualización (PUT /temas/:id)**
- **Nota:** NO necesitas enviar todas las propiedades. Envía solo las que cambian.
- **Campos comunes a actualizar:** `nombre`.

**Ejemplo de actualización parcial:**
```js
await client.temas.update(1, { nombre: "Tema Y" });
```

---

### 5.10.6 Evidencias (`/evidencias`)

**Creación (POST /evidencias)**
- **Campos reales en el backend:**
	- `proyecto_id` (number)
	- `descripcion` (string)
	- `url_pdf` (string)

**Ejemplo de creación:**
```js
await client.evidencias.create({
	proyecto_id: 1,
	descripcion: "Evidencia inicial",
	url_pdf: "https://ejemplo.com/doc.pdf"
});
```

**Filtros (GET /evidencias)**
- El endpoint `/evidencias` **no tiene paginación ni filtros** en el backend actual. Cualquier parámetro extra será ignorado.

**Ejemplo de filtros:**
```js
await client.evidencias.list();
```

**Actualización (PUT /evidencias/:id)**
- **Nota:** NO necesitas enviar todas las propiedades. Envía solo las que cambian.
- **Campos comunes a actualizar:** `proyecto_id`, `descripcion`, `url_pdf`.

**Ejemplo de actualización parcial:**
```js
await client.evidencias.update(1, { descripcion: "Evidencia actualizada" });
```

---

### 5.10.7 Estudiantes (`/estudiantes`)

**Creación (POST /estudiantes)**
- **Campos reales en el backend:**
	- `usuario_id` (number | null)
	- `programa_id` (number | null)

**Ejemplo de creación:**
```js
await client.estudiantes.create({
	usuario_id: 12,
	programa_id: 3
});
```

**Filtros (GET /estudiantes)**
- **Filtros:** `programa` (id de programa), `usuario` (id de usuario).
- **Orden:** `sort` con campos permitidos: `id`, `programa`, `usuario`. Usa prefijo `-` para desc.
- **Paginación:** `page` y `page_size` (o `pageSize`).

**Ejemplo de filtros:**
```js
await client.estudiantes.list({ page: 1, pageSize: 20, programa: 3, usuario: 12, sort: "-id" });
```

**Actualización (PUT /estudiantes/:id)**
- **Nota:** NO necesitas enviar todas las propiedades. Envía solo las que cambian.
- **Campos comunes a actualizar:** `usuario_id`, `programa_id`.

**Ejemplo de actualización parcial:**
```js
await client.estudiantes.update(5, { programa_id: 4 });
```

---

### 5.10.8 Proyectos (`/proyectos`)

**Creación (POST /proyectos)**
- **Campos reales en el backend:**
	- `titulo` (string)
	- `nivel` (number)
	- `estado_id` (number)
	- `activo` (boolean, default true)

**Ejemplo de creación:**
```js
await client.proyectos.create({
	titulo: "Proyecto Demo",
	nivel: 6,
	estado_id: 1,
	activo: true
});
```

**Filtros (GET /proyectos)**
- **Búsqueda:** `q` (string) busca por título.
- **Filtros:** `estado` (id de estado), `programa` (id de programa asociado).
- **Orden:** `sort` con campos permitidos: `codigo`, `titulo`, `nivel`, `estado`. Usa prefijo `-` para desc.
- **Paginación:** `page` y `page_size` (o `pageSize`).

**Ejemplo de filtros:**
```js
await client.proyectos.list({ page: 1, pageSize: 20, q: "sostenibilidad", estado: 1, programa: 3, sort: "-titulo" });
```

**Actualización (PUT /proyectos/:id)**
- **Nota:** NO necesitas enviar todas las propiedades. Envía solo las que cambian.
- **Campos comunes a actualizar:** `titulo`, `nivel`, `estado_id`, `activo`.

**Ejemplo de actualización parcial:**
```js
await client.proyectos.update(7, { titulo: "Proyecto Demo 2", estado_id: 2 });
```

---

### 5.10.9 Calificaciones (`/calificaciones`)

**Creación (POST /calificaciones)**
- **Campos reales en el backend:**
	- `evidencia_id` (number)
	- `nota` (number)
	- `estado_id` (number)
	- `observaciones` (string | null)

**Ejemplo de creación:**
```js
await client.calificaciones.create({
	evidencia_id: 7,
	nota: 4.5,
	observaciones: "Buen trabajo",
	estado_id: 1
});
```

**Filtros (GET /calificaciones)**
- El endpoint `/calificaciones` **no tiene paginación ni filtros** en el backend actual. Cualquier parámetro extra será ignorado.

**Ejemplo de filtros:**
```js
await client.calificaciones.list();
```

**Actualización (PUT /calificaciones/:id)**
- **Nota:** NO necesitas enviar todas las propiedades. Envía solo las que cambian.
- **Campos comunes a actualizar:** `evidencia_id`, `nota`, `estado_id`, `observaciones`.

**Ejemplo de actualización parcial:**
```js
await client.calificaciones.update(10, { nota: 4.8, observaciones: "Excelente trabajo" });
```

---

## 5.11 Endpoints del backend sin colección en el SDK

Actualmente, todas las rutas del backend usadas por el frontend tienen colección en el SDK.

---

## 6) Métodos adicionales por colección

### 6.1 `client.proyectos.getEstudiantes(proyectoId)`
**Qué hace:** obtiene estudiantes de un proyecto.

**Ejemplo:**
```js
const estudiantes = await client.proyectos.getEstudiantes(7);
```

**Explicación:** llama a `/proyectos/:id/estudiantes` y retorna modelos `Estudiante`.

---

## 7) Modelos y métodos específicos

### 7.1 `Proyecto.refresh()`
**Qué hace:** recarga el proyecto desde el backend.

**Ejemplo:**
```js
const proyecto = await client.proyectos.get(7);
await proyecto.refresh();
```

**Explicación:** vuelve a pedir el proyecto y actualiza sus campos locales.

---

### 7.2 `Proyecto.calificar(payload)`
**Qué hace:** crea una calificación para el proyecto.

**Ejemplo:**
```js
const proyecto = await client.proyectos.get(7);
await proyecto.calificar({ evidencia_id: 7, nota: 4.8, estado_id: 1 });
```

**Explicación:** delega a `client.calificaciones.create()` y requiere los campos reales de calificación.

---

### 7.3 `Proyecto.estudiantes`
**Qué hace:** obtiene estudiantes asociados al proyecto.

**Ejemplo:**
```js
const proyecto = await client.proyectos.get(7);
const estudiantes = await proyecto.estudiantes;
```

**Explicación:** usa internamente `client.proyectos.getEstudiantes()`.

---

### 7.4 `Estudiante.proyecto`
**Qué hace:** obtiene el proyecto del estudiante.

**Ejemplo:**
```js
const estudiante = await client.estudiantes.get(5);
const proyecto = await estudiante.proyecto;
```

**Explicación:** usa internamente `client.getEstudianteProyecto()`.

---

## 8) Cache y rendimiento

### 8.1 `client.getCached(key, loader)`
**Qué hace:** devuelve un valor en cache o lo carga si no existe.

**Ejemplo:**
```js
const data = await client.getCached("/usuarios:1", () => client.usuarios.get(1));
```

**Explicación:** evita requests duplicadas y sincroniza llamadas concurrentes.

---

### 8.2 `client.setCache(key, value, ttl)`
**Qué hace:** guarda un valor en cache con TTL.

**Ejemplo:**
```js
client.setCache("mi:key", { x: 1 }, 60000);
```

**Explicación:** si `ttl` es `null`, el cache no expira.

---

### 8.3 `client.invalidateCache(key)`
**Qué hace:** elimina una clave del cache.

**Ejemplo:**
```js
client.invalidateCache("/usuarios:1");
```

**Explicación:** se usa al actualizar o eliminar datos.

---

### 8.4 `client.invalidateCacheByPrefix(prefix)`
**Qué hace:** elimina todas las claves que empiecen por el prefijo.

**Ejemplo:**
```js
client.invalidateCacheByPrefix("/usuarios:");
```

**Explicación:** útil para limpiar una colección completa.

---

## 9) Eventos (`EventEmitter`)

### 9.1 `client.on(event, handler)`
**Qué hace:** escucha eventos.

**Ejemplo:**
```js
const unsubscribe = client.on("request", (info) => console.log(info));
```

**Explicación:** permite observar requests, respuestas y errores.

---

### 9.2 `client.once(event, handler)`
**Qué hace:** escucha una sola vez.

**Ejemplo:**
```js
client.once("response", (info) => console.log(info));
```

**Explicación:** se desuscribe automáticamente tras el primer evento.

---

### 9.3 `client.off(event, handler)`
**Qué hace:** elimina un listener.

**Ejemplo:**
```js
const handler = (info) => console.log(info);
client.on("error", handler);
client.off("error", handler);
```

**Explicación:** deja de escuchar eventos.

---

### 9.4 Eventos disponibles
**Qué hace:** describe los eventos que emite el SDK.

- `request`: `{ method, url, options }`
- `response`: `{ method, url, status, data }`
- `error`: `{ error, method, url }`

**Explicación:** puedes usarlos para logging, métricas o debugging.

---

## 10) Filtrado, búsqueda y ordenamiento

### 10.1 Filtrar por campos
**Qué hace:** filtra resultados usando query params.

**Ejemplo:**
```js
const { items } = await client.estudiantes.list({ estado: 1, programa: 3 });
```

**Explicación:** el SDK pasa cualquier campo como query param. El backend solo soporta filtros en `/estudiantes` y `/proyectos`.

---

### 10.2 Búsqueda por texto
**Qué hace:** pasa parámetros de búsqueda al backend.

**Ejemplo:**
```js
const { items } = await client.proyectos.list({ q: "sostenibilidad" });
```

**Explicación:** el backend soporta `q` en `/estudiantes` y `/proyectos`.

---

### 10.3 Ordenamiento
**Qué hace:** envía parámetros de orden al backend.

**Ejemplo:**
```js
const { items } = await client.estudiantes.list({ sort: "-nombre" });
```

**Explicación:** el backend define el formato de orden (campos permitidos). Por ejemplo, `/estudiantes` acepta `id`, `nombre`, `estado`, `programa` y `/proyectos` acepta `codigo`, `titulo`, `nivel`, `estado`.

---

## 11) Manejo de sesión

### 11.1 Guardar datos en `localStorage`
**Qué hace:** persiste sesión manualmente (el SDK no escribe en `localStorage`).

**Ejemplo:**
```js
localStorage.setItem("token", token);
localStorage.setItem("role", role);
```

**Explicación:** guarda lo que tu app necesite para proteger rutas o rehidratar sesión al recargar.

---

### 11.2 Cerrar sesión
**Qué hace:** limpia token y storage.

**Ejemplo:**
```js
localStorage.clear();
client.setToken(null);
```

**Explicación:** deja la app sin credenciales.

---

## 12) Seguridad de contraseñas (SDK)

> **Nota:** en producción, las contraseñas deben hashearse en el backend. Estas utilidades son para uso en frontend (por ejemplo, almacenamiento local o pruebas).

### 12.1 `hashPassword(password)`
**Qué hace:** genera un hash con PBKDF2 (no reversible).

**Ejemplo:**
```js
import { hashPassword } from "../../sdk";

const hashed = await hashPassword("mi-clave");
// { salt, hash, iterations }
```

**Ejemplo con parámetros (opcionales):**
```js
import { hashPassword } from "../../sdk";

const hashed = await hashPassword("mi-clave", {
	salt: "BASE64_SALT",
	iterations: 120000
});
```

**Nota:** `salt` e `iterations` son opcionales. Si no los pasas, el SDK genera un `salt` y usa 100000 iteraciones.

### 12.2 `verifyPassword(password, { salt, hash })`
**Qué hace:** valida una contraseña contra su hash.

**Ejemplo:**
```js
import { verifyPassword } from "../../sdk";

const ok = await verifyPassword("mi-clave", hashed);
```

### 12.3 Ejemplos CRUD con hash

**Crear usuario (hash en backend recomendado):**
```js
import { hashPassword } from "../../sdk";

const hashed = await hashPassword("MiClave123");
await client.usuarios.create({
	nombre: "Ana",
	cedula: "123456",
	password: JSON.stringify(hashed),
	activo: true,
	rol_id: 1
});
```

**Actualizar contraseña (hash):**
```js
const hashed = await hashPassword("NuevaClave123");
await client.usuarios.update(1, { password: JSON.stringify(hashed) });
```

**Eliminar usuario:**
```js
await client.usuarios.delete(1);
```

---

## 13) Ejemplos completos (end-to-end)

### 13.1 Login + redirección
**Qué hace:** autentica y redirige por rol.

**Ejemplo:**
```js
const data = await client.login({ cedula, password });
localStorage.setItem("token", data.access_token);
localStorage.setItem("role", data.role);
client.setToken(data.access_token); // opcional, login ya lo hace
```

**Explicación:** después puedes usar el `role` para decidir rutas y rehidratar sesión al recargar.

---

### 13.2 Cargar panel Estudiante
**Qué hace:** trae el proyecto del estudiante.

**Ejemplo:**
```js
const estudiante = await client.estudiante;
const proyecto = await estudiante.proyecto;
```

**Explicación:** el modelo se encarga de resolver el endpoint.

---

## 14) Buenas prácticas

- Usa las colecciones en lugar de llamar `client.http` directamente.
- Maneja errores con `try/catch` y muestra feedback al usuario.
- Invalidar cache después de `create/update/delete` si tu vista necesita datos frescos.
- Centraliza la autenticación en el login y el router.

---

## 15) Resumen rápido de “todo lo que se puede usar”

- `client.login`
- `client.setToken`, `client.setBaseUrl`
- `Client` con `retries`, `retryDelay`, `cacheTtl`, `fetcher`
- `client.usuario`, `client.estudiante`
- `client.getEstudianteProyecto`
- `client.usuarios`, `client.roles`, `client.programas`, `client.estados`, `client.temas`, `client.evidencias`, `client.estudiantes`, `client.proyectos`, `client.calificaciones`
- `client.http` (`get`, `post`, `put`, `delete`)
- `list`, `get`, `create`, `update`, `delete`
- `getEstudiantes` (proyectos)
- Métodos de modelos: `Proyecto.refresh`, `Proyecto.calificar`, `Proyecto.estudiantes`, `Estudiante.proyecto`
- Seguridad: `hashPassword`, `verifyPassword`
- Cache: `getCached`, `setCache`, `invalidateCache`, `invalidateCacheByPrefix`
- Eventos: `on`, `once`, `off`

---

Si algo cambia en el SDK, actualiza esta documentación para mantenerla al 100%.