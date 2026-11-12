import { motion } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { SectionTitle } from '../components/SectionTitle';

const items = [
  'Добра папкова структура: pages, components и store.',
  'Всички компоненти са написани като arrow functions.',
  'Лесен за разширяване старт за реален бизнес сайт.',
  'Подходящ за бъдещи секции, форми и CMS интеграции.',
];

export const About = () => {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.25 }} className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <SectionTitle
        eyebrow="За проекта"
        title="Подреден старт за истинско приложение"
        description="Този frontend е организиран така, че да можеш лесно да добавяш нови страници, компоненти и логика без да губиш четимост."
      />

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <FaCheckCircle className="mt-1 shrink-0 text-emerald-300" />
              <p className="text-slate-200">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
