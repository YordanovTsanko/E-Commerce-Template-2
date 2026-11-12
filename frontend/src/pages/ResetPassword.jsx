import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthCard } from '../components/common/AuthCard';
import { PasswordInput, validatePassword } from '../components/common/PasswordInput';
import { Button } from '../components/ui';
import { authApi } from '../services/endpoints';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState();

  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword(token, password),
    meta: { successMessage: (data) => data.message },
    onSuccess: () => navigate('/login', { replace: true }),
  });

  const submit = (e) => {
    e.preventDefault();
    const err = validatePassword(password) || (password !== confirm ? 'Паролите не съвпадат.' : undefined);
    setError(err);
    if (!err) mutation.mutate();
  };

  return (
    <AuthCard title="Нова парола" subtitle="Въведете новата си парола">
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <PasswordInput label="Нова парола" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="Поне 8 символа и една цифра" />
        <PasswordInput label="Повторете паролата" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={error} />
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Запази паролата
        </Button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
