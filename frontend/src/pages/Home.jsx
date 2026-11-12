import { Link } from 'react-router-dom';
import { FaBolt, FaLeaf, FaMobileAlt, FaPalette } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { SectionTitle } from '../components/SectionTitle';
import { FeatureCard } from '../components/FeatureCard';
import { CounterPanel } from '../components/CounterPanel';

const features = [
  {
    icon: <FaLeaf size={20} />,
    title: 'Чиста основа',
    text: 'Добра структура с отделни папки за страници и компоненти, за да се разраства проектът без хаос.',
  },
  {
    icon: <FaBolt size={20} />,
    title: 'Анимации',
    text: 'Framer Motion добавя плавни преходи и по-живо усещане при зареждане и скрол.',
  },
  {
    icon: <FaMobileAlt size={20} />,
    title: 'Responsive дизайн',
    text: 'Layout-ът работи добре на мобилен, таблет и desktop с адаптивни grid и flex решения.',
  },
  {
    icon: <FaPalette size={20} />,
    title: 'Български интерфейс',
    text: 'Текстовете, навигацията и CTA бутоните са изцяло на български език.',
  },
];

export const Home = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="grid gap-10 lg:gap-14">
      <section className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionTitle
            eyebrow="EcoKoren-Yordanov"
            title="Готов frontend старт с ясна структура и модерен стек"
            description="Тук всичко е подредено за лесно надграждане: отделни страници, отделни компоненти, глобално състояние и адаптивен UI."
          />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/projects" className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300">
              Виж проектите
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-3 font-medium text-slate-100 transition hover:bg-white/10">
              Свържи се с нас
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <div className="text-sm text-slate-400">Създадено с</div>
              <div className="mt-2 text-2xl font-bold text-white">Vite + React</div>
            </div>
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <div className="text-sm text-slate-400">Стил</div>
              <div className="mt-2 text-2xl font-bold text-white">Tailwind v4</div>
            </div>
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <div className="text-sm text-slate-400">Навигация</div>
              <div className="mt-2 text-2xl font-bold text-white">React Router</div>
            </div>
            <div className="rounded-3xl bg-slate-950/50 p-5">
              <div className="text-sm text-slate-400">Състояние</div>
              <div className="mt-2 text-2xl font-bold text-white">Redux Toolkit</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} delay={index * 0.05} {...feature} />
          ))}
        </div>
      </section>

      <CounterPanel />
    </motion.div>
  );
};
