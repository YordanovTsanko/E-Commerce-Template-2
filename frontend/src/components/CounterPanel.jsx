import { useDispatch, useSelector } from 'react-redux';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { decrement, increment, incrementByAmount, selectCount } from '../store/counterSlice';

export const CounterPanel = () => {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-2xl shadow-black/20">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Redux Toolkit</p>
      <h2 className="mt-3 text-2xl font-bold text-white">Бърз пример за глобално състояние</h2>
      <p className="mt-3 text-slate-300">Броячът е само демо, за да имаш готов модел как да вържеш store, actions и UI.</p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center sm:min-w-40">
          <div className="text-sm text-slate-400">Стойност</div>
          <div className="text-5xl font-bold text-white">{count}</div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => dispatch(decrement())}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 font-medium text-slate-100 transition hover:bg-white/10"
          >
            <FaMinus /> -1
          </button>
          <button
            type="button"
            onClick={() => dispatch(increment())}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            <FaPlus /> +1
          </button>
          <button
            type="button"
            onClick={() => dispatch(incrementByAmount(5))}
            className="rounded-2xl border border-emerald-400/30 px-4 py-3 font-medium text-emerald-200 transition hover:bg-emerald-400/10"
          >
            +5 стойности
          </button>
        </div>
      </div>
    </section>
  );
};
