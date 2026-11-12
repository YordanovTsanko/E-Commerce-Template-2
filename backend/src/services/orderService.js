import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";

// Атомарно намалява наличността. При неуспех за който и да е продукт
// връща вече намалените количества и хвърля грешка.
export const reserveStock = async (items) => {
  const reserved = [];

  for (const item of items) {
    const result = await Product.updateOne(
      { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, sold: item.quantity } },
    );

    if (result.modifiedCount !== 1) {
      await releaseStock(reserved);
      throw new AppError(`Няма достатъчна наличност от „${item.name}“. Обновете количката.`, 409);
    }
    reserved.push(item);
  }
};

export const releaseStock = async (items) => {
  await Promise.all(
    items.map((item) =>
      Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity, sold: -item.quantity } }),
    ),
  );
};
