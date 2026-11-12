import axios from 'axios';
import { API_URL } from '../config/site';
import { tokenStorage } from './tokenStorage';

/**
 * Централизирана Axios инстанция:
 *  - базов URL от VITE_API_URL
 *  - автоматично добавя Authorization: Bearer <token>
 *  - при 401 опитва еднократно да поднови токена (refresh) и повтаря заявката
 *  - превежда грешките в едно четимо съобщение (error.message)
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

let onAuthFailure = () => {};
export const setAuthFailureHandler = (handler) => {
  onAuthFailure = handler;
};

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- Refresh логика (една заявка за подновяване, останалите чакат) ----------
let refreshPromise = null;

const refreshTokens = async () => {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error('Няма refresh token');

  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
  tokenStorage.set(data.data);
  return data.data.accessToken;
};

const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'Сървърът не отговаря. Опитайте отново.';
  if (error?.message === 'Network Error') return 'Няма връзка със сървъра. Проверете интернет връзката.';
  return error?.message || 'Възникна неочаквана грешка.';
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthRoute = AUTH_ROUTES.some((route) => original?.url?.includes(route));

    if (status === 401 && original && !original._retry && !isAuthRoute && tokenStorage.getRefresh()) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise || refreshTokens();
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        tokenStorage.clear();
        onAuthFailure();
      } finally {
        refreshPromise = null;
      }
    } else if (status === 401 && !isAuthRoute && tokenStorage.getAccess()) {
      tokenStorage.clear();
      onAuthFailure();
    }

    error.message = getErrorMessage(error);
    return Promise.reject(error);
  },
);

// Връща директно полето data от стандартния отговор { success, data, message }
export const unwrap = (promise) => promise.then((res) => res.data.data);

// Връща целия отговор (за случаи, когато е нужно и message)
export const unwrapFull = (promise) => promise.then((res) => res.data);

// Помощна функция за multipart заявки (снимки)
export const toFormData = (values, files = {}) => {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value) || (value !== null && typeof value === 'object')) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value === null ? '' : value);
    }
  });
  Object.entries(files).forEach(([field, list]) => {
    (Array.isArray(list) ? list : [list]).filter(Boolean).forEach((file) => formData.append(field, file));
  });
  return formData;
};

export default api;
