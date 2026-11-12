import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FaArrowLeft } from 'react-icons/fa';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { ImageDropzone } from '../../components/admin/ImageDropzone';
import { Panel, Input, Textarea, Select, Checkbox, Button, FullPageLoader, ErrorState } from '../../components/ui';
import { productApi, categoryApi } from '../../services/endpoints';
import { UNITS } from '../../utils/constants';

const MAX_IMAGES = 8;

const EMPTY = {
  name: '',
  description: '',
  price: '',
  salePrice: '',
  category: '',
  brand: '',
  unit: 'piece',
  stock: '',
  tags: '',
  features: '',
  isActive: true,
  isFeatured: false,
};

const fromProduct = (p) => ({
  name: p.name,
  description: p.description,
  price: String(p.price),
  salePrice: p.salePrice ?? '',
  category: p.category?._id || p.category || '',
  brand: p.brand || '',
  unit: p.unit,
  stock: String(p.stock),
  tags: (p.tags || []).join(', '),
  features: (p.features || []).join('\n'),
  isActive: p.isActive,
  isFeatured: p.isFeatured,
});

const validate = (form, imageCount) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Въведете заглавие.';
  if (!form.description.trim()) errors.description = 'Въведете описание.';
  const price = Number(String(form.price).replace(',', '.'));
  if (!form.price || !Number.isFinite(price) || price < 0) errors.price = 'Въведете валидна цена.';
  if (form.salePrice !== '') {
    const sale = Number(String(form.salePrice).replace(',', '.'));
    if (!Number.isFinite(sale) || sale < 0) errors.salePrice = 'Невалидна цена.';
    else if (sale >= price) errors.salePrice = 'Трябва да е по-ниска от редовната цена.';
  }
  if (form.stock === '' || Number(form.stock) < 0) errors.stock = 'Въведете наличност (0 или повече).';
  if (form.unit === 'piece' && form.stock !== '' && !Number.isInteger(Number(form.stock))) errors.stock = 'За бройки – цяло число.';
  if (imageCount === 0) errors.images = 'Добавете поне едно изображение.';
  return errors;
};

const AdminProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [errors, setErrors] = useState({});

  const categories = useQuery({ queryKey: ['categories', 'all'], queryFn: () => categoryApi.list({ all: 'true' }) });
  const productQuery = useQuery({
    queryKey: ['product', 'admin', id],
    queryFn: () => productApi.get(id),
    enabled: isEdit,
    staleTime: 0,
  });

  useEffect(() => {
    if (productQuery.data) {
      setForm(fromProduct(productQuery.data));
      setExistingImages(productQuery.data.images || []);
      setNewFiles([]);
    }
  }, [productQuery.data]);

  const mutation = useMutation({
    mutationFn: (values) => (isEdit ? productApi.update(id, values, newFiles) : productApi.create(values, newFiles)),
    meta: {
      successMessage: isEdit ? 'Продуктът е обновен' : 'Продуктът е създаден',
      invalidates: [['products'], ['product'], ['admin', 'stats'], ['categories']],
    },
    onSuccess: () => navigate('/admin/products'),
  });

  const set = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((err) => ({ ...err, [name]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form, existingImages.length + newFiles.length);
    setErrors(found);
    if (Object.keys(found).length) return;

    const values = {
      ...form,
      price: String(form.price).replace(',', '.'),
      salePrice: form.salePrice === '' ? null : String(form.salePrice).replace(',', '.'),
      category: form.category || null,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      features: form.features.split('\n').map((f) => f.trim()).filter(Boolean),
      ...(isEdit && { existingImages: existingImages.map((img) => img.publicId || img.url) }),
    };
    mutation.mutate(values);
  };

  if (isEdit && productQuery.isLoading) return <FullPageLoader label="Зареждане на продукта..." />;
  if (isEdit && productQuery.error) return <ErrorState error={productQuery.error} onRetry={productQuery.refetch} />;

  return (
    <>
      <AdminPageHeader
        title={isEdit ? 'Редакция на продукт' : 'Нов продукт'}
        actions={
          <Button to="/admin/products" variant="secondary" icon={<FaArrowLeft />}>
            Назад
          </Button>
        }
      />

      <form onSubmit={submit} noValidate className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-w-0 content-start gap-6">
          <Panel className="grid gap-4 p-4 sm:p-6">
            <Input label="Заглавие *" value={form.name} onChange={set('name')} error={errors.name} maxLength={150} />
            <Textarea label="Описание *" rows={6} value={form.description} onChange={set('description')} error={errors.description} maxLength={5000} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Марка" value={form.brand} onChange={set('brand')} />
              <Input label="Етикети" value={form.tags} onChange={set('tags')} hint="Разделени със запетая (за търсене)" />
            </div>
            <Textarea
              label="Характеристики"
              rows={4}
              value={form.features}
              onChange={set('features')}
              hint="Всяка характеристика на нов ред"
            />
          </Panel>

          <Panel className="p-4 sm:p-6">
            <ImageDropzone
              existing={existingImages}
              onRemoveExisting={(img) => setExistingImages((list) => list.filter((i) => i !== img))}
              files={newFiles}
              onFilesChange={(files) => {
                setNewFiles(files);
                setErrors((err) => ({ ...err, images: undefined }));
              }}
              maxFiles={MAX_IMAGES}
              label="Изображения * (първото е основно)"
            />
            {errors.images && <p className="mt-2 text-xs text-rose-300">{errors.images}</p>}
            <p className="mt-3 text-xs text-slate-500">
              Снимките се качват в Cloudinary (папка E-Commerce-Template-2/products). Премахнатите се изтриват автоматично при запис.
            </p>
          </Panel>
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <Panel className="grid gap-4 p-4 sm:p-6">
            <h2 className="font-semibold text-white">Цена и наличност</h2>
            <Input label="Цена *" inputMode="decimal" value={form.price} onChange={set('price')} error={errors.price} placeholder="0.00" />
            <Input
              label="Промоционална цена"
              inputMode="decimal"
              value={form.salePrice}
              onChange={set('salePrice')}
              error={errors.salePrice}
              hint="Оставете празно, ако няма промоция"
            />
            <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
              <Input label="Наличност *" inputMode="decimal" value={form.stock} onChange={set('stock')} error={errors.stock} />
              <Select
                label="Мерна единица"
                value={form.unit}
                onChange={set('unit')}
                options={Object.entries(UNITS).map(([value, u]) => ({ value, label: u.long }))}
              />
            </div>
          </Panel>

          <Panel className="grid gap-4 p-4 sm:p-6">
            <h2 className="font-semibold text-white">Организация</h2>
            <Select
              label="Категория"
              value={form.category}
              onChange={set('category')}
              placeholder="Без категория"
              options={(categories.data || []).map((c) => ({ value: c._id, label: c.name }))}
            />
            <Checkbox label="Активен (видим в магазина)" checked={form.isActive} onChange={set('isActive')} />
            <Checkbox label="Препоръчан (показва се на началната страница)" checked={form.isFeatured} onChange={set('isFeatured')} />
          </Panel>

          <Button type="submit" loading={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Качване и запис...' : isEdit ? 'Запази промените' : 'Създай продукта'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default AdminProductForm;
