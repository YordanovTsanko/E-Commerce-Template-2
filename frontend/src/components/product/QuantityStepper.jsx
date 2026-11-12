import { useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { UNITS } from '../../utils/constants';
import { cn } from '../../utils/format';

const round = (n) => Math.round(n * 1000) / 1000;

export const QuantityStepper = ({ value, onChange, unit = 'piece', max = Infinity, disabled = false, className = '' }) => {
  const step = UNITS[unit]?.step || 1;
  const min = step;
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const commit = (next) => {
    let parsed = Number(String(next).replace(',', '.'));
    if (!Number.isFinite(parsed) || parsed <= 0) parsed = value;
    if (unit === 'piece') parsed = Math.round(parsed);
    const clamped = Math.min(Math.max(round(parsed), min), max);
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  const btn = 'flex h-10 w-10 items-center justify-center text-slate-200 transition hover:bg-white/10 disabled:opacity-40';

  return (
    <div className={cn('inline-flex items-center overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50', className)}>
      <button type="button" className={btn} onClick={() => commit(value - step)} disabled={disabled || value <= min} aria-label="Намали">
        <FaMinus size={12} />
      </button>
      <input
        type="text"
        inputMode={unit === 'piece' ? 'numeric' : 'decimal'}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit(e.currentTarget.value)}
        className="w-16 bg-transparent text-center text-white outline-none"
        aria-label="Количество"
      />
      <button type="button" className={btn} onClick={() => commit(value + step)} disabled={disabled || value + step > max} aria-label="Увеличи">
        <FaPlus size={12} />
      </button>
    </div>
  );
};
