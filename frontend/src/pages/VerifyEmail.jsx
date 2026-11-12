import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { AuthCard } from '../components/common/AuthCard';
import { Button, Spinner } from '../components/ui';
import { authApi } from '../services/endpoints';
import { bootstrapAuth } from '../store/authSlice';

const VerifyEmail = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const { data, error, isLoading } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: () => authApi.verifyEmail(token),
    retry: false,
    staleTime: Infinity,
  });

  // Обновява профила (статусът става "активен")
  useEffect(() => {
    if (data) dispatch(bootstrapAuth());
  }, [data, dispatch]);

  return (
    <AuthCard title="Потвърждение на имейл">
      <div className="grid justify-items-center gap-4 text-center">
        {isLoading ? (
          <Spinner size="lg" className="text-emerald-300" />
        ) : error ? (
          <>
            <FaTimesCircle size={36} className="text-rose-300" />
            <p className="text-slate-300">{error.message}</p>
          </>
        ) : (
          <>
            <FaCheckCircle size={36} className="text-emerald-300" />
            <p className="text-slate-300">{data.message}</p>
          </>
        )}
        {!isLoading && <Button to="/">Към началото</Button>}
      </div>
    </AuthCard>
  );
};

export default VerifyEmail;
