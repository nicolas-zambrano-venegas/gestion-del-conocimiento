<template>
  <div class="login-page">
    <div class="login-card shadow-lg">
      <div class="login-image d-none d-md-flex">
        <img src="../../assets/gestion-cundinamarca-amarillo.svg" alt="Login" />
      </div>

      <div class="login-form">
        <div class="text-center mb-3">
          <img
            src="../../assets/logo-cundinamarca.png"
            alt="Universidad de Cundinamarca"
            class="logo-udc mb-2"
          />

          <p class="text-muted">Sistema de Gestión del Conocimiento</p>
        </div>

        <div class="mb-3">
          <label class="form-label">Cédula</label>
          <input
            type="text"
            class="form-control form-control-lg"
            placeholder="Ingrese su cédula"
            v-model="cedula"
          />
        </div>

        <div class="mb-4">
          <label class="form-label">Contraseña</label>
          <input
            type="password"
            class="form-control form-control-lg"
            placeholder="Últimos 4 dígitos"
            v-model="password"
          />
        </div>

        <button class="btn-login w-100 mt-3" :disabled="loading" @click="login">
          {{ loading ? "Ingresando..." : "Iniciar sesión" }}
        </button>

        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>

        <div class="text-center mt-4 text-muted small">
          © 2026 · Gestión del Conocimiento
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../../styles/login.css";
import client from "../../sdk";

export default {
  name: "Login",
  data() {
    return {
      cedula: "",
      password: "",
      error: "",
      loading: false
    };
  },
  methods: {
    async login() {
      this.error = "";
      this.loading = true;
      try {
        const response = await client.login({
          cedula: this.cedula,
          password: this.password
        });


        const role = response?.role;
        const token = response?.access_token;

        if (!token || !role) {
          throw new Error("Credenciales inválidas");
        }

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        client.setToken(token);

        if (role === "ADMIN" || role === "SUPERADMIN") {
          this.$router.push("/admin");
        } else if (role === "DOCENTE") {
          this.$router.push("/docente");
        } else if (role === "ESTUDIANTE") {
          this.$router.push("/estudiante");
        } else {
          this.$router.push("/");
        }
      } catch (error) {
        console.error("Login error:", error);
        this.error = "Error al iniciar sesión";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
