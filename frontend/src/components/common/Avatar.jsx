import { optimizeImage } from '../../utils/image';
import { getUserName, cn } from '../../utils/format';

export const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-24 w-24 text-2xl' };
  const initials = getUserName(user)
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return user?.avatar?.url ? (
    <img
      src={optimizeImage(user.avatar.url, 200)}
      alt={getUserName(user)}
      className={cn('shrink-0 rounded-2xl object-cover', sizes[size], className)}
    />
  ) : (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 font-semibold text-emerald-300',
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
};
