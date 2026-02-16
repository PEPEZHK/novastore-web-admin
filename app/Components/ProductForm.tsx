import { useMemo, useState, type FormEvent } from "react";
import type { Category, ProductDraft } from "~/Interfaces/product";
import type { CreateCategoryResult } from "~/utils/categories.client";
import type { TranslationKey } from "~/utils/i18n";

interface ProductFormProps {
  initialValues: ProductDraft;
  categories: Category[];
  submitLabel: string;
  onSubmit: (draft: ProductDraft) => void;
  onCancel: () => void;
  onCreateCategory: (name: string) => CreateCategoryResult | null;
  t: (key: TranslationKey) => string;
}

interface FormErrors {
  name?: string;
  price?: string;
  stock?: string;
  categoryId?: string;
  newCategoryName?: string;
}

const NEW_CATEGORY_VALUE = "__new__";

const toNumber = (value: string): number => Number(value);

export const ProductForm = ({
  initialValues,
  categories,
  submitLabel,
  onSubmit,
  onCancel,
  onCreateCategory,
  t,
}: ProductFormProps) => {
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [price, setPrice] = useState(String(initialValues.price));
  const [stock, setStock] = useState(String(initialValues.stock));
  const [categoryId, setCategoryId] = useState(String(initialValues.categoryId || ""));
  const [newCategoryName, setNewCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState(initialValues.imageUrl);
  const [errors, setErrors] = useState<FormErrors>({});

  const isAddingCategory = categoryId === NEW_CATEGORY_VALUE;

  const canSubmit = useMemo(() => {
    return name.trim().length > 0;
  }, [name]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    const numericPrice = toNumber(price);
    const numericStock = toNumber(stock);
    const numericCategory = toNumber(categoryId);

    if (!name.trim()) {
      nextErrors.name = t("validationNameRequired");
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      nextErrors.price = t("validationPricePositive");
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      nextErrors.stock = t("validationStockNonNegative");
    }

    if (isAddingCategory) {
      if (!newCategoryName.trim()) {
        nextErrors.newCategoryName = t("validationNewCategoryRequired");
      }
    } else if (!Number.isInteger(numericCategory) || numericCategory <= 0) {
      nextErrors.categoryId = t("validationCategoryRequired");
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    let resolvedCategoryId = numericCategory;
    if (isAddingCategory) {
      const created = onCreateCategory(newCategoryName);
      if (!created) {
        setErrors({
          newCategoryName: t("validationNewCategoryRequired"),
        });
        return;
      }

      resolvedCategoryId = created.category.id;
      setCategoryId(String(created.category.id));
      setNewCategoryName("");
    }

    onSubmit({
      name,
      description,
      price: numericPrice,
      stock: numericStock,
      categoryId: resolvedCategoryId,
      imageUrl,
    });
  };

  const inputClasses =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {t("formName")}
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClasses}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? (
            <span className="text-xs text-rose-600 dark:text-rose-400">
              {errors.name}
            </span>
          ) : null}
        </label>

        <div className="space-y-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {t("formCategory")}
            </span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={inputClasses}
              aria-invalid={Boolean(errors.categoryId || errors.newCategoryName)}
            >
              <option value="">{t("categoryLabel")}</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
              <option value={NEW_CATEGORY_VALUE}>{t("formAddNewCategory")}</option>
            </select>
          </label>

          {isAddingCategory ? (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {t("formNewCategoryName")}
              </span>
              <input
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className={inputClasses}
                aria-invalid={Boolean(errors.newCategoryName)}
              />
            </label>
          ) : null}

          {errors.categoryId ? (
            <span className="text-xs text-rose-600 dark:text-rose-400">
              {errors.categoryId}
            </span>
          ) : null}

          {errors.newCategoryName ? (
            <span className="text-xs text-rose-600 dark:text-rose-400">
              {errors.newCategoryName}
            </span>
          ) : null}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {t("formPrice")}
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={inputClasses}
            aria-invalid={Boolean(errors.price)}
          />
          {errors.price ? (
            <span className="text-xs text-rose-600 dark:text-rose-400">
              {errors.price}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {t("formStock")}
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            className={inputClasses}
            aria-invalid={Boolean(errors.stock)}
          />
          {errors.stock ? (
            <span className="text-xs text-rose-600 dark:text-rose-400">
              {errors.stock}
            </span>
          ) : null}
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {t("formDescription")}
        </span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className={inputClasses}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {t("formImageUrl")}
        </span>
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className={inputClasses}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
};
