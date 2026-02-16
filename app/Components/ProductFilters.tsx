import type { Category, SortBy } from "~/Interfaces/product";
import type { TranslationKey } from "~/utils/i18n";

interface ProductFiltersProps {
  categories: Category[];
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  canManage?: boolean;
  t: (key: TranslationKey) => string;
}

export const ProductFilters = ({
  categories,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  onSortByChange,
  onExport,
  onImport,
  canManage = true,
  t,
}: ProductFiltersProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {t("searchLabel")}
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {t("categoryLabel")}
          </span>
          <select
            value={categoryFilter}
            onChange={(event) => onCategoryFilterChange(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="all">{t("categoryAll")}</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {t("sortLabel")}
          </span>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as SortBy)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="name-asc">{t("sortNameAsc")}</option>
            <option value="price-asc">{t("sortPriceAsc")}</option>
            <option value="price-desc">{t("sortPriceDesc")}</option>
            <option value="stock-asc">{t("sortStockAsc")}</option>
            <option value="stock-desc">{t("sortStockDesc")}</option>
          </select>
        </label>

        <div className="flex items-end justify-start gap-2">
          {canManage ? (
            <>
              <button
                type="button"
                onClick={onExport}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("exportJson")}
              </button>

              <label className="cursor-pointer rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                {t("importJson")}
                <input
                  type="file"
                  accept="application/json"
                  className="sr-only"
                  aria-label={t("fileInputLabel")}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      onImport(file);
                      event.target.value = "";
                    }
                  }}
                />
              </label>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};
