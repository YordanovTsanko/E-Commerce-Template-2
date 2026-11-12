import { motion } from 'framer-motion';
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { SectionTitle } from '../components/SectionTitle';

const contactItems = [
  { icon: <FaEnvelope />, label: 'Имейл', value: 'hello@ecokoren.bg' },
  { icon: <FaPhoneAlt />, label: 'Телефон', value: '+359 888 123 456' },
  { icon: <FaMapMarkerAlt />, label: 'Локация', value: 'София, България' },
];

export const Contact = () => {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.25 }} className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <SectionTitle
        eyebrow="Контакт"
        title="Нека добавим следващата част от сайта"
        description="Формата е примерна, но дизайнът и структурата са готови за реална интеграция с backend или service като EmailJS."
      />

      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {contactItems.map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">{item.icon}</div>
              <p className="mt-4 text-sm text-slate-400">{item.label}</p>
              <p className="mt-1 text-base font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <form className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-slate-300">
              Име
              <input type="text" placeholder="Вашето име" className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/50" />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              Имейл
              <input type="email" placeholder="your@email.com" className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/50" />
            </label>
          </div>
          <label className="mt-4 grid gap-2 text-sm text-slate-300">
            Съобщение
            <textarea rows="5" placeholder="Напишете съобщението си..." className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/50" />
          </label>
          <button type="button" className="mt-5 rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300">
            Изпрати съобщение
          </button>
        </form>
      </div>
    </motion.section>
  );
};
