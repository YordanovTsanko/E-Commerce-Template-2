import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/common/AuthCard';
import { PasswordInput, validatePassword } from '../components/common/PasswordInput';
import { Input, Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const set = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = {
      firstName: form.firstName.trim() ? undefined : 'Името е задължително.',
      password: validatePassword(form.password),
      confirm: form.password !== form.confirm ? 'Паролите не съвпадат.' : undefined,
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    const { confirm, ...payload } = form;
    const user = await signUp(payload);
    if (user) navigate(location.state?.from?.pathname || '/', { replace: true });
  };

  return (
    <AuthCard
      title="Регистрация"
      subtitle="Създайте профил за по-бързо пазаруване"
      footer={
        <>
          Вече имате профил?{' '}
          <Link to="/login" state={location.state} className="font-semibold text-emerald-300 hover:text-emerald-200">
            Влезте
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Име *" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
          <Input label="Фамилия" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} />
        </div>
        <Input label="Имейл *" type="email" autoComplete="email" value={form.email} onChange={set('email')} />
        <PasswordInput
          label="Парола *"
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="Поне 8 символа и една цифра"
        />
        <PasswordInput
          label="Повторете паролата *"
          autoComplete="new-password"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />
        <Button type="submit" loading={loading} className="w-full">
          Създай профил
        </Button>
      </form>
    </AuthCard>
  );
};

export default Register;
