import { useLocation } from 'react-router-dom';
import { FaCompass } from 'react-icons/fa';
import { PageTransition } from '../components/common/PageTransition';
import { Button, Panel } from '../components/ui';

const NotFound = ({ title = 'Страницата не е намерена' }) => {
  const { pathname } = useLocation();

  return (
    <PageTransition title="404" className="grid min-h-[55vh] place-items-center">
      <Panel className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-300">
          <FaCompass size={28} />
        </div>
        <p className="mt-6 bg-gradient-to-b from-emerald-200 to-emerald-500 bg-clip-text text-7xl font-black tracking-tight text-transparent sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        <p className="mt-3 text-slate-400">
          Адресът <span className="break-all font-mono text-emerald-200">{pathname}</span> не съществува или е бил преместен.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/">Към началото</Button>
          <Button to="/shop" variant="secondary">
            Разгледай магазина
          </Button>
        </div>
      </Panel>
    </PageTransition>
  );
};

export default NotFound;
