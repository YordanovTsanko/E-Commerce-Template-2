import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/common/AuthCard';
import { PasswordInput } from '../components/common/PasswordInput';
import { Input, Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { signIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });

  const submit = async (e) => {
    e.preventDefault();
    const user = await signIn(form);
    if (user) navigate(location.state?.from?.pathname || '/', { replace: true });
  };

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  return (
    <AuthCard
      title="Вход"
      subtitle="Влезте в профила си, за да продължите"
      footer={
        <>
          Нямате профил?{' '}
          <Link to="/register" state={location.state} className="font-semibold text-emerald-300 hover:text-emerald-200">
            Регистрирайте се
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <Input label="Имейл" type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        <PasswordInput label="Парола" autoComplete="current-password" required value={form.password} onChange={set('password')} />
        <Link to="/forgot-password" className="justify-self-end text-sm text-emerald-300 hover:text-emerald-200">
          Забравена парола?
        </Link>
        <Button type="submit" loading={loading} className="w-full">
          Вход
        </Button>
      </form>
    </AuthCard>
  );
};

export default Login;
