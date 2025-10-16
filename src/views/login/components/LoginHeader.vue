<script lang="ts" setup>
import { Sunny } from "@element-plus/icons-vue";
</script>

<template>
  <div class="peidi-login-header-container">
    <img
      src="@/assets/login/logo.png"
      alt="Peidi Logo"
      class="peidi-login-header-logo"
    />
    <div>
      <el-button circle text color="#000" size="large">中</el-button>
      <el-button circle text color="#000" size="large">
        <el-icon :size="18"><Sunny /></el-icon
      ></el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-login-header-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .peidi-login-header-logo {
    height: 40px;
  }

  .el-button {
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: #000;
    }
  }
}
</style>
