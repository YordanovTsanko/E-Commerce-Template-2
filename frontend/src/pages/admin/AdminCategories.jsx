import { useQuery } from '@tanstack/react-query';
import { FaEdit, FaPlus, FaTrash, FaTags } from 'react-icons/fa';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable } from '../../components/admin/DataTable';
import { ImageDropzone } from '../../components/admin/ImageDropzone';
import { Button, Badge, Modal, Input, Textarea, Checkbox, ConfirmDialog } from '../../components/ui';
import { categoryApi } from '../../services/endpoints';
import { useImageEntityForm } from '../../hooks/useImageEntityForm';
import { optimizeImage } from '../../utils/image';

const EMPTY = { name: '', description: '', sortOrder: '0', isActive: true };

const AdminCategories = () => {
  const { data = [], isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoryApi.list({ all: 'true' }),
  });

  const f = useImageEntityForm({
    empty: EMPTY,
    toForm: (c) => ({ name: c.name, description: c.description || '', sortOrder: String(c.sortOrder ?? 0), isActive: c.isActive }),
    api: categoryApi,
    invalidates: [['categories'], ['products']],
    labels: { created: 'Категорията е създадена', updated: 'Категорията е обновена', deleted: 'Категорията е изтрита' },
  });

  const columns = [
    {
      key: 'name',
      header: 'Категория',
      render: (c) => (
        <div className="flex items-center gap-3">
          {c.image?.url ? (
            <img src={optimizeImage(c.image.url, 100)} alt="" className="h-11 w-11 rounded-xl object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <FaTags />
            </span>
          )}
          <div>
            <p className="font-medium text-white">{c.name}</p>
            <p className="text-xs text-slate-500">/{c.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'productCount', header: 'Продукти' },
    { key: 'sortOrder', header: 'Подредба' },
    { key: 'isActive', header: 'Статус', render: (c) => <Badge tone={c.isActive ? 'emerald' : 'slate'}>{c.isActive ? 'Активна' : 'Скрита'}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="iconSm" aria-label="Редактирай" onClick={() => f.open(c)}>
            <FaEdit size={14} />
          </Button>
          <Button variant="danger" size="iconSm" aria-label="Изтрий" onClick={() => f.setToDelete(c)}>
            <FaTrash size={12} />
          </Button>
        </div>
      ),
    },
  ];

  const submit = (e) => {
    e.preventDefault();
    f.save.mutate({ ...f.form, ...(f.removeImage && !f.file && { removeImage: true }) });
  };

  return (
    <>
      <AdminPageHeader
        title="Категории"
        description="Организирайте продуктите в категории."
        actions={
          <Button icon={<FaPlus />} onClick={() => f.open()}>
            Нова категория
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data}
        loading={isLoading}
        fetching={isFetching}
        error={error}
        onRetry={refetch}
        emptyText="Няма категории. Създайте първата!"
      />

      <Modal
        open={Boolean(f.editing)}
        onClose={f.save.isPending ? undefined : f.close}
        title={f.isEdit ? 'Редакция на категория' : 'Нова категория'}
        footer={
          <>
            <Button variant="secondary" onClick={f.close} disabled={f.save.isPending}>
              Отказ
            </Button>
            <Button type="submit" form="category-form" loading={f.save.isPending}>
              Запази
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={submit} className="grid gap-4">
          <Input label="Име *" required maxLength={80} value={f.form.name} onChange={f.set('name')} />
          <Textarea label="Описание" rows={3} maxLength={500} value={f.form.description} onChange={f.set('description')} />
          <Input label="Подредба" type="number" value={f.form.sortOrder} onChange={f.set('sortOrder')} hint="По-малкото число е по-напред" />
          <Checkbox label="Активна (видима в магазина)" checked={f.form.isActive} onChange={f.set('isActive')} />
          <ImageDropzone
            label="Изображение"
            multiple={false}
            existing={f.currentImage ? [f.currentImage] : []}
            onRemoveExisting={f.removeCurrentImage}
            files={f.file ? [f.file] : []}
            onFilesChange={(files) => f.setFile(files[0] || null)}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(f.toDelete)}
        onClose={() => f.setToDelete(null)}
        onConfirm={() => f.remove.mutate(f.toDelete._id)}
        loading={f.remove.isPending}
        title="Изтриване на категория"
        message={`Категорията „${f.toDelete?.name}“ ще бъде изтрита. Категория с продукти не може да бъде изтрита.`}
      />
    </>
  );
};

export default AdminCategories;
