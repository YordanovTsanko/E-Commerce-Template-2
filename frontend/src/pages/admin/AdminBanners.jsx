import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { DataTable } from '../../components/admin/DataTable';
import { ImageDropzone } from '../../components/admin/ImageDropzone';
import { Button, Badge, Modal, Input, Checkbox, ConfirmDialog } from '../../components/ui';
import { bannerApi } from '../../services/endpoints';
import { useImageEntityForm } from '../../hooks/useImageEntityForm';
import { optimizeImage } from '../../utils/image';

const EMPTY = { title: '', subtitle: '', buttonText: '', link: '', sortOrder: '0', isActive: true };

const AdminBanners = () => {
  const { data = [], isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['banners', 'all'],
    queryFn: () => bannerApi.list({ all: 'true' }),
  });

  const f = useImageEntityForm({
    empty: EMPTY,
    toForm: (b) => ({
      title: b.title,
      subtitle: b.subtitle || '',
      buttonText: b.buttonText || '',
      link: b.link || '',
      sortOrder: String(b.sortOrder ?? 0),
      isActive: b.isActive,
    }),
    api: bannerApi,
    invalidates: [['banners']],
    labels: { created: 'Банерът е създаден', updated: 'Банерът е обновен', deleted: 'Банерът е изтрит' },
  });

  const columns = [
    {
      key: 'image',
      header: 'Банер',
      render: (b) => (
        <div className="flex items-center gap-3">
          <img src={optimizeImage(b.image?.url, 200)} alt="" className="h-12 w-20 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="line-clamp-1 font-medium text-white">{b.title}</p>
            {b.subtitle && <p className="line-clamp-1 text-xs text-slate-500">{b.subtitle}</p>}
          </div>
        </div>
      ),
    },
    { key: 'link', header: 'Линк', render: (b) => b.link || <span className="text-slate-500">—</span> },
    { key: 'sortOrder', header: 'Подредба' },
    { key: 'isActive', header: 'Статус', render: (b) => <Badge tone={b.isActive ? 'emerald' : 'slate'}>{b.isActive ? 'Активен' : 'Скрит'}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (b) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="iconSm" aria-label="Редактирай" onClick={() => f.open(b)}>
            <FaEdit size={14} />
          </Button>
          <Button variant="danger" size="iconSm" aria-label="Изтрий" onClick={() => f.setToDelete(b)}>
            <FaTrash size={12} />
          </Button>
        </div>
      ),
    },
  ];

  const submit = (e) => {
    e.preventDefault();
    if (!f.file && !f.currentImage) {
      toast.error('Добавете изображение за банера.');
      return;
    }
    f.save.mutate(f.form);
  };

  return (
    <>
      <AdminPageHeader
        title="Банери"
        description="Слайдове на началната страница. Ако няма активни банери, се показва стандартният блок."
        actions={
          <Button icon={<FaPlus />} onClick={() => f.open()}>
            Нов банер
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
        emptyText="Няма банери."
      />

      <Modal
        open={Boolean(f.editing)}
        onClose={f.save.isPending ? undefined : f.close}
        title={f.isEdit ? 'Редакция на банер' : 'Нов банер'}
        footer={
          <>
            <Button variant="secondary" onClick={f.close} disabled={f.save.isPending}>
              Отказ
            </Button>
            <Button type="submit" form="banner-form" loading={f.save.isPending}>
              Запази
            </Button>
          </>
        }
      >
        <form id="banner-form" onSubmit={submit} className="grid gap-4">
          <Input label="Заглавие *" required maxLength={120} value={f.form.title} onChange={f.set('title')} />
          <Input label="Подзаглавие" maxLength={300} value={f.form.subtitle} onChange={f.set('subtitle')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Текст на бутона" maxLength={40} value={f.form.buttonText} onChange={f.set('buttonText')} />
            <Input label="Линк" placeholder="/shop?onSale=true" value={f.form.link} onChange={f.set('link')} />
          </div>
          <Input label="Подредба" type="number" value={f.form.sortOrder} onChange={f.set('sortOrder')} />
          <Checkbox label="Активен" checked={f.form.isActive} onChange={f.set('isActive')} />
          <ImageDropzone
            label="Изображение * (препоръчително 1600×1000)"
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
        title="Изтриване на банер"
        message={`Банерът „${f.toDelete?.title}“ ще бъде изтрит заедно със снимката в Cloudinary.`}
      />
    </>
  );
};

export default AdminBanners;
