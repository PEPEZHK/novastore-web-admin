import { Link } from "@remix-run/react";
import type { Category, Product } from "~/Interfaces/product";
import type { TranslationKey } from "~/utils/i18n";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onDelete: (product: Product) => void;
  canManage?: boolean;
  t: (key: TranslationKey) => string;
}

export const ProductTable = ({
  products,
  categories,
  onDelete,
  canManage = true,
  t,
}: ProductTableProps) => {
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  if (products.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {t("noProductsMatched")}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {t("tableName")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {t("tableCategory")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {t("tablePrice")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {t("tableStock")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {t("tableActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 align-top">
                  <Link
                    to={`/products/${product.id}`}
                    className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
                  >
                    {product.name}
                  </Link>
                  <p className="max-w-md text-sm text-slate-600 dark:text-slate-300">
                    {product.description}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {categoryMap.get(product.categoryId) ?? t("noCategory")}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {product.stock}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {t("view")}
                    </Link>
                    {canManage ? (
                      <>
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {t("edit")}
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(product)}
                          className="rounded-md border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/30"
                        >
                          {t("delete")}
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
