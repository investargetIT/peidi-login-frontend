import { http } from "@/utils/http";

type Result<T> = {
  success: boolean;
  data: T;
};

const USER_BASE_URL =
  import.meta.env.VITE_API_USER_BASE_URL || "https://user.peidigroup.cn";
const userApi = (url: string) => `${USER_BASE_URL}${url}`;

// 发送验证码
export const validateCode = data => {
  return http.request<Result<any>>("post", userApi(`/user/validate-code`), {
    data
  });
};

// 重置密码
export const resetPassword = data => {
  return http.request<Result<any>>("post", userApi(`/user/reset-password`), {
    data
  });
};
