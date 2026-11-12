import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { wishlistApi } from '../services/endpoints';

export const fetchWishlistIds = createAsyncThunk('wishlist/fetchIds', async () => wishlistApi.ids());

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggle',
  async (product, { getState, rejectWithValue }) => {
    const isFavorite = getState().wishlist.ids.includes(product._id);
    try {
      if (isFavorite) {
        await wishlistApi.remove(product._id);
        toast.success('Премахнато от любими');
      } else {
        await wishlistApi.add(product._id);
        toast.success('Добавено в любими');
      }
      return { productId: product._id, isFavorite: !isFavorite };
    } catch (error) {
      toast.error(error.message);
      return rejectWithValue(error.message);
    }
  },
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { ids: [], pending: {} },
  reducers: {
    resetWishlist: (state) => {
      state.ids = [];
      state.pending = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistIds.fulfilled, (state, action) => {
        state.ids = action.payload.map(String);
      })
      .addCase(toggleWishlist.pending, (state, action) => {
        state.pending[action.meta.arg._id] = true;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, isFavorite } = action.payload;
        delete state.pending[productId];
        state.ids = isFavorite ? [...state.ids, productId] : state.ids.filter((id) => id !== productId);
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        delete state.pending[action.meta.arg._id];
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;

export const selectWishlistIds = (state) => state.wishlist.ids;
export const selectWishlistCount = (state) => state.wishlist.ids.length;
export const selectIsFavorite = (productId) => (state) => state.wishlist.ids.includes(productId);
export const selectWishlistPending = (productId) => (state) => Boolean(state.wishlist.pending[productId]);

export default wishlistSlice.reducer;
