// 按需引入 element-plus（只注册登录页实际使用的组件）
import type { App, Component } from "vue";
import {
  ElButton,
  ElCard,
  ElCheckbox,
  ElContainer,
  ElFooter,
  ElForm,
  ElFormItem,
  ElHeader,
  ElInput,
  ElLoading,
  ElMain,
  ElRadio,
  ElRadioButton,
  ElRadioGroup
} from "element-plus";

const components = [
  ElButton,
  ElCard,
  ElCheckbox,
  ElContainer,
  ElFooter,
  ElForm,
  ElFormItem,
  ElHeader,
  ElInput,
  ElMain,
  ElRadio,
  ElRadioButton,
  ElRadioGroup
];

/** 按需引入`element-plus` */
export function useElementPlus(app: App) {
  // 全局注册组件
  components.forEach((component: Component) => {
    app.component(component.name, component);
  });
  // 保留 v-loading 指令（layout 等页面仍在使用）
  app.use(ElLoading);
}
