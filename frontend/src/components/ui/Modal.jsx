import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineX } from 'react-icons/hi';
import { Button } from './Button';
import { cn } from '../../utils/format';

export const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'flex max-h-[90vh] w-full flex-col rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl shadow-black/40',
              widths[size],
            )}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <Button variant="ghost" size="iconSm" onClick={onClose} aria-label="Затвори">
                <HiOutlineX size={20} />
              </Button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 px-6 py-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  loading,
  title = 'Сигурни ли сте?',
  message,
  confirmText = 'Изтрий',
}) => (
  <Modal
    open={open}
    onClose={loading ? undefined : onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Отказ
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </>
    }
  >
    <p className="text-slate-300">{message}</p>
  </Modal>
);
