import { forwardRef } from 'react';
import { cn } from '../../utils/format';

export const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400/50 disabled:opacity-60';

const Wrapper = ({ label, error, hint, className, children }) => (
  <label className={cn('grid gap-2 text-sm text-slate-300', className)}>
    {label && <span>{label}</span>}
    {children}
    {error ? <span className="text-xs text-rose-300">{error}</span> : hint && <span className="text-xs text-slate-500">{hint}</span>}
  </label>
);

export const Input = forwardRef(({ label, error, hint, className, inputClassName, ...props }, ref) => (
  <Wrapper label={label} error={error} hint={hint} className={className}>
    <input ref={ref} className={cn(inputClass, error && 'border-rose-400/50', inputClassName)} {...props} />
  </Wrapper>
));
Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, hint, className, rows = 4, ...props }, ref) => (
  <Wrapper label={label} error={error} hint={hint} className={className}>
    <textarea ref={ref} rows={rows} className={cn(inputClass, error && 'border-rose-400/50')} {...props} />
  </Wrapper>
));
Textarea.displayName = 'Textarea';

export const Select = forwardRef(({ label, error, hint, className, options = [], placeholder, children, ...props }, ref) => (
  <Wrapper label={label} error={error} hint={hint} className={className}>
    <select ref={ref} className={cn(inputClass, 'appearance-none pr-10', error && 'border-rose-400/50')} {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
      {children}
    </select>
  </Wrapper>
));
Select.displayName = 'Select';

export const Checkbox = ({ label, className, ...props }) => (
  <label className={cn('inline-flex cursor-pointer items-center gap-3 text-sm text-slate-300', className)}>
    <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-slate-950/50 accent-emerald-400" {...props} />
    {label}
  </label>
);
