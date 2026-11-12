import { configureStore } from '@reduxjs/toolkit';
import authReducer, { sessionExpired } from './authSlice';
import cartReducer, { resetCart } from './cartSlice';
import wishlistReducer, { resetWishlist } from './wishlistSlice';
import { setAuthFailureHandler } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

// Когато сесията изтече и refresh не успее – изчистваме данните на потребителя
setAuthFailureHandler(() => {
  if (!store.getState().auth.user) return;
  store.dispatch(sessionExpired());
  store.dispatch(resetCart());
  store.dispatch(resetWishlist());
});
