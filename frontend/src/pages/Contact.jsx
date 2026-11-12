import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { SectionTitle } from '../components/common/SectionTitle';
import { Panel, Card, Input, Textarea, Button } from '../components/ui';
import { contactApi } from '../services/endpoints';
import { useAuth } from '../hooks/useAuth';
import { getUserName } from '../utils/format';
import { SITE } from '../config/site';

const contactItems = [
  { icon: <FaEnvelope />, label: 'Имейл', value: SITE.contacts.email, href: `mailto:${SITE.contacts.email}` },
  { icon: <FaPhoneAlt />, label: 'Телефон', value: SITE.contacts.phone, href: `tel:${SITE.contacts.phone.replace(/\s/g, '')}` },
  { icon: <FaMapMarkerAlt />, label: 'Локация', value: SITE.contacts.location },
];

const Contact = () => {
  const { user } = useAuth();
  const empty = { name: user ? getUserName(user) : '', email: user?.email || '', message: '' };
  const [form, setForm] = useState(empty);

  const mutation = useMutation({
    mutationFn: contactApi.send,
    meta: { successMessage: (data) => data.message },
    onSuccess: () => setForm({ ...empty, message: '' }),
  });

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  return (
    <PageTransition title="Контакт" className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <SectionTitle
        eyebrow="Контакт"
        title="Свържете се с нас"
        description="Имате въпрос за продукт или поръчка? Пишете ни и ще отговорим възможно най-бързо."
      />

      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {contactItems.map((item) => (
            <Card key={item.label} className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">{item.icon}</div>
              <p className="mt-4 text-sm text-slate-400">{item.label}</p>
              {item.href ? (
                <a href={item.href} className="mt-1 block break-words text-base font-medium text-white hover:text-emerald-200">
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 text-base font-medium text-white">{item.value}</p>
              )}
            </Card>
          ))}
        </div>

        <Panel
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Име" placeholder="Вашето име" required minLength={2} value={form.name} onChange={set('name')} />
            <Input label="Имейл" type="email" placeholder="your@email.com" required value={form.email} onChange={set('email')} />
          </div>
          <Textarea
            label="Съобщение"
            rows={5}
            placeholder="Напишете съобщението си..."
            required
            minLength={10}
            value={form.message}
            onChange={set('message')}
            className="mt-4"
          />
          <Button type="submit" loading={mutation.isPending} className="mt-5">
            Изпрати съобщение
          </Button>
        </Panel>
      </div>
    </PageTransition>
  );
};

export default Contact;
