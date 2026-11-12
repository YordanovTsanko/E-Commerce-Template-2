import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FaTrash } from 'react-icons/fa';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable } from '../../components/admin/DataTable';
import { ListToolbar } from '../../components/admin/ListToolbar';
import { Avatar } from '../../components/common/Avatar';
import { Button, Select, StatusBadge, ConfirmDialog, Badge } from '../../components/ui';
import { adminApi } from '../../services/endpoints';
import { useAdminList } from '../../hooks/useAdminList';
import { useAuth } from '../../hooks/useAuth';
import { ROLES, USER_STATUSES } from '../../utils/constants';
import { formatDate, getUserName } from '../../utils/format';
import { isAdmin as isAdminUser } from '../../utils/roles';

const roleOptions = Object.entries(ROLES).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(USER_STATUSES).map(([value, s]) => ({ value, label: s.label }));
const smallSelect =
  'rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50 disabled:opacity-60';

const AdminUsers = () => {
  const { user: me, isSuperAdmin } = useAuth();
  const [toDelete, setToDelete] = useState(null);

  const list = useAdminList({
    queryKey: ['admin', 'users'],
    filterKeys: ['role', 'status'],
    fetcher: adminApi.users,
  });

  const invalidates = [['admin', 'users'], ['admin', 'stats']];
  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => adminApi.updateUserRole(id, role),
    meta: { successMessage: 'Ролята е обновена', invalidates },
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateUserStatus(id, status),
    meta: { successMessage: 'Статусът е обновен', invalidates },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    meta: { successMessage: 'Потребителят е изтрит', invalidates },
    onSuccess: () => setToDelete(null),
  });

  // Същите правила като в backend: superAdmin управлява всички, admin – само потребители
  const canManage = (target) => target._id !== me._id && (isSuperAdmin || !isAdminUser(target));
  const isRowPending = (id, mutation) => mutation.isPending && mutation.variables?.id === id;

  const columns = [
    {
      key: 'user',
      header: 'Потребител',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar user={u} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-white">
              {getUserName(u)} {u._id === me._id && <Badge tone="emerald">Вие</Badge>}
            </p>
            <p className="truncate text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'createdAt', header: 'Регистриран', render: (u) => formatDate(u.createdAt) },
    {
      key: 'role',
      header: 'Роля',
      render: (u) =>
        isSuperAdmin && canManage(u) ? (
          <select
            className={smallSelect}
            value={u.role}
            disabled={isRowPending(u._id, roleMutation)}
            onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}
            aria-label="Роля"
          >
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        ) : (
          <Badge tone={isAdminUser(u) ? 'emerald' : 'slate'}>{ROLES[u.role]}</Badge>
        ),
    },
    {
      key: 'status',
      header: 'Статус',
      render: (u) =>
        canManage(u) ? (
          <select
            className={smallSelect}
            value={u.status}
            disabled={isRowPending(u._id, statusMutation)}
            onChange={(e) => statusMutation.mutate({ id: u._id, status: e.target.value })}
            aria-label="Статус"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        ) : (
          <StatusBadge value={u.status} meta={USER_STATUSES} />
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u) =>
        isSuperAdmin && u._id !== me._id ? (
          <Button variant="danger" size="iconSm" aria-label="Изтрий" onClick={() => setToDelete(u)}>
            <FaTrash size={12} />
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Потребители"
        description={
          isSuperAdmin
            ? 'Като супер администратор можете да назначавате администратори.'
            : 'Можете да управлявате статуса на обикновените потребители.'
        }
      />

      <ListToolbar search={list.search} onSearch={list.setSearch} placeholder="Име, имейл или телефон...">
        <Select
          aria-label="Роля"
          value={list.filters.role}
          onChange={(e) => list.setFilter('role', e.target.value)}
          placeholder="Всички роли"
          options={roleOptions}
          className="sm:w-52"
        />
        <Select
          aria-label="Статус"
          value={list.filters.status}
          onChange={(e) => list.setFilter('status', e.target.value)}
          placeholder="Всички статуси"
          options={statusOptions}
          className="sm:w-44"
        />
      </ListToolbar>

      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.isLoading}
        fetching={list.isFetching}
        error={list.error}
        onRetry={list.refetch}
        pagination={list.pagination}
        onPageChange={list.setPage}
        emptyText="Няма намерени потребители."
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => deleteMutation.mutate(toDelete._id)}
        loading={deleteMutation.isPending}
        title="Изтриване на потребител"
        message={`Профилът на ${toDelete?.email} ще бъде деактивиран и изтрит.`}
      />
    </>
  );
};

export default AdminUsers;
