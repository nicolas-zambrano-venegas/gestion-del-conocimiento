<template>
  <div>

    <!-- NAVBAR ADMIN -->
    <nav class="navbar navbar-expand-lg navbar-dark admin-navbar mb-4 shadow-sm">
      <div class="container-fluid">

  
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbar"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="adminNavbar">

          <!-- LINKS -->
          <ul class="navbar-nav me-auto">

            <li class="nav-item">
              <RouterLink class="nav-link" to="/admin">
                Inicio
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" to="/admin/usuarios">
                Usuarios
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" to="/admin/programas">
                Programas
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" to="/admin/proyectos">
                Proyectos
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" to="/admin/roles">
                Roles
              </RouterLink>
            </li>

            <li class="nav-item">
              <RouterLink class="nav-link" to="/admin/estudiantes">
                Estudiantes
              </RouterLink>
            </li>

          </ul>

          <!-- DERECHA -->
          <div class="d-flex align-items-center gap-3">

            <span class="text-white small">
              Admin
            </span>

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

    <!-- CONTENIDO DE LAS VISTAS -->
    <div class="container">
      <RouterView />
    </div>

  </div>
</template>

<script>
import client from "../sdk";

export default {
  name: "AdminLayout",

  methods: {
    cerrarSesion() {
      localStorage.clear();
      client.setToken(null);
      this.$router.push("/");
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
  color: #fff;
}

.admin-navbar .btn-outline-light:hover {
  background: #fff;
  color: #1e3a8a;
}

</style>
