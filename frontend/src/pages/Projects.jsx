import { motion } from 'framer-motion';
import { FaSeedling, FaGlobeEurope, FaServer } from 'react-icons/fa';
import { SectionTitle } from '../components/SectionTitle';
import { FeatureCard } from '../components/FeatureCard';

const projects = [
  {
    icon: <FaSeedling size={20} />,
    title: 'Еко платформа',
    text: 'Страница за устойчиви инициативи, кампании и съдържание за зелен начин на живот.',
  },
  {
    icon: <FaGlobeEurope size={20} />,
    title: 'Многоезичен сайт',
    text: 'Подходяща основа за бъдещо добавяне на още езици и локализация.',
  },
  {
    icon: <FaServer size={20} />,
    title: 'Админ панел',
    text: 'Добър старт за статистики, CRUD екрани и управление на съдържание.',
  },
];

export const Projects = () => {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.25 }} className="grid gap-8">
      <SectionTitle
        eyebrow="Проекти"
        title="Примерни секции, които можеш да развиеш"
        description="Тук са подготвени примерни карти, за да е ясно как да изглеждат бъдещите страници и блокове."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((project, index) => (
          <FeatureCard key={project.title} delay={index * 0.05} {...project} />
        ))}
      </div>
    </motion.section>
  );
};
