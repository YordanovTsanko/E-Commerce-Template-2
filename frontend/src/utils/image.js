// Добавя Cloudinary трансформации (автоматичен формат/качество + ширина)
// към URL адреса, за по-бързо зареждане на снимките.
export const optimizeImage = (url, width = 600) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
};

export const getProductImage = (product, index = 0) => product?.images?.[index]?.url || null;
