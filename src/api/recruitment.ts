import { http } from "@/utils/http";

export type AertxInfoResult = {
  code: number;
  data: any;
  msg: string;
};

/** 获取招聘问卷信息 */
export const getAertxInfo = params => {
  return http.request<AertxInfoResult>(
    "get",
    `https://api.peidigroup.cn/ui/extra/info`,
    {
      params
    }
  );
};

/** 获取招聘问卷信息分页列表 */
export const getAertxInfoPage = params => {
  return http.request<AertxInfoResult>(
    "get",
    `https://api.peidigroup.cn/ui/extra/page`,
    {
      params
    }
  );
};

/** 上传招聘问卷信息 */
export const setAertxInfo = data => {
  return http.request<AertxInfoResult>(
    "post",
    `https://api.peidigroup.cn/ui/extra/info`,
    {
      data
    }
  );
};

/** 上传文件 */
export const uploadFile = data => {
  return http.request<AertxInfoResult>(
    "post",
    `https://api.peidigroup.cn/ui/extra/upload`,
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
  return http.request<any>(
    "get",
    `https://api.peidigroup.cn/ui/common/download`,
    {
      params
    }
  );
};
