import { HiOutlineSearch } from 'react-icons/hi';
import { inputClass } from '../ui';
import { cn } from '../../utils/format';

// Лента с търсене + произволни филтри (children) за админ списъците
export const ListToolbar = ({ search, onSearch, placeholder = 'Търсене...', children }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div className="relative flex-1">
      <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, 'pl-11')}
        aria-label="Търсене"
      />
    </div>
    {children}
  </div>
);
