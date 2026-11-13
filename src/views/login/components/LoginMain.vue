<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import LoginCircle from "./LoginCircle.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Mail from "@iconify-icons/ri/mail-fill";
import Phone from "@iconify-icons/ri/phone-fill";
import Lock from "@iconify-icons/ri/lock-fill";
import type { FormInstance } from "element-plus";
import { message } from "@/utils/message";
import { useUserStoreHook } from "@/store/modules/user";
import {
  decryptMessage,
  encryptMessage,
  getUrlParam,
  isEmail,
  isMobile
} from "../utils";
import { useI18n } from "vue-i18n";
import router from "@/router";
const { t } = useI18n();

const remember = ref(false);
const mode = ref("email");
const loading = ref(false);

const form = reactive({
  email: "",
  mobile: "",
  password: ""
});
const formRef = ref<FormInstance>();

// 校验邮箱格式
const validateEmail = (rule, value, callback) => {
  if (value && !isEmail(value)) {
    callback(new Error(t("peidiLogin.emailCorrectReg")));
  } else {
    callback();
  }
};

// 校验手机号格式
const validateNumber = (rule, value, callback) => {
  if (value && !isMobile(value)) {
    callback(new Error(t("peidiLogin.mobileCorrectReg")));
  } else {
    callback();
  }
};
const rules: any = reactive({
  email: [
    {
      required: mode.value === "email",
      message: t("peidiLogin.emailRequiredReg"),
      trigger: "blur"
    },
    { validator: validateEmail, trigger: "blur" }
  ],
  mobile: [
    {
      required: mode.value == "mobile",
      message: t("peidiLogin.mobileRequiredReg"),
      trigger: "blur"
    },
    { validator: validateNumber, trigger: "blur" }
  ],
  password: [
    {
      required: true,
      message: t("peidiLogin.passwordRequiredReg"),
      trigger: "blur"
    }
  ]
});

const handleModeChange = () => {
  rules.email[0].required = mode.value === "email";
  rules.mobile[0].required = mode.value === "mobile";
  formRef.value?.resetFields();
};

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (["Enter", "NumpadEnter"].includes(code)) {
    onLogin(formRef.value);
  }
}

onMounted(() => {
  window.document.addEventListener("keypress", onkeypress);

  if (!getUrlParam("source")) {
    message(t("peidiLogin.noJumpToDefault"), { type: "error" });
  }
});
onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid: boolean) => {
    if (!valid) return;
    loading.value = true;
    useUserStoreHook()
      .loginByUsername({
        username: mode.value === "email" ? form.email : form.mobile,
        password: form.password
      })
      .then((res: any) => {
        if (res.success) {
          // 统一登录：把账号信息加密后通过 URL 交给目标系统
          const source = getUrlParam("source");
          if (source) {
            const sourceUrl = decryptMessage(source);
            const username = mode.value === "email" ? form.email : form.mobile;
            const toUrl =
              sourceUrl +
              `?key1=${encryptMessage(username)}&key2=${encryptMessage(form.password)}&key3=${encryptMessage(remember.value.toString())}`;
            window.location.replace(toUrl);
          } else {
            message(t("peidiLogin.loginSuccessButNoJump"), {
              type: "success"
            });
          }
        } else if (res?.code === 100100001) {
          message(t("peidiLogin.accountOrPasswordError"), {
            type: "error"
          });
        } else {
          message(t("peidiLogin.loginFail"), { type: "error" });
        }
      })
      .catch(() => {
        message(t("peidiLogin.loginFail"), { type: "error" });
      })
      .finally(() => (loading.value = false));
  });
};

/** 处理重置密码点击事件 */
const handleResetPasswordClick = () => {
  router.push({
    path: "/reset-password",
    query: { source: getUrlParam("source") }
  });
};
</script>

<template>
  <el-card style="width: 446px">
    <div class="peidi-login-main-welcome">
      <div class="peidi-login-main-welcome-block">
        <LoginCircle style="margin-right: 8px" />{{
          t("peidiLogin.welcomeLogin")
        }}
      </div>
    </div>

    <div class="peidi-login-main-title">
      <p style="font-size: 24px; font-weight: 700; color: #3151ac">
        {{ t("peidiLogin.loginTitle") }}
      </p>
      <p style="font-size: 14px; color: oklch(55.6% 0 0deg)">
        {{ t("peidiLogin.loginTip") }}
      </p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="auto"
      style="max-width: 600px; margin-top: 40px"
      label-position="top"
      class="peidi-login-main-form"
      hide-required-asterisk
      :validate-on-rule-change="false"
    >
      <el-radio-group
        v-model="mode"
        fill="rgb(45, 74, 158)"
        class="peidi-login-main-radio-group"
        @change="handleModeChange()"
      >
        <el-radio-button :label="t('peidiLogin.useEmail')" value="email" />
        <el-radio-button :label="t('peidiLogin.useMobile')" value="mobile" />
      </el-radio-group>

      <el-form-item
        v-show="mode === 'email'"
        :label="t('peidiLogin.email')"
        prop="email"
      >
        <el-input
          v-model="form.email"
          :placeholder="t('peidiLogin.emailPlaceholder')"
          :prefix-icon="useRenderIcon(Mail)"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="mode === 'mobile'"
        :label="t('peidiLogin.mobile')"
        prop="mobile"
      >
        <el-input
          v-model="form.mobile"
          :placeholder="t('peidiLogin.mobilePlaceholder')"
          :prefix-icon="useRenderIcon(Phone)"
          clearable
        />
      </el-form-item>
      <div class="peidi-login-main-forgot-password">
        <span @click="handleResetPasswordClick">{{
          t("peidiLogin.forgotPassword")
        }}</span>
      </div>

      <el-form-item :label="t('peidiLogin.password')" prop="password">
        <el-input
          v-model="form.password"
          :placeholder="t('peidiLogin.passwordPlaceholder')"
          :prefix-icon="useRenderIcon(Lock)"
          clearable
          show-password
        />
      </el-form-item>

      <div class="peidi-login-main-remember">
        <el-checkbox v-model="remember" size="large" />
        <span
          style="
            margin-left: 8px;
            font-size: 14px;
            font-weight: 400;
            color: oklch(14.5% 0 0deg);
          "
          >{{ t("peidiLogin.rememberMe") }}</span
        >
      </div>

      <el-form-item>
        <el-button
          type="primary"
          style="width: 100%; height: 36px; background-color: #304ea6"
          :loading="loading"
          @click="onLogin(formRef)"
          >{{ t("peidiLogin.loginButton") }}</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.peidi-login-main-welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;

  .peidi-login-main-welcome-block {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    background-color: #304ea6;
    border-radius: 20px;
  }
}

.peidi-login-main-title {
  margin-top: 20px;
  text-align: center;

  p {
    margin-bottom: 10px;
  }
}

.peidi-login-main-form {
  :deep(.el-form-item__label) {
    font-size: 14px;
    color: oklch(14.5% 0 0deg);
  }
}

.peidi-login-main-radio-group {
  width: 100%;
  margin-bottom: 20px;

  :deep(.el-radio-button) {
    flex: 1;
  }

  :deep(.el-radio-button__inner) {
    width: 100%;
    color: oklch(55.6% 0 0deg);
    background-color: #f5f5f7;
    border-color: transparent;

    &:hover {
      color: oklch(55.6% 0 0deg);
    }
  }
}

.peidi-login-main-remember {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #304ea6;
    border-color: #304ea6;
  }
}

.peidi-login-main-forgot-password {
  display: flex;
  flex-direction: row-reverse;
  margin-bottom: -22px;
  font-size: 14px;
  color: #2d4a9e;
  cursor: pointer;

  &:hover {
    color: rgb(245 166 35);
  }
}
</style>
