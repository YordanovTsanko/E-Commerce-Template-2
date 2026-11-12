import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { login, register, logout, selectUser, selectAuthLoading, selectAuthReady } from '../store/authSlice';
import { mergeGuestCart, resetCart } from '../store/cartSlice';
import { fetchWishlistIds, resetWishlist } from '../store/wishlistSlice';
import { isAdmin, isSuperAdmin } from '../utils/roles';
import { getUserName } from '../utils/format';

// Единна точка за вход/регистрация/изход + синхронизация на количка и любими
export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const ready = useSelector(selectAuthReady);

  const afterAuth = useCallback(
    (loggedUser, message) => {
      dispatch(mergeGuestCart());
      dispatch(fetchWishlistIds());
      queryClient.invalidateQueries();
      toast.success(message(getUserName(loggedUser)));
      return loggedUser;
    },
    [dispatch, queryClient],
  );

  const run = useCallback(
    async (thunk, payload, message) => {
      const result = await dispatch(thunk(payload));
      if (thunk.rejected.match(result)) {
        toast.error(result.payload || 'Възникна грешка.');
        return null;
      }
      return afterAuth(result.payload, message);
    },
    [dispatch, afterAuth],
  );

  const signIn = (credentials) => run(login, credentials, (name) => `Добре дошли, ${name}!`);
  const signUp = (payload) => run(register, payload, (name) => `Регистрацията е успешна. Здравейте, ${name}!`);

  const signOut = async () => {
    await dispatch(logout());
    dispatch(resetCart());
    dispatch(resetWishlist());
    queryClient.clear();
    toast.success('Излязохте от профила си');
  };

  return {
    user,
    loading,
    ready,
    isAuthenticated: Boolean(user),
    isAdmin: isAdmin(user),
    isSuperAdmin: isSuperAdmin(user),
    signIn,
    signUp,
    signOut,
  };
};
