import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// 基础配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.dhudate.com/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动注入 JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('dhudate_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理 401 和统一解析
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 后端格式约定为 { code: 0, message: "ok", data: ... }
    if (response.data && typeof response.data.code === 'number') {
      if (response.data.code !== 0) {
        // 将后端业务错误抛出
        return Promise.reject(new Error(response.data.message || '业务请求失败'));
      }
      // 直接返回实际数据
      return response.data.data !== undefined ? response.data.data : response.data;
    }
    return response.data;
  },
  (error: AxiosError<{code?: number, message?: string}>) => {
    if (error.response?.status === 401) {
      // Token 过期或未授权，触发登出逻辑（这里可配合 store 的 logout 操作）
      localStorage.removeItem('dhudate_auth_token');
      // 避免死循环加载，派发一个自定义事件让应用根组件捕获并跳转登录
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    
    // 提取并抛出后端友好的错误提示
    const message = error.response?.data?.message || error.message || '网络或服务器错误';
    return Promise.reject(new Error(message));
  }
);
