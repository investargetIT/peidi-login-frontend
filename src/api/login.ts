import { http } from "@/utils/http";

type Result<T> = {
  success: boolean;
  data: T;
};

// 获取基地枚举信息
export const getUserSite = () => {
  return http.request<Result<any>>(
    "get",
    `https://user.peidigroup.cn/user/site`,
    {}
  );
};

// 根据code拿到个人信息
export const getUserInfo = code => {
  return http.request<Result<any>>(
    "get",
    `https://user.peidigroup.cn/ding/userInfo?code=${code}`,
    {}
  );
};

// 根据token拿到userId
export const getUserCheck = token => {
  return http.request(
    "get",
    `https://user.peidigroup.cn/user/user-check?token=${token}`,
    {}
  );
};

// 邮箱注册
export const register = data => {
  return http.request<Result<any>>(
    "post",
    `https://user.peidigroup.cn/user/email-register`,
    {
      data
    }
  );
};

// 手机号注册
export const registerMobile = data => {
  return http.request<Result<any>>(
    "post",
    `https://user.peidigroup.cn/user/sms-register`,
    {
      data
    }
  );
};

// 发送验证码
export const validateCode = data => {
  return http.request<Result<any>>(
    "post",
    `https://user.peidigroup.cn/user/validate-code`,
    {
      data
    }
  );
};

// 重置密码
export const resetPassword = data => {
  return http.request<Result<any>>(
    "post",
    `https://user.peidigroup.cn/user/reset-password`,
    {
      data
    }
  );
};
