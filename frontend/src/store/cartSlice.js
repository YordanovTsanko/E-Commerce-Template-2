import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { cartApi, productApi } from '../services/endpoints';
import { storage } from '../services/tokenStorage';

/**
 * Количка:
 *  - влязъл потребител -> съхранява се в базата (API)
 *  - гост -> съхранява се в localStorage и се слива с профила при вход
 */
const GUEST_CART_KEY = 'ect2_guest_cart';

// Пазим само нужните полета от продукта за количката на госта
const snapshot = (p) => ({
  _id: p._id,
  name: p.name,
  slug: p.slug,
  price: p.price,
  salePrice: p.salePrice ?? null,
  finalPrice: p.finalPrice ?? p.salePrice ?? p.price,
  images: p.images?.slice(0, 1) || [],
  unit: p.unit,
  stock: p.stock,
});

const toItems = (serverCart) => serverCart.items.map(({ product, quantity }) => ({ product, quantity }));
const isLoggedIn = (getState) => Boolean(getState().auth.user);
const saveGuest = (items) => storage.set(GUEST_CART_KEY, items.map((i) => ({ product: snapshot(i.product), quantity: i.quantity })));

const round3 = (n) => Math.round(n * 1000) / 1000;

const validateGuestQuantity = (product, quantity) => {
  if (quantity > product.stock) {
    throw new Error(product.stock > 0 ? `Наличното количество е ${product.stock}.` : 'Продуктът не е наличен.');
  }
  return round3(quantity);
};

const withErrorToast = (fn) => async (arg, thunkApi) => {
  try {
    return await fn(arg, thunkApi);
  } catch (error) {
    toast.error(error.message);
    return thunkApi.rejectWithValue(error.message);
  }
};

export const fetchCart = createAsyncThunk(
  'cart/fetch',
  withErrorToast(async (_, { getState }) => {
    if (!isLoggedIn(getState)) {
      // Обновяваме цените/наличностите на госта от сървъра
      const items = storage.get(GUEST_CART_KEY, []);
      if (!items.length) return [];
      const { items: fresh } = await productApi.list({ ids: items.map((i) => i.product._id).join(','), limit: 60 });
      const updated = items
        .map((item) => {
          const product = fresh.find((p) => p._id === item.product._id);
          return product ? { product: snapshot(product), quantity: Math.min(item.quantity, product.stock) } : null;
        })
        .filter((item) => item && item.quantity > 0);
      saveGuest(updated);
      return updated;
    }
    return toItems(await cartApi.get());
  }),
);

export const addToCart = createAsyncThunk(
  'cart/add',
  withErrorToast(async ({ product, quantity = 1 }, { getState }) => {
    let items;
    if (isLoggedIn(getState)) {
      items = toItems(await cartApi.add(product._id, quantity));
    } else {
      const current = getState().cart.items;
      const existing = current.find((i) => i.product._id === product._id);
      const newQty = validateGuestQuantity(product, (existing?.quantity || 0) + quantity);
      items = existing
        ? current.map((i) => (i.product._id === product._id ? { ...i, quantity: newQty } : i))
        : [...current, { product: snapshot(product), quantity: newQty }];
      saveGuest(items);
    }
    toast.success(`„${product.name}“ е добавен в количката`);
    return items;
  }),
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  withErrorToast(async ({ productId, quantity }, { getState }) => {
    if (isLoggedIn(getState)) return toItems(await cartApi.update(productId, quantity));

    const items = getState().cart.items.map((i) =>
      i.product._id === productId ? { ...i, quantity: validateGuestQuantity(i.product, quantity) } : i,
    );
    saveGuest(items);
    return items;
  }),
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  withErrorToast(async (productId, { getState }) => {
    let items;
    if (isLoggedIn(getState)) {
      items = toItems(await cartApi.remove(productId));
    } else {
      items = getState().cart.items.filter((i) => i.product._id !== productId);
      saveGuest(items);
    }
    toast.success('Продуктът е премахнат от количката');
    return items;
  }),
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  withErrorToast(async (_, { getState }) => {
    if (isLoggedIn(getState)) await cartApi.clear();
    storage.remove(GUEST_CART_KEY);
    return [];
  }),
);

// След вход: прехвърля количката на госта в профила
export const mergeGuestCart = createAsyncThunk(
  'cart/merge',
  withErrorToast(async () => {
    const guestItems = storage.get(GUEST_CART_KEY, []);
    storage.remove(GUEST_CART_KEY);
    if (!guestItems.length) return toItems(await cartApi.get());
    return toItems(
      await cartApi.merge(guestItems.map((i) => ({ productId: i.product._id, quantity: i.quantity }))),
    );
  }),
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: storage.get(GUEST_CART_KEY, []),
    loading: false, // първоначално зареждане
    pending: {}, // { [productId]: true } – за бутоните на конкретен продукт
    clearing: false,
  },
  reducers: {
    // При изход – изчистваме локалното състояние (сървърната количка остава)
    resetCart: (state) => {
      state.items = [];
      state.pending = {};
    },
  },
  extraReducers: (builder) => {
    const setItems = (state, action) => {
      state.items = action.payload;
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(mergeGuestCart.fulfilled, setItems)
      .addCase(clearCart.pending, (state) => {
        state.clearing = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.clearing = false;
        state.items = [];
      })
      .addCase(clearCart.rejected, (state) => {
        state.clearing = false;
      });

    // Състояние "pending" за конкретен продукт
    const productIdOf = (action) => action.meta.arg?.product?._id || action.meta.arg?.productId || action.meta.arg;

    [addToCart, updateCartItem, removeFromCart].forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state, action) => {
          state.pending[productIdOf(action)] = true;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          delete state.pending[productIdOf(action)];
          state.items = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          delete state.pending[productIdOf(action)];
        });
    });
  },
});

export const { resetCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.length;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartPending = (productId) => (state) => Boolean(state.cart.pending[productId]);
export const selectCartClearing = (state) => state.cart.clearing;

export default cartSlice.reducer;
