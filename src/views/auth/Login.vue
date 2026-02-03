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
import { hashPassword } from "../../sdk";

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
      if (this.loading) {
        return;
      }
      if (!this.cedula?.trim() || !this.password?.trim()) {
        this.error = "Debe ingresar cédula y contraseña";
        return;
      }
      const cedula = this.cedula.trim();
      const password = this.password.trim();
      this.loading = true;
      try {
        const salt = btoa(cedula);
        const hashed = await hashPassword(password, { salt });
        let response;
        try {
          response = await client.login({
            cedula,
            password: JSON.stringify(hashed)
          });
        } catch (error) {
          if (error?.status === 401) {
            response = await client.login({ cedula, password });
          } else {
            throw error;
          }
        }

  const role = response?.role?.toUpperCase();
        const token = response?.access_token;

        if (!token || !role) {
          throw new Error("Credenciales inválidas");
        }

        const normalizedRole = role === "DOCENTE" ? "PROFESOR" : role;

        localStorage.setItem("token", token);
        localStorage.setItem("role", normalizedRole);
        client.setToken(token);

        if (normalizedRole === "ADMIN" || normalizedRole === "SUPERADMIN") {
          this.$router.push("/admin");
        } else if (normalizedRole === "PROFESOR") {
          this.$router.push("/docente");
        } else if (normalizedRole === "ESTUDIANTE") {
          this.$router.push("/estudiante");
        } else {
          this.error = "Rol no reconocido";
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
