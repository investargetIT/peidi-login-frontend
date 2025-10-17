<script lang="ts" setup>
//@ts-ignore
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { Sunny } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const { locale, translationCh, translationEn } = useTranslationLang();
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);

const changeLang = () => {
  if (locale.value === "zh") {
    locale.value = "en";
    translationEn();
  } else {
    locale.value = "zh";
    translationCh();
  }
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
      <el-button
        v-if="false"
        circle
        text
        color="#000"
        size="large"
        @click="dataThemeChange(overallStyle)"
      >
        <el-icon :size="18"><Sunny /></el-icon
      ></el-button>
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
