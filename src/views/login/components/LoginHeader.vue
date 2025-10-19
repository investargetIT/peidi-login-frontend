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

const handleChangeTheme = () => {
  dataTheme.value = !dataTheme.value;
  dataThemeChange(overallStyle.value);
};

const changeLang = () => {
  if (locale.value === "zh") {
    locale.value = "en";
    translationEn();
  } else {
    locale.value = "zh";
    translationCh();
  }
  window.location.reload(); // 刷新页面, 暴力解决语言切换后, 表单验证不切换问题
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
      <!-- 切换主题按钮, 效果不理想, 暂不使用 -->
      <el-button
        v-if="false"
        circle
        text
        color="#000"
        size="large"
        @click="handleChangeTheme()"
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
