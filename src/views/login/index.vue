<script setup lang="ts">
import LoginHeader from "./components/LoginHeader.vue";
import LoginMain from "./components/LoginMain.vue";
</script>

<template>
  <div class="peidi-login-container">
    <el-container>
      <el-header class="peidi-login-header peidi-login-flex">
        <LoginHeader />
      </el-header>
      <el-main class="peidi-login-main peidi-login-flex">
        <LoginMain />
      </el-main>
      <el-footer class="peidi-login-footer peidi-login-flex">
        © 2025 Peidi Corporation. All rights reserved.
      </el-footer>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.peidi-login-flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

.peidi-login-container {
  height: 100vh;
  background-color: #314fa9;
  font-family: "Inter", sans-serif;

  .peidi-login-header,
  .peidi-login-footer {
    height: 60px;
    font-weight: bold;
    text-align: center;
    background-color: rgba(255, 255, 255, 0.05);
  }

  .peidi-login-header {
    color: #fff;
    font-size: 24px;
    border-bottom: 1px solid #4a64b3;
  }

  .peidi-login-footer {
    height: 60px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    border-top: 1px solid #4a64b3;
  }

  .peidi-login-main {
    height: calc(100vh - 120px);
  }
}
</style>
