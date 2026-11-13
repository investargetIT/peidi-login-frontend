import { http } from "@/utils/http";

export type AertxInfoResult = {
  code: number;
  data: any;
  msg: string;
};

const RECRUITMENT_BASE_URL =
  import.meta.env.VITE_API_RECRUITMENT_BASE_URL || "https://api.peidigroup.cn";
const recruitmentApi = (url: string) => `${RECRUITMENT_BASE_URL}${url}`;

/** 获取招聘问卷信息 */
export const getAertxInfo = params => {
  return http.request<AertxInfoResult>(
    "get",
    recruitmentApi(`/ui/extra/info`),
    {
      params
    }
  );
};

/** 获取招聘问卷信息分页列表 */
export const getAertxInfoPage = params => {
  return http.request<AertxInfoResult>(
    "get",
    recruitmentApi(`/ui/extra/page`),
    {
      params
    }
  );
};

/** 上传招聘问卷信息 */
export const setAertxInfo = data => {
  return http.request<AertxInfoResult>(
    "post",
    recruitmentApi(`/ui/extra/info`),
    {
      data
    }
  );
};

/** 上传文件 */
export const uploadFile = data => {
  return http.request<AertxInfoResult>(
    "post",
    recruitmentApi(`/ui/extra/upload`),
    {
      data,
      headers: {
        "content-type": "multipart/form-data;"
      }
    }
  );
};

/** 下载文件 */
export const downloadFile = params => {
  return http.request<any>("get", recruitmentApi(`/ui/common/download`), {
    params,
    headers: {
      responseType: "blob"
    }
  });
};
