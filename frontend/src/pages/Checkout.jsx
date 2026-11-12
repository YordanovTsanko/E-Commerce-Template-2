import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { SectionTitle } from '../components/common/SectionTitle';
import { CartSummary } from '../components/cart/CartSummary';
import { Panel, Input, Textarea, Checkbox, Button, FullPageLoader } from '../components/ui';
import { orderApi } from '../services/endpoints';
import { selectCartItems, selectCartLoading, resetCart } from '../store/cartSlice';
import { useCartTotals } from '../hooks/useStoreConfig';
import { useAuth } from '../hooks/useAuth';
import { PAYMENT_METHODS } from '../utils/constants';
import { formatPrice, formatQuantity, getUserName, cn } from '../utils/format';
import { getFinalPrice } from '../utils/pricing';

const PAYMENT_ICONS = { cod: <FaMoneyBillWave />, card: <FaCreditCard /> };

const validate = (form) => {
  const errors = {};
  if (form.fullName.trim().length < 3) errors.fullName = 'Въведете име и фамилия.';
  if (!/^\+?[0-9\s-]{8,20}$/.test(form.phone.trim())) errors.phone = 'Въведете валиден телефон.';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Въведете валиден имейл.';
  if (form.city.trim().length < 2) errors.city = 'Въведете град.';
  if (form.postalCode.trim().length < 3) errors.postalCode = 'Въведете пощенски код.';
  if (form.street.trim().length < 3) errors.street = 'Въведете адрес.';
  return errors;
};

const Checkout = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const items = useSelector(selectCartItems);
  const cartLoading = useSelector(selectCartLoading);
  const totals = useCartTotals();

  const [form, setForm] = useState({
    fullName: user.address?.fullName || getUserName(user),
    phone: user.address?.phone || user.phone || '',
    email: user.email,
    city: user.address?.city || '',
    postalCode: user.address?.postalCode || '',
    street: user.address?.street || '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [saveAddress, setSaveAddress] = useState(true);
  const [errors, setErrors] = useState({});
  const placed = useRef(false);

  const mutation = useMutation({
    mutationFn: orderApi.create,
    meta: { successMessage: 'Поръчката е направена успешно!' },
    onSuccess: (order) => {
      placed.current = true;
      navigate(`/orders/${order._id}`, { replace: true, state: { justPlaced: true } });
      dispatch(resetCart());
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  if (cartLoading && !items.length) return <FullPageLoader label="Зареждане на количката..." />;
  if (!items.length && !placed.current) return <Navigate to="/cart" replace />;

  const field = (name) => ({
    name,
    value: form[name],
    error: errors[name],
    onChange: (e) => {
      setForm((f) => ({ ...f, [name]: e.target.value }));
      if (errors[name]) setErrors((err) => ({ ...err, [name]: undefined }));
    },
  });

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    mutation.mutate({ shippingAddress: form, paymentMethod, saveAddress });
  };

  return (
    <PageTransition title="Поръчка">
      <SectionTitle eyebrow="Завършване на поръчката" title="Доставка и плащане" />

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_380px]" noValidate>
        <div className="grid content-start gap-6">
          <Panel className="grid gap-4">
            <h2 className="text-xl font-semibold text-white">Адрес за доставка</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Име и фамилия *" autoComplete="name" {...field('fullName')} />
              <Input label="Телефон *" type="tel" autoComplete="tel" placeholder="+359 888 123 456" {...field('phone')} />
              <Input label="Имейл *" type="email" autoComplete="email" {...field('email')} className="sm:col-span-2" />
              <Input label="Град *" autoComplete="address-level2" {...field('city')} />
              <Input label="Пощенски код *" autoComplete="postal-code" {...field('postalCode')} />
              <Input label="Адрес (улица, номер, етаж) *" autoComplete="street-address" {...field('street')} className="sm:col-span-2" />
              <Textarea label="Бележка към поръчката" rows={3} {...field('notes')} className="sm:col-span-2" />
            </div>
            <Checkbox label="Запази адреса в профила ми" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
          </Panel>

          <Panel className="grid gap-4">
            <h2 className="text-xl font-semibold text-white">Начин на плащане</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(PAYMENT_METHODS).map(([value, method]) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer gap-4 rounded-3xl border p-4 transition',
                    paymentMethod === value ? 'border-emerald-400/60 bg-emerald-400/10' : 'border-white/10 bg-slate-950/40 hover:border-white/20',
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="mt-1 accent-emerald-400"
                  />
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-white">
                      <span className="text-emerald-300">{PAYMENT_ICONS[value]}</span> {method.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </Panel>
        </div>

        <CartSummary totals={totals} title="Вашата поръчка">
          <ul className="grid max-h-64 gap-3 overflow-y-auto border-y border-white/10 py-4">
            {items.map(({ product, quantity }) => (
              <li key={product._id} className="flex justify-between gap-3 text-sm">
                <span className="text-slate-300">
                  {product.name} <span className="text-slate-500">× {formatQuantity(quantity, product.unit)}</span>
                </span>
                <span className="shrink-0 font-medium text-white">{formatPrice(getFinalPrice(product) * quantity)}</span>
              </li>
            ))}
          </ul>
          <Button type="submit" loading={mutation.isPending} className="w-full">
            Потвърди поръчката
          </Button>
          <Button to="/cart" variant="secondary" className="w-full">
            Обратно към количката
          </Button>
        </CartSummary>
      </form>
    </PageTransition>
  );
};

export default Checkout;
