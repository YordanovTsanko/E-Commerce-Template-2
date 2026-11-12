import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FaEdit, FaPlus, FaTrash, FaStar, FaImage } from 'react-icons/fa';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable } from '../../components/admin/DataTable';
import { ListToolbar } from '../../components/admin/ListToolbar';
import { Button, Badge, Select, ConfirmDialog } from '../../components/ui';
import { PriceTag } from '../../components/product/PriceTag';
import { productApi, categoryApi } from '../../services/endpoints';
import { useAdminList } from '../../hooks/useAdminList';
import { formatQuantity } from '../../utils/format';
import { optimizeImage } from '../../utils/image';

const STATUS_OPTIONS = [
  { value: 'true', label: 'Само активни' },
  { value: 'false', label: 'Само неактивни' },
];

const AdminProducts = () => {
  const [toDelete, setToDelete] = useState(null);
  const categories = useQuery({ queryKey: ['categories', 'all'], queryFn: () => categoryApi.list({ all: 'true' }) });

  const list = useAdminList({
    queryKey: ['products', 'admin'],
    filterKeys: ['category', 'isActive'],
    fetcher: (params) => productApi.list({ ...params, isActive: params.isActive || 'all' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.remove(id),
    meta: { successMessage: 'Продуктът е изтрит', invalidates: [['products'], ['admin', 'stats']] },
    onSuccess: () => setToDelete(null),
  });

  const columns = [
    {
      key: 'name',
      header: 'Продукт',
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.images?.[0]?.url ? (
            <img src={optimizeImage(p.images[0].url, 100)} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950/60 text-slate-600">
              <FaImage />
            </span>
          )}
          <div className="min-w-0">
            <p className="line-clamp-1 font-medium text-white">{p.name}</p>
            {p.brand && <p className="text-xs text-slate-500">{p.brand}</p>}
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Категория', render: (p) => p.category?.name || <span className="text-slate-500">—</span> },
    { key: 'price', header: 'Цена', render: (p) => <PriceTag product={p} size="sm" showUnit={false} /> },
    {
      key: 'stock',
      header: 'Наличност',
      render: (p) => (
        <span className={p.stock === 0 ? 'text-rose-300' : p.stock <= 5 ? 'text-amber-300' : ''}>{formatQuantity(p.stock, p.unit)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          <Badge tone={p.isActive ? 'emerald' : 'slate'}>{p.isActive ? 'Активен' : 'Скрит'}</Badge>
          {p.isFeatured && (
            <Badge tone="amber">
              <FaStar size={10} /> Препоръчан
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-2">
          <Button to={`/admin/products/${p._id}/edit`} variant="secondary" size="iconSm" aria-label="Редактирай">
            <FaEdit size={14} />
          </Button>
          <Button variant="danger" size="iconSm" aria-label="Изтрий" onClick={() => setToDelete(p)}>
            <FaTrash size={12} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Продукти"
        description="Добавяйте, редактирайте и изтривайте продукти."
        actions={
          <Button to="/admin/products/new" icon={<FaPlus />}>
            Нов продукт
          </Button>
        }
      />

      <ListToolbar search={list.search} onSearch={list.setSearch} placeholder="Търсене по име, марка, етикет...">
        <Select
          aria-label="Категория"
          value={list.filters.category}
          onChange={(e) => list.setFilter('category', e.target.value)}
          placeholder="Всички категории"
          options={(categories.data || []).map((c) => ({ value: c._id, label: c.name }))}
          className="sm:w-52"
        />
        <Select
          aria-label="Статус"
          value={list.filters.isActive}
          onChange={(e) => list.setFilter('isActive', e.target.value)}
          placeholder="Всички статуси"
          options={STATUS_OPTIONS}
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
        emptyText="Няма продукти. Добавете първия си продукт!"
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => deleteMutation.mutate(toDelete._id)}
        loading={deleteMutation.isPending}
        title="Изтриване на продукт"
        message={`„${toDelete?.name}“ ще бъде изтрит заедно със снимките му в Cloudinary. Действието е необратимо.`}
      />
    </>
  );
};

export default AdminProducts;
