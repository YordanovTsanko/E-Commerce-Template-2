import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Input } from '../ui';

export const PasswordInput = (props) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} inputClassName="pr-12" {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Скрий паролата' : 'Покажи паролата'}
        className="absolute right-4 top-[2.6rem] text-slate-400 transition hover:text-white"
      >
        {visible ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
};

export const validatePassword = (value) => {
  if (!value || value.length < 8) return 'Паролата трябва да е поне 8 символа.';
  if (!/\d/.test(value)) return 'Паролата трябва да съдържа поне една цифра.';
  return undefined;
};
