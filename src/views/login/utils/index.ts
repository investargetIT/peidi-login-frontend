/**
 * 判断是否为钉钉浏览器
 * @returns 是否为钉钉浏览器
 */
export const isDingTalk = () => {
  const ua = navigator.userAgent;
  return ua.includes("DingTalk");
};

/**
 * 获取URL参数
 * @param name 参数名
 * @returns 参数值
 */
export const getUrlParam = (name: string) => {
  var search = window.location.hash.split("?")[1];
  const searchParams = new URLSearchParams(search);
  return searchParams.get(name);
};
