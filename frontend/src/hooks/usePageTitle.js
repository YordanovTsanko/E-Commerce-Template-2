import { useEffect } from 'react';
import { SITE } from '../config/site';

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE.name}` : SITE.name;
  }, [title]);
};
