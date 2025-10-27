<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import LoginCircle from "./LoginCircle.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { LocationFilled, Back } from "@element-plus/icons-vue";
import Mail from "@iconify-icons/ri/mail-fill";
import Phone from "@iconify-icons/ri/phone-fill";
import Lock from "@iconify-icons/ri/lock-fill";
import VerifyCode from "@iconify-icons/ri/shield-check-line";
import BackLeft from "@/assets/svg/back_left.svg?component";
import {
  getUserCheck,
  getUserInfo,
  getUserSite,
  register,
  registerMobile,
  resetPassword,
  validateCode
} from "@/api/login";
import * as dd from "dingtalk-jsapi";
import {
  DINGTALK_CORP_ID,
  DINGTALK_LOGIN_FREE_DEFAULT_PASSWORD
} from "@/views/login/utils/constants";
import { message } from "@/utils/message";
import { useUserStoreHook } from "@/store/modules/user";
import {
  decryptMessage,
  encryptMessage,
  getUrlParam,
  isDingTalk
} from "../utils";
import { CrossStorageClient } from "cross-storage";
import { removeToken } from "@/utils/auth";
import { useNav } from "@/layout/hooks/useNav";
import { useI18n } from "vue-i18n";
import { get } from "sortablejs";
import router from "@/router";
import { v } from "vxe-table";
const { t } = useI18n();

const NEW_PASSWORD = "Aa123456";

const { logout } = useNav();

let storage: CrossStorageClient;

const remember = ref(false);
const mode = ref("email");
const loading = ref(false);

const form = reactive({
  email: "",
  mobile: "",
  password: "",
  site: "",
  validateCode: ""
});
const formRef = ref(null);

// 校验邮箱是否包含@符号
const validateEmail = (rule, value, callback) => {
  if (value && !value.includes("@")) {
    callback(new Error(t("peidiLogin.emailCorrectReg")));
  } else {
    callback();
  }
};

// 校验是否为纯数字
const validateNumber = (rule, value, callback) => {
  if (value && !/^\d+$/.test(value)) {
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
  validateCode: [
    {
      required: true,
      message: t("peidiLogin.verifyCodePlaceholder"),
      trigger: "blur"
    }
  ]
});

const handleModeChange = () => {
  // console.log("rules", rules);
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
});
onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});

const onLogin = async formEl => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      resetPassword({
        codeType:
          mode.value === "email"
            ? "email_reset_password"
            : "sms_reset_password",
        identifier: mode.value === "email" ? form.email : form.mobile,
        newPassword: NEW_PASSWORD,
        validateCode: form.validateCode
      })
        .then((res: any) => {
          if (res && res?.code === 200) {
            message(t("peidiLogin.resetPasswordSuccess"), { type: "success" });
          } else {
            message(res?.msg || t("peidiLogin.resetPasswordFail"), {
              type: "error"
            });
          }
        })
        .catch(err => {
          message(t("peidiLogin.resetPasswordFail") + "：" + err.message, {
            type: "error"
          });
        });
    }
  });
};

const handleBackToLoginClick = () => {
  router.push({ path: "/login", query: { source: getUrlParam("source") } });
};

//#region 验证码
const validationCodeSpanRef = ref();
const isSendValidationCode = ref<string>(t("peidiLogin.sendVerifyCode"));

// 发送验证码
const sendValidationCode = async () => {
  if (!isSendValidationCode.value.endsWith(t("peidiLogin.sendVerifyCode")))
    return;
  if (mode.value === "email") {
    await formRef.value!.validateField("email");
  } else {
    await formRef.value!.validateField("mobile");
  }
  // 发送
  try {
    // const res = await sendCheckCode({ username: phone }); // 返回boolean
    // if (res) message("验证码发送成功", { type: "success" });
    validateCode({
      codeType:
        mode.value === "email" ? "email_reset_password" : "sms_reset_password",
      destination: mode.value === "email" ? form.email : form.mobile
    }).then((res: any) => {
      if (res && res?.code === 200) {
        isSendValidationCode.value = `60${t("peidiLogin.verifyCodeInfo")}`;
        validationCodeSpanRef.value.style = "color: gray;"; // 颜色变灰
        const countDown = ref<number>(60); // 倒计时
        const temp = setInterval(() => {
          countDown.value--;
          isSendValidationCode.value =
            countDown.value + t("peidiLogin.verifyCodeInfo");
          if (!countDown.value) {
            clearInterval(temp);
            validationCodeSpanRef.value.style = "color: #1764FF;"; // 颜色变蓝
            isSendValidationCode.value = t("peidiLogin.sendVerifyCode");
            countDown.value = 60;
          }
        }, 1000);
      } else {
        message(res?.msg || t("peidiLogin.verifyCodeSendFail"), {
          type: "error"
        });
      }
    });
  } catch {
    message(t("peidiLogin.verifyCodeSendFail"), { type: "error" });
  }
};
//#endregion
</script>

<template>
  <el-card style="width: 446px">
    <div class="peidi-login-resetpassword-welcome">
      <div
        class="peidi-login-resetpassword-welcome-block"
        @click="handleBackToLoginClick"
      >
        <BackLeft style="margin-right: 8px" />{{ t("peidiLogin.backToLogin") }}
      </div>
    </div>

    <div class="peidi-login-resetpassword-title">
      <p style="font-size: 24px; font-weight: 700; color: #3151ac">
        {{ t("peidiLogin.pureResetPassword") }}
      </p>
      <p style="font-size: 14px; color: oklch(55.6% 0 0deg)">
        {{ t("peidiLogin.resetPasswordTip") }}
      </p>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="auto"
      style="max-width: 600px; margin-top: 40px"
      label-position="top"
      class="peidi-login-resetpassword-form"
      hide-required-asterisk
      :validate-on-rule-change="false"
    >
      <el-radio-group
        v-model="mode"
        fill="rgb(45, 74, 158)"
        class="peidi-login-resetpassword-radio-group"
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

      <el-form-item :label="t('peidiLogin.verifyCode')" prop="validateCode">
        <el-input
          v-model="form.validateCode"
          :placeholder="t('peidiLogin.verifyCodePlaceholder')"
          :prefix-icon="useRenderIcon(VerifyCode)"
        >
          <template #suffix>
            <span
              id="suffix-span"
              style="display: flex; align-items: center; cursor: pointer"
            >
              <span style="margin-right: 8px">|</span>
              <span
                id="suffix-span-2"
                ref="validationCodeSpanRef"
                style="color: #1764ff"
                @click="sendValidationCode()"
              >
                {{ isSendValidationCode }}
              </span>
            </span>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          style="width: 100%; height: 36px; background-color: #304ea6"
          :loading="loading"
          @click="onLogin(formRef)"
          >{{ t("peidiLogin.pureResetPassword") }}</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style lang="scss" scoped>
.peidi-login-resetpassword-welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;

  .peidi-login-resetpassword-welcome-block {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 20px;
    cursor: pointer;
    background-color: #304ea6;
    border-radius: 20px;
  }
}

.peidi-login-resetpassword-title {
  margin-top: 20px;
  text-align: center;

  p {
    margin-bottom: 10px;
  }
}

.peidi-login-resetpassword-form {
  :deep(.el-form-item__label) {
    font-size: 14px;
    color: oklch(14.5% 0 0deg);
  }
}

.peidi-login-resetpassword-radio-group {
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

.peidi-login-resetpassword-remember {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #304ea6;
    border-color: #304ea6;
  }
}

.peidi-login-resetpassword-forgot-password {
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
