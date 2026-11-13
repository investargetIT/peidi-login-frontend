<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useGlobal } from "@pureadmin/utils";

const { t, locale } = useI18n();
const { $storage } = useGlobal<GlobalPropertiesApi>();

const changeLang = () => {
  const next = locale.value === "zh" ? "en" : "zh";
  locale.value = next;
  if ($storage) $storage.locale = { locale: next };
  // 刷新页面，保证表单校验等文案同步切换
  window.location.reload();
};
</script>

<template>
  <div class="peidi-login-header-container">
    <img
      src="@/assets/login/logo.png"
      alt="Peidi Logo"
      class="peidi-login-header-logo"
    />
    <div>
      <el-button circle text color="#000" size="large" @click="changeLang">
        {{ t("peidiLogin.language") }}
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.peidi-login-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .peidi-login-header-logo {
    height: 40px;
  }

  .el-button {
    &:hover {
      color: #000;
      background-color: rgb(255 255 255 / 10%);
    }
  }
}
</style>
