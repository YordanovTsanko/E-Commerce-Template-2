import { QueryClient, MutationCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * Глобална обратна връзка за всички мутации (създаване/редакция/изтриване):
 *  - meta.successMessage -> зелен toast при успех
 *  - грешките автоматично се показват като червен toast (освен ако meta.silentError)
 *  - meta.invalidates -> масив от queryKey-ове за опресняване след успех
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      const { successMessage, invalidates } = mutation.options.meta || {};
      if (successMessage) {
        toast.success(typeof successMessage === 'function' ? successMessage(data, variables) : successMessage);
      }
      invalidates?.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
    },
    onError: (error, variables, context, mutation) => {
      if (!mutation.options.meta?.silentError) toast.error(error.message);
    },
  }),
});
