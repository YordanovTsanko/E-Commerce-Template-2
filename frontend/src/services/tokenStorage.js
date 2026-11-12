const ACCESS_KEY = 'ect2_access_token';
const REFRESH_KEY = 'ect2_refresh_token';

const safe = (fn, fallback = null) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const tokenStorage = {
  getAccess: () => safe(() => localStorage.getItem(ACCESS_KEY)),
  getRefresh: () => safe(() => localStorage.getItem(REFRESH_KEY)),
  set: ({ accessToken, refreshToken }) =>
    safe(() => {
      if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    }),
  clear: () =>
    safe(() => {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }),
};

// Обща помощна функция за localStorage с JSON
export const storage = {
  get: (key, fallback) => safe(() => JSON.parse(localStorage.getItem(key)) ?? fallback, fallback),
  set: (key, value) => safe(() => localStorage.setItem(key, JSON.stringify(value))),
  remove: (key) => safe(() => localStorage.removeItem(key)),
};
