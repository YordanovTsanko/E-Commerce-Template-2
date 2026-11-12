import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { FaCamera, FaEnvelope, FaTrash } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { SectionTitle } from '../components/common/SectionTitle';
import { Avatar } from '../components/common/Avatar';
import { PasswordInput, validatePassword } from '../components/common/PasswordInput';
import { Panel, Input, Button, Badge, ConfirmDialog } from '../components/ui';
import { authApi, profileApi } from '../services/endpoints';
import { tokenStorage } from '../services/tokenStorage';
import { setUser } from '../store/authSlice';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';
import { formatDate, getUserName } from '../utils/format';

const SectionCard = ({ title, description, children }) => (
  <Panel className="grid gap-5">
    <div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
    </div>
    {children}
  </Panel>
);

const AvatarSection = ({ user }) => {
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  const upload = useMutation({
    mutationFn: profileApi.updateAvatar,
    meta: { successMessage: 'Профилната снимка е обновена' },
    onSuccess: ({ user: updated }) => dispatch(setUser(updated)),
  });
  const remove = useMutation({
    mutationFn: profileApi.deleteAvatar,
    meta: { successMessage: 'Профилната снимка е премахната' },
    onSuccess: ({ user: updated }) => dispatch(setUser(updated)),
  });

  return (
    <Panel className="flex flex-col items-center gap-4 text-center">
      <Avatar user={user} size="lg" />
      <div>
        <p className="text-lg font-semibold text-white">{getUserName(user)}</p>
        <p className="text-sm text-slate-400">{user.email}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Badge tone="emerald">{ROLES[user.role] || 'Потребител'}</Badge>
          <Badge>От {formatDate(user.createdAt)}</Badge>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload.mutate(file);
          e.target.value = '';
        }}
      />
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" icon={<FaCamera />} loading={upload.isPending} onClick={() => inputRef.current?.click()}>
          Смени снимката
        </Button>
        {user.avatar && (
          <Button variant="ghost" size="sm" loading={remove.isPending} onClick={() => remove.mutate()}>
            Премахни
          </Button>
        )}
      </div>
    </Panel>
  );
};

const ProfileForm = ({ user }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    address: {
      fullName: user.address?.fullName || '',
      phone: user.address?.phone || '',
      city: user.address?.city || '',
      postalCode: user.address?.postalCode || '',
      street: user.address?.street || '',
    },
  });

  const mutation = useMutation({
    mutationFn: profileApi.update,
    meta: { successMessage: 'Профилът е обновен' },
    onSuccess: ({ user: updated }) => dispatch(setUser(updated)),
  });

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const setAddress = (name) => (e) => setForm((f) => ({ ...f, address: { ...f.address, [name]: e.target.value } }));

  return (
    <form
      className="grid gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(form);
      }}
    >
      <SectionCard title="Лични данни">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Име" value={form.firstName} onChange={set('firstName')} required />
          <Input label="Фамилия" value={form.lastName} onChange={set('lastName')} />
          <Input label="Телефон" type="tel" value={form.phone} onChange={set('phone')} />
          <Input label="Имейл" value={user.email} disabled />
        </div>
      </SectionCard>

      <SectionCard title="Адрес за доставка" description="Използва се за автоматично попълване при поръчка.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Име и фамилия" value={form.address.fullName} onChange={setAddress('fullName')} />
          <Input label="Телефон" type="tel" value={form.address.phone} onChange={setAddress('phone')} />
          <Input label="Град" value={form.address.city} onChange={setAddress('city')} />
          <Input label="Пощенски код" value={form.address.postalCode} onChange={setAddress('postalCode')} />
          <Input label="Адрес" value={form.address.street} onChange={setAddress('street')} className="sm:col-span-2" />
        </div>
        <div>
          <Button type="submit" loading={mutation.isPending}>
            Запази промените
          </Button>
        </div>
      </SectionCard>
    </form>
  );
};

const PasswordForm = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState();

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
    meta: { successMessage: 'Паролата е сменена успешно' },
    onSuccess: (data) => {
      tokenStorage.set(data); // новите токени след смяна на паролата
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    },
  });

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  return (
    <SectionCard title="Смяна на парола">
      <form
        className="grid gap-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const err = validatePassword(form.newPassword) || (form.newPassword !== form.confirm ? 'Паролите не съвпадат.' : undefined);
          setError(err);
          if (!err) mutation.mutate();
        }}
      >
        <PasswordInput label="Текуща парола" autoComplete="current-password" value={form.currentPassword} onChange={set('currentPassword')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordInput label="Нова парола" autoComplete="new-password" value={form.newPassword} onChange={set('newPassword')} />
          <PasswordInput label="Повторете новата парола" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={error} />
        </div>
        <div>
          <Button type="submit" variant="outline" loading={mutation.isPending} disabled={!form.currentPassword}>
            Смени паролата
          </Button>
        </div>
      </form>
    </SectionCard>
  );
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const resend = useMutation({
    mutationFn: authApi.resendVerification,
    meta: { successMessage: (data) => data.message },
  });
  const deleteAccount = useMutation({
    mutationFn: profileApi.deleteAccount,
    meta: { successMessage: 'Акаунтът е изтрит' },
    onSuccess: () => signOut(),
  });

  return (
    <PageTransition title="Моят профил">
      <SectionTitle eyebrow="Профил" title="Моят профил" description="Управлявайте личните си данни, адреса и паролата." />

      {!user.emailVerified && (
        <Panel className="flex flex-wrap items-center justify-between gap-4 border-amber-400/30 bg-amber-400/10">
          <p className="flex items-center gap-3 text-amber-100">
            <FaEnvelope /> Имейлът ви все още не е потвърден.
          </p>
          <Button variant="secondary" size="sm" loading={resend.isPending} onClick={() => resend.mutate()}>
            Изпрати отново
          </Button>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="grid content-start gap-6">
          <AvatarSection user={user} />
          <Panel className="grid gap-3">
            <h2 className="font-semibold text-white">Опасна зона</h2>
            <p className="text-sm text-slate-400">Изтриването на профила е окончателно.</p>
            <Button variant="danger" size="sm" icon={<FaTrash size={12} />} onClick={() => setConfirmDelete(true)}>
              Изтрий профила
            </Button>
          </Panel>
        </div>
        <div className="grid content-start gap-6">
          <ProfileForm key={user.updatedAt} user={user} />
          <PasswordForm />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteAccount.mutate()}
        loading={deleteAccount.isPending}
        title="Изтриване на профила"
        message="Профилът ви ще бъде изтрит и ще излезете от системата. Сигурни ли сте?"
        confirmText="Изтрий профила"
      />
    </PageTransition>
  );
};

export default Profile;
