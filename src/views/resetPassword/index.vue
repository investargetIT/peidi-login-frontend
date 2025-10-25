<script setup lang="ts">
import "@/views/login/index.scss";
import LoginHeader from "@/views/login/components/LoginHeader.vue";
import LoginResetPassword from "@/views/login/components/LoginResetPassword.vue";
</script>

<template>
  <div class="peidi-login-container">
    <el-container>
      <el-header class="peidi-login-header peidi-login-flex">
        <LoginHeader />
      </el-header>
      <el-main class="peidi-login-main peidi-login-flex">
        <LoginResetPassword />
      </el-main>
      <el-footer class="peidi-login-footer peidi-login-flex">
        © 2025 Peidi Corporation. All rights reserved.
      </el-footer>
    </el-container>
  </div>
</template>
