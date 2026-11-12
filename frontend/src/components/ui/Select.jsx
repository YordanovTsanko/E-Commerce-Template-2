import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HiCheck, HiChevronDown } from 'react-icons/hi';
import { cn } from '../../utils/format';

const MENU_MAX_HEIGHT = 288; // 18rem
const GAP = 8;

const TRIGGER_SIZES = {
  md: 'rounded-2xl px-4 py-3',
  sm: 'rounded-xl px-3 py-2 text-sm',
};

/**
 * Персонализиран dropdown, съвместим с API-то на нативния <select>:
 *   <Select label value onChange={(e) => e.target.value} options={[{ value, label }]} placeholder />
 *
 * - менюто се рендерира в portal (не се отрязва от модали и таблици)
 * - отваря се нагоре, ако няма място отдолу
 * - клавиатура: ↑ ↓ Home End Enter Space Escape Tab + търсене по първа буква
 */
export const Select = forwardRef(
  (
    {
      label,
      error,
      hint,
      className,
      options = [],
      placeholder,
      value = '',
      onChange,
      name,
      disabled = false,
      size = 'md',
      'aria-label': ariaLabel,
      id: idProp,
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp || autoId;
    const listId = `${id}-list`;

    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [position, setPosition] = useState(null);

    // Празната стойност (placeholder) също е избираема опция – "Всички ..."
    const items = placeholder !== undefined ? [{ value: '', label: placeholder, isPlaceholder: true }, ...options] : options;
    const selectedIndex = items.findIndex((o) => String(o.value) === String(value));
    const selected = items[selectedIndex];

    const setRefs = (node) => {
      triggerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const updatePosition = useCallback(() => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUp = spaceBelow < Math.min(MENU_MAX_HEIGHT, items.length * 44 + 16) && spaceAbove > spaceBelow;
      setPosition({
        left: rect.left,
        width: rect.width,
        maxHeight: Math.max(Math.min(MENU_MAX_HEIGHT, (openUp ? spaceAbove : spaceBelow) - GAP * 2), 120),
        ...(openUp ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
        openUp,
      });
    }, [items.length]);

    useLayoutEffect(() => {
      if (open) updatePosition();
    }, [open, updatePosition]);

    // Затваряне при клик извън, скрол и преоразмеряване
    useEffect(() => {
      if (!open) return undefined;
      const onPointer = (e) => {
        if (!triggerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false);
      };
      const onScroll = (e) => {
        if (menuRef.current?.contains(e.target)) return;
        updatePosition();
      };
      document.addEventListener('mousedown', onPointer);
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        document.removeEventListener('mousedown', onPointer);
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', updatePosition);
      };
    }, [open, updatePosition]);

    // Скролира активната опция във видимата част
    useEffect(() => {
      if (open && active >= 0) menuRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [open, active]);

    const openMenu = () => {
      if (disabled) return;
      setActive(selectedIndex >= 0 ? selectedIndex : 0);
      setOpen(true);
    };

    const choose = (index) => {
      const option = items[index];
      if (!option) return;
      setOpen(false);
      triggerRef.current?.focus();
      if (String(option.value) !== String(value)) {
        // Обект като нативното събитие – съществуващите onChange={(e) => e.target.value} работят без промяна
        onChange?.({ target: { value: option.value, name }, currentTarget: { value: option.value, name } });
      }
    };

    const onKeyDown = (e) => {
      if (disabled) return;
      const last = items.length - 1;

      if (!open) {
        if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
          e.preventDefault();
          openMenu();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActive((i) => (i >= last ? 0 : i + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActive((i) => (i <= 0 ? last : i - 1));
          break;
        case 'Home':
          e.preventDefault();
          setActive(0);
          break;
        case 'End':
          e.preventDefault();
          setActive(last);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          choose(active);
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation(); // да не затвори и модала
          setOpen(false);
          break;
        case 'Tab':
          setOpen(false);
          break;
        default:
          // Търсене по първа буква
          if (e.key.length === 1) {
            const char = e.key.toLowerCase();
            const start = active + 1;
            const found = [...items.slice(start), ...items.slice(0, start)].find((o) =>
              String(o.label).toLowerCase().startsWith(char),
            );
            if (found) setActive(items.indexOf(found));
          }
      }
    };

    const trigger = (
      <button
        ref={setRefs}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-3 border bg-slate-950/50 text-left outline-none transition disabled:cursor-not-allowed disabled:opacity-60',
          TRIGGER_SIZES[size],
          open ? 'border-emerald-400/50 bg-slate-950/70' : 'border-white/10 hover:border-white/20 focus-visible:border-emerald-400/50',
          error && 'border-rose-400/50',
        )}
      >
        <span className={cn('truncate', !selected || selected.isPlaceholder ? 'text-slate-400' : 'text-white')}>
          {selected?.label ?? placeholder ?? 'Изберете...'}
        </span>
        <HiChevronDown
          size={size === 'sm' ? 16 : 18}
          className={cn('shrink-0 text-slate-400 transition-transform duration-200', open && 'rotate-180 text-emerald-300')}
        />
      </button>
    );

    const menu = createPortal(
      <AnimatePresence>
        {open && position && (
          <motion.ul
            ref={menuRef}
            id={listId}
            role="listbox"
            aria-labelledby={id}
            initial={{ opacity: 0, y: position.openUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: position.openUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            style={{
              position: 'fixed',
              left: position.left,
              minWidth: position.width,
              width: 'max-content',
              maxWidth: Math.max(position.width, Math.min(320, window.innerWidth - position.left - GAP)),
              top: position.top,
              bottom: position.bottom,
              maxHeight: position.maxHeight,
            }}
            className="z-[200] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            {items.map((option, index) => {
              const isSelected = index === selectedIndex;
              const isActive = index === active;
              return (
                <li
                  key={`${option.value}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(index)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    isActive && 'bg-white/10',
                    isSelected ? 'font-semibold text-emerald-300' : option.isPlaceholder ? 'text-slate-400' : 'text-slate-200',
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <HiCheck size={16} className="shrink-0 text-emerald-300" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>,
      document.body,
    );

    return (
      <div className={cn('grid gap-2 text-sm text-slate-300', className)}>
        {label && (
          <label htmlFor={id} className="cursor-pointer">
            {label}
          </label>
        )}
        {trigger}
        {menu}
        {error ? <span className="text-xs text-rose-300">{error}</span> : hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
    );
  },
);

Select.displayName = 'Select';