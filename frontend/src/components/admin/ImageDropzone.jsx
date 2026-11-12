import { useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import { optimizeImage } from '../../utils/image';
import { cn } from '../../utils/format';

const MAX_SIZE_MB = 8;

const Thumb = ({ src, label, onRemove, isMain }) => (
  <div className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50">
    <img src={src} alt="" className="h-full w-full object-cover" />
    {isMain && (
      <span className="absolute left-2 top-2 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">
        Основна
      </span>
    )}
    {label && (
      <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/80 px-2 py-0.5 text-[10px] text-emerald-200">{label}</span>
    )}
    <button
      type="button"
      onClick={onRemove}
      aria-label="Премахни снимката"
      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/80 text-slate-200 transition hover:bg-rose-500 hover:text-white"
    >
      <FaTimes size={12} />
    </button>
  </div>
);

/**
 * Drag & drop качване на снимки.
 * existing: вече качени снимки [{ url, publicId }]
 * files: нови File обекти (качват се в Cloudinary при запис на формата)
 */
export const ImageDropzone = ({
  existing = [],
  onRemoveExisting,
  files = [],
  onFilesChange,
  maxFiles = 8,
  multiple = true,
  label = 'Изображения',
}) => {
  const total = existing.length + files.length;
  const remaining = Math.max(maxFiles - total, 0);

  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const onDrop = (accepted, rejected) => {
    if (rejected.length) {
      toast.error(`Някои файлове са отхвърлени (само изображения до ${MAX_SIZE_MB} MB).`);
    }
    if (!multiple) {
      onFilesChange(accepted.slice(0, 1));
      return;
    }
    if (accepted.length > remaining) toast.error(`Можете да добавите още най-много ${remaining} снимки.`);
    onFilesChange([...files, ...accepted.slice(0, remaining)]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'] },
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    multiple,
    disabled: multiple && remaining === 0,
  });

  return (
    <div className="grid gap-3 text-sm text-slate-300">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {multiple && (
          <span className="text-xs text-slate-500">
            {total}/{maxFiles}
          </span>
        )}
      </div>

      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-8 text-center transition',
          isDragActive ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/15 bg-slate-950/40 hover:border-emerald-400/50',
          multiple && remaining === 0 && 'cursor-not-allowed opacity-50',
        )}
      >
        <input {...getInputProps()} />
        <FaCloudUploadAlt size={28} className="text-emerald-300" />
        <p className="font-medium text-white">{isDragActive ? 'Пуснете снимките тук...' : 'Плъзнете снимки тук или кликнете'}</p>
        <p className="text-xs text-slate-500">JPG, PNG, WEBP, GIF, AVIF · до {MAX_SIZE_MB} MB</p>
      </div>

      {(existing.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {existing.map((img, i) => (
            <Thumb
              key={img.publicId || img.url}
              src={optimizeImage(img.url, 300)}
              isMain={i === 0}
              onRemove={() => onRemoveExisting?.(img)}
            />
          ))}
          {previews.map((p, i) => (
            <Thumb
              key={p.url}
              src={p.url}
              label="Нова"
              isMain={existing.length === 0 && i === 0}
              onRemove={() => onFilesChange(files.filter((f) => f !== p.file))}
            />
          ))}
        </div>
      )}
    </div>
  );
};
