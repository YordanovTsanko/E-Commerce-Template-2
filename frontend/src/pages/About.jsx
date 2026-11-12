import { FaCheckCircle } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { SectionTitle } from '../components/common/SectionTitle';
import { Panel } from '../components/ui';
import { SITE } from '../config/site';

const items = [
  'Внимателно подбрани продукти от доверени доставчици.',
  'Бърза доставка до всеки адрес в страната.',
  'Сигурно пазаруване и защитени лични данни.',
  'Лесно връщане и отзивчиво обслужване на клиенти.',
];

const About = () => (
  <PageTransition title="За нас" className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
    <SectionTitle
      eyebrow="За нас"
      title={`Добре дошли в ${SITE.name}`}
      description="Създадохме този магазин с една цел – да направим онлайн пазаруването лесно, бързо и приятно. Всеки продукт е подбран с грижа, а всяка поръчка – обработена с внимание."
    />

    <Panel>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-slate-950/40 p-4">
            <FaCheckCircle className="mt-1 shrink-0 text-emerald-300" />
            <p className="text-slate-200">{item}</p>
          </div>
        ))}
      </div>
    </Panel>
  </PageTransition>
);

export default About;
