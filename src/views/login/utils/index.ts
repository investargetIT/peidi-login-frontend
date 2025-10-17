import CryptoJS from "crypto-js";
import { CRYPTOJS_KEY } from "./constants";

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

/**
 * 加密
 * @param message 待加密的字符串
 * @returns 加密后的字符串
 */
export const encryptMessage = (message: string) => {
  return CryptoJS.AES.encrypt(message, CRYPTOJS_KEY).toString();
};
