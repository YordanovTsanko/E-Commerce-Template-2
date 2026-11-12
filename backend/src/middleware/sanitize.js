// Защита от NoSQL injection: премахва ключове, които започват с "$" или съдържат ".".
// Заменя express-mongo-sanitize, който не работи с Express 5 (там req.query е само за четене).
const isUnsafeKey = (key) => key.startsWith("$") || key.includes(".");

const clean = (value) => {
  if (Array.isArray(value)) {
    value.forEach(clean);
  } else if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (isUnsafeKey(key)) delete value[key];
      else clean(value[key]);
    }
  }
  return value;
};

const sanitize = (req, res, next) => {
  // В Express 5 req.body е undefined, ако заявката няма тяло
  if (req.body === undefined) req.body = {};
  clean(req.body);
  clean(req.params);
  // В Express 5 req.query е getter, който парсва адреса при всяко четене,
  // затова записваме почистеното копие като собствено свойство на заявката.
  Object.defineProperty(req, "query", { value: clean({ ...req.query }), writable: true, configurable: true });
  next();
};

export default sanitize;
