<template>
  <nav class="navbar navbar-expand-lg navbar-dark admin-navbar mb-4 shadow-sm">
    <div class="container-fluid">

      <!-- Logo -->
      <span class="navbar-brand fw-bold">
        📊 Panel Admin
      </span>

      <!-- Botón mobile -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#adminNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menú -->
      <div class="collapse navbar-collapse" id="adminNavbar">

        <!-- Links -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">

          <li class="nav-item">
            <a class="nav-link" @click.prevent="go('/admin')">
              🏠 Inicio
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" @click.prevent="go('/admin/usuarios')">
              👤 Usuarios
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" @click.prevent="go('/admin/programas')">
              📚 Programas
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" @click.prevent="go('/admin/proyectos')">
              📁 Proyectos
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" @click.prevent="go('/admin/roles')">
              🔐 Roles
            </a>
          </li>

          <li class="nav-item">
            <a class="nav-link" @click.prevent="go('/admin/estudiantes')">
              🎓 Estudiantes
            </a>
          </li>

        </ul>

        <!-- Derecha -->
        <div class="d-flex align-items-center gap-3">

          <slot name="extra"></slot>

          <button
            class="btn btn-outline-light btn-sm"
            @click="cerrarSesion"
          >
            Cerrar sesión
          </button>

        </div>

      </div>
    </div>
  </nav>
</template>


<script>
import client from "../sdk";

export default {
  name: "AdminNavbar",

  methods: {

    cerrarSesion() {
      localStorage.clear();
      client.setToken(null);

      this.$router.push("/");
    },

    go(ruta) {
      this.$router.push(ruta);
    }

  }
};
</script>


<style scoped>
.admin-navbar {
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  border-radius: 14px;
  padding: 10px 16px;
}

.admin-navbar .nav-link {
  color: rgba(255,255,255,0.9);
  font-weight: 500;
  border-radius: 8px;
  padding: 6px 12px;
  transition: 0.2s;
}

.admin-navbar .nav-link:hover {
  background: rgba(255,255,255,0.15);
}

.admin-navbar .btn-outline-light {
  border-radius: 10px;
}
</style>
