import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { configApi } from '../services/endpoints';
import { calculateTotals, DEFAULT_STORE_CONFIG, getFinalPrice } from '../utils/pricing';
import { selectCartItems } from '../store/cartSlice';
import { setCurrency } from '../utils/format';

export const useStoreConfig = () => {
  const { data } = useQuery({
    queryKey: ['config'],
    queryFn: async () => {
      const config = await configApi.get();
      setCurrency(config.currency);
      return config;
    },
    staleTime: Infinity,
  });
  return data || DEFAULT_STORE_CONFIG;
};

// Сумите на количката (продукти, доставка, ДДС, общо)
export const useCartTotals = () => {
  const items = useSelector(selectCartItems);
  const config = useStoreConfig();

  return useMemo(
    () =>
      calculateTotals(
        items.map(({ product, quantity }) => ({ price: product.price, finalPrice: getFinalPrice(product), quantity })),
        config,
      ),
    [items, config],
  );
};
