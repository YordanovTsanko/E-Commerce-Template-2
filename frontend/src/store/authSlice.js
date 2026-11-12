import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../services/endpoints';
import { tokenStorage } from '../services/tokenStorage';

// Зарежда текущия потребител при старт (ако има запазен токен)
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  if (!tokenStorage.getAccess() && !tokenStorage.getRefresh()) return null;
  try {
    const { user } = await authApi.me();
    return user;
  } catch {
    tokenStorage.clear();
    return null;
  }
});

const authenticate = (apiCall) => async (payload, { rejectWithValue }) => {
  try {
    const { user, accessToken, refreshToken } = await apiCall(payload);
    tokenStorage.set({ accessToken, refreshToken });
    return user;
  } catch (error) {
    return rejectWithValue(error.message);
  }
};

export const login = createAsyncThunk('auth/login', authenticate(authApi.login));
export const register = createAsyncThunk('auth/register', authenticate(authApi.register));

export const logout = createAsyncThunk('auth/logout', async () => {
  const refreshToken = tokenStorage.getRefresh();
  tokenStorage.clear();
  try {
    if (refreshToken) await authApi.logout(refreshToken);
  } catch {
    /* дори при грешка потребителят излиза локално */
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    initialized: false,
    status: 'idle', // idle | loading
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    // Извиква се от axios interceptor-а при невалидна сесия
    sessionExpired: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });

    [login, register].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = 'idle';
          state.user = action.payload;
        })
        .addCase(thunk.rejected, (state) => {
          state.status = 'idle';
        });
    });
  },
});

export const { setUser, sessionExpired } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectAuthReady = (state) => state.auth.initialized;
export const selectAuthLoading = (state) => state.auth.status === 'loading';

export default authSlice.reducer;
