<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import LoginCircle from "./LoginCircle.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { LocationFilled } from "@element-plus/icons-vue";
import Mail from "@iconify-icons/ri/mail-fill";
import Phone from "@iconify-icons/ri/phone-fill";
import Lock from "@iconify-icons/ri/lock-fill";
import {
  getUserCheck,
  getUserInfo,
  getUserSite,
  register,
  registerMobile
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
const { t } = useI18n();

const { logout } = useNav();

let storage: CrossStorageClient;

const remember = ref(false);
const mode = ref("email");
const loading = ref(false);

const form = reactive({
  email: "",
  mobile: "",
  password: "",
  site: ""
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
  password: [
    {
      required: true,
      message: t("peidiLogin.passwordRequiredReg"),
      trigger: "blur"
    }
  ]
});

const siteEnum = ref([
  // {
  //   id: "3",
  //   siteName: "佩蒂智创"
  // }
]);

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

  if (!getUrlParam("source")) {
    message("未指定跳转地址", { type: "error" });
  }

  // 获取基地枚举信息 -登录不再选基地
  // getUserSite()
  //   .then(res => {
  //     if (res.success) {
  //       const { data } = res;
  //       // console.log("siteEnum", data);
  //       siteEnum.value = data;
  //     }
  //   })
  //   .catch(err => {
  //     console.log("获取基地枚举信息失败", err);
  //     message("获取基地枚举信息失败", { type: "error" });
  //   });

  //#region ifarme 跨域通信
  // console.log(getUrlParam("source"));
  // if (getUrlParam("source")) {
  //   console.log("source", `${getUrlParam("source").split("#")[0]}hub.html`);
  //   storage = new CrossStorageClient(
  //     `${getUrlParam("source").split("#")[0]}hub.html`
  //   );
  // }

  // storage
  //   .onConnect()
  //   .then(() => {
  //     return storage.set("202510161238", "value");
  //   })
  //   .then(() => {
  //     return storage.get("202510161238");
  //   })
  //   .then(res => {
  //     console.log(res); // 输出: value
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });
  //#endregion
});
onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});

const onLogin = async formEl => {
  console.log("login");
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    // console.log("valid", valid, "fields", fields, "form", form);
    if (!getUrlParam("source")) {
      message("未指定跳转地址", { type: "error" });
      return;
    }
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({
          username: mode.value === "email" ? form.email : form.mobile,
          password: form.password
          // site: form.site || null
        })
        .then((res: any) => {
          if (res.success) {
            // console.log("isDingTalk", isDingTalk());
            // if (!isDingTalk()) {
            //   getUserCheck(res?.data).then((res: any) =>
            //     localStorage.setItem(
            //       "ddUserInfo",
            //       JSON.stringify({
            //         userid: res?.data?.id,
            //         dept_id_list: [res?.data?.deptId]
            //       })
            //     )
            //   );
            // }

            //#region 统一登录方法，目前是URL参数传递🥹，已经上线EPS
            const source = getUrlParam("source");
            if (source) {
              const sourceUrl = decryptMessage(source);
              console.log("source", source);
              console.log("sourceUrl", sourceUrl);
              const toUrl =
                sourceUrl +
                `?key1=${encryptMessage(mode.value === "email" ? form.email : form.mobile)}&key2=${encryptMessage(form.password)}&key3=${encryptMessage(remember.value.toString())}`;
              console.log("window.location.href", toUrl);
              removeToken(); // 登录成功后，移除token
              logout();
              window.location.href = toUrl;
              // logout();
            } else {
              message("登录成功但未指定跳转地址", { type: "success" });
            }
            //#endregion

            //#region iframe 跨域通信
            // if (storage) {
            //   storage
            //     .onConnect()
            //     .then(() => {
            //       localStorage.setItem(
            //         "peidi-userInfo",
            //         JSON.stringify({
            //           // 邮箱或手机号
            //           username:
            //             mode.value === "email" ? form.email : form.mobile,
            //           // 密码
            //           password: form.password,
            //           // 基地ID
            //           site: form.site || null,
            //           // 记住密码
            //           remember: remember.value
            //         })
            //       );

            //       return storage.set(
            //         "peidi-userInfo",
            //         JSON.stringify({
            //           // 邮箱或手机号
            //           username:
            //             mode.value === "email" ? form.email : form.mobile,
            //           // 密码
            //           password: form.password,
            //           // 基地ID
            //           site: form.site || null,
            //           // 记住密码
            //           remember: remember.value
            //         })
            //       );
            //     })
            //     .then(() => {
            //       return storage.get("peidi-userInfo");
            //     })
            //     .then(res => {
            //       console.log(res);
            //       if (getUrlParam("source")) {
            //         console.log("to-source", getUrlParam("source"));
            //         removeToken();
            //         // storage.close();
            //         window.location.href = getUrlParam("source");
            //       }
            //     })
            //     .catch(err => {
            //       console.error(err);
            //     });
            // } else {
            //   console.log("storage 未初始化");
            // }
            //#endregion
          } else {
            message("登录失败", { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

//#region 钉钉登录
const ddLogin = () => {
  let ddUserEmail = "";
  dd.runtime.permission.requestAuthCode({
    corpId: DINGTALK_CORP_ID, // 钉钉企业ID
    //@ts-ignore
    onSuccess: function (info) {
      console.log(info);
      const { code } = info;

      // 根据code拿到个人信息
      getUserInfo(code)
        .then(res => {
          if (res.success) {
            const { data: ddUserInfo } = res;
            localStorage.setItem("ddUserInfo", JSON.stringify(ddUserInfo));
            const { org_email, name, userid, mobile } = ddUserInfo;

            if (org_email) {
              ddUserEmail = org_email;
              // 获取到钉钉用户企业邮箱，调用注册接口
              mode.value = "email";
              form.email = `${ddUserEmail}`;
              form.password = DINGTALK_LOGIN_FREE_DEFAULT_PASSWORD;
              return register({
                email: org_email,
                emailCode: "",
                password: DINGTALK_LOGIN_FREE_DEFAULT_PASSWORD,
                username: name,
                dingId: userid,
                mobile
              });
            } else if (mobile) {
              mode.value = "mobile";
              form.mobile = mobile;
              form.password = DINGTALK_LOGIN_FREE_DEFAULT_PASSWORD;
              return registerMobile({
                mobile,
                mobileCode: "",
                password: DINGTALK_LOGIN_FREE_DEFAULT_PASSWORD,
                username: name,
                dingId: userid
              });
            } else {
              message(
                "获取钉钉用户邮箱和手机号都失败：" + JSON.stringify(res),
                {
                  type: "error"
                }
              );
            }
          } else {
            message("用户注册失败：" + JSON.stringify(res), { type: "error" });
          }
        })
        .then((res: any) => {
          if (res) {
            // 获取当前用户信息来判断注册类型
            const ddUserInfo = JSON.parse(
              localStorage.getItem("ddUserInfo") || "{}"
            );
            const isEmailRegistration = !!ddUserInfo.org_email;
            let registrationSuccess = false;

            if (isEmailRegistration) {
              // 邮箱注册的判断条件
              registrationSuccess =
                res.success ||
                (res.code === 100100002 &&
                  res.msg === "EMAIL_ACCOUNT_ALREADY_EXIST");
              console.log("邮箱注册结果:", res);
            } else {
              // 手机号注册的判断条件
              registrationSuccess =
                res.success ||
                (res.code === 100100003 &&
                  res.msg === "MOBILE_ACCOUNT_ALREADY_EXIST");
              console.log("手机号注册结果:", res);
            }

            if (registrationSuccess) {
              // 注册成功，调用登录接口
              console.log("注册成功，开始登录");
              onLogin(formRef.value);
            } else {
              const registrationType = isEmailRegistration ? "邮箱" : "手机号";
              message(`${registrationType}注册失败：` + JSON.stringify(res), {
                type: "error"
              });
            }
          }
        })
        .then((res: any) => {
          if (res.success) {
            localStorage.setItem("token", res.data);
            // 登录成功，跳转到指定页面
            const urlParams = new URL(window.location.href).searchParams;
            window.location.href = urlParams.get("redirect") || "/";
          } else {
            message("用户登录失败：" + JSON.stringify(res), { type: "error" });
          }
        });
    },
    onFail: function (err) {
      message("获取钉钉免登授权码失败：" + JSON.stringify(err), {
        type: "error"
      });
    }
  });
};
//#endregion

// ddLogin(); // 钉钉环境不走登录, 因为钉钉环境已经有登录了, 不需要再登录一次

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
      <!-- <el-form-item label="生产基地">
        <el-select
          v-model="form.site"
          placeholder="选择生产基地"
          style="width: 100%"
          clearable
          filterable
        >
          <template #prefix>
            <el-icon size="14" style="margin-right: 2px">
              <LocationFilled />
            </el-icon>
          </template>
          <el-option
            v-for="item in siteEnum"
            :key="item.id"
            :label="item.siteName"
            :value="item.id"
          />
        </el-select>
      </el-form-item> -->

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
