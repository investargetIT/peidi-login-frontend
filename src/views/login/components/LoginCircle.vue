<script lang="ts" setup></script>

<template>
  <div class="login-circle">
    <div class="login-circle-item login-circle-main" />
  </div>
</template>

<style lang="scss" scoped>
.login-circle {
  .login-circle-item {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ff8c00;
  }

  .login-circle-main {
    animation: colorChange 1s ease-in-out infinite alternate;
  }

  @keyframes colorChange {
    0% {
      background-color: #927963; /* 灰色 */
      // box-shadow: 0 0 20px rgba(128, 128, 128, 0.7);
    }
    100% {
      background-color: #eea328; /* 橙色 */
      // box-shadow: 0 0 30px rgba(255, 140, 0, 0.8);
    }
  }
}
</style>
