import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaEnvelopeOpenText } from 'react-icons/fa';
import { AuthCard } from '../components/common/AuthCard';
import { Input, Button } from '../components/ui';
import { authApi } from '../services/endpoints';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const mutation = useMutation({ mutationFn: authApi.forgotPassword });

  return (
    <AuthCard
      title="Забравена парола"
      subtitle="Ще ви изпратим връзка за нулиране на паролата"
      footer={
        <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
          Обратно към вход
        </Link>
      }
    >
      {mutation.isSuccess ? (
        <div className="grid justify-items-center gap-3 text-center">
          <FaEnvelopeOpenText size={32} className="text-emerald-300" />
          <p className="text-slate-300">{mutation.data.message}</p>
        </div>
      ) : (
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(email);
          }}
        >
          <Input label="Имейл" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" loading={mutation.isPending} className="w-full">
            Изпрати връзка
          </Button>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
